"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import Link from "next/link"
import { LogIn } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

export function AuthMenu({ hasClerk }: { hasClerk: boolean }) {
  const t = useTranslations("shell.auth")

  if (!hasClerk) {
    return (
      <span className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground">
        {t("demoMode")}
      </span>
    )
  }

  return <ClerkAuthMenu />
}

function ClerkAuthMenu() {
  const t = useTranslations("shell.auth")
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return <span className="h-10 w-10 rounded-lg border border-border bg-card" aria-hidden="true" />
  }

  if (isSignedIn) {
    return (
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-9 w-9",
          },
        }}
      />
    )
  }

  return (
    <Button asChild variant="outline" size="lg">
      <Link href="/sign-in">
        <LogIn data-icon="inline-start" />
        {t("signIn")}
      </Link>
    </Button>
  )
}
