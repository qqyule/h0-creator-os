const rawBaseUrl = process.env.CREATOROS_BASE_URL
const defaultYoutubeVideoId = process.env.CREATOROS_SMOKE_YOUTUBE_VIDEO_ID || "GpQSUjNsNm0"

function getBaseUrl() {
  if (!rawBaseUrl) {
    throw new Error("CREATOROS_BASE_URL is required for production smoke checks.")
  }

  const url = new URL(rawBaseUrl)
  const blockedHosts = new Set(["localhost", "127.0.0.1", "::1"])

  if (url.protocol !== "https:" || blockedHosts.has(url.hostname)) {
    throw new Error("CREATOROS_BASE_URL must be a real HTTPS production URL.")
  }

  return url.toString().replace(/\/$/, "")
}

const baseUrl = getBaseUrl()
let failures = 0
let skipped = 0

function logPass(label, detail = "") {
  console.log(`PASS ${label}${detail ? ` - ${detail}` : ""}`)
}

function logSkip(label, detail = "") {
  skipped += 1
  console.log(`SKIP ${label}${detail ? ` - ${detail}` : ""}`)
}

function logFail(label, detail) {
  failures += 1
  console.error(`FAIL ${label}${detail ? ` - ${detail}` : ""}`)
}

async function request(method, path, { body, headers, redirect = "follow" } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    redirect,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(headers ?? {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get("content-type") ?? ""
  const payload = contentType.includes("application/json") ? await response.json().catch(() => null) : null

  return { response, payload }
}

async function checkPage(path) {
  const label = `GET ${path}`

  try {
    const { response } = await request("GET", path)
    if (response.ok) {
      logPass(label, `HTTP ${response.status}`)
      return
    }

    logFail(label, `HTTP ${response.status}`)
  } catch (error) {
    logFail(label, error.message)
  }
}

async function checkApi(method, path, { body, validate } = {}) {
  const label = `${method} ${path}`

  try {
    const { response, payload } = await request(method, path, {
      body,
      headers: { accept: "application/json" },
    })

    if (!response.ok) {
      logFail(label, `HTTP ${response.status}`)
      return null
    }

    if (!payload?.ok) {
      logFail(label, "unexpected API payload")
      return null
    }

    if (validate && !validate(payload.data)) {
      logFail(label, "response data did not match smoke expectations")
      return null
    }

    logPass(label, `HTTP ${response.status}`)
    return payload.data
  } catch (error) {
    logFail(label, error.message)
    return null
  }
}

async function checkSettingsProtection() {
  const label = "GET /settings"

  try {
    const { response } = await request("GET", "/settings", { redirect: "manual" })
    if ([307, 308, 401, 403].includes(response.status)) {
      logPass(label, `protected with HTTP ${response.status}`)
      return
    }

    if (response.status === 404 && response.headers.get("x-clerk-auth-status") === "signed-out") {
      logPass(label, "protected by Clerk signed-out rewrite")
      return
    }

    logFail(label, `expected auth protection, got HTTP ${response.status}`)
  } catch (error) {
    logFail(label, error.message)
  }
}

async function checkYoutubeSync() {
  const label = "PATCH /api/v1/posts/post-01/sync"

  try {
    const { response, payload } = await request("PATCH", "/api/v1/posts/post-01/sync", {
      body: { externalId: defaultYoutubeVideoId },
      headers: { accept: "application/json" },
    })

    if (response.ok && payload?.ok) {
      logPass(label, `synced ${payload.data?.externalId ?? defaultYoutubeVideoId}`)
      return
    }

    if (payload?.error?.code === "YOUTUBE_API_UNCONFIGURED") {
      logSkip(label, "GOOGLE_PUBLIC_API_KEY is not configured")
      return
    }

    logFail(label, payload?.error?.code ?? `HTTP ${response.status}`)
  } catch (error) {
    logFail(label, error.message)
  }
}

function nextStatus(status) {
  const statuses = ["Idea", "Drafting", "Review", "Scheduled", "Published"]
  const index = statuses.indexOf(status)
  return statuses[(index + 1) % statuses.length] ?? "Drafting"
}

await checkPage("/dashboard")
await checkPage("/calendar")
await checkPage("/post/post-01")
await checkPage("/analytics")

await checkApi("GET", "/api/v1/profile", {
  validate: (data) => Boolean(data?.profile),
})
await checkApi("GET", "/api/v1/plans/2026-06", {
  validate: (data) => Boolean(data?.plan),
})
const postData = await checkApi("GET", "/api/v1/posts/post-01", {
  validate: (data) => Boolean(data?.detail?.post),
})

await checkApi("POST", "/api/v1/posts/post-01/rewrite", {
  body: { platform: "linkedin", tone: "Analytic" },
  validate: (data) => Boolean(data?.saved?.variant),
})

const post = postData?.detail?.post
await checkApi("PATCH", "/api/v1/posts/post-01/status", {
  body: { status: nextStatus(post?.status), version: post?.version },
  validate: (data) => Boolean(data?.post),
})

await checkApi("POST", "/api/v1/metrics/import", {
  body: {
    postId: "post-01",
    platform: "linkedin",
    views: 1200,
    likes: 86,
    comments: 12,
    saves: 20,
    followersGained: 7,
    source: "manual",
  },
  validate: (data) => Boolean(data?.metric),
})

await checkApi("POST", "/api/v1/analytics/insights", {
  body: { month: "2026-06" },
  validate: (data) => Boolean(data?.saved),
})

await checkApi("POST", "/api/v1/analytics/insights/actionable", {
  body: { month: "2026-06" },
  validate: (data) => Boolean(data?.saved),
})

await checkYoutubeSync()
await checkSettingsProtection()

if (failures > 0) {
  console.error(`Production smoke failed with ${failures} failure(s), ${skipped} skipped. Base URL: ${baseUrl}`)
  process.exit(1)
}

console.log(`Production smoke passed with ${skipped} skipped. Base URL: ${baseUrl}`)
