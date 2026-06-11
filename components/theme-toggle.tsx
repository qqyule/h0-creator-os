"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useEffect, useMemo, useState } from "react"

type ThemeMode = "system" | "light" | "dark"

const modes: ThemeMode[] = ["system", "light", "dark"]
const icons = {
  system: Monitor,
  light: Sun,
  dark: Moon,
}

function normalizeTheme(theme: string | undefined): ThemeMode {
  return theme === "light" || theme === "dark" || theme === "system" ? theme : "system"
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme()
  const t = useTranslations("theme")
  const [mounted, setMounted] = useState(false)
  const buttonClassName =
    "relative flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45"

  useEffect(() => {
    // next-themes needs a client-only mounted gate to avoid hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const currentTheme = normalizeTheme(theme)
  const nextTheme = useMemo(() => {
    const currentIndex = modes.indexOf(currentTheme)
    return modes[(currentIndex + 1) % modes.length]
  }, [currentTheme])
  const Icon = icons[currentTheme]
  const resolvedLabel = resolvedTheme === "dark" ? t("dark") : t("light")
  const currentLabel = t(currentTheme)
  const nextLabel = t(nextTheme)

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label={t("systemAria")}
        title={t("systemTitle")}
        className={buttonClassName}
      >
        <Monitor className="h-[18px] w-[18px]" />
        <span className="sr-only">{t("switch")}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      aria-label={t("toggleAria", { current: currentLabel, next: nextLabel })}
      title={currentTheme === "system" ? t("titleWithResolved", { current: currentLabel, resolved: resolvedLabel }) : t("title", { current: currentLabel })}
      onClick={() => setTheme(nextTheme)}
      className={buttonClassName}
    >
      <Icon className="h-[18px] w-[18px]" />
      <span className="sr-only">{t("switch")}</span>
    </button>
  )
}
