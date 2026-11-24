'use client'

import React, { useEffect, useState } from 'react'
import { Bell, CheckCheck, RefreshCw, Loader2 } from 'lucide-react'
import { http } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Card } from '@azba/ui/card'

interface Notification { id: string; title: string; message: string; link?: string; readAt: string | null; type: string; createdAt: string }

const TYPE_AR: Record<string, string> = {
  SYSTEM: 'نظام', INVESTMENT: 'استثمار', PAYMENT: 'دفع', PROJECT: 'مشروع',
  VETERINARY: 'بيطري', TASK: 'مهمة', TICKET: 'تذكرة', ANNOUNCEMENT: 'إعلان',
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const load = async () => { setLoading(true); try { const r = await http.get<{ items?: Notification[]; data?: Notification[] }>('/notifications'); setItems(r.items ?? r.data ?? []) } catch {} finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  const markAll = async () => { try { await http.post('/notifications/read-all', {}); setItems((s) => s.map((n) => ({ ...n, readAt: new Date().toISOString() }))) } catch {} }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">الإشعارات</h2>
        <div className="flex gap-2">
          <button onClick={markAll} className="btn-outline text-xs"><CheckCheck className="h-4 w-4" /> تعليم الكل كمقروء</button>
          <button onClick={load} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-primary hover:bg-primary/5"><RefreshCw className={cn('h-5 w-5', loading && 'animate-spin')} /></button>
        </div>
      </div>
      <Card className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground"><Loader2 className="ml-2 h-5 w-5 animate-spin" />جارٍ التحميل...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center"><Bell className="h-12 w-12 text-primary/20" /><p className="text-sm text-muted-foreground">لا إشعارات بعد</p></div>
        ) : (
          <div className="divide-y divide-border/40">
            {items.map((n) => (
              <div key={n.id} className={cn('flex gap-3 p-5', !n.readAt && 'bg-gold/5')}>
                <div className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', n.readAt ? 'bg-border' : 'bg-gold')} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-bold text-primary">{n.title}</div>
                    <span className="badge-outline shrink-0">{TYPE_AR[n.type] ?? n.type}</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground/70">{n.message}</p>
                  <div className="mt-2 text-[11px] text-muted-foreground">{new Date(n.createdAt).toLocaleString('ar-EG')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
