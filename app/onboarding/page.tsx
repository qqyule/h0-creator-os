import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import { AccountDnaForm } from "@/components/onboarding/account-dna-form"
import { Button } from "@/components/ui/button"
import type { AccountDna } from "@/lib/domain"
import { ContentNotFoundError, getProfile } from "@/lib/repositories/content-repository"
import { resolveWorkspace } from "@/lib/workspace"

export default async function OnboardingPage() {
  const workspace = await resolveWorkspace()
  let profile: AccountDna
  try {
    profile = await getProfile(workspace.workspaceId)
  } catch (error) {
    if (error instanceof ContentNotFoundError && error.code === "PROFILE_NOT_FOUND") {
      profile = {
        workspaceId: workspace.workspaceId,
        niche: "",
        audience: "",
        platforms: [],
        cadence: "",
        tone: "",
        goals: [],
        updatedAt: new Date().toISOString(),
      }
    } else {
      throw error
    }
  }

  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]">
        <section className="border-b border-border pb-6 xl:col-span-2">
          <p className="text-sm font-medium text-primary">Onboarding</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Set the account DNA</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            The demo path starts here: positioning context becomes a 30-day plan, then platform rewrites and insights.
          </p>
        </section>

        <AccountDnaForm profile={profile} />

        <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Demo-safe behavior</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <p>Unauthenticated judges use the isolated `DEMO#judge` workspace.</p>
            <p>When DynamoDB is unconfigured, the server returns deterministic demo data instead of blocking the flow.</p>
            <p>Real Clerk user workspaces use `USER#clerkUserId` after Clerk resources are configured.</p>
          </div>
          <Button asChild className="mt-5 w-full" variant="outline">
            <Link href="/calendar">
              Continue to plan
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </aside>
      </div>
    </AppShell>
  )
}
