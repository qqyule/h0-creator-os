import { TransactWriteCommand, type TransactWriteCommandInput } from "@aws-sdk/lib-dynamodb"
import {
  accountDnaSchema,
  brandVoiceSchema,
  carouselExportSchema,
  creatorTaskSchema,
  dashboardSummarySchema,
  draftVersionSchema,
  ideaSchema,
  insightSchema,
  monthlyPlanSchema,
  platformVariantSchema,
  postDetailSchema,
  postMetricSchema,
  postSchema,
  type AccountDna,
  type BrandVoice,
  type CarouselExport,
  type CreatorTask,
  type CreatorTaskStatus,
  type DashboardSummary,
  type DraftVersion,
  type Idea,
  type IdeaSource,
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
  demoTasks,
  demoVariants,
  getDemoDashboardSummary,
  getDemoPostDetail,
} from "@/lib/demo-data"
import { getDocumentClient } from "@/lib/dynamodb/client"
import {
  ContentService,
  BrandVoiceEntity,
  CarouselExportEntity,
  DraftVersionEntity,
  IdeaEntity,
  InsightEntity,
  MonthlyPlanEntity,
  PlatformVariantEntity,
  PostEntity,
  PostMetricEntity,
  ProfileEntity,
  TaskEntity,
} from "@/lib/dynamodb/entities"
import { getDynamoConfig } from "@/lib/env"

type RepositoryMode = "demo" | "dynamodb"
type MonthlyPlanRecord = Omit<MonthlyPlan, "posts">
type DraftVersionRecord = DraftVersion & { workspaceId: string }
type PlatformVariantRecord = PlatformVariant & Pick<Post, "workspaceId" | "month" | "scheduledDate">
type PostMetricRecord = PostMetric & { workspaceId: string; month: string }
const demoTaskStore = new Map<string, CreatorTask[]>()
const demoBrandVoiceStore = new Map<string, BrandVoice>()
const demoIdeaStore = new Map<string, Idea[]>()
const demoCarouselStore = new Map<string, CarouselExport[]>()
const demoPostOverrideStore = new Map<string, Partial<Post>>()

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
  const posts = demoPosts.map((post) => applyDemoPostOverride({ ...post, workspaceId, month }))

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

function getDemoTasksForWorkspace(workspaceId: string, month = DEMO_MONTH): CreatorTask[] {
  const seeded = demoTasks.map((task) => ({
    ...task,
    workspaceId,
    month,
  }))
  const generated = demoTaskStore.get(`${workspaceId}#${month}`) ?? []

  return [
    ...seeded.filter((task) => !generated.some((item) => item.id === task.id)),
    ...generated,
  ].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

function getDemoPostDetailForWorkspace(workspaceId: string, postId: string): PostDetail {
  const detail = getDemoPostDetail(postId)
  if (!detail) {
    throw new ContentNotFoundError("POST_NOT_FOUND", "Post could not be found.")
  }

  const post = applyDemoPostOverride({ ...detail.post, workspaceId })

  return {
    post,
    variants: detail.variants,
    metrics: detail.metrics,
    drafts: detail.drafts,
  }
}

function demoPostOverrideKey(workspaceId: string, postId: string) {
  return `${workspaceId}#${postId}`
}

function applyDemoPostOverride(post: Post): Post {
  return postSchema.parse({
    ...post,
    ...demoPostOverrideStore.get(demoPostOverrideKey(post.workspaceId, post.id)),
  })
}

function saveDemoPostOverride(post: Post) {
  demoPostOverrideStore.set(demoPostOverrideKey(post.workspaceId, post.id), {
    scheduledDate: post.scheduledDate,
    scheduledTime: post.scheduledTime,
    timezone: post.timezone,
    queueStatus: post.queueStatus,
    queuePosition: post.queuePosition,
    status: post.status,
    version: post.version,
    updatedAt: post.updatedAt,
  })
}

function makeId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
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

export async function getBrandVoice(workspaceId: string): Promise<BrandVoice | undefined> {
  if (!dynamoReady()) {
    return demoBrandVoiceStore.get(workspaceId)
  }

  const result = await BrandVoiceEntity.get({ workspaceId }).go()
  return result.data ? brandVoiceSchema.parse(result.data) : undefined
}

export async function saveBrandVoice(workspaceId: string, input: Omit<BrandVoice, "workspaceId" | "updatedAt">) {
  const saved = brandVoiceSchema.parse({
    ...input,
    workspaceId,
    updatedAt: new Date().toISOString(),
  })

  if (!dynamoReady()) {
    demoBrandVoiceStore.set(workspaceId, saved)
    return { brandVoice: saved, mode: "demo" as const }
  }

  await BrandVoiceEntity.put(saved).go()

  return { brandVoice: saved, mode: "dynamodb" as const }
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
  if (!dynamoReady()) {
    return getDemoPostDetailForWorkspace(workspaceId, postId)
  }

  const [postResult, variantsResult, metricsResult, draftsResult] = await Promise.all([
    PostEntity.get({ workspaceId, id: postId }).go(),
    PlatformVariantEntity.query.variant({ workspaceId }).begins({ postId }).go(),
    PostMetricEntity.query.metric({ workspaceId }).begins({ postId }).go(),
    DraftVersionEntity.query.draft({ workspaceId }).begins({ postId }).go(),
  ])

  if (!postResult.data) {
    if (workspaceId === DEMO_WORKSPACE_ID) {
      return getDemoPostDetailForWorkspace(workspaceId, postId)
    }

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
      tasks: getDemoTasksForWorkspace(workspaceId, month),
      ideas: await listIdeas(workspaceId),
      brandVoice: await getBrandVoice(workspaceId),
    })
  }

  const [profile, plan, insights, metrics, tasks, ideas, brandVoice] = await Promise.all([
    getProfile(workspaceId),
    getMonthlyPlan(workspaceId, month),
    listInsights(workspaceId, month),
    listMetrics(workspaceId, month),
    listTasks(workspaceId, month),
    listIdeas(workspaceId),
    getBrandVoice(workspaceId),
  ])

  return dashboardSummarySchema.parse({
    profile,
    plan,
    posts: plan.posts,
    insights,
    metrics,
    tasks,
    ideas,
    brandVoice,
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
    saveDemoPostOverride(nextPost)
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

export async function savePostExternalReference(
  workspaceId: string,
  postId: string,
  reference: { externalId: string; publishedUrl?: string },
) {
  const detail = await getPostDetail(workspaceId, postId)
  const updatedAt = new Date().toISOString()
  const post: Post = {
    ...detail.post,
    externalId: reference.externalId,
    publishedUrl: reference.publishedUrl ?? detail.post.publishedUrl,
    version: detail.post.version + 1,
    updatedAt,
  }

  if (!dynamoReady()) {
    return { post, mode: "demo" as const }
  }

  await PostEntity.update({ workspaceId, id: postId })
    .set({
      externalId: post.externalId,
      ...(post.publishedUrl ? { publishedUrl: post.publishedUrl } : {}),
      version: post.version,
      updatedAt,
    })
    .go()

  return { post, mode: "dynamodb" as const }
}

export async function updatePostSchedule(
  workspaceId: string,
  postId: string,
  input: {
    scheduledDate: string
    scheduledTime: string
    timezone: string
    status?: WorkflowStatus
    version?: number
  },
) {
  let detail: PostDetail

  try {
    detail = await getPostDetail(workspaceId, postId)
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      return {
        ok: false as const,
        code: "NOT_FOUND" as const,
        message: error.message,
        mode: dynamoReady() ? ("dynamodb" as const) : ("demo" as const),
      }
    }

    throw error
  }

  if (input.version && input.version !== detail.post.version) {
    return {
      ok: false as const,
      code: "CONFLICT" as const,
      message: "The post was updated by another request. Refresh and try again.",
      mode: dynamoReady() ? ("dynamodb" as const) : ("demo" as const),
    }
  }

  const post = postSchema.parse({
    ...detail.post,
    scheduledDate: input.scheduledDate,
    month: monthFromDate(input.scheduledDate),
    scheduledTime: input.scheduledTime,
    timezone: input.timezone,
    status: input.status ?? detail.post.status,
    version: detail.post.version + 1,
    updatedAt: new Date().toISOString(),
  })

  if (!dynamoReady()) {
    saveDemoPostOverride(post)
    return { ok: true as const, post, mode: "demo" as const }
  }

  try {
    await PostEntity.update({ workspaceId, id: postId })
      .set({
        scheduledDate: post.scheduledDate,
        month: post.month,
        scheduledTime: post.scheduledTime,
        timezone: post.timezone,
        status: post.status,
        version: post.version,
        updatedAt: post.updatedAt,
      })
      .where(({ version }, { eq }) => eq(version, input.version ?? detail.post.version))
      .go()
  } catch {
    return {
      ok: false as const,
      code: "CONFLICT" as const,
      message: "The schedule update could not be applied because the stored version changed.",
      mode: "dynamodb" as const,
    }
  }

  return { ok: true as const, post, mode: "dynamodb" as const }
}

export async function addPostToQueue(workspaceId: string, postId: string, input: { timezone: string; version?: number }) {
  const plan = await getMonthlyPlan(workspaceId)
  const queuedPosts = plan.posts.filter((post) => post.queueStatus === "queued")
  const takenSlots = new Set(queuedPosts.map((post) => `${post.scheduledDate}#${post.scheduledTime ?? "09:00"}`))
  const slots = ["09:00", "13:00", "17:00"]
  const dates = plan.posts.map((post) => post.scheduledDate)
  let scheduledDate = dates[0] ?? `${DEMO_MONTH}-01`
  let scheduledTime = slots[0]

  for (const date of dates) {
    const available = slots.find((slot) => !takenSlots.has(`${date}#${slot}`))
    if (available) {
      scheduledDate = date
      scheduledTime = available
      break
    }
  }

  const result = await updatePostSchedule(workspaceId, postId, {
    scheduledDate,
    scheduledTime,
    timezone: input.timezone,
    status: "Scheduled",
    version: input.version,
  })

  if (!result.ok) {
    return result
  }

  const post = postSchema.parse({
    ...result.post,
    queueStatus: "queued",
    queuePosition: Math.max(0, ...queuedPosts.map((item) => item.queuePosition ?? 0)) + 1,
  })

  if (!dynamoReady()) {
    saveDemoPostOverride(post)
    return { ok: true as const, post, mode: "demo" as const }
  }

  await PostEntity.update({ workspaceId, id: postId })
    .set({
      queueStatus: post.queueStatus,
      queuePosition: post.queuePosition,
    })
    .go()

  return { ok: true as const, post, mode: "dynamodb" as const }
}

export async function saveCarouselExport(workspaceId: string, exportData: Omit<CarouselExport, "workspaceId">) {
  const saved = carouselExportSchema.parse({
    ...exportData,
    workspaceId,
  })

  if (!dynamoReady()) {
    const key = `${workspaceId}#${saved.postId}`
    demoCarouselStore.set(key, [saved, ...(demoCarouselStore.get(key) ?? [])])
    return { export: saved, mode: "demo" as const }
  }

  await CarouselExportEntity.put(saved).go()

  return { export: saved, mode: "dynamodb" as const }
}

export async function getCarouselExport(workspaceId: string, postId: string, exportId: string) {
  if (!dynamoReady()) {
    return (demoCarouselStore.get(`${workspaceId}#${postId}`) ?? []).find((item) => item.id === exportId)
  }

  const result = await CarouselExportEntity.get({ workspaceId, postId, id: exportId }).go()
  return result.data ? carouselExportSchema.parse(result.data) : undefined
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

export async function listTasks(workspaceId: string, month = DEMO_MONTH): Promise<CreatorTask[]> {
  if (canUseDemoFallback(workspaceId)) {
    return getDemoTasksForWorkspace(workspaceId, month)
  }

  const result = await TaskEntity.query.byMonth({ workspaceId, month }).go()

  return result.data.map((item) => creatorTaskSchema.parse(item))
}

export async function listIdeas(workspaceId: string): Promise<Idea[]> {
  if (!dynamoReady()) {
    const current = demoIdeaStore.get(workspaceId)

    if (current?.length) {
      return current.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }

    return [
      ideaSchema.parse({
        id: "idea-demo-brand-voice",
        workspaceId,
        title: "Turn the strongest workflow insight into a carousel",
        description: "Use the retention insight to explain how creators can stop restarting from a blank calendar.",
        source: "manual",
        status: "new",
        platform: "linkedin",
        createdAt: "2026-06-10T00:00:00.000Z",
        updatedAt: "2026-06-10T00:00:00.000Z",
      }),
    ]
  }

  const result = await IdeaEntity.query.byCreatedAt({ workspaceId }).go()
  return result.data.map((item) => ideaSchema.parse(item)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function createIdea(
  workspaceId: string,
  input: { title: string; description: string; platform?: Post["primaryPlatform"] },
  source: IdeaSource = "manual",
) {
  const now = new Date().toISOString()
  const idea = ideaSchema.parse({
    ...input,
    id: makeId("idea"),
    workspaceId,
    source,
    status: "new",
    createdAt: now,
    updatedAt: now,
  })

  if (!dynamoReady()) {
    demoIdeaStore.set(workspaceId, [idea, ...(demoIdeaStore.get(workspaceId) ?? [])])
    return { idea, mode: "demo" as const }
  }

  await IdeaEntity.put(idea).go()

  return { idea, mode: "dynamodb" as const }
}

export async function updateIdea(workspaceId: string, update: { id: string; title?: string; description?: string; status?: Idea["status"]; platform?: Idea["platform"] }) {
  const current = (await listIdeas(workspaceId)).find((idea) => idea.id === update.id)

  if (!current) {
    return {
      ok: false as const,
      code: "NOT_FOUND" as const,
      message: "Idea could not be found.",
      mode: dynamoReady() ? ("dynamodb" as const) : ("demo" as const),
    }
  }

  const idea = ideaSchema.parse({
    ...current,
    ...update,
    updatedAt: new Date().toISOString(),
  })

  if (!dynamoReady()) {
    const next = (demoIdeaStore.get(workspaceId) ?? []).filter((item) => item.id !== idea.id)
    demoIdeaStore.set(workspaceId, [idea, ...next])
    return { ok: true as const, idea, mode: "demo" as const }
  }

  await IdeaEntity.update({ workspaceId, id: idea.id })
    .set({
      title: idea.title,
      description: idea.description,
      status: idea.status,
      ...(idea.platform ? { platform: idea.platform } : {}),
      updatedAt: idea.updatedAt,
    })
    .go()

  return { ok: true as const, idea, mode: "dynamodb" as const }
}

export async function calculateBestTimes(workspaceId: string, month = DEMO_MONTH) {
  const metrics = await listMetrics(workspaceId, month)
  const posts = await listPosts(workspaceId, month)
  const postById = new Map(posts.map((post) => [post.id, post]))
  const buckets = new Map<string, { score: number; count: number }>()

  for (const metric of metrics) {
    const post = postById.get(metric.postId)
    const time = post?.scheduledTime ?? metric.publishedAt.slice(11, 16)
    const day = post?.scheduledDate ?? metric.publishedAt.slice(0, 10)
    const key = `${new Date(`${day}T00:00:00.000Z`).getUTCDay()}#${time}`
    const current = buckets.get(key) ?? { score: 0, count: 0 }
    buckets.set(key, {
      score: current.score + metric.views + metric.likes * 8 + metric.comments * 16 + metric.saves * 20,
      count: current.count + 1,
    })
  }

  const recommendations = Array.from(buckets.entries())
    .map(([key, value]) => {
      const [weekday, time] = key.split("#")
      return {
        weekday: Number(weekday),
        time,
        averageScore: Math.round(value.score / Math.max(value.count, 1)),
        sampleSize: value.count,
        confidence: value.count >= 5 ? "high" : value.count >= 2 ? "medium" : "low",
      }
    })
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 6)

  return {
    recommendations,
    minimumSampleSize: 5,
    metricCount: metrics.length,
    mode: dynamoReady() ? ("dynamodb" as const) : ("demo" as const),
  }
}

export async function saveInsight(workspaceId: string, insight: Insight) {
  const saved = { ...insight, workspaceId }

  if (!dynamoReady()) {
    return { insight: saved, mode: "demo" as const }
  }

  await InsightEntity.put(saved).go()

  return { insight: saved, mode: "dynamodb" as const }
}

export async function saveTasks(workspaceId: string, tasks: CreatorTask[]) {
  const saved = tasks.map((task) => creatorTaskSchema.parse({ ...task, workspaceId }))

  if (!dynamoReady()) {
    for (const task of saved) {
      const key = `${workspaceId}#${task.month}`
      const current = demoTaskStore.get(key) ?? []
      const next = current.filter((item) => item.id !== task.id)
      demoTaskStore.set(key, [...next, task])
    }

    return { tasks: saved, mode: "demo" as const }
  }

  await Promise.all(saved.map((task) => TaskEntity.put(task).go()))

  return { tasks: saved, mode: "dynamodb" as const }
}

export async function updateTaskStatus(workspaceId: string, taskId: string, status: CreatorTaskStatus) {
  let existing: CreatorTask | undefined

  if (dynamoReady()) {
    const result = await TaskEntity.get({ workspaceId, id: taskId }).go()
    existing = result.data ? creatorTaskSchema.parse(result.data) : undefined
  } else {
    existing = (await listTasks(workspaceId)).find((task) => task.id === taskId)
  }

  const updatedAt = new Date().toISOString()

  if (!existing) {
    return {
      ok: false as const,
      code: "NOT_FOUND" as const,
      message: "Task could not be found.",
      mode: dynamoReady() ? ("dynamodb" as const) : ("demo" as const),
    }
  }

  const task = creatorTaskSchema.parse({
    ...existing,
    status,
    updatedAt,
  })

  if (!dynamoReady()) {
    const key = `${workspaceId}#${task.month}`
    const current = demoTaskStore.get(key) ?? []
    const seededTask = demoTasks.some((item) => item.id === task.id)
    const next = seededTask ? current : current.filter((item) => item.id !== task.id)
    demoTaskStore.set(key, [...next, task])

    return { ok: true as const, task, mode: "demo" as const }
  }

  await TaskEntity.update({ workspaceId, id: taskId })
    .set({
      status,
      updatedAt,
    })
    .go()

  return { ok: true as const, task, mode: "dynamodb" as const }
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
  const tasks = getDemoTasksForWorkspace(DEMO_WORKSPACE_ID, DEMO_MONTH)
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

  for (const task of tasks) {
    await TaskEntity.put(task).go()
    count += 1
  }

  return { seeded: true, mode: "dynamodb" as const, count }
}
