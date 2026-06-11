import { z } from "zod"
import {
  draftVersionSchema,
  insightSchema,
  monthlyPlanSchema,
  platformVariantSchema,
  type AccountDna,
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
import { AiSettingsError, resolveAiProviderConfig } from "@/lib/ai-settings"

export type GenerationResult<T> = {
  data: T
  source: "openai" | "fallback"
  warning?: string
}

const hookOptionsResultSchema = z.object({
  hooks: z.array(z.string().min(2).max(180)).min(1).max(3),
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

async function requestJson(prompt: string) {
  let config: Awaited<ReturnType<typeof resolveAiProviderConfig>>

  try {
    config = await resolveAiProviderConfig()
  } catch (error) {
    if (error instanceof AiSettingsError) {
      return { ok: false as const, warning: error.message }
    }

    return { ok: false as const, warning: "OpenAI-compatible API is not configured." }
  }

  let response: Response

  try {
    response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.apiKey}`,
      },
      signal: AbortSignal.timeout(20_000),
      body: JSON.stringify({
        model: config.model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are CreatorOS. Return only valid JSON that matches the requested schema. Do not include markdown.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })
  } catch {
    return { ok: false as const, warning: "AI provider request failed." }
  }

  if (!response.ok) {
    return { ok: false as const, warning: `AI provider returned ${response.status}.` }
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = payload.choices?.[0]?.message?.content

  if (!content) {
    return { ok: false as const, warning: "AI provider returned an empty response." }
  }

  try {
    return { ok: true as const, json: JSON.parse(content) as unknown }
  } catch {
    return { ok: false as const, warning: "AI provider returned invalid JSON." }
  }
}

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
    const retryParsed = retry.ok ? monthlyPlanSchema.safeParse(retry.json) : undefined

    if (retryParsed?.success) {
      return { data: retryParsed.data, source: "openai" }
    }

    return { data: fallback, source: "fallback", warning: "AI output failed schema validation." }
  }

  return { data: parsed.data, source: "openai" }
}

export async function generatePlatformRewrite(
  detail: PostDetail,
  platform: PlatformId,
  tone?: ToneSandbox,
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
  const prompt = `Rewrite this CreatorOS post for ${platform}. Return JSON with postId, platform, headline, body, callToAction, characterCount, status, updatedAt.
Tone override: ${tone ?? "Use the account DNA tone."}
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
    const retryParsed = retry.ok ? platformVariantSchema.safeParse(retry.json) : undefined

    if (retryParsed?.success) {
      return { data: normalizeVariant(detail, platform, retryParsed.data), source: "openai" }
    }

    return { data: fallback, source: "fallback", warning: "AI rewrite failed schema validation." }
  }

  return { data: normalizeVariant(detail, platform, parsed.data), source: "openai" }
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
    const retryParsed = retry.ok ? hookOptionsResultSchema.safeParse(retry.json) : undefined

    if (retryParsed?.success) {
      return { data: retryParsed.data.hooks.slice(0, 3), source: "openai" }
    }

    return { data: fallback, source: "fallback", warning: "AI hook generation failed schema validation." }
  }

  return { data: parsed.data.hooks.slice(0, 3), source: "openai" }
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

  return { data: parsed.data, source: "openai" }
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

  return { data: parsed.data, source: "openai" }
}
