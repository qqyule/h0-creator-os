import { z } from "zod"
import {
  creatorTaskSchema,
  carouselSlideSchema,
  draftVersionSchema,
  insightSchema,
  monthlyPlanSchema,
  platformVariantSchema,
  type AccountDna,
  type BrandVoice,
  type CarouselSlide,
  type CreatorTask,
  type DraftVersion,
  type Insight,
  type MonthlyPlan,
  type PlatformId,
  type PlatformVariant,
  type PostDetail,
  type PostMetric,
  type ToneSandbox,
} from "@/lib/domain"
import { DEMO_MONTH, demoInsights, demoPlan } from "@/lib/demo-data"
import { requestAiJson, type AiJsonSource } from "@/lib/services/ai-client"

export type GenerationResult<T> = {
  data: T
  source: AiJsonSource | "fallback"
  warning?: string
}

const hookOptionsResultSchema = z.object({
  hooks: z.array(z.string().min(2).max(180)).min(1).max(3),
})

const actionableTasksResultSchema = z.object({
  tasks: z.array(creatorTaskSchema).min(2).max(3),
})

const carouselSlidesResultSchema = z.object({
  slides: z.array(carouselSlideSchema).min(3).max(8),
})

function normalizeVariant(detail: PostDetail, platform: PlatformId, variant: PlatformVariant) {
  return platformVariantSchema.parse({
    ...variant,
    postId: detail.post.id,
    platform,
    characterCount: variant.body.length,
    status: "generated",
    updatedAt: new Date().toISOString(),
  })
}

const requestJson = requestAiJson

export async function generateMonthlyPlan(profile: AccountDna, month = DEMO_MONTH): Promise<GenerationResult<MonthlyPlan>> {
  const fallback = monthlyPlanSchema.parse({
    ...demoPlan,
    workspaceId: profile.workspaceId,
    month,
    generationStatus: "fallback",
  })
  const prompt = `Create a 30-day CreatorOS plan JSON with fields workspaceId, month, title, summary, themes, generationStatus, posts, updatedAt.
Workspace: ${profile.workspaceId}
Month: ${month}
Niche: ${profile.niche}
Audience: ${profile.audience}
Platforms: ${profile.platforms.join(", ")}
Cadence: ${profile.cadence}
Tone: ${profile.tone}
Goals: ${profile.goals.join("; ")}
Each post must include id, workspaceId, month, scheduledDate, title, format, goal, keywords, outline, draft, sourceIdea, status, primaryPlatform, platforms, version, updatedAt.`

  const generated = await requestJson(prompt)

  if (!generated.ok) {
    return { data: fallback, source: "fallback", warning: generated.warning }
  }

  const parsed = monthlyPlanSchema.safeParse(generated.json)

  if (!parsed.success) {
    const retry = await requestJson(`${prompt}\nThe previous JSON did not match the schema. Return corrected JSON only.`)

    if (retry.ok) {
      const retryParsed = monthlyPlanSchema.safeParse(retry.json)

      if (retryParsed.success) {
        return { data: retryParsed.data, source: retry.source }
      }
    }

    return { data: fallback, source: "fallback", warning: "AI output failed schema validation." }
  }

  return { data: parsed.data, source: generated.source }
}

export async function generatePlatformRewrite(
  detail: PostDetail,
  platform: PlatformId,
  tone?: ToneSandbox,
  brandVoice?: BrandVoice,
): Promise<GenerationResult<PlatformVariant>> {
  const fallbackBody = {
    linkedin:
      "Most creators do not need more ideas. They need a visible operating loop: plan the month, adapt one idea for each platform, move work through status, measure outcomes, and feed the next cycle.",
    x:
      "More ideas are not the bottleneck. The bottleneck is the loop: plan -> adapt -> status -> metrics -> insight. Make that visible and creators ship more consistently.",
    youtube:
      "Open with the pain of blank calendars, then show the CreatorOS loop as a simple operating system for creators who need to ship every week.",
    rednote:
      "创作者真正缺的不是灵感，而是把月计划、平台改写、发布状态和数据复盘串起来的工作流。",
  }[platform]
  const tonePrefix = tone ? `${tone} take: ` : ""
  const finalFallbackBody = `${tonePrefix}${fallbackBody}`
  const fallback = platformVariantSchema.parse({
    postId: detail.post.id,
    platform,
    headline: tone ? `${detail.post.title} - ${tone}` : `${detail.post.title} - ${platform}`,
    body: finalFallbackBody,
    callToAction: "Save this workflow for your next content planning session.",
    characterCount: finalFallbackBody.length,
    status: "generated",
    updatedAt: new Date().toISOString(),
  })
  const approvedExamples = brandVoice?.examples.filter((example) => example.approved).slice(0, 2) ?? []
  const prompt = `Rewrite this CreatorOS post for ${platform}. Return JSON with postId, platform, headline, body, callToAction, characterCount, status, updatedAt.
Tone override: ${tone ?? "Use the account DNA tone."}
Brand voice traits: ${brandVoice?.traits.slice(0, 6).join(", ") || "Use the account DNA tone."}
Approved brand voice snippets: ${approvedExamples.map((example) => `${example.title}: ${example.text.slice(0, 360)}`).join(" | ") || "None"}
Title: ${detail.post.title}
Source idea: ${detail.post.sourceIdea}
Draft: ${detail.post.draft}
Outline: ${detail.post.outline.join(" | ")}
Use status "generated" and ISO updatedAt.`

  const generated = await requestJson(prompt)

  if (!generated.ok) {
    return { data: fallback, source: "fallback", warning: generated.warning }
  }

  const parsed = platformVariantSchema.safeParse(generated.json)

  if (!parsed.success) {
    const retry = await requestJson(`${prompt}\nThe previous JSON failed validation. Return corrected JSON only.`)

    if (retry.ok) {
      const retryParsed = platformVariantSchema.safeParse(retry.json)

      if (retryParsed.success) {
        return { data: normalizeVariant(detail, platform, retryParsed.data), source: retry.source }
      }
    }

    return { data: fallback, source: "fallback", warning: "AI rewrite failed schema validation." }
  }

  return { data: normalizeVariant(detail, platform, parsed.data), source: generated.source }
}

export async function generateCarouselSlides(detail: PostDetail, title?: string): Promise<GenerationResult<CarouselSlide[]>> {
  const fallback = [
    carouselSlideSchema.parse({
      title: title || detail.post.title,
      body: "Most content calendars only track dates. CreatorOS turns planning, rewrites, status, metrics, and insights into one operating loop.",
    }),
    carouselSlideSchema.parse({
      title: "The operating loop",
      body: "Start with Account DNA, generate the monthly plan, adapt one post per platform, and move work through a visible status workflow.",
    }),
    carouselSlideSchema.parse({
      title: "The feedback loop",
      body: "Metrics and insights shape the next cycle so creator teams improve the system instead of restarting from a blank page.",
    }),
  ]
  const prompt = `Create 5 concise LinkedIn document carousel slides from this CreatorOS post.
Return only JSON in this shape: {"slides":[{"title":"short title","body":"plain text"}]}.
Use 3-8 slides. Keep title under 120 chars and body under 500 chars.
Post title: ${detail.post.title}
Source idea: ${detail.post.sourceIdea}
Draft: ${detail.post.draft}
Outline: ${detail.post.outline.join(" | ")}`
  const generated = await requestJson(prompt)

  if (!generated.ok) {
    return { data: fallback, source: "fallback", warning: generated.warning }
  }

  const parsed = carouselSlidesResultSchema.safeParse(generated.json)

  if (!parsed.success) {
    const retry = await requestJson(`${prompt}\nThe previous JSON failed validation. Return corrected JSON only.`)

    if (retry.ok) {
      const retryParsed = carouselSlidesResultSchema.safeParse(retry.json)

      if (retryParsed.success) {
        return { data: retryParsed.data.slides, source: retry.source }
      }
    }

    return { data: fallback, source: "fallback", warning: "AI carousel generation failed schema validation." }
  }

  return { data: parsed.data.slides, source: generated.source }
}

export async function generateHookOptions(
  detail: PostDetail,
  platform: PlatformId,
  body?: string,
): Promise<GenerationResult<string[]>> {
  const sourceText = body?.trim() || detail.variants.find((variant) => variant.platform === platform)?.body || detail.post.draft
  const fallback = [
    `What if ${detail.post.title.toLowerCase()} was an operating loop instead of another content idea?`,
    "Most creators do not have an ideas problem. They have a workflow visibility problem.",
    "Before you publish another post, make the planning, rewrite, status, metrics, and insight loop visible.",
  ]
  const prompt = `Create exactly 3 alternative opening hooks for this ${platform} post.
Return only JSON in this shape: {"hooks":["short hook","short hook","short hook"]}.
Each hook must be under 180 characters and must not include markdown.
Post title: ${detail.post.title}
Source idea: ${detail.post.sourceIdea}
Current body: ${sourceText}`
  const generated = await requestJson(prompt)

  if (!generated.ok) {
    return { data: fallback, source: "fallback", warning: generated.warning }
  }

  const parsed = hookOptionsResultSchema.safeParse(generated.json)

  if (!parsed.success) {
    const retry = await requestJson(`${prompt}\nThe previous JSON failed validation. Return corrected JSON only.`)

    if (retry.ok) {
      const retryParsed = hookOptionsResultSchema.safeParse(retry.json)

      if (retryParsed.success) {
        return { data: retryParsed.data.hooks.slice(0, 3), source: retry.source }
      }
    }

    return { data: fallback, source: "fallback", warning: "AI hook generation failed schema validation." }
  }

  return { data: parsed.data.hooks.slice(0, 3), source: generated.source }
}

export async function generateDraft(detail: PostDetail, platform: PlatformId): Promise<GenerationResult<DraftVersion>> {
  const fallback = draftVersionSchema.parse({
    postId: detail.post.id,
    platform,
    version: detail.drafts.length + 1,
    body: `${detail.post.draft}\n\nNext draft focus: sharpen the hook for ${platform} and keep the operating loop concrete.`,
    createdAt: new Date().toISOString(),
  })
  const prompt = `Create a draft for ${platform}. Return JSON with postId, platform, version, body, createdAt.
Post: ${detail.post.title}
Draft: ${detail.post.draft}
Version: ${detail.drafts.length + 1}`
  const generated = await requestJson(prompt)

  if (!generated.ok) {
    return { data: fallback, source: "fallback", warning: generated.warning }
  }

  const parsed = draftVersionSchema.safeParse(generated.json)

  if (!parsed.success) {
    return { data: fallback, source: "fallback", warning: "AI draft failed schema validation." }
  }

  return { data: parsed.data, source: generated.source }
}

export async function generateInsight(
  workspaceId: string,
  month: string,
  plan: MonthlyPlan,
  metrics: PostMetric[],
): Promise<GenerationResult<Insight>> {
  const fallback = insightSchema.parse({
    ...demoInsights[0],
    id: `insight-${month}-fallback`,
    workspaceId,
    month,
    generatedAt: new Date().toISOString(),
  })
  const prompt = `Generate exactly one next-cycle insight from this plan and metrics.
Return only this JSON shape:
{
  "id": "insight-${month}-generated",
  "workspaceId": "${workspaceId}",
  "month": "${month}",
  "title": "string under 180 chars",
  "summary": "string under 800 chars",
  "recommendations": ["1-6 short strings"],
  "confidence": "low" | "medium" | "high",
  "generatedAt": "ISO-8601 datetime string"
}
Do not add fields. Use confidence exactly as one lowercase enum value.
Workspace: ${workspaceId}
Month: ${month}
Plan summary: ${plan.summary}
Themes: ${plan.themes.join(", ")}
Metrics: ${JSON.stringify(metrics.slice(0, 12))}`
  const generated = await requestJson(prompt)

  if (!generated.ok) {
    return { data: fallback, source: "fallback", warning: generated.warning }
  }

  const parsed = insightSchema.safeParse(generated.json)

  if (!parsed.success) {
    return { data: fallback, source: "fallback", warning: "AI insight failed schema validation." }
  }

  return { data: parsed.data, source: generated.source }
}

export async function generateActionableTasks(
  workspaceId: string,
  month: string,
  plan: MonthlyPlan,
  insights: Insight[],
  metrics: PostMetric[],
): Promise<GenerationResult<CreatorTask[]>> {
  const nowDate = new Date()
  const now = nowDate.toISOString()
  /** 根据当前日期动态推算截止时间，避免硬编码月内日期在跨月场景下立即过期 */
  const offsetDays = (days: number) => {
    const d = new Date(nowDate)
    d.setDate(d.getDate() + days)
    return d.toISOString().slice(0, 10)
  }
  const latestInsight = insights.at(-1) ?? demoInsights[0]
  const fallback = [
    creatorTaskSchema.parse({
      id: `task-${month}-workflow-loop`,
      workspaceId,
      month,
      title: "Package the strongest workflow insight into a post",
      description:
        "Turn the latest analytics insight into one concrete platform post that makes the planning, rewrite, status, metrics, and insight loop visible.",
      sourceInsightId: latestInsight.id,
      postId: plan.posts[0]?.id,
      status: "open",
      dueDate: offsetDays(5),
      createdAt: now,
      updatedAt: now,
    }),
    creatorTaskSchema.parse({
      id: `task-${month}-metric-review`,
      workspaceId,
      month,
      title: "Review metrics before the next content batch",
      description:
        "Compare top-view and top-save posts, then adjust the next batch around the platform that showed the clearest signal.",
      sourceInsightId: latestInsight.id,
      postId: metrics[0]?.postId,
      status: "open",
      dueDate: offsetDays(7),
      createdAt: now,
      updatedAt: now,
    }),
  ]
  const prompt = `Convert these CreatorOS analytics insights into 2-3 actionable task cards.
Return only JSON in this exact shape: {"tasks":[...]}.
Each task must include id, workspaceId, month, title, description, sourceInsightId, optional postId, status, dueDate, createdAt, updatedAt.
Use workspaceId "${workspaceId}", month "${month}", status "open", ISO timestamps, and dueDate in YYYY-MM-DD.
Keep titles under 180 characters and descriptions under 600 characters.
Plan posts: ${JSON.stringify(plan.posts.slice(0, 8).map((post) => ({ id: post.id, title: post.title, date: post.scheduledDate, platform: post.primaryPlatform })))}
Insights: ${JSON.stringify(insights.slice(-3))}
Metrics: ${JSON.stringify(metrics.slice(0, 12))}`
  const generated = await requestJson(prompt)

  if (!generated.ok) {
    return { data: fallback, source: "fallback", warning: generated.warning }
  }

  const parsed = actionableTasksResultSchema.safeParse(generated.json)

  if (!parsed.success) {
    const retry = await requestJson(`${prompt}\nThe previous JSON failed validation. Return corrected JSON only.`)

    if (retry.ok) {
      const retryParsed = actionableTasksResultSchema.safeParse(retry.json)

      if (retryParsed.success) {
        return { data: retryParsed.data.tasks, source: retry.source }
      }
    }

    return { data: fallback, source: "fallback", warning: "AI task generation failed schema validation." }
  }

  return { data: parsed.data.tasks, source: generated.source }
}
