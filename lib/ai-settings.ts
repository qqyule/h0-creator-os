import "server-only"

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"
import { getOptionalEnv } from "@/lib/env"
import {
  canPersistAiSettings,
  readStoredAiSettings,
  saveStoredAiSettings,
} from "@/lib/repositories/ai-settings-repository"

export type AiSettings = {
  baseUrl: string
  model: string
  enabled: boolean
  encryptedApiKey?: string
  apiKeyHint?: string
  updatedAt?: string
}

export type PublicAiSettings = {
  baseUrl: string
  model: string
  enabled: boolean
  hasApiKey: boolean
  apiKeyHint?: string
  updatedAt?: string
}

export type SaveAiSettingsInput = {
  baseUrl: string
  model: string
  enabled: boolean
  apiKey?: string
}

export type AiSettingsErrorCode =
  | "invalid_config"
  | "missing_encryption_key"
  | "missing_api_key"
  | "decrypt_failed"
  | "auth_failed"
  | "network_error"
  | "storage_unavailable"
  | "provider_error"

export class AiSettingsError extends Error {
  code: AiSettingsErrorCode
  status: number

  constructor(code: AiSettingsErrorCode, message: string, status = 400) {
    super(message)
    this.name = "AiSettingsError"
    this.code = code
    this.status = status
  }
}

function defaultSettings(): AiSettings {
  const envApiKey = getOptionalEnv("OPENAI_API_KEY")

  return {
    baseUrl: getOptionalEnv("OPENAI_BASE_URL") ?? "https://api.openai.com/v1",
    model: getOptionalEnv("OPENAI_MODEL") ?? "gpt-4o-mini",
    enabled: Boolean(envApiKey),
    apiKeyHint: envApiKey ? maskApiKey(envApiKey) : undefined,
  }
}

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "")
}

export function validateAiSettingsInput(input: SaveAiSettingsInput) {
  const baseUrl = normalizeBaseUrl(input.baseUrl)
  const model = input.model.trim()

  if (!baseUrl) {
    throw new AiSettingsError("invalid_config", "Base URL is required.")
  }

  try {
    const url = new URL(baseUrl)
    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      throw new Error("AI provider URL must use HTTPS.")
    }
  } catch {
    throw new AiSettingsError("invalid_config", "Enter a valid AI provider URL.")
  }

  if (!model) {
    throw new AiSettingsError("invalid_config", "Model is required.")
  }

  return {
    baseUrl,
    model,
    enabled: input.enabled,
    apiKey: input.apiKey?.trim(),
  }
}

function encryptionKey() {
  const raw = process.env.AI_CONFIG_ENCRYPTION_KEY
  if (!raw) {
    throw new AiSettingsError(
      "missing_encryption_key",
      "AI_CONFIG_ENCRYPTION_KEY is required before saving API keys.",
      500,
    )
  }

  return createHash("sha256").update(raw).digest()
}

function encryptSecret(secret: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(":")
}

function decryptSecret(encryptedSecret: string) {
  try {
    const [version, iv, tag, encrypted] = encryptedSecret.split(":")
    if (version !== "v1" || !iv || !tag || !encrypted) {
      throw new Error("Unsupported encrypted secret format.")
    }

    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"))
    decipher.setAuthTag(Buffer.from(tag, "base64url"))
    return Buffer.concat([
      decipher.update(Buffer.from(encrypted, "base64url")),
      decipher.final(),
    ]).toString("utf8")
  } catch (error) {
    if (error instanceof AiSettingsError) {
      throw error
    }
    throw new AiSettingsError("decrypt_failed", "Stored AI API key could not be decrypted.", 500)
  }
}

function maskApiKey(apiKey: string) {
  if (apiKey.length <= 8) {
    return "configured"
  }

  return `${apiKey.slice(0, 3)}...${apiKey.slice(-4)}`
}

export async function readAiSettings(): Promise<AiSettings> {
  const stored = await readStoredAiSettings()
  return stored ? { ...defaultSettings(), ...stored } : defaultSettings()
}

export async function getPublicAiSettings(): Promise<PublicAiSettings> {
  const settings = await readAiSettings()
  return {
    baseUrl: settings.baseUrl,
    model: settings.model,
    enabled: settings.enabled,
    hasApiKey: Boolean(settings.encryptedApiKey || getOptionalEnv("OPENAI_API_KEY")),
    apiKeyHint: settings.apiKeyHint,
    updatedAt: settings.updatedAt,
  }
}

export async function saveAiSettings(input: SaveAiSettingsInput): Promise<PublicAiSettings> {
  const current = await readAiSettings()
  const nextInput = validateAiSettingsInput(input)

  if (!canPersistAiSettings()) {
    throw new AiSettingsError(
      "storage_unavailable",
      "DynamoDB must be configured before saving AI provider settings.",
      500,
    )
  }

  const next: AiSettings = {
    ...current,
    baseUrl: nextInput.baseUrl,
    model: nextInput.model,
    enabled: nextInput.enabled,
    updatedAt: new Date().toISOString(),
  }

  if (nextInput.apiKey) {
    next.encryptedApiKey = encryptSecret(nextInput.apiKey)
    next.apiKeyHint = maskApiKey(nextInput.apiKey)
  }

  await saveStoredAiSettings({
    baseUrl: next.baseUrl,
    model: next.model,
    enabled: next.enabled,
    encryptedApiKey: next.encryptedApiKey,
    apiKeyHint: next.apiKeyHint,
    updatedAt: next.updatedAt ?? new Date().toISOString(),
  })

  return getPublicAiSettings()
}

export async function resolveAiProviderConfig(input?: Partial<SaveAiSettingsInput>) {
  const settings = await readAiSettings()
  const baseUrl = normalizeBaseUrl(input?.baseUrl ?? settings.baseUrl)
  const model = (input?.model ?? settings.model).trim()
  const encryptedApiKey = settings.encryptedApiKey
  const apiKey = input?.apiKey?.trim() || (encryptedApiKey ? decryptSecret(encryptedApiKey) : getOptionalEnv("OPENAI_API_KEY") ?? "")
  const enabled = input?.enabled ?? settings.enabled

  validateAiSettingsInput({
    baseUrl,
    model,
    enabled,
    apiKey,
  })

  if (!enabled) {
    throw new AiSettingsError("invalid_config", "AI provider is disabled.")
  }

  if (!apiKey) {
    throw new AiSettingsError("missing_api_key", "An AI API key is required for this request.")
  }

  return {
    baseUrl,
    model,
    apiKey,
  }
}

export function toAiSettingsError(error: unknown): AiSettingsError {
  if (error instanceof AiSettingsError) {
    return error
  }

  return new AiSettingsError("provider_error", "AI provider request failed.", 502)
}
