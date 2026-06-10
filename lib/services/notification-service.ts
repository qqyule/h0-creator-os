import { Resend } from "resend"
import { getResendConfig } from "@/lib/env"

export async function sendPlanReadySmokeEmail(input: { to?: string; workspaceId: string }) {
  const config = getResendConfig()
  const to = input.to ?? config.testRecipient

  if (!config.configured || !config.apiKey || !to) {
    return {
      configured: false as const,
      sent: false,
      warning: "Resend is not configured. Set RESEND_API_KEY and a safe recipient.",
    }
  }

  const resend = new Resend(config.apiKey)
  const result = await resend.emails.send({
    from: config.from,
    to,
    subject: "CreatorOS plan-ready smoke test",
    text: `CreatorOS smoke test for ${input.workspaceId}: the plan-ready notification service is wired.`,
  })

  if (result.error) {
    return {
      configured: true as const,
      sent: false,
      warning: result.error.message,
    }
  }

  return {
    configured: true as const,
    sent: true,
    id: result.data?.id,
  }
}
