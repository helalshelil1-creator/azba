import React from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/marketing/hero'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { Opportunities } from '@/components/marketing/opportunities'
import { Features } from '@/components/marketing/features'
import { Farms } from '@/components/marketing/farms'
import { Transparency } from '@/components/marketing/transparency'
import { FAQ } from '@/components/marketing/faq'
import { CTA } from '@/components/marketing/cta'

export const metadata = { alternates: { canonical: '/' } }

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <Opportunities />
      <Features />
      <Farms />
      <Transparency />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  )
}
