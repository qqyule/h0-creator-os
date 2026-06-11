"use client"

import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Lightbulb,
  Settings,
  Sparkles,
  Workflow,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { LocaleSwitcher } from "@/components/app/locale-switcher"
import { navItems } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

const iconMap = {
  dashboard: LayoutDashboard,
  calendar: CalendarDays,
  ideas: Lightbulb,
  workflow: Workflow,
  analytics: BarChart3,
  templates: FileText,
  settings: Settings,
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const t = useTranslations("shell")

  return (
    <aside className="flex h-full w-full flex-col gap-6 border-r border-sidebar-border bg-sidebar px-4 py-6">
      {/* Brand */}
      <div className="px-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">{t("brand")}</span>
        </div>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">{t("tagline")}</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1" aria-label={t("navLabel")}>
        {navItems.map((item) => {
          const Icon = iconMap[item.icon]
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {t(`nav.${item.id}`)}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="flex flex-col gap-3">
        <LocaleSwitcher />

        <button className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent/40">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold text-primary">
            Y
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">{t("workspace.name")}</span>
            <span className="block text-xs text-muted-foreground">{t("workspace.plan")}</span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </div>
    </aside>
  )
}
