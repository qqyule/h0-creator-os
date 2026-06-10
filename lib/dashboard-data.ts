// Placeholder data for the CreatorOS dashboard.
// No business logic here — purely static content to drive the UI scaffold.

export type PlatformId = "linkedin" | "x" | "youtube" | "rednote"

export const statusColors = {
  planned: "#3b82f6",
  drafting: "#f59e0b",
  review: "#a855f7",
  scheduled: "#06b6d4",
  published: "#22c55e",
} as const

export type StatusId = keyof typeof statusColors

export const statusLegend: { id: StatusId; label: string }[] = [
  { id: "planned", label: "Planned" },
  { id: "drafting", label: "Drafting" },
  { id: "review", label: "Review" },
  { id: "scheduled", label: "Scheduled" },
  { id: "published", label: "Published" },
]

export const stats = [
  {
    id: "planned",
    label: "Planned Posts",
    labelZh: "计划内容",
    value: "96",
    delta: "12%",
    deltaLabel: "vs Apr 1 – Apr 30",
    trend: "up" as const,
    icon: "calendar" as const,
    color: "#3b82f6",
    tint: "#eff6ff",
    chart: "line" as const,
    series: [12, 18, 14, 22, 19, 28, 24, 31, 27, 35, 32, 44],
  },
  {
    id: "published",
    label: "Published",
    labelZh: "已发布",
    value: "58",
    delta: "18%",
    deltaLabel: "vs Apr 1 – Apr 30",
    trend: "up" as const,
    icon: "send" as const,
    color: "#22c55e",
    tint: "#ecfdf5",
    chart: "line" as const,
    series: [8, 10, 9, 14, 12, 17, 15, 22, 19, 26, 24, 33],
  },
  {
    id: "completion",
    label: "Completion Rate",
    labelZh: "完成率",
    value: "60%",
    delta: "8pp",
    deltaLabel: "vs Apr 1 – Apr 30",
    trend: "up" as const,
    icon: "pie" as const,
    color: "#a855f7",
    tint: "#faf5ff",
    chart: "donut" as const,
    series: [60],
  },
  {
    id: "reach",
    label: "Cross-platform Reach",
    labelZh: "跨平台触达",
    value: "278K",
    delta: "24%",
    deltaLabel: "vs Apr 1 – Apr 30",
    trend: "up" as const,
    icon: "radio" as const,
    color: "#f97316",
    tint: "#fff7ed",
    chart: "line" as const,
    series: [120, 140, 130, 175, 160, 205, 190, 240, 220, 260, 250, 278],
  },
]

// 30-Day Content Plan Snapshot — calendar grid by week.
export type CalendarDay = {
  day: number
  muted?: boolean
  today?: boolean
  dots?: StatusId[]
}

export const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export const calendarWeeks: { range: string; days: CalendarDay[] }[] = [
  {
    range: "Apr 28 – May 4",
    days: [
      { day: 28, muted: true },
      { day: 29, muted: true },
      { day: 30, muted: true },
      { day: 1, dots: ["planned"] },
      { day: 2, dots: ["drafting"] },
      { day: 3, dots: ["published"] },
      { day: 4, dots: ["published", "scheduled"] },
    ],
  },
  {
    range: "May 5 – May 11",
    days: [
      { day: 5, dots: ["planned"] },
      { day: 6, dots: ["drafting"] },
      { day: 7 },
      { day: 8, dots: ["review"] },
      { day: 9 },
      { day: 10, dots: ["scheduled"] },
      { day: 11, dots: ["published"] },
    ],
  },
  {
    range: "May 12 – May 18",
    days: [
      { day: 12, dots: ["planned", "drafting"] },
      { day: 13, dots: ["published"] },
      { day: 14, dots: ["published", "review"] },
      { day: 15, today: true },
      { day: 16, dots: ["scheduled"] },
      { day: 17 },
      { day: 18, dots: ["planned"] },
    ],
  },
  {
    range: "May 19 – May 25",
    days: [
      { day: 19, dots: ["drafting"] },
      { day: 20, dots: ["planned"] },
      { day: 21 },
      { day: 22, dots: ["review"] },
      { day: 23, dots: ["scheduled"] },
      { day: 24 },
      { day: 25, dots: ["planned"] },
    ],
  },
  {
    range: "May 26 – Jun 1",
    days: [
      { day: 26, dots: ["drafting"] },
      { day: 27 },
      { day: 28, dots: ["planned"] },
      { day: 29, dots: ["scheduled"] },
      { day: 30, dots: ["review"] },
      { day: 31, dots: ["planned"] },
      { day: 1, muted: true },
    ],
  },
]

// Workflow Overview — kanban columns
export type WorkflowCard = {
  title: string
  platform: PlatformId
  date?: string
}

export const workflowColumns: {
  id: StatusId
  label: string
  icon: "idea" | "draft" | "review" | "scheduled" | "published"
  count: number
  more: number
  cards: WorkflowCard[]
}[] = [
  {
    id: "planned",
    label: "Idea",
    icon: "idea",
    count: 18,
    more: 15,
    cards: [
      { title: "How to build your personal brand", platform: "linkedin" },
      { title: "Creators' tools roundup 2025", platform: "x" },
      { title: "3 lessons from content teams", platform: "youtube" },
    ],
  },
  {
    id: "drafting",
    label: "Drafting",
    icon: "draft",
    count: 14,
    more: 11,
    cards: [
      { title: "LinkedIn carousel on positioning", platform: "linkedin" },
      { title: "X thread: top 5 growth tips", platform: "x" },
      { title: "YouTube Short: myth vs fact", platform: "youtube" },
    ],
  },
  {
    id: "review",
    label: "Review",
    icon: "review",
    count: 7,
    more: 4,
    cards: [
      { title: "Rednote post: brand story", platform: "rednote" },
      { title: "Newsletter: May creator trends", platform: "linkedin" },
      { title: "YouTube video outline", platform: "youtube" },
    ],
  },
  {
    id: "scheduled",
    label: "Scheduled",
    icon: "scheduled",
    count: 16,
    more: 13,
    cards: [
      { title: "LinkedIn post: case study", platform: "linkedin", date: "May 16, 09:00" },
      { title: "X thread: content strategy", platform: "x", date: "May 16, 12:00" },
      { title: "YouTube video: workflow tips", platform: "youtube", date: "May 17, 10:00" },
    ],
  },
  {
    id: "published",
    label: "Published",
    icon: "published",
    count: 58,
    more: 55,
    cards: [
      { title: "5 content ideas that convert", platform: "linkedin", date: "May 14" },
      { title: "Stop guessing your audience", platform: "x", date: "May 14" },
      { title: "My creator journey", platform: "youtube", date: "May 13" },
    ],
  },
]

// Platform Mix — donut
export const platformMix: {
  id: PlatformId
  label: string
  count: number
  percent: string
  color: string
}[] = [
  { id: "linkedin", label: "LinkedIn", count: 42, percent: "43.8%", color: "#2563eb" },
  { id: "x", label: "X (Twitter)", count: 28, percent: "29.2%", color: "#0f172a" },
  { id: "youtube", label: "YouTube", count: 16, percent: "16.7%", color: "#ef4444" },
  { id: "rednote", label: "Rednote", count: 10, percent: "10.4%", color: "#f43f5e" },
]

// AI Insights
export const aiInsights: {
  text: string
  tag: string
  tagTone: "growth" | "timing" | "optimization"
  icon: "spark" | "play"
}[] = [
  {
    text: "LinkedIn carousel posts have 23% higher reach than single image posts. Consider adding more.",
    tag: "Growth",
    tagTone: "growth",
    icon: "spark",
  },
  {
    text: "Your audience is most active on X at 11:00 AM UTC. Consider scheduling threads earlier.",
    tag: "Timing",
    tagTone: "timing",
    icon: "play",
  },
  {
    text: "YouTube retention drops after 45s. Try a stronger hook in the first 15s.",
    tag: "Optimization",
    tagTone: "optimization",
    icon: "play",
  },
]

// Upcoming Tasks
export const upcomingTasks: {
  title: string
  platform: PlatformId
  due: string
  done?: boolean
}[] = [
  {
    title: "Review LinkedIn carousel: Brand positioning framework",
    platform: "linkedin",
    due: "Today, 10:00 AM",
  },
  {
    title: "Approve YouTube video: Content workflow best practices",
    platform: "youtube",
    due: "Today, 02:00 PM",
  },
  {
    title: "Schedule X thread: 5 growth experiments",
    platform: "x",
    due: "Tomorrow, 11:00 AM",
  },
  {
    title: "Publish Rednote post: 我的内容运营经验",
    platform: "rednote",
    due: "Tomorrow, 03:00 PM",
    done: true,
  },
]

// Recent Activity
export const recentActivity: {
  action: string
  title: string
  platform: PlatformId | "team"
  time: string
}[] = [
  {
    action: "Published LinkedIn post",
    title: "\u201C5 content ideas that convert\u201D",
    platform: "linkedin",
    time: "May 14, 09:02 AM",
  },
  {
    action: "Scheduled X thread",
    title: "\u201CContent strategy in 2025\u201D",
    platform: "x",
    time: "May 14, 12:00 PM",
  },
  {
    action: "Uploaded YouTube video",
    title: "\u201CCreator workflow tips\u201D",
    platform: "youtube",
    time: "May 13, 10:15 PM",
  },
  {
    action: "Published Rednote post",
    title: "\u201C我的内容运营经验\u201D",
    platform: "rednote",
    time: "May 13, 03:45 PM",
  },
  {
    action: "Team member Alex",
    title: "approved 3 items",
    platform: "team",
    time: "May 13, 11:20 AM",
  },
]

export const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" as const, href: "/dashboard" },
  { id: "onboarding", label: "Account DNA", icon: "ideas" as const, href: "/onboarding" },
  { id: "calendar", label: "Calendar", icon: "calendar" as const, href: "/calendar" },
  { id: "workflow", label: "Post Workflow", icon: "workflow" as const, href: "/post/post-01" },
  { id: "analytics", label: "Analytics", icon: "analytics" as const, href: "/analytics" },
]
