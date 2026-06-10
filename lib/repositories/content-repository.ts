import { TransactWriteCommand, type TransactWriteCommandInput } from "@aws-sdk/lib-dynamodb"
import {
  accountDnaSchema,
  dashboardSummarySchema,
  draftVersionSchema,
  insightSchema,
  monthlyPlanSchema,
  platformVariantSchema,
  postDetailSchema,
  postMetricSchema,
  postSchema,
  type AccountDna,
  type DashboardSummary,
  type DraftVersion,
  type Insight,
  type MonthlyPlan,
  type PlatformVariant,
  type Post,
  type PostDetail,
  type PostMetric,
  type WorkflowStatus,
} from "@/lib/domain"
import {
  DEMO_MONTH,
  DEMO_WORKSPACE_ID,
  demoDrafts,
  demoInsights,
  demoMetrics,
  demoPlan,
  demoPosts,
  demoProfile,
  demoVariants,
  getDemoDashboardSummary,
  getDemoPostDetail,
} from "@/lib/demo-data"
import { getDocumentClient } from "@/lib/dynamodb/client"
import {
  ContentService,
  DraftVersionEntity,
  InsightEntity,
  MonthlyPlanEntity,
  PlatformVariantEntity,
  PostEntity,
  PostMetricEntity,
  ProfileEntity,
} from "@/lib/dynamodb/entities"
import { getDynamoConfig } from "@/lib/env"

type RepositoryMode = "demo" | "dynamodb"
type MonthlyPlanRecord = Omit<MonthlyPlan, "posts">
type DraftVersionRecord = DraftVersion & { workspaceId: string }
type PlatformVariantRecord = PlatformVariant & Pick<Post, "workspaceId" | "month" | "scheduledDate">
type PostMetricRecord = PostMetric & { workspaceId: string; month: string }

export class ContentNotFoundError extends Error {
  code: "PROFILE_NOT_FOUND" | "PLAN_NOT_FOUND" | "POST_NOT_FOUND"

  constructor(code: ContentNotFoundError["code"], message: string) {
    super(message)
    this.name = "ContentNotFoundError"
    this.code = code
  }
}

export type StatusUpdateResult =
  | { ok: true; post: Post; mode: RepositoryMode }
  | { ok: false; code: "CONFLICT" | "NOT_FOUND"; message: string; mode: RepositoryMode }

function dynamoReady() {
  return getDynamoConfig().configured && Boolean(getDocumentClient())
}

function monthFromDate(value: string) {
  return value.slice(0, 7)
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function canUseDemoFallback(workspaceId: string) {
  return !dynamoReady() || workspaceId === DEMO_WORKSPACE_ID
}

function toMonthlyPlanRecord(plan: MonthlyPlan): MonthlyPlanRecord {
  return {
    workspaceId: plan.workspaceId,
    month: plan.month,
    title: plan.title,
    summary: plan.summary,
    themes: plan.themes,
    generationStatus: plan.generationStatus,
    updatedAt: plan.updatedAt,
  }
}

function normalizeMonthlyPlan(workspaceId: string, plan: MonthlyPlan): MonthlyPlan {
  return monthlyPlanSchema.parse({
    ...plan,
    workspaceId,
    posts: plan.posts.map((post) => ({
      ...post,
      workspaceId,
      month: plan.month,
    })),
  })
}

function toVariantRecord(variant: PlatformVariant, post: Post): PlatformVariantRecord {
  return {
    ...variant,
    workspaceId: post.workspaceId,
    month: post.month,
    scheduledDate: post.scheduledDate,
  }
}

function toDraftRecord(draft: DraftVersion, workspaceId: string): DraftVersionRecord {
  return {
    ...draft,
    workspaceId,
  }
}

function toMetricRecord(metric: PostMetric, workspaceId: string): PostMetricRecord {
  return {
    ...metric,
    workspaceId,
    month: monthFromDate(metric.publishedAt),
  }
}

function getDemoPlanForWorkspace(workspaceId: string, month = DEMO_MONTH): MonthlyPlan {
  const posts = demoPosts.map((post) => ({ ...post, workspaceId, month }))

  return {
    ...demoPlan,
    workspaceId,
    month,
    posts,
  }
}

function getDemoProfileForWorkspace(workspaceId: string): AccountDna {
  return {
    ...demoProfile,
    workspaceId,
  }
}

function getDemoInsightsForWorkspace(workspaceId: string, month = DEMO_MONTH): Insight[] {
  return demoInsights.map((insight) => ({
    ...insight,
    workspaceId,
    month,
  }))
}

function getDemoPostDetailForWorkspace(workspaceId: string, postId: string): PostDetail {
  const detail = getDemoPostDetail(postId)
  if (!detail) {
    throw new ContentNotFoundError("POST_NOT_FOUND", "Post could not be found.")
  }

  const post = { ...detail.post, workspaceId }

  return {
    post,
    variants: detail.variants,
    metrics: detail.metrics,
    drafts: detail.drafts,
  }
}

export async function getProfile(workspaceId: string): Promise<AccountDna> {
  if (canUseDemoFallback(workspaceId)) {
    return getDemoProfileForWorkspace(workspaceId)
  }

  const result = await ProfileEntity.get({ workspaceId }).go()

  if (!result.data) {
    throw new ContentNotFoundError("PROFILE_NOT_FOUND", "Profile could not be found.")
  }

  return accountDnaSchema.parse(result.data)
}

export async function saveProfile(workspaceId: string, profile: Omit<AccountDna, "workspaceId" | "updatedAt">) {
  const saved: AccountDna = {
    ...profile,
    workspaceId,
    updatedAt: new Date().toISOString(),
  }

  if (!dynamoReady()) {
    return { profile: saved, mode: "demo" as const }
  }

  await ProfileEntity.put(saved).go()

  return { profile: saved, mode: "dynamodb" as const }
}

export async function saveMonthlyPlan(workspaceId: string, plan: MonthlyPlan) {
  const saved = normalizeMonthlyPlan(workspaceId, plan)

  if (!dynamoReady()) {
    return { plan: saved, mode: "demo" as const, postCount: saved.posts.length }
  }

  const params = ContentService.transaction
    .write(({ monthlyPlan, post }) => [
      monthlyPlan.put(toMonthlyPlanRecord(saved)).commit(),
      ...saved.posts.map((item) => post.put(item).commit()),
    ])
    .params() as unknown as TransactWriteCommandInput

  await getDocumentClient()?.send(new TransactWriteCommand(params))

  return { plan: saved, mode: "dynamodb" as const, postCount: saved.posts.length }
}

export async function getMonthlyPlan(workspaceId: string, month = DEMO_MONTH): Promise<MonthlyPlan> {
  if (canUseDemoFallback(workspaceId)) {
    return getDemoPlanForWorkspace(workspaceId, month)
  }

  const [planResult, postsResult] = await Promise.all([
    MonthlyPlanEntity.get({ workspaceId, month }).go(),
    PostEntity.query.byMonth({ workspaceId, month }).go(),
  ])

  if (!planResult.data || !postsResult.data.length) {
    throw new ContentNotFoundError("PLAN_NOT_FOUND", "Monthly plan could not be found.")
  }

  const posts = postsResult.data
    .map((item) => postSchema.parse(item))
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
  const plan = monthlyPlanSchema.parse({
    ...planResult.data,
    posts,
  })

  return plan
}

export async function listPosts(workspaceId: string, month = DEMO_MONTH): Promise<Post[]> {
  const plan = await getMonthlyPlan(workspaceId, month)
  return plan.posts
}

export async function getPostDetail(workspaceId: string, postId: string): Promise<PostDetail> {
  if (canUseDemoFallback(workspaceId)) {
    return getDemoPostDetailForWorkspace(workspaceId, postId)
  }

  const [postResult, variantsResult, metricsResult, draftsResult] = await Promise.all([
    PostEntity.get({ workspaceId, id: postId }).go(),
    PlatformVariantEntity.query.variant({ workspaceId }).begins({ postId }).go(),
    PostMetricEntity.query.metric({ workspaceId }).begins({ postId }).go(),
    DraftVersionEntity.query.draft({ workspaceId }).begins({ postId }).go(),
  ])

  if (!postResult.data) {
    throw new ContentNotFoundError("POST_NOT_FOUND", "Post could not be found.")
  }

  const post = postSchema.parse(postResult.data)
  const variants = variantsResult.data.map((item) => platformVariantSchema.parse(item))
  const metrics = metricsResult.data.map((item) => postMetricSchema.parse(item))
  const drafts = draftsResult.data
    .map((item) => draftVersionSchema.parse(item))
    .sort((a, b) => a.version - b.version)

  return postDetailSchema.parse({ post, variants, metrics, drafts })
}

export async function getDashboardSummary(workspaceId: string, month = DEMO_MONTH): Promise<DashboardSummary> {
  if (!dynamoReady()) {
    const summary = getDemoDashboardSummary()
    return dashboardSummarySchema.parse({
      ...summary,
      profile: getDemoProfileForWorkspace(workspaceId),
      plan: getDemoPlanForWorkspace(workspaceId, month),
      posts: getDemoPlanForWorkspace(workspaceId, month).posts,
      insights: getDemoInsightsForWorkspace(workspaceId, month),
    })
  }

  const [profile, plan, insights, metrics] = await Promise.all([
    getProfile(workspaceId),
    getMonthlyPlan(workspaceId, month),
    listInsights(workspaceId, month),
    listMetrics(workspaceId, month),
  ])

  return dashboardSummarySchema.parse({
    profile,
    plan,
    posts: plan.posts,
    insights,
    metrics,
  })
}

export async function saveVariant(workspaceId: string, postId: string, variant: PlatformVariant) {
  const detail = await getPostDetail(workspaceId, postId)
  const saved = toVariantRecord(variant, detail.post)

  if (!dynamoReady()) {
    return { variant, mode: "demo" as const }
  }

  await PlatformVariantEntity.put(saved).go()

  return { variant, mode: "dynamodb" as const }
}

export async function saveDraft(workspaceId: string, draft: DraftVersion) {
  const saved = toDraftRecord(draft, workspaceId)

  if (!dynamoReady()) {
    return { draft, mode: "demo" as const }
  }

  await DraftVersionEntity.put(saved).go()

  return { draft, mode: "dynamodb" as const }
}

export async function updatePostStatus(
  workspaceId: string,
  postId: string,
  status: WorkflowStatus,
  expectedVersion?: number,
): Promise<StatusUpdateResult> {
  let detail: PostDetail

  try {
    detail = await getPostDetail(workspaceId, postId)
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      return {
        ok: false,
        code: "NOT_FOUND",
        message: error.message,
        mode: dynamoReady() ? "dynamodb" : "demo",
      }
    }

    throw error
  }
  const nextPost: Post = {
    ...detail.post,
    status,
    version: detail.post.version + (detail.post.status === status ? 0 : 1),
    updatedAt: new Date().toISOString(),
  }

  if (expectedVersion && expectedVersion !== detail.post.version) {
    return {
      ok: false,
      code: "CONFLICT",
      message: "The post was updated by another request. Refresh and try again.",
      mode: dynamoReady() ? "dynamodb" : "demo",
    }
  }

  if (!dynamoReady()) {
    return { ok: true, post: nextPost, mode: "demo" }
  }

  try {
    await PostEntity.update({ workspaceId, id: postId })
      .set({
        status,
        version: nextPost.version,
        updatedAt: nextPost.updatedAt,
      })
      .where(({ version }, { eq }) => eq(version, expectedVersion ?? detail.post.version))
      .go()
  } catch {
    return {
      ok: false,
      code: "CONFLICT",
      message: "The status update could not be applied because the stored version changed.",
      mode: "dynamodb",
    }
  }

  return { ok: true, post: nextPost, mode: "dynamodb" }
}

export async function saveMetric(workspaceId: string, metric: PostMetric) {
  const saved = toMetricRecord(metric, workspaceId)

  if (!dynamoReady()) {
    return { metric, mode: "demo" as const }
  }

  await PostMetricEntity.put(saved).go()

  return { metric, mode: "dynamodb" as const }
}

export async function listMetrics(workspaceId: string, month = DEMO_MONTH): Promise<PostMetric[]> {
  if (canUseDemoFallback(workspaceId)) {
    return clone(demoMetrics)
  }

  const result = await PostMetricEntity.query.byMetricsMonth({ workspaceId, month }).go()

  return result.data.map((item) => postMetricSchema.parse(item))
}

export async function listInsights(workspaceId: string, month = DEMO_MONTH): Promise<Insight[]> {
  if (canUseDemoFallback(workspaceId)) {
    return getDemoInsightsForWorkspace(workspaceId, month)
  }

  const result = await InsightEntity.query.byMonth({ workspaceId, month }).go()

  return result.data.map((item) => insightSchema.parse(item))
}

export async function saveInsight(workspaceId: string, insight: Insight) {
  const saved = { ...insight, workspaceId }

  if (!dynamoReady()) {
    return { insight: saved, mode: "demo" as const }
  }

  await InsightEntity.put(saved).go()

  return { insight: saved, mode: "dynamodb" as const }
}

export async function seedDemoWorkspace() {
  if (!dynamoReady()) {
    return { seeded: false, mode: "demo" as const, reason: "DynamoDB is not configured." }
  }

  const plan = getDemoPlanForWorkspace(DEMO_WORKSPACE_ID, DEMO_MONTH)
  const profile = getDemoProfileForWorkspace(DEMO_WORKSPACE_ID)
  const variants = demoVariants
  const drafts = demoDrafts
  const metrics = demoMetrics
  const insights = getDemoInsightsForWorkspace(DEMO_WORKSPACE_ID, DEMO_MONTH)
  let count = 0

  await ProfileEntity.put(profile).go()
  count += 1

  const savedPlan = await saveMonthlyPlan(DEMO_WORKSPACE_ID, plan)
  count += 1 + savedPlan.postCount

  for (const variant of variants) {
    const post = plan.posts.find((item) => item.id === variant.postId) ?? plan.posts[0]
    await PlatformVariantEntity.put(toVariantRecord(variant, post)).go()
    count += 1
  }

  for (const draft of drafts) {
    await DraftVersionEntity.put(toDraftRecord(draft, DEMO_WORKSPACE_ID)).go()
    count += 1
  }

  for (const metric of metrics) {
    await PostMetricEntity.put(toMetricRecord(metric, DEMO_WORKSPACE_ID)).go()
    count += 1
  }

  for (const insight of insights) {
    await InsightEntity.put(insight).go()
    count += 1
  }

  return { seeded: true, mode: "dynamodb" as const, count }
}
