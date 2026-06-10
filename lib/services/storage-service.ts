import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { getS3Config } from "@/lib/env"

let cachedS3Client: S3Client | undefined

function getS3Client() {
  const config = getS3Config()

  if (!config.configured || !config.region) {
    return undefined
  }

  if (!cachedS3Client) {
    cachedS3Client = new S3Client({ region: config.region })
  }

  return cachedS3Client
}

export async function createPresignedUpload(input: {
  workspaceId: string
  fileName: string
  contentType: string
  purpose: "metrics-import" | "export" | "asset"
}) {
  const config = getS3Config()
  const client = getS3Client()
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-")
  const key = `${input.workspaceId}/${input.purpose}/${Date.now()}-${safeName}`

  if (!config.configured || !client || !config.bucket) {
    return {
      configured: false as const,
      key,
      uploadUrl: null,
      warning: "S3 is not configured. Set AWS_REGION and CREATOROS_S3_BUCKET.",
    }
  }

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: input.contentType,
  })
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 })

  return {
    configured: true as const,
    key,
    uploadUrl,
  }
}
