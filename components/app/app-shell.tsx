import { Menu, Sparkles } from "lucide-react"
import { Sidebar } from "@/components/dashboard/sidebar"

export function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1600px]">
        <div className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
          <Sidebar />
        </div>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="text-lg font-semibold tracking-tight text-foreground">CreatorOS</span>
            </div>
            <button
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {children}
        </main>
      </div>
    </div>
  )
}
