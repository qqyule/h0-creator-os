"use client"

import { SignIn, SignUp } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemedSignIn(props: React.ComponentProps<typeof SignIn>) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    // 渲染骨架屏或透明以避免水合闪烁
    return <div className="min-h-[400px] w-full" />
  }

  const isDark = resolvedTheme === "dark"

  return (
    <SignIn
      {...props}
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: {
          colorPrimary: "#6d28d9", // Purple matching the design
          colorBackground: isDark ? "#121212" : "#ffffff", // Make it match current background if needed
        },
        elements: {
          rootBox: "w-full",
          card: "bg-transparent shadow-none border-none p-0 w-full", // Remove Clerk's default card styling to fit into our right section
          headerTitle: "text-3xl font-bold tracking-tight text-foreground",
          headerSubtitle: "text-muted-foreground mb-4",
          socialButtonsBlockButton: "border-border text-foreground hover:bg-muted/50 transition-colors h-11",
          socialButtonsBlockButtonText: "font-semibold",
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground",
          formFieldLabel: "text-foreground font-medium",
          formFieldInput: "bg-background border-border text-foreground focus:ring-2 focus:ring-primary/20 h-11",
          formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base font-semibold transition-colors",
          footerActionText: "text-muted-foreground",
          footerActionLink: "text-primary hover:text-primary/90 font-semibold",
          identityPreviewText: "text-foreground",
          identityPreviewEditButton: "text-primary hover:text-primary/90",
        }
      }}
    />
  )
}

export function ThemedSignUp(props: React.ComponentProps<typeof SignUp>) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-[400px] w-full" />
  }

  const isDark = resolvedTheme === "dark"

  return (
    <SignUp
      {...props}
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: {
          colorPrimary: "#6d28d9",
        },
        elements: {
          rootBox: "w-full",
          card: "bg-transparent shadow-none border-none p-0 w-full",
          headerTitle: "text-3xl font-bold tracking-tight text-foreground",
          headerSubtitle: "text-muted-foreground mb-4",
          socialButtonsBlockButton: "border-border text-foreground hover:bg-muted/50 transition-colors h-11",
          socialButtonsBlockButtonText: "font-semibold",
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground",
          formFieldLabel: "text-foreground font-medium",
          formFieldInput: "bg-background border-border text-foreground focus:ring-2 focus:ring-primary/20 h-11",
          formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-base font-semibold transition-colors",
          footerActionText: "text-muted-foreground",
          footerActionLink: "text-primary hover:text-primary/90 font-semibold",
          identityPreviewText: "text-foreground",
          identityPreviewEditButton: "text-primary hover:text-primary/90",
        }
      }}
    />
  )
}
