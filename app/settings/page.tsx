import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { AiSettingsForm } from "@/components/settings/ai-settings-form"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1600px]">
        <div className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
          <Sidebar />
        </div>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Topbar />

          <div className="mt-8 max-w-4xl">
            <div>
              <p className="text-sm font-medium text-primary">Settings</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">AI Provider</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Configure the OpenAI-compatible endpoint used by future planning, rewrite, draft, and insight workflows.
                Secrets stay on the server and are never sent back to the browser.
              </p>
            </div>

            <AiSettingsForm />
          </div>
        </main>
      </div>
    </div>
  )
}
