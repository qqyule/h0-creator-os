import Link from "next/link"
import { Sparkles, Calendar, Layers, Activity, ShieldCheck, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LocaleSwitcher } from "@/components/app/locale-switcher"
import { ThemeToggle } from "@/components/theme-toggle"

export async function AuthPageShell({
  children,
  mode,
}: {
  children: React.ReactNode
  mode: "signIn" | "signUp"
}) {
  const t = await getTranslations(`auth.${mode}`)

  return (
    <main className="flex min-h-screen bg-background relative overflow-hidden" aria-labelledby="auth-page-title">
      <div className="sr-only">
        <h1 id="auth-page-title">{t("title")}</h1>
        <p>{t("description")}</p>
      </div>
      {/* Decorative Background for the left side */}
      <div className="absolute top-0 left-0 w-1/2 h-full hidden lg:block overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px] dark:bg-purple-500/20" />
      </div>

      <div className="flex w-full">
        {/* Left Section - Product Showcase */}
        <section className="hidden lg:flex flex-col w-[55%] relative z-10 px-12 xl:px-20 py-12 justify-between border-r border-border/50 bg-background/50 backdrop-blur-sm">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-foreground hover:opacity-90 transition-opacity">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="h-6 w-6" />
              </span>
              CreatorOS
            </Link>

            <div className="mt-16 max-w-2xl">
              <h1 className="text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                Plan, adapt, and ship your next 30 posts.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                The content operating system for independent creators, small studios, and cross-border teams.
                <span className="block mt-2 text-sm text-muted-foreground/80 font-medium">面向独立创作者与小团队的内容运营系统</span>
              </p>

              {/* Tags */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium bg-background/80 shadow-sm border-border/60">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  30-day content planning
                </Badge>
                <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium bg-background/80 shadow-sm border-border/60">
                  <Layers className="w-4 h-4 mr-2 text-primary" />
                  Multi-platform adaptation
                </Badge>
                <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium bg-background/80 shadow-sm border-border/60">
                  <Activity className="w-4 h-4 mr-2 text-primary" />
                  Analytics feedback loop
                </Badge>
              </div>
            </div>
          </div>

          {/* Mock UI Elements relative to the bottom space */}
          <div className="relative flex-1 mt-12 min-h-[400px] w-full max-w-[600px]">
             {/* Calendar Mock */}
             <div className="absolute top-0 right-10 w-[280px] bg-card rounded-2xl shadow-xl border border-border/60 p-5 transform rotate-2 hover:rotate-0 transition-transform duration-500 select-none">
               <div className="flex justify-between items-center mb-4">
                 <span className="font-semibold text-sm">May 2025</span>
                 <div className="flex gap-2">
                   <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                   <ChevronRight className="w-4 h-4 text-muted-foreground" />
                 </div>
               </div>
               <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground mb-2">
                 <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
               </div>
               <div className="grid grid-cols-7 gap-2 text-center text-sm">
                 <span className="text-muted-foreground/30">28</span><span className="text-muted-foreground/30">29</span><span className="text-muted-foreground/30">30</span>
                 <span>1</span><span>2</span><span>3</span><span>4</span>
                 <span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span>
                 <span>12</span><span>13</span><span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mx-auto shadow-md">14</span><span>15</span><span>16</span><span>17</span><span>18</span>
                 <span>19</span><span>20</span><span>21</span><span className="relative">22<span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></span></span><span>23</span><span>24</span><span>25</span>
               </div>
             </div>

             {/* Workflow Mock */}
             <div className="absolute top-32 left-0 w-[240px] bg-card rounded-2xl shadow-xl border border-border/60 p-4 transform -rotate-2 hover:rotate-0 transition-transform duration-500 select-none">
               <div className="flex justify-between items-center mb-3">
                 <span className="font-semibold text-xs text-muted-foreground">Workflow</span>
                 <span className="text-[10px] text-primary cursor-pointer hover:underline">View all</span>
               </div>
               <div className="space-y-2.5">
                 <div className="flex justify-between items-center text-sm">
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div>Ideation</div>
                   <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium text-[10px] px-1.5 py-0.5 rounded">12</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div>In Progress</div>
                   <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium text-[10px] px-1.5 py-0.5 rounded">5</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>Review</div>
                   <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-medium text-[10px] px-1.5 py-0.5 rounded">3</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" />Published</div>
                   <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium text-[10px] px-1.5 py-0.5 rounded">24</span>
                 </div>
               </div>
             </div>

             {/* Post adapted Mock */}
             <div className="absolute bottom-4 right-0 w-[360px] bg-card rounded-2xl shadow-xl border border-border/60 p-4 transform rotate-1 hover:rotate-0 transition-transform duration-500 select-none">
                <span className="text-xs font-semibold text-muted-foreground mb-3 block">Adapted for each platform</span>
                <div className="flex gap-3 items-end">
                  {/* IG style */}
                  <div className="w-[70px] h-[90px] rounded-lg bg-muted border border-border flex flex-col justify-end p-2 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 group-hover:opacity-80 transition-opacity"></div>
                    <svg className="w-4 h-4 z-10 text-pink-600 dark:text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    <span className="z-10 text-[9px] font-medium mt-1">4:5</span>
                  </div>
                  {/* TikTok style */}
                  <div className="w-[60px] h-[100px] rounded-lg bg-muted border border-border flex flex-col justify-end p-2 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 dark:to-white/5"></div>
                    <svg className="w-4 h-4 z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                    <span className="z-10 text-[9px] font-medium mt-1">9:16</span>
                  </div>
                  {/* X style */}
                  <div className="w-[80px] h-[60px] rounded-lg bg-muted border border-border flex flex-col justify-end p-2">
                     <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
                     <span className="text-[9px] font-medium mt-1">16:9</span>
                  </div>
                  {/* LinkedIn style */}
                  <div className="w-[60px] h-[60px] rounded-lg bg-muted border border-border flex flex-col justify-end p-2">
                     <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                     <span className="text-[9px] font-medium mt-1">1:1</span>
                  </div>
                  <div className="w-[40px] h-[40px] rounded-full border border-dashed border-border flex items-center justify-center text-xs font-medium text-muted-foreground mb-2">
                    +2
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* Right Section - Auth Form */}
        <section className="w-full lg:w-[45%] flex flex-col justify-center items-center relative z-20 px-4 sm:px-8 bg-background lg:bg-transparent">
          {/* Top Right Controls */}
          <div className="absolute top-6 right-6 sm:top-8 sm:right-8 flex items-center gap-3">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>

          <div className="w-full max-w-[440px] mt-24 mb-16 flex flex-col relative z-10">
            {/* 居中放置表单 */}
            <div className="w-full flex justify-center">
              {children}
            </div>
            <Button asChild className="mt-4 w-full" variant="outline" size="lg">
              <Link href="/dashboard">{t("demoLink")}</Link>
            </Button>
          </div>

          {/* Bottom Security Note */}
          <div className="absolute bottom-6 left-0 w-full flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            <span>Your data is encrypted and secure. We never share your information.</span>
          </div>
        </section>
      </div>
    </main>
  )
}

export async function AuthUnavailable({ mode }: { mode: "signIn" | "signUp" }) {
  const t = await getTranslations(`auth.${mode}`)

  return (
    <div className="max-w-sm w-full mx-auto rounded-xl border border-dashed border-border bg-card p-6 text-center">
      <h2 className="text-lg font-semibold text-foreground">{t("unconfiguredTitle")}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("unconfiguredDescription")}</p>
      <Button asChild className="mt-5 w-full" size="lg">
        <Link href="/dashboard">{t("demoLink")}</Link>
      </Button>
    </div>
  )
}
