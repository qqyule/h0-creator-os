import { SignUp } from "@clerk/nextjs"
import { AuthPageShell, AuthUnavailable } from "@/components/auth/auth-page-shell"

export default function SignUpPage() {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

  return (
    <AuthPageShell mode="signUp">
      {hasClerk ? <SignUp routing="path" path="/sign-up" /> : <AuthUnavailable mode="signUp" />}
    </AuthPageShell>
  )
}
