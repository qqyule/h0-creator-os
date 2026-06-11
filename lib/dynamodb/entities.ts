import { Entity, Service } from "electrodb"
import { getDocumentClient } from "@/lib/dynamodb/client"
import { getDynamoConfig } from "@/lib/env"

const service = "creatoros"
const version = "1"

const client = getDocumentClient()
const table = getDynamoConfig().tableName ?? "creatoros-unconfigured-content"

const commonIndexes = {
  primary: {
    pk: {
      field: "pk",
      composite: ["workspaceId"],
      template: "WORKSPACE#${workspaceId}",
    },
    sk: {
      field: "sk",
      composite: [],
    },
  },
  byMonth: {
    index: "gsi1",
    pk: {
      field: "gsi1pk",
      composite: ["workspaceId", "month"],
      template: "WORKSPACE#${workspaceId}#MONTH#${month}",
    },
    sk: {
      field: "gsi1sk",
      composite: [],
    },
  },
  byStatus: {
    index: "gsi2",
    pk: {
      field: "gsi2pk",
      composite: ["workspaceId", "status"],
      template: "WORKSPACE#${workspaceId}#STATUS#${status}",
    },
    sk: {
      field: "gsi2sk",
      composite: [],
    },
  },
} as const

export const ProfileEntity = new Entity(
  {
    model: { entity: "Profile", service, version },
    attributes: {
      workspaceId: { type: "string", required: true },
      niche: { type: "string", required: true },
      audience: { type: "string", required: true },
      platforms: { type: "list", items: { type: "string" }, required: true },
      cadence: { type: "string", required: true },
      tone: { type: "string", required: true },
      goals: { type: "list", items: { type: "string" }, required: true },
      updatedAt: { type: "string", required: true },
    },
    indexes: {
      profile: {
        pk: commonIndexes.primary.pk,
        sk: {
          field: "sk",
          composite: [],
          template: "PROFILE",
        },
      },
    },
  },
  { client, table },
)

export const MonthlyPlanEntity = new Entity(
  {
    model: { entity: "MonthlyPlan", service, version },
    attributes: {
      workspaceId: { type: "string", required: true },
      month: { type: "string", required: true },
      title: { type: "string", required: true },
      summary: { type: "string", required: true },
      themes: { type: "list", items: { type: "string" }, required: true },
      generationStatus: { type: "string", required: true },
      updatedAt: { type: "string", required: true },
    },
    indexes: {
      plan: {
        pk: commonIndexes.primary.pk,
        sk: {
          field: "sk",
          composite: ["month"],
          template: "PLAN#${month}",
        },
      },
      byMonth: {
        ...commonIndexes.byMonth,
        sk: {
          field: "gsi1sk",
          composite: [],
          template: "PLAN",
        },
      },
    },
  },
  { client, table },
)

export const PostEntity = new Entity(
  {
    model: { entity: "Post", service, version },
    attributes: {
      id: { type: "string", required: true },
      workspaceId: { type: "string", required: true },
      month: { type: "string", required: true },
      scheduledDate: { type: "string", required: true },
      title: { type: "string", required: true },
      format: { type: "string", required: true },
      goal: { type: "string", required: true },
      keywords: { type: "list", items: { type: "string" }, required: true },
      outline: { type: "list", items: { type: "string" }, required: true },
      draft: { type: "string", required: true },
      sourceIdea: { type: "string", required: true },
      status: { type: "string", required: true },
      primaryPlatform: { type: "string", required: true },
      platforms: { type: "list", items: { type: "string" }, required: true },
      version: { type: "number", required: true },
      updatedAt: { type: "string", required: true },
    },
    indexes: {
      post: {
        pk: commonIndexes.primary.pk,
        sk: {
          field: "sk",
          composite: ["id"],
          template: "POST#${id}",
        },
      },
      byMonth: {
        ...commonIndexes.byMonth,
        sk: {
          field: "gsi1sk",
          composite: ["scheduledDate", "id"],
          template: "DATE#${scheduledDate}#POST#${id}",
        },
      },
      byStatus: {
        ...commonIndexes.byStatus,
        sk: {
          field: "gsi2sk",
          composite: ["scheduledDate", "id"],
          template: "DATE#${scheduledDate}#POST#${id}",
        },
      },
    },
  },
  { client, table },
)

export const PlatformVariantEntity = new Entity(
  {
    model: { entity: "PlatformVariant", service, version },
    attributes: {
      workspaceId: { type: "string", required: true },
      postId: { type: "string", required: true },
      month: { type: "string", required: true },
      scheduledDate: { type: "string", required: true },
      platform: { type: "string", required: true },
      headline: { type: "string", required: true },
      body: { type: "string", required: true },
      callToAction: { type: "string", required: true },
      characterCount: { type: "number", required: true },
      status: { type: "string", required: true },
      updatedAt: { type: "string", required: true },
    },
    indexes: {
      variant: {
        pk: commonIndexes.primary.pk,
        sk: {
          field: "sk",
          composite: ["postId", "platform"],
          template: "POST#${postId}#VARIANT#${platform}",
        },
      },
      byPlatform: {
        index: "gsi2",
        pk: {
          field: "gsi2pk",
          composite: ["workspaceId", "platform"],
          template: "WORKSPACE#${workspaceId}#PLATFORM#${platform}",
        },
        sk: {
          field: "gsi2sk",
          composite: ["scheduledDate", "postId"],
          template: "DATE#${scheduledDate}#POST#${postId}",
        },
      },
    },
  },
  { client, table },
)

export const DraftVersionEntity = new Entity(
  {
    model: { entity: "DraftVersion", service, version },
    attributes: {
      workspaceId: { type: "string", required: true },
      postId: { type: "string", required: true },
      platform: { type: "string", required: true },
      version: { type: "number", required: true },
      body: { type: "string", required: true },
      createdAt: { type: "string", required: true },
    },
    indexes: {
      draft: {
        pk: commonIndexes.primary.pk,
        sk: {
          field: "sk",
          composite: ["postId", "platform", "version"],
          template: "POST#${postId}#DRAFT#${platform}#${version}",
        },
      },
    },
  },
  { client, table },
)

export const PostMetricEntity = new Entity(
  {
    model: { entity: "PostMetric", service, version },
    attributes: {
      workspaceId: { type: "string", required: true },
      month: { type: "string", required: true },
      postId: { type: "string", required: true },
      platform: { type: "string", required: true },
      publishedAt: { type: "string", required: true },
      views: { type: "number", required: true },
      likes: { type: "number", required: true },
      comments: { type: "number", required: true },
      saves: { type: "number", required: true },
      followersGained: { type: "number", required: true },
    },
    indexes: {
      metric: {
        pk: commonIndexes.primary.pk,
        sk: {
          field: "sk",
          composite: ["postId", "publishedAt"],
          template: "POST#${postId}#METRIC#${publishedAt}",
        },
      },
      byMetricsMonth: {
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["workspaceId", "month"],
          template: "WORKSPACE#${workspaceId}#METRICS#${month}",
        },
        sk: {
          field: "gsi1sk",
          composite: ["publishedAt", "postId"],
          template: "DATE#${publishedAt}#POST#${postId}",
        },
      },
    },
  },
  { client, table },
)

export const InsightEntity = new Entity(
  {
    model: { entity: "Insight", service, version },
    attributes: {
      id: { type: "string", required: true },
      workspaceId: { type: "string", required: true },
      month: { type: "string", required: true },
      title: { type: "string", required: true },
      summary: { type: "string", required: true },
      recommendations: { type: "list", items: { type: "string" }, required: true },
      confidence: { type: "string", required: true },
      generatedAt: { type: "string", required: true },
    },
    indexes: {
      insight: {
        pk: commonIndexes.primary.pk,
        sk: {
          field: "sk",
          composite: ["month", "generatedAt"],
          template: "INSIGHT#${month}#${generatedAt}",
        },
      },
      byMonth: {
        ...commonIndexes.byMonth,
        sk: {
          field: "gsi1sk",
          composite: ["generatedAt"],
          template: "INSIGHT#${generatedAt}",
        },
      },
    },
  },
  { client, table },
)

export const AiSettingsEntity = new Entity(
  {
    model: { entity: "AiSettings", service, version },
    attributes: {
      configId: { type: "string", required: true },
      baseUrl: { type: "string", required: true },
      model: { type: "string", required: true },
      enabled: { type: "boolean", required: true },
      encryptedApiKey: { type: "string" },
      apiKeyHint: { type: "string" },
      updatedAt: { type: "string", required: true },
    },
    indexes: {
      settings: {
        pk: {
          field: "pk",
          composite: ["configId"],
          template: "CONFIG#${configId}",
        },
        sk: {
          field: "sk",
          composite: [],
          template: "SETTINGS",
        },
      },
    },
  },
  { client, table },
)

export const ContentService = new Service(
  {
    profile: ProfileEntity,
    monthlyPlan: MonthlyPlanEntity,
    post: PostEntity,
    platformVariant: PlatformVariantEntity,
    draftVersion: DraftVersionEntity,
    postMetric: PostMetricEntity,
    insight: InsightEntity,
  },
  { client, table },
)
