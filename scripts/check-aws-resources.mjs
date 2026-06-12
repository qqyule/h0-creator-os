import { DynamoDBClient, DescribeTableCommand } from "@aws-sdk/client-dynamodb"
import { S3Client, HeadBucketCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { existsSync, readFileSync } from "node:fs"

// 加载本地环境变量
loadLocalEnv()

const region = process.env.AWS_REGION
const tableName = process.env.CREATOROS_TABLE_NAME
const s3Bucket = process.env.CREATOROS_S3_BUCKET

console.log("=== CreatorOS AWS 资源诊断工具 ===")
console.log(`Region:      ${region || "未配置"}`)
console.log(`DynamoDB 表: ${tableName || "未配置"}`)
console.log(`S3 存储桶:   ${s3Bucket || "未配置"}\n`)

if (!region) {
  console.error("❌ 错误: AWS_REGION 环境变量未配置。")
  process.exit(1)
}

// 检查 AWS 凭证链是否可用（STS 模拟）
// 我们尝试实例化并调用 DescribeTable 或 HeadBucket。如果报错 "ExpiredToken" 或 "CredentialsError"，我们就捕获它。
let credentialsExpired = false
let credentialsError = null

const ddbClient = new DynamoDBClient({ region })
const s3Client = new S3Client({ region })

async function checkDynamoDB() {
  if (!tableName) {
    console.log("⚠️ 警告: CREATOROS_TABLE_NAME 未配置，跳过 DynamoDB 检查。")
    return
  }

  console.log(`[DynamoDB] 正在检查表 "${tableName}"...`)
  try {
    const data = await ddbClient.send(new DescribeTableCommand({ TableName: tableName }))
    const table = data.Table
    console.log(`  ✅ 表 "${tableName}" 存在。状态: ${table.TableStatus}`)

    // 检查主键
    const keySchema = table.KeySchema || []
    const pk = keySchema.find(k => k.KeyType === "HASH")?.AttributeName
    const sk = keySchema.find(k => k.KeyType === "RANGE")?.AttributeName

    if (pk === "pk" && sk === "sk") {
      console.log(`  ✅ 主键配置正确 (Partition Key: "pk", Sort Key: "sk")`)
    } else {
      console.log(`  ❌ 主键配置不符合要求！期望: pk/sk, 实际: ${pk}/${sk}`)
    }

    // 检查 GSI
    const gsis = table.GlobalSecondaryIndexes || []
    const gsi1 = gsis.find(g => g.IndexName === "gsi1")
    const gsi2 = gsis.find(g => g.IndexName === "gsi2")

    if (gsi1) {
      const g1pk = gsi1.KeySchema.find(k => k.KeyType === "HASH")?.AttributeName
      const g1sk = gsi1.KeySchema.find(k => k.KeyType === "RANGE")?.AttributeName
      if (g1pk === "gsi1pk" && g1sk === "gsi1sk") {
        console.log(`  ✅ gsi1 索引配置正确 (gsi1pk / gsi1sk)`)
      } else {
        console.log(`  ❌ gsi1 索引配置不符合要求！期望: gsi1pk/gsi1sk, 实际: ${g1pk}/${g1sk}`)
      }
    } else {
      console.log(`  ❌ 未找到 gsi1 索引！`)
    }

    if (gsi2) {
      const g2pk = gsi2.KeySchema.find(k => k.KeyType === "HASH")?.AttributeName
      const g2sk = gsi2.KeySchema.find(k => k.KeyType === "RANGE")?.AttributeName
      if (g2pk === "gsi2pk" && g2sk === "gsi2sk") {
        console.log(`  ✅ gsi2 索引配置正确 (gsi2pk / gsi2sk)`)
      } else {
        console.log(`  ❌ gsi2 索引配置不符合要求！期望: gsi2pk/gsi2sk, 实际: ${g2pk}/${g2sk}`)
      }
    } else {
      console.log(`  ❌ 未找到 gsi2 索引！`)
    }

  } catch (error) {
    if (isCredentialsError(error)) {
      credentialsExpired = true
      credentialsError = error
      console.log(`  ❌ DynamoDB 检查失败: AWS 凭据无效或已过期！`)
    } else {
      console.log(`  ❌ DynamoDB 检查失败: ${error.message}`)
    }
  }
}

async function checkS3() {
  if (!s3Bucket) {
    console.log("⚠️ 警告: CREATOROS_S3_BUCKET 未配置，跳过 S3 检查。")
    return
  }

  console.log(`[S3] 正在检查存储桶 "${s3Bucket}"...`)
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: s3Bucket }))
    console.log(`  ✅ 存储桶 "${s3Bucket}" 存在且可访问。`)

    // 测试读写权限
    const testKey = `.creatoros-connection-test-${Date.now()}.txt`
    try {
      await s3Client.send(new PutObjectCommand({
        Bucket: s3Bucket,
        Key: testKey,
        Body: "CreatorOS connection verification",
        ContentType: "text/plain"
      }))
      console.log(`  ✅ 写入测试成功 (PutObject 权限正常)`)

      await s3Client.send(new DeleteObjectCommand({
        Bucket: s3Bucket,
        Key: testKey
      }))
      console.log(`  ✅ 删除测试成功 (DeleteObject 权限正常)`)
    } catch (writeErr) {
      console.log(`  ❌ 读写权限测试失败: ${writeErr.message}`)
    }

  } catch (error) {
    if (isCredentialsError(error)) {
      credentialsExpired = true
      credentialsError = error
      console.log(`  ❌ S3 检查失败: AWS 凭据无效或已过期！`)
    } else {
      console.log(`  ❌ S3 检查失败: ${error.message}`)
    }
  }
}

function isCredentialsError(err) {
  const code = err.code || err.name || ""
  return (
    code.includes("ExpiredToken") ||
    code.includes("CredentialsError") ||
    code.includes("UnrecognizedClientException") ||
    code.includes("AccessDenied") ||
    err.message?.includes("expired") ||
    err.message?.includes("credentials")
  )
}

async function run() {
  await checkDynamoDB()
  console.log("")
  await checkS3()
  console.log("")

  if (credentialsExpired) {
    console.error("=========================================")
    console.error("❌ 严重错误: 本地 AWS 访问会话已经过期或无效。")
    console.error("请使用 'aws login' 重新登录，或者设置正确的环境变量：")
    console.error("  AWS_ACCESS_KEY_ID")
    console.error("  AWS_SECRET_ACCESS_KEY")
    console.error("  AWS_SESSION_TOKEN (若有)")
    if (credentialsError) {
      console.error(`具体异常信息: ${credentialsError.stack || credentialsError.message}`)
    }
    console.error("=========================================")
    process.exit(1)
  }

  console.log("=== 诊断完毕 ===")
}

run()

function loadLocalEnv() {
  for (const fileName of [".env.local", ".env"]) {
    if (!existsSync(fileName)) {
      continue
    }

    const lines = readFileSync(fileName, "utf8").split(/\r?\n/)

    for (const line of lines) {
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith("#")) {
        continue
      }

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)

      if (!match) {
        continue
      }

      const [, key, rawValue] = match

      if (process.env[key]) {
        continue
      }

      process.env[key] = rawValue.replace(/^['"]|['"]$/g, "")
    }
  }
}
