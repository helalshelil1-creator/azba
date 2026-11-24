import type { Metadata, Viewport } from 'next'
import './globals.css'
import { cn } from '@/lib/utils'
import { AuthProvider } from '@/lib/auth-store'
import { MarketingBottomNav } from '@/components/layout/marketing-bottom-nav'
import { DemoBanner } from '@/components/layout/demo-banner'
import { Toaster } from 'sonner'
import {
  Tajawal,
  Cairo,
  Montserrat,
  Instrument_Serif,
} from 'next/font/google'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://azba.vercel.app'),
  title: {
    default: 'عزبة | AZBA: عرض منصة الاستثمار في الثروة الحيوانية',
    template: '%s | AZBA | عزبة',
  },
  description:
    'منصة متكاملة تتيح لك متابعة فرص الاستثمار في الثروة الحيوانية، ومراقبة مشروعاتك، والاطلاع على تفاصيل التشغيل والتكاليف والنتائج بكل شفافية.',
  keywords: [
    'استثمار الثروة الحيوانية',
    'استثمار أبقار',
    'استثمار جاموس',
    'مشاريع زراعية استثمارية',
    'livestock investment',
    'Egypt agriculture investment',
    'AZBA',
    'عزبة',
  ],
  authors: [{ name: 'AZBA' }],
  creator: 'AZBA',
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: ['en_US'],
    siteName: 'AZBA | عزبة',
    title: 'عزبة | AZBA: عرض منصة الاستثمار في الثروة الحيوانية',
    description:
      'من المزرعة إلى محفظتك الاستثمارية. منصة متكاملة للاستثمار في الثروة الحيوانية بشفافية كاملة.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AZBA | عزبة',
    description: 'استثمر في الثروة الحقيقية — من المزرعة إلى محفظتك الاستثمارية.',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon-512.png',
    other: [{ url: '/favicon.png', sizes: '64x64', type: 'image/png' }],
  },
  manifest: '/manifest.json',
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F1E8' },
    { media: '(prefers-color-scheme: dark)', color: '#061A12' },
  ],
}

// خطوط ذاتية الاستضافة (تُبنى محلياً في وقت البناء — بلا طلبات خارجية)
const fontTajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800'],
  display: 'swap',
  variable: '--nf-tajawal',
})
const fontCairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--nf-cairo',
})
const fontMontserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--nf-montserrat',
})
const fontInstrument = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--nf-instrument',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={cn(
        fontTajawal.variable,
        fontCairo.variable,
        fontMontserrat.variable,
        fontInstrument.variable
      )}
    >

      <body className="min-h-screen bg-background text-foreground">
        <AuthProvider>
          {children}
          <MarketingBottomNav />
          <DemoBanner />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  )
}
