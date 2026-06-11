import "server-only"

import { AiSettingsEntity } from "@/lib/dynamodb/entities"
import { getDynamoConfig } from "@/lib/env"

export type AiSettingsRecord = {
  baseUrl: string
  model: string
  enabled: boolean
  encryptedApiKey?: string
  apiKeyHint?: string
  updatedAt: string
}

const AI_PROVIDER_CONFIG_ID = "AI_PROVIDER"

export function canPersistAiSettings() {
  return getDynamoConfig().configured
}

export async function readStoredAiSettings(): Promise<AiSettingsRecord | null> {
  if (!canPersistAiSettings()) {
    return null
  }

  const result = await AiSettingsEntity.get({ configId: AI_PROVIDER_CONFIG_ID }).go()

  if (!result.data) {
    return null
  }

  return {
    baseUrl: result.data.baseUrl,
    model: result.data.model,
    enabled: result.data.enabled,
    encryptedApiKey: result.data.encryptedApiKey,
    apiKeyHint: result.data.apiKeyHint,
    updatedAt: result.data.updatedAt,
  }
}

export async function saveStoredAiSettings(settings: AiSettingsRecord) {
  if (!canPersistAiSettings()) {
    throw new Error("DynamoDB is not configured.")
  }

  await AiSettingsEntity.put({
    configId: AI_PROVIDER_CONFIG_ID,
    ...settings,
  }).go()

  return settings
}
