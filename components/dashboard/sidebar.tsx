import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  FileText,
  Globe,
  LayoutDashboard,
  Lightbulb,
  Settings,
  Sparkles,
  Workflow,
} from "lucide-react"
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

export function Sidebar() {
  return (
    <aside className="flex h-full w-full flex-col gap-6 border-r border-sidebar-border bg-sidebar px-4 py-6">
      {/* Brand */}
      <div className="px-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">CreatorOS</span>
        </div>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
          Plan, adapt, and ship your next 30 posts.
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon]
          return (
            <a
              key={item.id}
              href="#"
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                item.active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </a>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="flex flex-col gap-3">
        <button className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <Globe className="h-[18px] w-[18px]" />
          <span>
            English <span className="text-muted-foreground/60">/</span> 中文
          </span>
        </button>

        <button className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent/40">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-sm font-semibold text-amber-700">
            Y
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">Acme Creators</span>
            <span className="block text-xs text-muted-foreground">Pro Plan</span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </div>
    </aside>
  )
}
