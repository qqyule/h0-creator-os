"use client"

import { Globe } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { setUserLocale } from "@/app/actions/locale"
import { localeLabels, supportedLocales, type AppLocale } from "@/i18n/config"
import { cn } from "@/lib/utils"

export function LocaleSwitcher() {
  const locale = useLocale() as AppLocale
  const router = useRouter()
  const t = useTranslations("shell.locale")
  const [isPending, startTransition] = useTransition()

  function setLocale(nextLocale: AppLocale) {
    startTransition(async () => {
      await setUserLocale(nextLocale)
      router.refresh()
    })
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="flex items-center gap-1 rounded-lg border border-border px-2 py-2 text-sm text-muted-foreground"
    >
      <Globe className="h-[18px] w-[18px]" aria-hidden="true" />
      {supportedLocales.map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={locale === item}
          disabled={isPending}
          onClick={() => setLocale(item)}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-sidebar-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45",
            locale === item && "bg-sidebar-accent text-sidebar-accent-foreground",
          )}
        >
          {localeLabels[item]}
        </button>
      ))}
    </div>
  )
}
