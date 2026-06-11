import type {
  AccountDna,
  DraftVersion,
  Insight,
  MonthlyPlan,
  PlatformId,
  PlatformVariant,
  Post,
  PostMetric,
  WorkflowStatus,
} from "@/lib/domain"

export const DEMO_WORKSPACE_ID = "DEMO#judge"
export const DEMO_MONTH = "2026-06"

const now = "2026-06-10T00:00:00.000Z"
const platforms: PlatformId[] = ["linkedin", "x", "youtube", "rednote"]
const statuses: WorkflowStatus[] = ["Idea", "Drafting", "Review", "Scheduled", "Published"]
const formats = ["LinkedIn carousel", "X thread", "YouTube short", "Rednote story", "Newsletter clip"]
const goals = ["Positioning", "Lead magnet", "Community trust", "Launch support", "Retention"]
const themes = ["Content operations", "Creator workflow", "Audience learning", "Cross-platform packaging"]

export const demoProfile: AccountDna = {
  workspaceId: DEMO_WORKSPACE_ID,
  niche: "B2B creator operations for independent consultants",
  audience: "Solo experts and small studios turning expertise into repeatable content systems.",
  platforms,
  cadence: "One flagship idea per weekday, adapted across priority platforms.",
  tone: "Clear, practical, operator-led, with concise examples and no hype.",
  goals: [
    "Build trust with B2B founders",
    "Turn repeat questions into evergreen posts",
    "Create a monthly operating rhythm",
  ],
  updatedAt: now,
}

function dateForDay(day: number) {
  return `${DEMO_MONTH}-${String(day).padStart(2, "0")}`
}

export const demoPosts: Post[] = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1
  const primaryPlatform = platforms[index % platforms.length]
  const titlePool = [
    "Turn repeated client questions into a content engine",
    "The weekly review that keeps creators shipping",
    "How to adapt one idea without sounding repetitive",
    "What your content calendar is missing",
    "A practical system for measuring creator momentum",
  ]
  const title = `${titlePool[index % titlePool.length]} #${day}`

  return {
    id: `post-${String(day).padStart(2, "0")}`,
    workspaceId: DEMO_WORKSPACE_ID,
    month: DEMO_MONTH,
    scheduledDate: dateForDay(day),
    title,
    format: formats[index % formats.length],
    goal: goals[index % goals.length],
    keywords: ["creator ops", "planning", "workflow", primaryPlatform],
    outline: [
      "Name the recurring content operations problem.",
      "Show the lightweight workflow that solves it.",
      "Give the reader one action to try this week.",
    ],
    draft:
      "Creators do not need another blank calendar. They need a system that turns positioning, ideas, drafts, publishing status, and feedback into one operating loop.",
    sourceIdea: `Use a real workflow moment to explain why creator operations matter on day ${day}.`,
    status: statuses[index % statuses.length],
    primaryPlatform,
    platforms,
    version: 1,
    updatedAt: now,
  }
})

export const demoPlan: MonthlyPlan = {
  workspaceId: DEMO_WORKSPACE_ID,
  month: DEMO_MONTH,
  title: "June creator operations plan",
  summary:
    "A 30-day plan that turns one B2B creator positioning system into daily posts, platform rewrites, workflow status, and feedback loops.",
  themes,
  generationStatus: "seeded",
  posts: demoPosts,
  updatedAt: now,
}

export const demoVariants: PlatformVariant[] = demoPosts.flatMap((post) =>
  platforms.map((platform) => {
    const bodies: Record<PlatformId, string> = {
      linkedin:
        "Most content calendars fail because they only track publish dates. A real creator operating system also tracks source ideas, draft status, platform rewrites, and what performance taught you for the next cycle.",
      x:
        "A content calendar is not enough. Track the idea, draft, rewrite, status, metrics, and next insight in one loop. That is how creators stop restarting every month.",
      youtube:
        "In this short, break down why a blank calendar creates more work and show the operating loop: plan, adapt, publish, measure, and improve.",
      rednote:
        "不要只做内容日历。把选题、草稿、平台改写、发布状态和数据复盘串起来，创作者才不会每个月从零开始。",
    }

    return {
      postId: post.id,
      platform,
      headline: `${post.title} for ${platform}`,
      body: bodies[platform],
      callToAction: "Save this workflow for your next planning cycle.",
      characterCount: bodies[platform].length,
      status: "seeded",
      updatedAt: now,
    }
  }),
)

export const demoDrafts: DraftVersion[] = demoPosts.map((post) => ({
  postId: post.id,
  platform: post.primaryPlatform,
  version: 1,
  body: `${post.draft}\n\nOutline:\n${post.outline.map((item) => `- ${item}`).join("\n")}`,
  createdAt: now,
}))

export const demoMetrics: PostMetric[] = demoPosts
  .filter((post) => post.status === "Published")
  .map((post, index) => ({
    postId: post.id,
    platform: post.primaryPlatform,
    publishedAt: `${post.scheduledDate}T09:00:00.000Z`,
    views: 4200 + index * 690,
    likes: 210 + index * 31,
    comments: 24 + index * 5,
    saves: 48 + index * 7,
    followersGained: 8 + index * 3,
    source: "manual",
  }))

export const demoInsights: Insight[] = [
  {
    id: "insight-june-retention",
    workspaceId: DEMO_WORKSPACE_ID,
    month: DEMO_MONTH,
    title: "Operational posts are earning stronger saves",
    summary:
      "Workflow-driven posts have the highest save rate. Keep making the operating loop visible instead of publishing isolated tips.",
    recommendations: [
      "Lead next week with the planning loop before introducing tools.",
      "Turn the best LinkedIn carousel into a YouTube short and Rednote checklist.",
      "Ask for one workflow reply on X to collect next-cycle objections.",
    ],
    confidence: "high",
    generatedAt: now,
  },
  {
    id: "insight-june-platform-fit",
    workspaceId: DEMO_WORKSPACE_ID,
    month: DEMO_MONTH,
    title: "Each platform needs a different job",
    summary:
      "LinkedIn is carrying trust-building, X is carrying concise prompts, YouTube is best for workflow explanation, and Rednote needs more concrete templates.",
    recommendations: [
      "Use LinkedIn for proof and frameworks.",
      "Use X for prompts and fast experiments.",
      "Use Rednote for checklist-style posts with a first-person angle.",
    ],
    confidence: "medium",
    generatedAt: now,
  },
]

export function getDemoPostDetail(postId: string) {
  const post = demoPosts.find((item) => item.id === postId)

  if (!post) {
    return undefined
  }

  return {
    post,
    variants: demoVariants.filter((variant) => variant.postId === post.id),
    metrics: demoMetrics.filter((metric) => metric.postId === post.id),
    drafts: demoDrafts.filter((draft) => draft.postId === post.id),
  }
}

export function getDemoDashboardSummary() {
  return {
    profile: demoProfile,
    plan: demoPlan,
    posts: demoPosts,
    insights: demoInsights,
    metrics: demoMetrics,
  }
}
