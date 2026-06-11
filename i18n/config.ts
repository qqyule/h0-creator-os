export const defaultLocale = "en-US"
export const supportedLocales = ["en-US", "zh-CN"] as const
export const localeCookieName = "creatoros-locale"

export type AppLocale = (typeof supportedLocales)[number]

export const localeLabels: Record<AppLocale, string> = {
  "en-US": "English",
  "zh-CN": "中文",
}

export function isSupportedLocale(value: string | undefined): value is AppLocale {
  return supportedLocales.includes(value as AppLocale)
}
