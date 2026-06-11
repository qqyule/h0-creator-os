import { AuthPageShell, AuthUnavailable } from "@/components/auth/auth-page-shell"
import { ThemedSignUp } from "@/components/auth/themed-clerk"

export default function SignUpPage() {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

  return (
    <AuthPageShell mode="signUp">
      {hasClerk ? (
        <ThemedSignUp routing="path" path="/sign-up" fallbackRedirectUrl="/onboarding" />
      ) : (
        <AuthUnavailable mode="signUp" />
      )}
    </AuthPageShell>
  )
}
