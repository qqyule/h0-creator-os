"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useMemo, useState } from "react"

type ThemeMode = "system" | "light" | "dark"

const modes: ThemeMode[] = ["system", "light", "dark"]
const labels: Record<ThemeMode, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
}

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
  const resolvedLabel = resolvedTheme === "dark" ? "Dark" : "Light"

  if (!mounted) {
    return (
      <button
        type="button"
      aria-label="Theme: System. Click to switch theme."
      title="Theme: System"
      className={buttonClassName}
    >
        <Monitor className="h-[18px] w-[18px]" />
        <span className="sr-only">Switch theme</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      aria-label={`Theme: ${labels[currentTheme]}. Click to switch to ${labels[nextTheme]}.`}
      title={`Theme: ${labels[currentTheme]}${currentTheme === "system" ? ` (${resolvedLabel})` : ""}`}
      onClick={() => setTheme(nextTheme)}
      className={buttonClassName}
    >
      <Icon className="h-[18px] w-[18px]" />
      <span className="sr-only">Switch theme</span>
    </button>
  )
}
