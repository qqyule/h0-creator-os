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
  /** 将 purpose 映射为 S3 文件夹名，使 metrics-import 对应文档约定的 imports/ 目录 */
  const folderByPurpose: Record<typeof input.purpose, string> = {
    "metrics-import": "imports",
    export: "exports",
    asset: "assets",
  }
  const folder = folderByPurpose[input.purpose]
  const key = `${input.workspaceId}/${folder}/${Date.now()}-${safeName}`

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
