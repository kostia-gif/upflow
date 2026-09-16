import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, Cormorant_Garamond, DM_Sans, Outfit, Syne } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { ApplicationProvider } from '@/lib/application/context'
import { BrandTheme } from '@/components/apply/brand-theme'
import { DevToolbar } from '@/components/apply/dev-toolbar'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', weight: ['500', '600', '700'] })
const barlow = Barlow_Condensed({ subsets: ['latin'], variable: '--font-barlow', weight: ['600', '700'] })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], variable: '--font-cormorant', weight: ['600', '700'] })
const syne = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['700', '800'] })

export const metadata: Metadata = {
  title: 'UP Apply — application flow prototype',
  description:
    'A three-minute application, then a guided set of get-ready steps. One flow for AIPC, NZMA, Elite and Yoobee.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#2D388E',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`bg-brand-soft ${dmSans.variable} ${outfit.variable} ${barlow.variable} ${cormorant.variable} ${syne.variable}`}
    >
      <body className="antialiased">
        <ApplicationProvider>
          <BrandTheme>{children}</BrandTheme>
          <DevToolbar />
          <Toaster position="top-center" />
        </ApplicationProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
