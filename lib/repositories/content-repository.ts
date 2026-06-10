import {
  GetCommand,
  PutCommand,
  QueryCommand,
  TransactWriteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb"
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
import { getDynamoConfig } from "@/lib/env"
import {
  draftSk,
  insightSk,
  metricSk,
  metricsMonthPk,
  monthPk,
  planSk,
  platformPk,
  postSk,
  profileSk,
  statusPk,
  variantSk,
  workspacePk,
} from "@/lib/repositories/key-builder"

type RepositoryMode = "demo" | "dynamodb"

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

function tableName() {
  return getDynamoConfig().tableName
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

function toDynamoProfile(profile: AccountDna) {
  return {
    ...profile,
    pk: workspacePk(profile.workspaceId),
    sk: profileSk(),
  }
}

function toDynamoPlan(plan: MonthlyPlan) {
  const planItem = {
    workspaceId: plan.workspaceId,
    month: plan.month,
    title: plan.title,
    summary: plan.summary,
    themes: plan.themes,
    generationStatus: plan.generationStatus,
    updatedAt: plan.updatedAt,
  }

  return {
    ...planItem,
    pk: workspacePk(plan.workspaceId),
    sk: planSk(plan.month),
    gsi1pk: monthPk(plan.workspaceId, plan.month),
    gsi1sk: "PLAN",
  }
}

function toDynamoPost(post: Post) {
  return {
    ...post,
    pk: workspacePk(post.workspaceId),
    sk: postSk(post.id),
    gsi1pk: monthPk(post.workspaceId, post.month),
    gsi1sk: `DATE#${post.scheduledDate}#POST#${post.id}`,
    gsi2pk: statusPk(post.workspaceId, post.status),
    gsi2sk: `DATE#${post.scheduledDate}#POST#${post.id}`,
  }
}

function toDynamoVariant(variant: PlatformVariant, post: Post) {
  return {
    ...variant,
    workspaceId: post.workspaceId,
    month: post.month,
    scheduledDate: post.scheduledDate,
    pk: workspacePk(post.workspaceId),
    sk: variantSk(post.id, variant.platform),
    gsi2pk: platformPk(post.workspaceId, variant.platform),
    gsi2sk: `DATE#${post.scheduledDate}#POST#${post.id}`,
  }
}

function toDynamoDraft(draft: DraftVersion, workspaceId: string) {
  return {
    ...draft,
    workspaceId,
    pk: workspacePk(workspaceId),
    sk: draftSk(draft.postId, draft.platform, draft.version),
  }
}

function toDynamoMetric(metric: PostMetric, workspaceId: string) {
  const month = monthFromDate(metric.publishedAt)

  return {
    ...metric,
    workspaceId,
    month,
    pk: workspacePk(workspaceId),
    sk: metricSk(metric.postId, metric.publishedAt),
    gsi1pk: metricsMonthPk(workspaceId, month),
    gsi1sk: `DATE#${metric.publishedAt}#POST#${metric.postId}`,
  }
}

function toDynamoInsight(insight: Insight) {
  return {
    ...insight,
    pk: workspacePk(insight.workspaceId),
    sk: insightSk(insight.month, insight.generatedAt),
    gsi1pk: monthPk(insight.workspaceId, insight.month),
    gsi1sk: `INSIGHT#${insight.generatedAt}`,
  }
}

function stripKeys<T extends Record<string, unknown>>(item: T) {
  const rest = { ...item }
  delete rest.pk
  delete rest.sk
  delete rest.gsi1pk
  delete rest.gsi1sk
  delete rest.gsi2pk
  delete rest.gsi2sk
  return rest
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

  const client = getDocumentClient()
  const result = await client?.send(
    new GetCommand({
      TableName: tableName(),
      Key: { pk: workspacePk(workspaceId), sk: profileSk() },
    }),
  )

  if (!result?.Item) {
    throw new ContentNotFoundError("PROFILE_NOT_FOUND", "Profile could not be found.")
  }

  return accountDnaSchema.parse(stripKeys(result.Item))
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

  await getDocumentClient()?.send(
    new PutCommand({
      TableName: tableName(),
      Item: toDynamoProfile(saved),
    }),
  )

  return { profile: saved, mode: "dynamodb" as const }
}

export async function getMonthlyPlan(workspaceId: string, month = DEMO_MONTH): Promise<MonthlyPlan> {
  if (canUseDemoFallback(workspaceId)) {
    return getDemoPlanForWorkspace(workspaceId, month)
  }

  const client = getDocumentClient()
  const [planResult, postsResult] = await Promise.all([
    client?.send(
      new GetCommand({
        TableName: tableName(),
        Key: { pk: workspacePk(workspaceId), sk: planSk(month) },
      }),
    ),
    client?.send(
      new QueryCommand({
        TableName: tableName(),
        IndexName: "gsi1",
        KeyConditionExpression: "gsi1pk = :pk AND begins_with(gsi1sk, :prefix)",
        ExpressionAttributeValues: {
          ":pk": monthPk(workspaceId, month),
          ":prefix": "DATE#",
        },
      }),
    ),
  ])

  if (!planResult?.Item || !postsResult?.Items?.length) {
    throw new ContentNotFoundError("PLAN_NOT_FOUND", "Monthly plan could not be found.")
  }

  const posts = postsResult.Items.map((item) => postSchema.parse(stripKeys(item))).sort((a, b) =>
    a.scheduledDate.localeCompare(b.scheduledDate),
  )
  const plan = monthlyPlanSchema.parse({
    ...stripKeys(planResult.Item),
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

  const client = getDocumentClient()
  const result = await client?.send(
    new QueryCommand({
      TableName: tableName(),
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
      ExpressionAttributeValues: {
        ":pk": workspacePk(workspaceId),
        ":prefix": `POST#${postId}`,
      },
    }),
  )

  const items = result?.Items ?? []
  const postItem = items.find((item) => item.sk === postSk(postId))

  if (!postItem) {
    throw new ContentNotFoundError("POST_NOT_FOUND", "Post could not be found.")
  }

  const post = postSchema.parse(stripKeys(postItem))
  const variants = items
    .filter((item) => typeof item.sk === "string" && item.sk.includes("#VARIANT#"))
    .map((item) => platformVariantSchema.parse(stripKeys(item)))
  const metrics = items
    .filter((item) => typeof item.sk === "string" && item.sk.includes("#METRIC#"))
    .map((item) => postMetricSchema.parse(stripKeys(item)))
  const drafts = items
    .filter((item) => typeof item.sk === "string" && item.sk.includes("#DRAFT#"))
    .map((item) => draftVersionSchema.parse(stripKeys(item)))

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

  if (!dynamoReady()) {
    return { variant, mode: "demo" as const }
  }

  await getDocumentClient()?.send(
    new PutCommand({
      TableName: tableName(),
      Item: toDynamoVariant(variant, detail.post),
    }),
  )

  return { variant, mode: "dynamodb" as const }
}

export async function saveDraft(workspaceId: string, draft: DraftVersion) {
  if (!dynamoReady()) {
    return { draft, mode: "demo" as const }
  }

  await getDocumentClient()?.send(
    new PutCommand({
      TableName: tableName(),
      Item: toDynamoDraft(draft, workspaceId),
    }),
  )

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
    await getDocumentClient()?.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { pk: workspacePk(workspaceId), sk: postSk(postId) },
        UpdateExpression:
          "SET #status = :status, #version = :nextVersion, #updatedAt = :updatedAt, gsi2pk = :gsi2pk",
        ConditionExpression: "#version = :expectedVersion",
        ExpressionAttributeNames: {
          "#status": "status",
          "#version": "version",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
          ":status": status,
          ":nextVersion": nextPost.version,
          ":expectedVersion": expectedVersion ?? detail.post.version,
          ":updatedAt": nextPost.updatedAt,
          ":gsi2pk": statusPk(workspaceId, status),
        },
      }),
    )
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
  if (!dynamoReady()) {
    return { metric, mode: "demo" as const }
  }

  await getDocumentClient()?.send(
    new PutCommand({
      TableName: tableName(),
      Item: toDynamoMetric(metric, workspaceId),
    }),
  )

  return { metric, mode: "dynamodb" as const }
}

export async function listMetrics(workspaceId: string, month = DEMO_MONTH): Promise<PostMetric[]> {
  if (canUseDemoFallback(workspaceId)) {
    return clone(demoMetrics)
  }

  const result = await getDocumentClient()?.send(
    new QueryCommand({
      TableName: tableName(),
      IndexName: "gsi1",
      KeyConditionExpression: "gsi1pk = :pk",
      ExpressionAttributeValues: {
        ":pk": metricsMonthPk(workspaceId, month),
      },
    }),
  )

  return (result?.Items ?? []).map((item) => postMetricSchema.parse(stripKeys(item)))
}

export async function listInsights(workspaceId: string, month = DEMO_MONTH): Promise<Insight[]> {
  if (canUseDemoFallback(workspaceId)) {
    return getDemoInsightsForWorkspace(workspaceId, month)
  }

  const result = await getDocumentClient()?.send(
    new QueryCommand({
      TableName: tableName(),
      IndexName: "gsi1",
      KeyConditionExpression: "gsi1pk = :pk AND begins_with(gsi1sk, :prefix)",
      ExpressionAttributeValues: {
        ":pk": monthPk(workspaceId, month),
        ":prefix": "INSIGHT#",
      },
    }),
  )

  return (result?.Items ?? []).map((item) => insightSchema.parse(stripKeys(item)))
}

export async function saveInsight(workspaceId: string, insight: Insight) {
  const saved = { ...insight, workspaceId }

  if (!dynamoReady()) {
    return { insight: saved, mode: "demo" as const }
  }

  await getDocumentClient()?.send(
    new PutCommand({
      TableName: tableName(),
      Item: toDynamoInsight(saved),
    }),
  )

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
  const writes = [
    toDynamoProfile(profile),
    toDynamoPlan(plan),
    ...plan.posts.map(toDynamoPost),
    ...variants.map((variant) => {
      const post = plan.posts.find((item) => item.id === variant.postId) ?? plan.posts[0]
      return toDynamoVariant(variant, post)
    }),
    ...drafts.map((draft) => toDynamoDraft(draft, DEMO_WORKSPACE_ID)),
    ...metrics.map((metric) => toDynamoMetric(metric, DEMO_WORKSPACE_ID)),
    ...insights.map(toDynamoInsight),
  ]

  for (let index = 0; index < writes.length; index += 25) {
    const batch = writes.slice(index, index + 25)
    await getDocumentClient()?.send(
      new TransactWriteCommand({
        TransactItems: batch.map((item) => ({
          Put: {
            TableName: tableName(),
            Item: item,
          },
        })),
      }),
    )
  }

  return { seeded: true, mode: "dynamodb" as const, count: writes.length }
}
