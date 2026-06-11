import { z } from "zod"
import { getYoutubeConfig } from "@/lib/env"

const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/
const YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"

const youtubeStatsResponseSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        statistics: z
          .object({
            viewCount: z.string().optional(),
            likeCount: z.string().optional(),
            commentCount: z.string().optional(),
          })
          .optional(),
      }),
    )
    .default([]),
})

export type YoutubeStatsErrorCode =
  | "YOUTUBE_API_UNCONFIGURED"
  | "YOUTUBE_INVALID_VIDEO_ID"
  | "YOUTUBE_VIDEO_NOT_FOUND"
  | "YOUTUBE_QUOTA_OR_FORBIDDEN"
  | "YOUTUBE_FETCH_FAILED"

export class MetricsFetcherError extends Error {
  code: YoutubeStatsErrorCode
  status: number

  constructor(code: YoutubeStatsErrorCode, message: string, status: number) {
    super(message)
    this.name = "MetricsFetcherError"
    this.code = code
    this.status = status
  }
}

export type YoutubeVideoStats = {
  videoId: string
  views: number
  likes: number
  comments: number
  fetchedAt: string
}

function parseCount(value: string | undefined) {
  const parsed = Number(value ?? 0)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0
  }

  return Math.trunc(parsed)
}

export async function fetchYoutubeVideoStats(videoId: string): Promise<YoutubeVideoStats> {
  const normalizedVideoId = videoId.trim()

  if (!YOUTUBE_VIDEO_ID_PATTERN.test(normalizedVideoId)) {
    throw new MetricsFetcherError(
      "YOUTUBE_INVALID_VIDEO_ID",
      "Use a valid 11-character YouTube video ID.",
      422,
    )
  }

  const config = getYoutubeConfig()

  if (!config.apiKey) {
    throw new MetricsFetcherError(
      "YOUTUBE_API_UNCONFIGURED",
      "YouTube live sync is not configured. Manual metric entry is still available.",
      503,
    )
  }

  const url = new URL(YOUTUBE_VIDEOS_URL)
  url.searchParams.set("part", "statistics")
  url.searchParams.set("id", normalizedVideoId)
  url.searchParams.set("key", config.apiKey)

  let response: Response

  try {
    response = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    })
  } catch {
    throw new MetricsFetcherError(
      "YOUTUBE_FETCH_FAILED",
      "YouTube stats could not be reached. Try manual metric entry for now.",
      502,
    )
  }

  if (response.status === 403) {
    throw new MetricsFetcherError(
      "YOUTUBE_QUOTA_OR_FORBIDDEN",
      "YouTube stats sync is blocked or quota-limited. Manual metric entry is still available.",
      503,
    )
  }

  if (!response.ok) {
    throw new MetricsFetcherError(
      "YOUTUBE_FETCH_FAILED",
      "YouTube stats could not be fetched. Try manual metric entry for now.",
      502,
    )
  }

  const body = await response.json().catch(() => undefined)
  const parsed = youtubeStatsResponseSchema.safeParse(body)

  if (!parsed.success) {
    throw new MetricsFetcherError(
      "YOUTUBE_FETCH_FAILED",
      "YouTube returned an unexpected stats payload.",
      502,
    )
  }

  const item = parsed.data.items[0]

  if (!item) {
    throw new MetricsFetcherError(
      "YOUTUBE_VIDEO_NOT_FOUND",
      "No public YouTube video was found for that ID.",
      404,
    )
  }

  return {
    videoId: item.id,
    views: parseCount(item.statistics?.viewCount),
    likes: parseCount(item.statistics?.likeCount),
    comments: parseCount(item.statistics?.commentCount),
    fetchedAt: new Date().toISOString(),
  }
}
