import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"
import { getDynamoConfig } from "@/lib/env"

let cachedDocumentClient: DynamoDBDocumentClient | undefined

export function getDocumentClient() {
  const config = getDynamoConfig()

  if (!config.configured || !config.region) {
    return undefined
  }

  if (!cachedDocumentClient) {
    cachedDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: config.region }), {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    })
  }

  return cachedDocumentClient
}
