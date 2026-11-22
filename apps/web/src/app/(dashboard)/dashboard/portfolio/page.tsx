'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Wallet, TrendingUp, RefreshCw, Loader2, ArrowLeft, FileText } from 'lucide-react'
import { http } from '@/lib/api'
import { cn, formatEGP } from '@/lib/utils'
import { Card } from '@azba/ui/card'

interface Investment {
  id: string
  contractNumber?: string
  shareCount: number
  netAmount: number
  status: string
  totalDistributions: number
  realizedProfit: number
  project: { id: string; name: string; status: string; animalType: string }
  createdAt: string
}

const ST: Record<string, { ar: string; cls: string }> = {
  ACTIVE: { ar: 'نشط', cls: 'badge-success' },
  CONFIRMED: { ar: 'مؤكد', cls: 'badge-info' },
  RESERVED: { ar: 'محجوز', cls: 'badge-warning' },
  PENDING_PAYMENT: { ar: 'بانتظار الدفع', cls: 'badge-warning' },
  COMPLETED: { ar: 'مكتمل', cls: 'badge-default' },
  CANCELLED: { ar: 'ملغي', cls: 'badge-danger' },
  REFUNDED: { ar: 'مسترد', cls: 'badge-default' },
}

export default function PortfolioPage() {
  const [items, setItems] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await http.get<{ items: Investment[] }>('/investments')
      setItems(res.items ?? [])
    } catch (e: any) { setError(e?.message || 'تعذر التحميل') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const total = items.reduce((s, i) => s + Number(i.netAmount), 0)
  const profit = items.reduce((s, i) => s + Number(i.realizedProfit), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">محفظتي الاستثمارية</h2>
        <button onClick={load} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-primary hover:bg-primary/5">
          <RefreshCw className={cn('h-5 w-5', loading && 'animate-spin')} />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-primary"><Wallet className="h-5 w-5" /></div><div><div className="text-xs text-muted-foreground">إجمالي الاستثمار</div><div className="text-xl font-bold text-primary">{formatEGP(total)}</div></div></div></Card>
        <Card><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"><TrendingUp className="h-5 w-5" /></div><div><div className="text-xs text-muted-foreground">الأرباح المحققة</div><div className="text-xl font-bold text-emerald-600">{formatEGP(profit)}</div></div></div></Card>
        <Card><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold-600"><FileText className="h-5 w-5" /></div><div><div className="text-xs text-muted-foreground">عدد الاستثمارات</div><div className="text-xl font-bold text-primary">{items.length}</div></div></div></Card>
      </div>

      <Card className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground"><RefreshCw className="ml-2 h-5 w-5 animate-spin" />جارٍ التحميل...</div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Wallet className="h-12 w-12 text-primary/20" />
            <p className="text-sm text-muted-foreground">لا توجد استثمارات بعد</p>
            <Link href="/opportunities" className="btn-gold text-sm">تصفح الفرص</Link>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {items.map((inv) => {
              const st = ST[inv.status] ?? { ar: inv.status, cls: 'badge-default' }
              return (
                <div key={inv.id} className="flex flex-col gap-3 p-5 transition-colors hover:bg-ivory/40 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/5 font-bold text-primary">{inv.shareCount}</div>
                    <div>
                      <Link href={`/dashboard/projects/${inv.project.id}`} className="font-bold text-primary hover:text-gold-600">{inv.project.name}</Link>
                      {inv.contractNumber && <div className="text-[11px] text-muted-foreground" dir="ltr">{inv.contractNumber}</div>}
                      <div className="mt-1 text-xs text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString('ar-EG')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-left"><div className="text-[11px] text-muted-foreground">المبلغ</div><div className="font-bold text-primary">{formatEGP(Number(inv.netAmount))}</div></div>
                    <div className="text-left"><div className="text-[11px] text-muted-foreground">العائد</div><div className={cn('font-bold', Number(inv.realizedProfit) >= 0 ? 'text-emerald-600' : 'text-red-600')}>{formatEGP(Number(inv.realizedProfit))}</div></div>
                    <span className={cn('badge', st.cls)}>{st.ar}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
