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
  }

  console.log(`PASS ${check.method} ${check.path}`)
}

if (failures > 0) {
  console.error(`Smoke failed with ${failures} failure(s). Base URL: ${baseUrl}`)
  process.exit(1)
}

console.log(`Smoke passed for ${checks.length} checks. Base URL: ${baseUrl}`)
