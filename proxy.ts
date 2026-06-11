import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const hasClerkRuntime = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
const isProtectedRoute = createRouteMatcher(["/settings(.*)"])

function publicProxy() {
  return NextResponse.next()
}

export default hasClerkRuntime
  ? clerkMiddleware(async (auth, request) => {
      if (isProtectedRoute(request)) {
        await auth.protect()
      }
    })
  : publicProxy

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/api/(.*)",
    "/__clerk/(.*)",
  ],
}
