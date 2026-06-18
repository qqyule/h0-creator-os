"use client"

import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Box,
  CalendarDays,
  Check,
  Cloud,
  Database,
  Download,
  Layers3,
  Monitor,
  RotateCcw,
  Send,
  Server,
  Sparkles,
  Target,
  Zap,
} from "lucide-react"
import { useState } from "react"
import { PlatformIcon } from "@/components/dashboard/platform-icon"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ProductPreview, WorkflowMiniBoard } from "./product-preview"
import { ArchitectureStep, FeatureShell, IconBubble, MiniBars, MiniSparkline } from "./landing-visuals"

const navItems = [
  { label: "Product", href: "#product" },
  { label: "Workflow", href: "#workflow" },
  { label: "Analytics", href: "#analytics" },
  { label: "Architecture", href: "#architecture" },
  { label: "Demo", href: "/dashboard" },
  { label: "Pricing", href: "#pricing" },
]

const technologyTags = ["Next.js", "Vercel", "DynamoDB", "AI SDK", "English-first", "Cross-platform"]

const flywheel = [
  { title: "Input", detail: "Capture ideas, feedback, and audience signals.", icon: Download },
  { title: "Plan", detail: "AI builds a 30-day content plan.", icon: CalendarDays },
  { title: "Adapt", detail: "Generate native rewrites for each platform.", icon: Sparkles },
  { title: "Ship", detail: "Publish with confidence across channels.", icon: Send },
  { title: "Measure", detail: "Track performance and engagement.", icon: BarChart3 },
  { title: "Optimize", detail: "Learn, refine, and fuel the next cycle.", icon: RotateCcw },
]

export function LandingPage() {
  const [activeWorkflow, setActiveWorkflow] = useState("Drafting")

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] bg-[radial-gradient(circle_at_18%_12%,rgba(37,99,235,0.13),transparent_32rem),radial-gradient(circle_at_78%_6%,rgba(125,170,255,0.13),transparent_28rem)] dark:bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.24),transparent_32rem),radial-gradient(circle_at_82%_8%,rgba(99,102,241,0.16),transparent_28rem)]" />

      <header className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-7 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="CreatorOS home">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_30px_rgba(37,99,235,0.28)]">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">CreatorOS</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground lg:flex" aria-label="Landing navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button asChild variant="ghost" className="hidden h-10 px-3 sm:inline-flex">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild className="h-10 rounded-xl px-4 shadow-[0_12px_30px_rgba(37,99,235,0.25)]">
            <Link href="/dashboard">
              <span className="hidden sm:inline">Open Demo Workspace</span>
              <span className="sm:hidden">Demo</span>
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 pb-12 pt-8 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:pb-16 lg:pt-12">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary dark:bg-primary/12">
            <Sparkles className="h-4 w-4" />
            AI-powered content operating system
          </div>
          <h1 className="mt-7 max-w-2xl text-pretty text-5xl font-semibold tracking-[-0.035em] text-foreground sm:text-6xl">
            Your command center for <span className="text-primary">creator operations.</span>
          </h1>
          <p className="mt-6 text-balance text-2xl font-medium leading-tight text-primary sm:text-3xl">
            Content operations for cross-platform creator teams.
          </p>
          <p className="mt-8 max-w-xl text-base leading-8 text-foreground/82">
            Plan the next 30 posts, adapt each idea for LinkedIn, X, YouTube, and Rednote, track execution, and turn performance data into the next actions.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-13 rounded-xl px-6 shadow-[0_16px_36px_rgba(37,99,235,0.28)]">
              <Link href="/dashboard">
                Try Demo
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-13 rounded-xl px-6 bg-card/70">
              <Link href="#architecture">
                View Architecture
                <Box data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-3 text-xs font-medium text-muted-foreground sm:flex sm:flex-wrap sm:gap-6">
            {["30-day cycle", "Multi-platform", "AI-powered", "Built for creators"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <ProductPreview />
      </section>

      <section className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-[24px] border border-border bg-card/78 px-6 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur dark:bg-card/60 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground sm:min-w-60">Built with best-in-class technologies</p>
          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {technologyTags.map((tag) => (
              <span key={tag} className="rounded-full border border-border bg-background/75 px-4 py-2 text-center text-sm font-medium text-foreground dark:bg-background/35">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="product" className="mx-auto grid max-w-7xl gap-4 px-5 py-9 sm:px-6 lg:grid-cols-4 lg:px-8">
        <FeatureShell>
          <FeatureHeader icon={Target} title="Account DNA" detail="Define who you serve, what you say, how you show up." />
          <div className="mt-5 rounded-2xl border border-border bg-background/80 p-4 text-xs dark:bg-background/35">
            <p className="font-semibold text-foreground">Account DNA</p>
            <MiniLabel label="Niche" value="B2B creator operations" />
            <MiniLabel label="Audience" value="Solo experts and small studios" />
            <MiniLabel label="Cadence" value="Weekdays" />
            <MiniLabel label="Tone" value="Clear, practical operator-led" />
            <div className="mt-4 flex gap-2">
              {(["linkedin", "x", "youtube", "rednote"] as const).map((platform) => (
                <PlatformIcon key={platform} platform={platform} tile className="h-7 w-7 rounded-full" />
              ))}
            </div>
          </div>
        </FeatureShell>

        <FeatureShell>
          <FeatureHeader icon={CalendarDays} title="30-Day Plan" detail="AI turns positioning into a daily plan with clear next actions." />
          <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-background/80 text-xs dark:bg-background/35">
            {[
              ["Day 1", "Positioning", "Idea"],
              ["Day 2", "Lead magnet", "Drafting"],
              ["Day 3", "Community trust", "Review"],
              ["Day 4", "Launch support", "Scheduled"],
              ["Day 5", "Retention", "Published"],
            ].map(([day, title, status]) => (
              <div key={day} className="grid grid-cols-[64px_1fr_auto] items-center gap-2 border-b border-border px-3 py-2.5 last:border-0">
                <span className="rounded-full border border-border bg-card px-2 py-1 text-center text-[11px] font-medium">{day}</span>
                <span className="truncate text-muted-foreground">{title}</span>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">{status}</span>
              </div>
            ))}
          </div>
        </FeatureShell>

        <FeatureShell>
          <FeatureHeader icon={Layers3} title="Multi-Platform Adaptation" detail="One idea, many native formats, adapted for every platform." />
          <div className="mt-5 rounded-2xl border border-border bg-background/80 p-4 dark:bg-background/35">
            <div className="flex flex-wrap gap-2">
              {(["linkedin", "x", "youtube", "rednote"] as const).map((platform) => (
                <PlatformIcon key={platform} platform={platform} tile className="h-7 w-7 rounded-full" />
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground">Turn repeated client questions into a content engine</p>
              <p className="mt-1 text-xs text-muted-foreground">Carousel · 6 slides</p>
              <div className="mt-4 grid grid-cols-[56px_1fr] gap-3">
                <div className="rounded-lg border border-border bg-background p-3 text-center text-lg font-semibold text-muted-foreground">01</div>
                <div className="rounded-lg bg-primary/10 p-3 text-xs text-foreground">
                  The best content comes from repeated questions.
                </div>
              </div>
            </div>
          </div>
        </FeatureShell>

        <FeatureShell>
          <FeatureHeader icon={Send} title="Workflow Board" detail="Track status, handoffs, and feedback across the entire cycle." />
          <div className="mt-5">
            <WorkflowMiniBoard />
          </div>
        </FeatureShell>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-5 pb-5 sm:px-6 lg:px-8">
        <div className="rounded-[24px] border border-border bg-card/86 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)] dark:bg-card/65">
          <div className="grid gap-8 lg:grid-cols-[230px_1fr] lg:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">The CreatorOS Flywheel</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">A continuous loop that compounds clarity, consistency, and growth.</p>
              <Link href="/dashboard" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                See how it works <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
              {flywheel.map((step, index) => (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setActiveWorkflow(step.title)}
                  className={cn(
                    "group relative rounded-2xl border p-4 text-center transition",
                    activeWorkflow === step.title
                      ? "border-primary/45 bg-primary/8 shadow-[0_14px_30px_rgba(37,99,235,0.14)]"
                      : "border-transparent hover:border-border hover:bg-background/60",
                  )}
                >
                  <IconBubble icon={step.icon} className="mx-auto" />
                  <p className="mt-3 text-sm font-semibold text-foreground">{index + 1}. {step.title}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{step.detail}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="analytics" className="mx-auto max-w-7xl px-5 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-[24px] border border-border bg-card/86 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] dark:bg-card/65 lg:grid-cols-[260px_repeat(5,minmax(0,1fr))]">
          <div className="p-1">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Measure what matters. Grow what works.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">CreatorOS connects your content operations to real business impact.</p>
            <Link href="/analytics" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Explore analytics <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <MetricTile label="Planned posts" value="30" detail="June creator operations plan" color="rgb(37 99 235)" data={[8, 12, 16, 14, 22, 24, 24, 34, 26]} />
          <MetricTile label="Published views" value="35,550" detail="From demo metrics" chart="bars" />
          <MetricTile label="Engagements" value="1,725" detail="Likes tracked manually" color="rgb(34 197 94)" data={[8, 10, 16, 14, 22, 19, 28, 20, 23]} />
          <MetricTile label="Followers gained" value="93" detail="Feedback loop input" color="rgb(168 85 247)" data={[4, 8, 12, 16, 8, 28, 24, 22, 32]} />
          <div className="rounded-2xl border border-primary/10 bg-primary/8 p-4 dark:bg-primary/12">
            <p className="text-2xl font-semibold text-primary">+28%</p>
            <p className="mt-1 text-xs font-semibold text-foreground">Avg. engagement lift</p>
            <p className="mt-5 text-xs leading-5 text-muted-foreground">Organizations using CreatorOS ship more, learn faster, and grow consistently.</p>
            <MiniSparkline data={[6, 8, 7, 12, 14, 18]} color="rgb(37 99 235)" className="mt-3" />
          </div>
        </div>
      </section>

      <section id="architecture" className="mx-auto max-w-7xl px-5 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-[24px] border border-border bg-card/86 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] dark:bg-card/65 lg:grid-cols-[245px_1fr] lg:items-center">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Built for speed, scale, and simplicity.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">A modern full-stack architecture powering a seamless creator OS.</p>
            <Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              View architecture <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <ArchitectureStep icon={Monitor} title="Web App" detail="Next.js 16" />
            <ArchitectureStep icon={Server} title="Backend API" detail="Route handlers" />
            <ArchitectureStep icon={Database} title="Database" detail="DynamoDB" />
            <ArchitectureStep icon={Zap} title="AI Layer" detail="GPT-4o / Claude" />
            <ArchitectureStep icon={Cloud} title="Storage" detail="S3 / CloudFront" showArrow={false} />
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-5 pb-8 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-5 rounded-[24px] border border-primary/10 bg-gradient-to-r from-primary/12 via-blue-100/70 to-indigo-100/70 px-8 py-7 dark:from-primary/18 dark:via-primary/10 dark:to-indigo-500/12 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground">Build your next content cycle from one workspace.</h2>
            <p className="mt-3 text-sm text-muted-foreground">Plan with clarity. Adapt with speed. Ship with confidence.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="h-11 rounded-xl px-5">
              <Link href="/dashboard">
                Launch Demo
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-xl bg-card/70 px-5">
              <Link href="#product">
                Explore Product
                <Box data-icon="inline-end" />
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground sm:col-span-2 sm:justify-center">
            {["No credit card required", "30-day demo workspace", "Cancel anytime"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function FeatureHeader({ icon, title, detail }: { icon: typeof Target; title: string; detail: string }) {
  const Icon = icon

  return (
    <div className="flex items-start gap-3">
      <IconBubble icon={Icon} className="h-10 w-10 shrink-0 rounded-2xl" />
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
      </div>
    </div>
  )
}

function MiniLabel({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-foreground">{value}</p>
    </div>
  )
}

function MetricTile({
  label,
  value,
  detail,
  color = "rgb(37 99 235)",
  data = [8, 11, 10, 18, 17, 24, 20, 26, 30],
  chart = "line",
}: {
  label: string
  value: string
  detail: string
  color?: string
  data?: number[]
  chart?: "line" | "bars"
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/80 p-4 dark:bg-background/35">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      {chart === "bars" ? (
        <MiniBars values={[15, 29, 22, 35, 27, 31, 24, 38, 42, 34, 48, 55]} className="mt-4" />
      ) : (
        <MiniSparkline data={data} color={color} className="mt-4" />
      )}
    </div>
  )
}
