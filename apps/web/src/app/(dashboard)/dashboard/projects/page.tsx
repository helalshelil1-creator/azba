'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { FolderKanban, RefreshCw, Loader2, ArrowLeft, MapPin } from 'lucide-react'
import { http } from '@/lib/api'
import { cn, formatEGP, formatPercent } from '@/lib/utils'
import { Card } from '@azba/ui/card'

interface Project {
  id: string; code: string; name: string; animalType: string; breed: string;
  expectedReturn: any; status: string; raisedAmount: any; targetAmount: any;
  soldShares: number; totalShares: number; farm?: { name: string; governorate: string };
  myShares?: number; myAmount?: number;
}

const STATUS_AR: Record<string, string> = { ACTIVE: 'نشط', IN_PROGRESS: 'قيد التنفيذ', COMPLETED: 'مكتمل', FUNDING: 'قيد التمويل', APPROVED: 'معتمد' }
const ST_CLS: Record<string, string> = { ACTIVE: 'badge-success', IN_PROGRESS: 'badge-info', COMPLETED: 'badge-default', FUNDING: 'badge-gold', APPROVED: 'badge-info' }

export default function ProjectsPage() {
  const [items, setItems] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const load = async () => { setLoading(true); try { const r = await http.get<{ items?: any[]; data?: any[] }>('/investments')
      const byProject = new Map<string, Project>()
      for (const inv of r.items ?? r.data ?? []) {
        const pr = inv.project; if (!pr?.id) continue
        const cur = byProject.get(pr.id)
        const shares = Number(inv.shareCount ?? 0); const amount = Number(inv.netAmount ?? 0)
        if (cur) { cur.myShares = (cur.myShares ?? 0) + shares; cur.myAmount = (cur.myAmount ?? 0) + amount }
        else byProject.set(pr.id, { ...pr, myShares: shares, myAmount: amount })
      }
      setItems([...byProject.values()]) } catch {} finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">مشاريعي</h2>
        <button onClick={load} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-primary hover:bg-primary/5"><RefreshCw className={cn('h-5 w-5', loading && 'animate-spin')} /></button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground"><Loader2 className="ml-2 h-5 w-5 animate-spin" />جارٍ التحميل...</div>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-16 text-center">
          <FolderKanban className="h-12 w-12 text-primary/20" />
          <p className="text-sm text-muted-foreground">لم تستثمر في أي مشروع بعد</p>
          <Link href="/opportunities" className="btn-gold text-sm">تصفح الفرص</Link>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((p) => {
            return (
              <Link key={p.id} href={`/projects/${p.id}`} className="group">
                <Card className="group h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[11px] text-muted-foreground">{p.code}</div>
                      <h3 className="mt-0.5 font-bold text-primary group-hover:text-gold-600">{p.name}</h3>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{p.farm?.governorate ?? 'مصر'}</div>
                    </div>
                    <span className={cn('badge', ST_CLS[p.status] ?? 'badge-default')}>{STATUS_AR[p.status] ?? p.status}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg bg-ivory p-2"><div className="text-[10px] text-muted-foreground">حصصي</div><div className="text-sm font-bold text-primary">{p.myShares ?? '—'}</div></div>
                    <div className="rounded-lg bg-ivory p-2"><div className="text-[10px] text-muted-foreground">مبلغ استثماري</div><div className="text-sm font-bold text-gold-600">{formatEGP(Number(p.myAmount ?? 0))}</div></div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
