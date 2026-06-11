import Link from "next/link"
import { Sparkles } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"

export async function AuthPageShell({
  children,
  mode,
}: {
  children: React.ReactNode
  mode: "signIn" | "signUp"
}) {
  const t = await getTranslations(`auth.${mode}`)

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
        <section className="max-w-xl">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </span>
            CreatorOS
          </Link>
          <p className="mt-8 text-sm font-medium text-primary">{t("eyebrow")}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{t("description")}</p>
          <Button asChild className="mt-8" variant="outline" size="lg">
            <Link href="/dashboard">{t("demoLink")}</Link>
          </Button>
        </section>

        <section className="flex justify-center rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          {children}
        </section>
      </div>
    </main>
  )
}

export async function AuthUnavailable({ mode }: { mode: "signIn" | "signUp" }) {
  const t = await getTranslations(`auth.${mode}`)

  return (
    <div className="max-w-sm rounded-xl border border-dashed border-border bg-background p-6 text-center">
      <h2 className="text-lg font-semibold text-foreground">{t("unconfiguredTitle")}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("unconfiguredDescription")}</p>
      <Button asChild className="mt-5" size="lg">
        <Link href="/dashboard">{t("demoLink")}</Link>
      </Button>
    </div>
  )
}
