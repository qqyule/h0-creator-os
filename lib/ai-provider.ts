import "server-only"

import { AiSettingsError, resolveAiProviderConfig, toAiSettingsError, type SaveAiSettingsInput } from "./ai-settings"

type ChatCompletionResponse = {
  id?: string
  model?: string
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  error?: {
    message?: string
    type?: string
    code?: string
  }
}

function endpointFor(baseUrl: string) {
  return `${baseUrl.replace(/\/+$/, "")}/chat/completions`
}

export async function testAiProvider(input?: Partial<SaveAiSettingsInput>) {
  const config = await resolveAiProviderConfig(input)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(endpointFor(config.baseUrl), {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: "user",
            content: "Reply with exactly: ok",
          },
        ],
        max_tokens: 8,
        temperature: 0,
      }),
    })
    const payload = (await response.json().catch(() => ({}))) as ChatCompletionResponse

    if (response.status === 401 || response.status === 403) {
      throw new AiSettingsError("auth_failed", "AI provider rejected the API key.", response.status)
    }

    if (!response.ok) {
      throw new AiSettingsError(
        "provider_error",
        payload.error?.message || "AI provider returned an error.",
        response.status,
      )
    }

    return {
      ok: true,
      model: payload.model || config.model,
      responseId: payload.id,
      sample: payload.choices?.[0]?.message?.content?.slice(0, 80),
    }
  } catch (error) {
    if (error instanceof AiSettingsError) {
      throw error
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new AiSettingsError("network_error", "AI provider request timed out.", 504)
    }

    throw toAiSettingsError(error)
  } finally {
    clearTimeout(timeout)
  }
}
