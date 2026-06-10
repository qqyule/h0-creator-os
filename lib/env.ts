export function getOptionalEnv(name: string) {
  const value = process.env[name]
  return value && value.trim().length > 0 ? value.trim() : undefined
}

export function getDynamoConfig() {
  const region = getOptionalEnv("AWS_REGION")
  const tableName = getOptionalEnv("CREATOROS_TABLE_NAME")

  return {
    configured: Boolean(region && tableName),
    region,
    tableName,
  }
}

export function getS3Config() {
  const region = getOptionalEnv("AWS_REGION")
  const bucket = getOptionalEnv("CREATOROS_S3_BUCKET")

  return {
    configured: Boolean(region && bucket),
    region,
    bucket,
  }
}

export function getAiConfig() {
  return {
    configured: Boolean(getOptionalEnv("OPENAI_API_KEY")),
    apiKey: getOptionalEnv("OPENAI_API_KEY"),
    baseUrl: getOptionalEnv("OPENAI_BASE_URL") ?? "https://api.openai.com/v1",
    model: getOptionalEnv("OPENAI_MODEL") ?? "gpt-4o-mini",
  }
}

export function getResendConfig() {
  return {
    configured: Boolean(getOptionalEnv("RESEND_API_KEY")),
    apiKey: getOptionalEnv("RESEND_API_KEY"),
    from: getOptionalEnv("RESEND_FROM_EMAIL") ?? "CreatorOS <demo@creatoros.local>",
    testRecipient: getOptionalEnv("RESEND_TEST_RECIPIENT"),
  }
}
