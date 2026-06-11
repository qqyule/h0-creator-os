import { fail, ok, validationError } from "@/lib/api/response"
import { liveMetricSyncInputSchema, type PostMetric } from "@/lib/domain"
import {
  ContentNotFoundError,
  getPostDetail,
  saveMetric,
  savePostExternalReference,
} from "@/lib/repositories/content-repository"
import { fetchYoutubeVideoStats, MetricsFetcherError } from "@/lib/services/metrics-fetcher-service"
import { resolveWorkspace } from "@/lib/workspace"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await resolveWorkspace()
  const { id } = await params
  const body = await request.json().catch(() => undefined)
  const parsed = liveMetricSyncInputSchema.safeParse(body)

  if (!parsed.success) {
    return validationError("A valid YouTube video ID is required.")
  }

  try {
    await getPostDetail(workspace.workspaceId, id)
  } catch (error) {
    if (error instanceof ContentNotFoundError) {
      return fail(error.code, error.message, { status: 404 })
    }

    throw error
  }

  try {
    const stats = await fetchYoutubeVideoStats(parsed.data.externalId)
    const metric: PostMetric = {
      postId: id,
      platform: "youtube",
      publishedAt: stats.fetchedAt,
      views: stats.views,
      likes: stats.likes,
      comments: stats.comments,
      saves: 0,
      followersGained: 0,
      source: "youtube",
    }
    const postResult = await savePostExternalReference(workspace.workspaceId, id, {
      externalId: stats.videoId,
      publishedUrl: parsed.data.publishedUrl,
    })
    const metricResult = await saveMetric(workspace.workspaceId, metric)

    return ok({
      metric: metricResult.metric,
      post: postResult.post,
      externalId: stats.videoId,
      publishedUrl: parsed.data.publishedUrl,
      source: "youtube" as const,
      mode: metricResult.mode,
      workspace,
    })
  } catch (error) {
    if (error instanceof MetricsFetcherError) {
      return fail(error.code, error.message, { status: error.status })
    }

    throw error
  }
}
