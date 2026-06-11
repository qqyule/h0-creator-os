import { SignIn } from "@clerk/nextjs"
import { AuthPageShell, AuthUnavailable } from "@/components/auth/auth-page-shell"

export default function SignInPage() {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

  return (
    <AuthPageShell mode="signIn">
      {hasClerk ? <SignIn routing="path" path="/sign-in" /> : <AuthUnavailable mode="signIn" />}
    </AuthPageShell>
  )
}
