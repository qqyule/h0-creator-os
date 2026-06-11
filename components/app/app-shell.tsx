"use client"

import { Menu, Sparkles, X } from "lucide-react"
import { useId, useState } from "react"
import { useTranslations } from "next-intl"
import { Sidebar } from "@/components/dashboard/sidebar"

export function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const t = useTranslations("shell")
  const [menuOpen, setMenuOpen] = useState(false)
  const mobileNavId = useId()

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
              type="button"
              aria-controls={mobileNavId}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {menuOpen ? (
            <div className="lg:hidden">
              <button
                type="button"
                aria-label={t("closeMenu")}
                className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
                onClick={() => setMenuOpen(false)}
              />
              <div id={mobileNavId} className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] shadow-xl">
                <Sidebar onNavigate={() => setMenuOpen(false)} />
              </div>
            </div>
          ) : null}

          {children}
        </main>
      </div>
    </div>
  )
}
