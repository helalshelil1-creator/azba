'use client'

import React, { useEffect, useState } from 'react'
import { Loader2, AlertTriangle, MapPin, Building2, PawPrint, Search } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { http, getToken } from '@/lib/api'
import { SHOWCASE_FARMS } from '@/lib/showcase'
import { PageLogo } from '@/components/layout/page-logo'

interface Farm {
  id: string; name: string; nameEn?: string; code: string; address?: string
  city?: string; governorate?: string; totalArea?: any; usableArea?: any
  status: string; _count?: { animals?: number; pens?: number }
}

export default function FarmsPage() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const params = new URLSearchParams({ page: '1', limit: '50' })
      if (search) params.set('search', search)
      const res = await http.get<any>(`/farms?${params.toString()}`, {}, getToken)
      setFarms(res?.data ?? [])
    } catch {
      // الـ API غير متاح: عرض مزارع العرض من نفس بيانات الـ seed
      setFarms(SHOWCASE_FARMS.map((f) => ({
        ...f,
        _count: { animals: f.animals, pens: f.pens },
      })) as Farm[])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search])

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <section className="relative overflow-hidden bg-primary-950 py-14 text-white">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container-page relative">
          <PageLogo className="mb-6 mt-6" />
          <span className="badge border border-gold/40 bg-gold/15 text-gold">المزارع</span>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">مزارع عزبة</h1>
          <p className="mt-3 max-w-2xl text-ivory/70">
            البنية التشغيلية التي تُدار بها مشاريع الاستثمار — مواقع ومساحات وعدد الحظائر والحيوانات بكل شفافية.
          </p>
        </div>
      </section>

      <div className="container-page py-10">
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم المزرعة أو المحافظة..." className="input-field pr-10" />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-20">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
            <span className="text-sm text-muted-foreground">جارٍ التحميل...</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center gap-3 py-20">
            <AlertTriangle className="h-10 w-10 text-amber-400" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button onClick={load} className="btn-outline text-sm">إعادة المحاولة</button>
          </div>
        )}

        {!loading && !error && farms.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-white py-20 text-center text-sm text-muted-foreground">
            لا توجد مزارع متاحة حاليًا.
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {farms.map((f) => (
            <div key={f.id} className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold text-primary">{f.name}</h3>
                <span className={f.status === 'ACTIVE' ? 'badge badge-success' : 'badge badge-default'}>{f.status === 'ACTIVE' ? 'نشطة' : f.status}</span>
              </div>
              {f.nameEn && <p className="mt-0.5 text-xs text-muted-foreground" dir="ltr">{f.nameEn}</p>}
              <p className="mt-3 flex items-center gap-1.5 text-sm text-foreground/75">
                <MapPin className="h-4 w-4 text-gold" />
                {f.city ?? '—'} — {f.governorate ?? '—'}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-ivory p-3 text-center">
                <div>
                  <div className="text-[10px] text-muted-foreground">المساحة الكلية</div>
                  <div className="text-sm font-bold text-primary">{f.totalArea ? `${f.totalArea} م²` : '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">الحيوانات</div>
                  <div className="flex items-center justify-center gap-1 text-sm font-bold text-primary">
                    <PawPrint className="h-3.5 w-3.5 text-gold" /> {f._count?.animals ?? '—'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
