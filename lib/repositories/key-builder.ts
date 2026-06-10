import type { PlatformId, WorkflowStatus } from "@/lib/domain"

export function workspacePk(workspaceId: string) {
  return `WORKSPACE#${workspaceId}`
}

export function profileSk() {
  return "PROFILE"
}

export function planSk(month: string) {
  return `PLAN#${month}`
}

export function postSk(postId: string) {
  return `POST#${postId}`
}

export function variantSk(postId: string, platform: PlatformId) {
  return `POST#${postId}#VARIANT#${platform}`
}

export function draftSk(postId: string, platform: PlatformId, version: number) {
  return `POST#${postId}#DRAFT#${platform}#${version}`
}

export function metricSk(postId: string, publishedAt: string) {
  return `POST#${postId}#METRIC#${publishedAt}`
}

export function insightSk(month: string, generatedAt: string) {
  return `INSIGHT#${month}#${generatedAt}`
}

export function monthPk(workspaceId: string, month: string) {
  return `WORKSPACE#${workspaceId}#MONTH#${month}`
}

export function metricsMonthPk(workspaceId: string, month: string) {
  return `WORKSPACE#${workspaceId}#METRICS#${month}`
}

export function statusPk(workspaceId: string, status: WorkflowStatus) {
  return `WORKSPACE#${workspaceId}#STATUS#${status}`
}

export function platformPk(workspaceId: string, platform: PlatformId) {
  return `WORKSPACE#${workspaceId}#PLATFORM#${platform}`
}
