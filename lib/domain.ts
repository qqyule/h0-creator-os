import { z } from "zod"

export const workspaceIdSchema = z.string().min(3)

export const platformSchema = z.enum(["linkedin", "x", "youtube", "rednote"])
export type PlatformId = z.infer<typeof platformSchema>

export const workflowStatusSchema = z.enum(["Idea", "Drafting", "Review", "Scheduled", "Published"])
export type WorkflowStatus = z.infer<typeof workflowStatusSchema>

export const workflowStatuses: WorkflowStatus[] = ["Idea", "Drafting", "Review", "Scheduled", "Published"]

export const creatorTaskStatusSchema = z.enum(["open", "done"])
export type CreatorTaskStatus = z.infer<typeof creatorTaskStatusSchema>

export const ideaStatusSchema = z.enum(["new", "planned", "archived"])
export type IdeaStatus = z.infer<typeof ideaStatusSchema>

export const ideaSourceSchema = z.enum(["manual", "approved-trend"])
export type IdeaSource = z.infer<typeof ideaSourceSchema>

export const queueStatusSchema = z.enum(["none", "queued"])
export type QueueStatus = z.infer<typeof queueStatusSchema>

export const platformLabels: Record<PlatformId, string> = {
  linkedin: "LinkedIn",
  x: "X",
  youtube: "YouTube",
  rednote: "Rednote",
}

export const toneSandboxSchema = z.enum(["Analytic", "Playful", "Provocative", "Empathetic"])
export type ToneSandbox = z.infer<typeof toneSandboxSchema>

export const toneSandboxOptions: ToneSandbox[] = ["Analytic", "Playful", "Provocative", "Empathetic"]

export const accountDnaSchema = z.object({
  workspaceId: workspaceIdSchema,
  niche: z.string().min(2).max(120),
  audience: z.string().min(2).max(240),
  platforms: z.array(platformSchema).min(1),
  cadence: z.string().min(2).max(120),
  tone: z.string().min(2).max(160),
  goals: z.array(z.string().min(2).max(160)).min(1).max(6),
  youtubeChannelId: z.string().min(2).max(120).optional(),
  updatedAt: z.string().datetime(),
})
export type AccountDna = z.infer<typeof accountDnaSchema>

export const brandVoiceExampleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2).max(120),
  text: z.string().min(20).max(800),
  approved: z.boolean(),
})
export type BrandVoiceExample = z.infer<typeof brandVoiceExampleSchema>

export const brandVoiceSchema = z.object({
  workspaceId: workspaceIdSchema,
  traits: z.array(z.string().min(2).max(120)).max(8),
  examples: z.array(brandVoiceExampleSchema).max(3),
  updatedAt: z.string().datetime(),
})
export type BrandVoice = z.infer<typeof brandVoiceSchema>

export const postMetricSourceSchema = z.enum(["manual", "youtube"])
export type PostMetricSource = z.infer<typeof postMetricSourceSchema>

export const postMetricSchema = z.object({
  postId: z.string().min(1),
  platform: platformSchema,
  publishedAt: z.string().datetime(),
  views: z.number().int().nonnegative(),
  likes: z.number().int().nonnegative(),
  comments: z.number().int().nonnegative(),
  saves: z.number().int().nonnegative(),
  followersGained: z.number().int().nonnegative(),
  source: postMetricSourceSchema.default("manual"),
})
export type PostMetric = z.infer<typeof postMetricSchema>

export const platformVariantSchema = z.object({
  postId: z.string().min(1),
  platform: platformSchema,
  headline: z.string().min(2).max(180),
  body: z.string().min(2).max(2800),
  callToAction: z.string().min(2).max(220),
  characterCount: z.number().int().nonnegative(),
  status: z.enum(["seeded", "generated", "edited"]),
  updatedAt: z.string().datetime(),
})
export type PlatformVariant = z.infer<typeof platformVariantSchema>

export const draftVersionSchema = z.object({
  postId: z.string().min(1),
  platform: platformSchema,
  version: z.number().int().positive(),
  body: z.string().min(2),
  createdAt: z.string().datetime(),
})
export type DraftVersion = z.infer<typeof draftVersionSchema>

export const postSchema = z.object({
  id: z.string().min(1),
  workspaceId: workspaceIdSchema,
  month: z.string().regex(/^\d{4}-\d{2}$/),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(2).max(180),
  format: z.string().min(2).max(80),
  goal: z.string().min(2).max(160),
  keywords: z.array(z.string().min(1).max(48)).min(1).max(8),
  outline: z.array(z.string().min(2).max(240)).min(1).max(8),
  draft: z.string().min(2).max(4800),
  sourceIdea: z.string().min(2).max(400),
  status: workflowStatusSchema,
  primaryPlatform: platformSchema,
  platforms: z.array(platformSchema).min(1),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  timezone: z.string().min(2).max(80).optional(),
  queueStatus: queueStatusSchema.optional(),
  queuePosition: z.number().int().positive().optional(),
  externalId: z.string().min(1).max(120).optional(),
  publishedUrl: z.string().url().max(500).optional(),
  version: z.number().int().positive(),
  updatedAt: z.string().datetime(),
})
export type Post = z.infer<typeof postSchema>

export const ideaSchema = z.object({
  id: z.string().min(1),
  workspaceId: workspaceIdSchema,
  title: z.string().min(2).max(180),
  description: z.string().min(2).max(600),
  source: ideaSourceSchema,
  status: ideaStatusSchema,
  platform: platformSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Idea = z.infer<typeof ideaSchema>

export const carouselSlideSchema = z.object({
  title: z.string().min(2).max(120),
  body: z.string().min(2).max(500),
})
export type CarouselSlide = z.infer<typeof carouselSlideSchema>

export const carouselExportSchema = z.object({
  id: z.string().min(1),
  workspaceId: workspaceIdSchema,
  postId: z.string().min(1),
  title: z.string().min(2).max(120),
  slides: z.array(carouselSlideSchema).min(3).max(8),
  s3Key: z.string().min(1).optional(),
  createdAt: z.string().datetime(),
})
export type CarouselExport = z.infer<typeof carouselExportSchema>

export const monthlyPlanSchema = z.object({
  workspaceId: workspaceIdSchema,
  month: z.string().regex(/^\d{4}-\d{2}$/),
  title: z.string().min(2).max(180),
  summary: z.string().min(2).max(600),
  themes: z.array(z.string().min(2).max(120)).min(1).max(8),
  generationStatus: z.enum(["seeded", "generated", "fallback"]),
  posts: z.array(postSchema),
  updatedAt: z.string().datetime(),
})
export type MonthlyPlan = z.infer<typeof monthlyPlanSchema>

export const insightSchema = z.object({
  id: z.string().min(1),
  workspaceId: workspaceIdSchema,
  month: z.string().regex(/^\d{4}-\d{2}$/),
  title: z.string().min(2).max(180),
  summary: z.string().min(2).max(800),
  recommendations: z.array(z.string().min(2).max(260)).min(1).max(6),
  confidence: z.enum(["low", "medium", "high"]),
  generatedAt: z.string().datetime(),
})
export type Insight = z.infer<typeof insightSchema>

export const creatorTaskSchema = z.object({
  id: z.string().min(1),
  workspaceId: workspaceIdSchema,
  month: z.string().regex(/^\d{4}-\d{2}$/),
  title: z.string().min(2).max(180),
  description: z.string().min(2).max(600),
  sourceInsightId: z.string().min(1),
  postId: z.string().min(1).optional(),
  status: creatorTaskStatusSchema,
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type CreatorTask = z.infer<typeof creatorTaskSchema>

export const postDetailSchema = z.object({
  post: postSchema,
  variants: z.array(platformVariantSchema),
  metrics: z.array(postMetricSchema),
  drafts: z.array(draftVersionSchema),
})
export type PostDetail = z.infer<typeof postDetailSchema>

export const dashboardSummarySchema = z.object({
  profile: accountDnaSchema,
  plan: monthlyPlanSchema,
  posts: z.array(postSchema),
  insights: z.array(insightSchema),
  metrics: z.array(postMetricSchema),
  tasks: z.array(creatorTaskSchema),
  ideas: z.array(ideaSchema).default([]),
  brandVoice: brandVoiceSchema.optional(),
})
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>

export const accountDnaInputSchema = accountDnaSchema
  .omit({ workspaceId: true, updatedAt: true })
  .extend({
    goals: z.union([z.array(z.string().min(2).max(160)), z.string().min(2)]),
  })
  .transform((value) => ({
    ...value,
    goals: Array.isArray(value.goals)
      ? value.goals
      : value.goals
          .split(/\n|,/)
          .map((goal) => goal.trim())
          .filter(Boolean),
  }))

export const statusUpdateSchema = z.object({
  status: workflowStatusSchema,
  version: z.number().int().positive().optional(),
  updatedAt: z.string().datetime().optional(),
})

export const scheduleUpdateSchema = z.object({
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string().min(2).max(80),
  status: workflowStatusSchema.optional(),
  version: z.number().int().positive().optional(),
})

export const queuePostSchema = z.object({
  timezone: z.string().min(2).max(80).default("America/Los_Angeles"),
  version: z.number().int().positive().optional(),
})

export const rewriteRequestSchema = z.object({
  platform: platformSchema,
  tone: toneSandboxSchema.optional(),
})

export const draftRequestSchema = z.object({
  platform: platformSchema,
})

export const hookRewriteRequestSchema = z.object({
  platform: platformSchema,
  body: z.string().min(2).max(2800).optional(),
})

export const metricInputSchema = postMetricSchema
  .omit({ publishedAt: true })
  .extend({
    publishedAt: z.string().datetime().optional(),
  })

export const metricImportBatchSchema = z.object({
  metrics: z.array(metricInputSchema).min(1).max(100),
})

export const actionableTaskRequestSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
})

export const taskStatusUpdateSchema = z.object({
  status: creatorTaskStatusSchema,
})

export const liveMetricSyncInputSchema = z.object({
  externalId: z.string().trim().min(1).max(120),
  publishedUrl: z.string().trim().url().max(500).optional(),
})

export const assetPresignSchema = z.object({
  fileName: z.string().min(1).max(180),
  contentType: z.string().min(3).max(120),
  purpose: z.enum(["metrics-import", "export", "asset"]),
})

export const notificationTestSchema = z.object({
  email: z.string().email().optional(),
})

export const brandVoiceInputSchema = z.object({
  traits: z.array(z.string().min(2).max(120)).max(8).default([]),
  examples: z.array(brandVoiceExampleSchema.omit({ id: true }).extend({ id: z.string().min(1).optional() })).max(3).default([]),
})

export const ideaInputSchema = z.object({
  title: z.string().min(2).max(180),
  description: z.string().min(2).max(600),
  platform: platformSchema.optional(),
})

export const ideaUpdateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2).max(180).optional(),
  description: z.string().min(2).max(600).optional(),
  status: ideaStatusSchema.optional(),
  platform: platformSchema.optional(),
})

export const ideaImportSchema = z.object({
  ideas: z.array(ideaInputSchema).min(1).max(12),
})

export const carouselGenerateSchema = z.object({
  title: z.string().min(2).max(120).optional(),
})
