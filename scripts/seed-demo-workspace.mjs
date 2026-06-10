import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, TransactWriteCommand } from "@aws-sdk/lib-dynamodb"
import { existsSync, readFileSync } from "node:fs"

loadLocalEnv()

const workspaceId = "DEMO#judge"
const month = "2026-06"
const tableName = process.env.CREATOROS_TABLE_NAME
const region = process.env.AWS_REGION

if (!tableName || !region) {
  console.error("Set AWS_REGION and CREATOROS_TABLE_NAME before seeding. The script reads .env.local and .env automatically.")
  process.exit(1)
}

const platforms = ["linkedin", "x", "youtube", "rednote"]
const statuses = ["Idea", "Drafting", "Review", "Scheduled", "Published"]
const now = "2026-06-10T00:00:00.000Z"

function workspacePk(id) {
  return `WORKSPACE#${id}`
}

function monthPk(id, value) {
  return `WORKSPACE#${id}#MONTH#${value}`
}

function statusPk(id, status) {
  return `WORKSPACE#${id}#STATUS#${status}`
}

function platformPk(id, platform) {
  return `WORKSPACE#${id}#PLATFORM#${platform}`
}

const profile = {
  pk: workspacePk(workspaceId),
  sk: "PROFILE",
  workspaceId,
  niche: "B2B creator operations for independent consultants",
  audience: "Solo experts and small studios turning expertise into repeatable content systems.",
  platforms,
  cadence: "One flagship idea per weekday, adapted across priority platforms.",
  tone: "Clear, practical, operator-led, with concise examples and no hype.",
  goals: ["Build trust with B2B founders", "Turn repeat questions into evergreen posts", "Create a monthly operating rhythm"],
  updatedAt: now,
}

const posts = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1
  const id = `post-${String(day).padStart(2, "0")}`
  const status = statuses[index % statuses.length]
  const primaryPlatform = platforms[index % platforms.length]
  const scheduledDate = `${month}-${String(day).padStart(2, "0")}`

  return {
    pk: workspacePk(workspaceId),
    sk: `POST#${id}`,
    gsi1pk: monthPk(workspaceId, month),
    gsi1sk: `DATE#${scheduledDate}#POST#${id}`,
    gsi2pk: statusPk(workspaceId, status),
    gsi2sk: `DATE#${scheduledDate}#POST#${id}`,
    id,
    workspaceId,
    month,
    scheduledDate,
    title: `Creator operations workflow #${day}`,
    format: ["LinkedIn carousel", "X thread", "YouTube short", "Rednote story"][index % 4],
    goal: ["Positioning", "Lead magnet", "Community trust", "Launch support"][index % 4],
    keywords: ["creator ops", "planning", "workflow", primaryPlatform],
    outline: ["Name the recurring problem.", "Show the lightweight workflow.", "Give one action to try."],
    draft: "Creators do not need another blank calendar. They need an operating loop.",
    sourceIdea: `Use a workflow moment to explain CreatorOS on day ${day}.`,
    status,
    primaryPlatform,
    platforms,
    version: 1,
    updatedAt: now,
  }
})

const plan = {
  pk: workspacePk(workspaceId),
  sk: `PLAN#${month}`,
  gsi1pk: monthPk(workspaceId, month),
  gsi1sk: "PLAN",
  workspaceId,
  month,
  title: "June creator operations plan",
  summary: "A deterministic judge demo plan for the CreatorOS golden path.",
  themes: ["Content operations", "Creator workflow", "Audience learning", "Cross-platform packaging"],
  generationStatus: "seeded",
  updatedAt: now,
}

const variants = posts.flatMap((post) =>
  platforms.map((platform) => ({
    pk: workspacePk(workspaceId),
    sk: `POST#${post.id}#VARIANT#${platform}`,
    gsi2pk: platformPk(workspaceId, platform),
    gsi2sk: `DATE#${post.scheduledDate}#POST#${post.id}`,
    workspaceId,
    postId: post.id,
    month,
    scheduledDate: post.scheduledDate,
    platform,
    headline: `${post.title} for ${platform}`,
    body: "Plan, adapt, publish, measure, and improve the next cycle from one operating loop.",
    callToAction: "Save this workflow for your next planning cycle.",
    characterCount: 84,
    status: "seeded",
    updatedAt: now,
  })),
)

const items = [profile, plan, ...posts, ...variants]
const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
  marshallOptions: { removeUndefinedValues: true },
})

for (let index = 0; index < items.length; index += 25) {
  const batch = items.slice(index, index + 25)
  await client.send(
    new TransactWriteCommand({
      TransactItems: batch.map((item) => ({
        Put: {
          TableName: tableName,
          Item: item,
        },
      })),
    }),
  )
}

console.log(`Seeded ${items.length} CreatorOS demo items into ${tableName}.`)

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
