import type { Metadata, Viewport } from 'next'
import './globals.css'
import { cn } from '@/lib/utils'
import { AuthProvider } from '@/lib/auth-store'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://azba.com'),
  title: {
    default: 'AZBA | عزبة — استثمر في الثروة الحقيقية',
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
  authors: [{ name: 'AZBA', url: 'https://azba.com' }],
  creator: 'AZBA',
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: ['en_US'],
    siteName: 'AZBA | عزبة',
    title: 'AZBA | عزبة — استثمر في الثروة الحقيقية',
    description:
      'من المزرعة إلى محفظتك الاستثمارية. منصة متكاملة للاستثمار في الثروة الحيوانية بشفافية كاملة.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AZBA | عزبة',
    description: 'استثمر في الثروة الحقيقية — من المزرعة إلى محفظتك الاستثمارية.',
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F1E8' },
    { media: '(prefers-color-scheme: dark)', color: '#061A12' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=Cairo:wght@400;600;700&family=Montserrat:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  )
}
