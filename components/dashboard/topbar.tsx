import { Bell, Search } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { AuthMenu } from "@/components/auth/auth-menu"
import { ThemeToggle } from "@/components/theme-toggle"

export async function Topbar() {
  const t = await getTranslations("shell.topbar")
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-pretty text-2xl font-semibold tracking-tight text-foreground">
          {t("title")} <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden flex-1 sm:block lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-14 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            ⌘ K
          </kbd>
        </div>

        <ThemeToggle />

        <button
          aria-label={t("notifications")}
          className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
        </button>

        <AuthMenu hasClerk={hasClerk} />
      </div>
    </header>
  )
}
