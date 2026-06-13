import "server-only"

import { resolveAiProviderConfig } from "@/lib/ai-settings"
import { getOptionalEnv } from "@/lib/env"

export type AiJsonSource = "openai" | "provider-fallback"

type AiProviderConfig = {
  name: AiJsonSource
  baseUrl: string
  model: string
  apiKey: string
}

type ChatCompletionPayload = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  error?: {
    message?: string
    code?: string
    type?: string
  }
}

type RequestMode = "json_object" | "compat"

export type AiJsonResult =
  | { ok: true; json: unknown; source: AiJsonSource; warning?: string }
  | { ok: false; warning: string; category: "config" | "auth" | "provider" | "network" | "parse" }

const TRANSIENT_STATUSES = new Set([408, 409, 429, 500, 502, 503, 504])

export async function requestAiJson(prompt: string): Promise<AiJsonResult> {
  const providers = await resolveProviderChain()
  const warnings: string[] = []

  if (!providers.length) {
    return {
      ok: false,
      warning: "AI provider is not configured. A safe editable draft was used.",
      category: "config",
    }
  }

  for (const provider of providers) {
    for (const mode of ["json_object", "compat"] as const) {
      const result = await requestProviderJson(provider, prompt, mode)

      if (result.ok) {
        return {
          ...result,
          warning: successWarning(result.source, mode, warnings.length),
        }
      }

      warnings.push(result.warning)

      if (result.category === "auth") {
        break
      }
    }
  }

  return {
    ok: false,
    warning: "AI service was unstable. A safe editable draft was used so the workflow can continue.",
    category: "provider",
  }
}

export function extractJsonFromText(content: string) {
  const trimmed = content.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidates = [
    trimmed,
    fenced?.[1]?.trim(),
    sliceJsonCandidate(trimmed, "{", "}"),
    sliceJsonCandidate(trimmed, "[", "]"),
  ].filter((value): value is string => Boolean(value))

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as unknown
    } catch {
      // Try the next extraction strategy.
    }
  }

  return undefined
}

export function isTransientAiStatus(status: number) {
  return TRANSIENT_STATUSES.has(status)
}

async function resolveProviderChain() {
  const providers: AiProviderConfig[] = []

  try {
    const primary = await resolveAiProviderConfig()
    providers.push({
      name: "openai",
      baseUrl: primary.baseUrl,
      model: primary.model,
      apiKey: primary.apiKey,
    })
  } catch {
    // Missing or disabled primary settings should not block env fallback.
  }

  const fallbackApiKey = getOptionalEnv("OPENAI_FALLBACK_API_KEY")
  const fallbackBaseUrl = getOptionalEnv("OPENAI_FALLBACK_BASE_URL") ?? getOptionalEnv("OPENAI_BASE_URL") ?? "https://api.openai.com/v1"
  const fallbackModel = getOptionalEnv("OPENAI_FALLBACK_MODEL") ?? getOptionalEnv("OPENAI_MODEL") ?? "gpt-4o-mini"

  if (fallbackApiKey) {
    providers.push({
      name: "provider-fallback",
      baseUrl: fallbackBaseUrl.replace(/\/+$/, ""),
      model: fallbackModel,
      apiKey: fallbackApiKey,
    })
  }

  return dedupeProviders(providers)
}

async function requestProviderJson(provider: AiProviderConfig, prompt: string, mode: RequestMode): Promise<AiJsonResult> {
  const maxAttempts = 3
  let lastWarning = "AI service was unstable. A safe editable draft was used so the workflow can continue."

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = await requestOnce(provider, prompt, mode)

    if (result.ok) {
      return result
    }

    lastWarning = result.warning

    if (!result.retryable || attempt === maxAttempts) {
      return {
        ok: false,
        warning: result.warning,
        category: result.category,
      }
    }

    await sleep(backoffDelay(attempt))
  }

  return { ok: false, warning: lastWarning, category: "provider" }
}

async function requestOnce(provider: AiProviderConfig, prompt: string, mode: RequestMode): Promise<AiJsonResult & { retryable?: boolean }> {
  let response: Response

  try {
    response = await fetch(`${provider.baseUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${provider.apiKey}`,
      },
      signal: AbortSignal.timeout(25_000),
      body: JSON.stringify({
        model: provider.model,
        ...(mode === "json_object" ? { response_format: { type: "json_object" } } : {}),
        messages: [
          {
            role: "system",
            content:
              mode === "json_object"
                ? "You are CreatorOS. Return only valid JSON that matches the requested schema. Do not include markdown."
                : "You are CreatorOS. Return JSON only. If the provider cannot enforce JSON mode, still return a single JSON object with no prose.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError"
    return {
      ok: false,
      warning: timedOut ? "AI provider request timed out." : "AI provider network request failed.",
      category: "network",
      retryable: true,
    }
  }

  const payload = (await response.json().catch(() => ({}))) as ChatCompletionPayload

  if (response.status === 401 || response.status === 403) {
    return {
      ok: false,
      warning: "AI provider rejected the API key.",
      category: "auth",
      retryable: false,
    }
  }

  if (!response.ok) {
    const providerMessage = payload.error?.message || `AI provider returned ${response.status}.`
    return {
      ok: false,
      warning: providerMessage,
      category: response.status >= 500 ? "provider" : "config",
      retryable: isTransientAiStatus(response.status),
    }
  }

  const content = payload.choices?.[0]?.message?.content

  if (!content) {
    return {
      ok: false,
      warning: "AI provider returned an empty response.",
      category: "provider",
      retryable: true,
    }
  }

  const json = extractJsonFromText(content)

  if (json === undefined) {
    return {
      ok: false,
      warning: "AI provider returned invalid JSON.",
      category: "parse",
      retryable: false,
    }
  }

  return {
    ok: true,
    json,
    source: provider.name,
  }
}

function sliceJsonCandidate(value: string, open: "{" | "[", close: "}" | "]") {
  const start = value.indexOf(open)
  const end = value.lastIndexOf(close)

  if (start === -1 || end === -1 || end <= start) {
    return undefined
  }

  return value.slice(start, end + 1)
}

function dedupeProviders(providers: AiProviderConfig[]) {
  const seen = new Set<string>()

  return providers.filter((provider) => {
    const key = `${provider.baseUrl}#${provider.model}#${provider.apiKey.slice(0, 8)}`

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function successWarning(source: AiJsonSource, mode: RequestMode, failedAttemptCount: number) {
  if (source === "provider-fallback") {
    return failedAttemptCount > 0
      ? "Primary AI service was unavailable; fallback provider completed the request."
      : "Fallback AI provider completed the request."
  }

  if (mode === "compat") {
    return "AI service required compatibility mode; generation completed."
  }

  if (failedAttemptCount > 0) {
    return "AI service was temporarily unstable; generation completed after retry."
  }

  return undefined
}

function backoffDelay(attempt: number) {
  const base = 400 * 2 ** (attempt - 1)
  const jitter = Math.floor(Math.random() * 250)
  return base + jitter
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
