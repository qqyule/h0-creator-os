"use server"

import { cookies } from "next/headers"
import { isSupportedLocale, localeCookieName, type AppLocale } from "@/i18n/config"

export async function setUserLocale(locale: AppLocale) {
  if (!isSupportedLocale(locale)) {
    return
  }

  const cookieStore = await cookies()
  cookieStore.set(localeCookieName, locale, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  })
}
