const baseUrl = (process.env.CREATOROS_BASE_URL || "http://localhost:3000").replace(/\/$/, "")

const checks = [
  { method: "GET", path: "/dashboard", type: "page" },
  { method: "GET", path: "/onboarding", type: "page" },
  { method: "GET", path: "/calendar", type: "page" },
  { method: "GET", path: "/post/post-01", type: "page" },
  { method: "GET", path: "/analytics", type: "page" },
  { method: "GET", path: "/api/v1/profile", type: "api" },
  { method: "GET", path: "/api/v1/plans/2026-06", type: "api" },
  { method: "GET", path: "/api/v1/posts/post-01", type: "api" },
]

let failures = 0
let postData

for (const check of checks) {
  const url = `${baseUrl}${check.path}`
  const response = await fetch(url, {
    method: check.method,
    redirect: "manual",
    headers: check.type === "api" ? { accept: "application/json" } : undefined,
  }).catch((error) => ({ error }))

  if ("error" in response) {
    failures += 1
    console.error(`FAIL ${check.method} ${check.path}: ${response.error.message}`)
    continue
  }

  const ok = response.status >= 200 && response.status < 300

  if (!ok) {
    failures += 1
    console.error(`FAIL ${check.method} ${check.path}: HTTP ${response.status}`)
    continue
  }

  if (check.type === "api") {
    const payload = await response.json().catch(() => null)
    if (!payload?.ok) {
      failures += 1
      console.error(`FAIL ${check.method} ${check.path}: unexpected API payload`)
      continue
    }
    if (check.path === "/api/v1/posts/post-01") {
      postData = payload.data
    }
  }

  console.log(`PASS ${check.method} ${check.path}`)
}

async function checkJson(method, path, body, validate = () => true) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { "content-type": "application/json", accept: "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }).catch((error) => ({ error }))

  if ("error" in response) {
    failures += 1
    console.error(`FAIL ${method} ${path}: ${response.error.message}`)
    return null
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload?.ok || !validate(payload.data)) {
    failures += 1
    console.error(`FAIL ${method} ${path}: HTTP ${response.status}`)
    return null
  }

  console.log(`PASS ${method} ${path}`)
  return payload.data
}

await checkJson("PATCH", "/api/v1/brand-voice", {
  traits: ["Clear", "Practical", "Operator-led"],
  examples: [{ title: "Workflow note", text: "Creator teams need one visible loop from idea to metric before they need more prompts.", approved: true }],
}, (data) => Boolean(data?.brandVoice))

const idea = await checkJson("POST", "/api/v1/ideas", {
  title: "Smoke test idea",
  description: "A safe first-party idea for the roadmap smoke check.",
  platform: "linkedin",
}, (data) => Boolean(data?.idea))

if (idea?.idea?.id) {
  await checkJson("PATCH", "/api/v1/ideas", {
    id: idea.idea.id,
    status: "planned",
  }, (data) => data?.idea?.status === "planned")
}

await checkJson("GET", "/api/v1/analytics/best-times", undefined, (data) => Array.isArray(data?.recommendations))

await checkJson("POST", "/api/v1/posts/post-01/rewrite", {
  platform: "x",
  tone: "Analytic",
}, (data) => Boolean(data?.generation?.data?.body))

await checkJson("POST", "/api/v1/posts/post-01/rewrite/hook", {
  platform: "x",
}, (data) => Array.isArray(data?.hooks) && data.hooks.length > 0)

await checkJson("POST", "/api/v1/analytics/insights", {
  month: "2026-06",
}, (data) => Boolean(data?.generation?.data?.summary))

const post = postData?.detail?.post
await checkJson("PATCH", "/api/v1/posts/post-01/schedule", {
  scheduledDate: "2026-06-03",
  scheduledTime: "13:00",
  timezone: "America/Los_Angeles",
  status: "Scheduled",
  version: post?.version,
}, (data) => data?.post?.scheduledTime === "13:00")

const conflictResponse = await fetch(`${baseUrl}/api/v1/posts/post-01/schedule`, {
  method: "PATCH",
  headers: { "content-type": "application/json", accept: "application/json" },
  body: JSON.stringify({
    scheduledDate: "2026-06-04",
    scheduledTime: "14:00",
    timezone: "America/Los_Angeles",
    version: 999,
  }),
}).catch((error) => ({ error }))

if ("error" in conflictResponse || conflictResponse.status !== 409) {
  failures += 1
  console.error("FAIL PATCH /api/v1/posts/post-01/schedule conflict: expected HTTP 409")
} else {
  console.log("PASS PATCH /api/v1/posts/post-01/schedule conflict")
}

await checkJson("POST", "/api/v1/posts/post-01/queue", {
  timezone: "America/Los_Angeles",
}, (data) => data?.post?.queueStatus === "queued")

const carousel = await checkJson("POST", "/api/v1/posts/post-01/carousel", {
  title: "Smoke carousel",
}, (data) => Boolean(data?.downloadPath))

if (carousel?.downloadPath) {
  const response = await fetch(`${baseUrl}${carousel.downloadPath}`).catch((error) => ({ error }))
  if ("error" in response || !response.ok || !response.headers.get("content-type")?.includes("application/pdf")) {
    failures += 1
    console.error(`FAIL GET ${carousel.downloadPath}: PDF download failed`)
  } else {
    console.log(`PASS GET ${carousel.downloadPath}`)
  }
}

if (failures > 0) {
  console.error(`Smoke failed with ${failures} failure(s). Base URL: ${baseUrl}`)
  process.exit(1)
}

console.log(`Smoke passed for page, API, roadmap, and PDF checks. Base URL: ${baseUrl}`)
