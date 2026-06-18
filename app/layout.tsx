import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import 'driver.js/dist/driver.css'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CreatorOS — Content operations for cross-platform creator teams',
  description:
    'Plan the next 30 posts, adapt each idea for LinkedIn, X, YouTube, and Rednote, track execution, and turn performance data into the next actions.',
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
  const content = <RootProviders>{children}</RootProviders>

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        {hasClerk ? <ClerkProvider>{content}</ClerkProvider> : content}
      </body>
    </html>
  )
}

async function RootProviders({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
        <Toaster position="bottom-right" theme="system" richColors closeButton visibleToasts={3} />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </NextIntlClientProvider>
    </ThemeProvider>
  )
}
