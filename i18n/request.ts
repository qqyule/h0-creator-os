import { getRequestConfig } from "next-intl/server"
import type { RequestConfig } from "next-intl/server"
import { cookies } from "next/headers"
import { defaultLocale, isSupportedLocale, localeCookieName } from "@/i18n/config"

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const requestedLocale = cookieStore.get(localeCookieName)?.value
  const locale = isSupportedLocale(requestedLocale) ? requestedLocale : defaultLocale
  const defaultMessages = (await import(`../messages/${defaultLocale}.json`)).default
  const localeMessages =
    locale === defaultLocale ? defaultMessages : (await import(`../messages/${locale}.json`)).default

  return {
    locale,
    messages: mergeMessages(defaultMessages, localeMessages) as RequestConfig["messages"],
  }
})

function mergeMessages(base: unknown, override: unknown): unknown {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override ?? base
  }

  return Object.keys({ ...base, ...override }).reduce<Record<string, unknown>>((result, key) => {
    result[key] = mergeMessages(base[key], override[key])
    return result
  }, {})
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}
