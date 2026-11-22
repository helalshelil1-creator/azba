'use client'

import React, { useEffect, useState } from 'react'
import { Building2, RefreshCw, Loader2, MapPin, Users, PawPrint } from 'lucide-react'
import { http } from '@/lib/api'
import { cn, formatEGP } from '@/lib/utils'
import { Card } from '@azba/ui/card'

interface FarmInfo {
  id: string; name: string; code: string; address: string; city: string; governorate: string;
  totalArea: any; usableArea: any; status: string; manager?: { firstName: string; lastName: string; email: string };
  _count?: { animals: number; pens: number; buildings: number; projects: number; employees: number };
}

export default function FarmPage() {
  const [farm, setFarm] = useState<FarmInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const load = async () => { setLoading(true); try { const r = await http.get<{ data: FarmInfo[] }>('/farms?page=1&limit=1'); setFarm(r?.data?.[0] ?? null) } catch {} finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  if (loading) return <div className="flex items-center justify-center py-16 text-sm text-muted-foreground"><Loader2 className="ml-2 h-5 w-5 animate-spin" />جارٍ التحميل...</div>
  if (!farm) return <Card className="p-16 text-center text-sm text-muted-foreground">لا توجد بيانات مزرعة مرتبطة بحسابك</Card>

  const stats = [
    { label: 'الحيوانات', value: farm._count?.animals ?? 0, icon: PawPrint },
    { label: 'العنابر', value: farm._count?.pens ?? 0, icon: Building2 },
    { label: 'المباني', value: farm._count?.buildings ?? 0, icon: Building2 },
    { label: 'المشاريع', value: farm._count?.projects ?? 0, icon: Users },
    { label: 'الموظفون', value: farm._count?.employees ?? 0, icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">المزرعة</h2>
        <button onClick={load} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-primary hover:bg-primary/5"><RefreshCw className={cn('h-5 w-5', loading && 'animate-spin')} /></button>
      </div>
      <Card className="bg-primary text-ivory">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-ivory/60">{farm.code}</div>
            <h3 className="mt-1 text-2xl font-extrabold">{farm.name}</h3>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-ivory/70"><MapPin className="h-4 w-4 text-gold" />{farm.city} — {farm.governorate}</div>
          </div>
          <span className="badge bg-white/15 text-white">{farm.status}</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <s.icon className="mx-auto h-4 w-4 text-gold" />
              <div className="mt-1.5 text-xl font-bold">{s.value}</div>
              <div className="text-[10px] text-ivory/60">{s.label}</div>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card><div className="text-xs text-muted-foreground">المساحة الكلية</div><div className="mt-1 text-xl font-bold text-primary">{farm.totalArea ? `${farm.totalArea} م²` : '—'}</div></Card>
        <Card><div className="text-xs text-muted-foreground">المساحة المستغلة</div><div className="mt-1 text-xl font-bold text-primary">{farm.usableArea ? `${farm.usableArea} م²` : '—'}</div></Card>
        <Card><div className="text-xs text-muted-foreground">مدير المزرعة</div><div className="mt-1 font-bold text-primary">{farm.manager ? `${farm.manager.firstName} ${farm.manager.lastName}` : '—'}</div></Card>
        <Card><div className="text-xs text-muted-foreground">العنوان</div><div className="mt-1 text-sm font-semibold text-primary">{farm.address}</div></Card>
      </div>
    </div>
  )
}
