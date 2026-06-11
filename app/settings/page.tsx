import { getTranslations } from "next-intl/server"
import { AppShell } from "@/components/app/app-shell"
import { Topbar } from "@/components/dashboard/topbar"
import { AiSettingsForm } from "@/components/settings/ai-settings-form"

export default async function SettingsPage() {
  const t = await getTranslations("settings")

  return (
    <AppShell>
      <Topbar />

      <div className="mt-8 max-w-4xl">
        <div>
          <p className="text-sm font-medium text-primary">{t("eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t("description")}</p>
        </div>

        <AiSettingsForm />
      </div>
    </AppShell>
  )
}
