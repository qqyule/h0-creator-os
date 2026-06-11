import { AuthPageShell, AuthUnavailable } from "@/components/auth/auth-page-shell"
import { ThemedSignIn } from "@/components/auth/themed-clerk"

export default function SignInPage() {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

  return (
    <AuthPageShell mode="signIn">
      {hasClerk ? <ThemedSignIn routing="path" path="/sign-in" /> : <AuthUnavailable mode="signIn" />}
    </AuthPageShell>
  )
}
