'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { http, getToken } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const STATUS_AR: Record<string, string> = {
  OPEN: 'مفتوحة', ASSIGNED: 'مسندة', IN_PROGRESS: 'قيد المعالجة', PENDING_USER: 'بانتظار العميل',
  RESOLVED: 'تم الحل', CLOSED: 'مغلقة', ESCALATED: 'مُصعّدة',
}
const PRIORITY_AR: Record<string, string> = { LOW: 'منخفضة', MEDIUM: 'متوسطة', HIGH: 'عالية', URGENT: 'عاجل' }

interface StaffTicket {
  id: string; ticketNumber: string; subject: string; description: string
  category: string; priority: string; status: string; createdAt: string
  user?: { firstName?: string; lastName?: string; email?: string }
  assignee?: { firstName?: string; lastName?: string } | null
  _count?: { messages: number }
}

interface Msg { id: string; body: string; isInternal: boolean; createdAt: string; sender?: { firstName?: string; lastName?: string; role?: string } }

export function StaffConsole({ staffId }: { staffId: string }) {
  const [tickets, setTickets] = useState<StaffTicket[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [internal, setInternal] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [thread, setThread] = useState<Msg[] | null>(null)
  const [threadErr, setThreadErr] = useState<string | null>(null)
  const [debounced, setDebounced] = useState('')
  const reqId = useRef(0)
  const lock = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const loadThread = useCallback(async (id: string) => {
    setThread(null); setThreadErr(null)
    try {
      const t = await http.get<any>(`/support/tickets/${id}`, {}, getToken)
      setThread(t?.messages ?? [])
    } catch (e: any) {
      setThreadErr(e?.message || 'تعذر تحميل المحادثة')
    }
  }, [])

  const load = useCallback(async () => {
    const my = ++reqId.current
    setLoading(true); setError(null)
    try {
      const q = new URLSearchParams({ page: '1', limit: '50' })
      if (status) q.set('status', status)
      if (priority) q.set('priority', priority)
      if (debounced.trim()) q.set('search', debounced.trim())
      const [res, st] = await Promise.all([
        http.get<any>(`/support/tickets/all?${q.toString()}`, {}, getToken),
        http.get<any>('/support/tickets/stats', {}, getToken),
      ])
      if (my !== reqId.current) return
      setTickets(res?.data ?? []); setStats(st)
    } catch (e: any) {
      if (my !== reqId.current) return
      setError(e?.message || 'تعذر تحميل التذاكر')
    } finally { if (my === reqId.current) setLoading(false) }
  }, [status, priority, debounced])

  useEffect(() => { load() }, [load])

  const act = async (key: string, fn: () => Promise<any>, ok: string, id?: string) => {
    if (lock.current) return
    lock.current = true
    setBusy(key)
    try {
      await fn(); toast.success(ok)
      await load()
      if (id && openId === id) await loadThread(id)
    } catch (e: any) { toast.error(e?.message || 'تعذر تنفيذ الإجراء') } finally { lock.current = false; setBusy(null) }
  }
  const assignMe = (id: string) => act('assign:' + id, () => http.post(`/support/tickets/${id}/assign`, { assigneeId: staffId }, {}, getToken), 'تم إسناد التذكرة لك', id)
  const resolve = (id: string) => act('resolve:' + id, () => http.post(`/support/tickets/${id}/resolve`, {}, {}, getToken), 'تم تحديد التذكرة كمحلولة', id)
  const send = (id: string) => {
    if (!text.trim()) return
    return act('send:' + id, async () => {
      await http.post(`/support/tickets/${id}/reply`, { message: text, isInternal: internal }, {}, getToken)
      setText(''); setInternal(false)
    }, internal ? 'تم حفظ الملاحظة الداخلية' : 'تم إرسال الرد للعميل', id)
  }

  return (
    <div className="space-y-4">
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          {[['الإجمالي', stats.total], ['مفتوحة', stats.open], ['محلولة', stats.resolved]].map(([l, v]) => (
            <div key={l as string} className="rounded-xl border border-border/60 bg-white p-3 text-center">
              <div className="text-lg font-extrabold text-primary">{v as number}</div>
              <div className="text-xs text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالعنوان أو الرقم" className="input-field sm:flex-1" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field sm:w-40">
          <option value="">كل الحالات</option>
          {Object.entries(STATUS_AR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field sm:w-40">
          <option value="">كل الأولويات</option>
          {Object.entries(PRIORITY_AR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {loading && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>}
      {error && !loading && (
        <div className="flex flex-col items-center gap-3 py-10">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={load} className="btn-outline text-sm">إعادة المحاولة</button>
        </div>
      )}
      {!loading && !error && tickets.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-white py-10 text-center text-sm text-muted-foreground">لا توجد تذاكر مطابقة.</div>
      )}
      {tickets.map((t) => {
        const closed = t.status === 'RESOLVED' || t.status === 'CLOSED'
        return (
          <div key={t.id} className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground" dir="ltr">{t.ticketNumber}</span>
              <span className={cn('badge', closed ? 'badge-success' : 'badge-warning')}>{STATUS_AR[t.status] ?? t.status}</span>
              <span className="badge badge-outline">{PRIORITY_AR[t.priority] ?? t.priority}</span>
            </div>
            <h3 className="mt-2 font-bold text-primary break-words">{t.subject}</h3>
            <p className="mt-1 text-sm leading-relaxed text-foreground/75 break-words">{t.description}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              العميل: {[t.user?.firstName, t.user?.lastName].filter(Boolean).join(' ') || '—'}
              {' · '}المسؤول: {t.assignee ? [t.assignee.firstName, t.assignee.lastName].filter(Boolean).join(' ') : 'غير مسند'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => { if (openId === t.id) { setOpenId(null) } else { setOpenId(t.id); setText(''); setInternal(false); loadThread(t.id) } }} className="btn-outline text-xs">المحادثة / رد</button>
              {!closed && <button disabled={!!busy} onClick={() => assignMe(t.id)} className="btn-outline text-xs disabled:opacity-50">إسناد لي</button>}
              {!closed && <button disabled={!!busy} onClick={() => resolve(t.id)} className="btn-outline text-xs disabled:opacity-50">تم الحل</button>}
            </div>
            {openId === t.id && (
              <div className="mt-3 space-y-2">
                {threadErr && <p className="text-xs text-red-600">{threadErr}</p>}
                {!thread && !threadErr && <div className="flex justify-center py-3"><Loader2 className="h-4 w-4 animate-spin text-gold" /></div>}
                {thread && thread.length === 0 && <p className="text-xs text-muted-foreground">لا توجد ردود بعد.</p>}
                {thread && thread.map((m) => (
                  <div key={m.id} className={cn('rounded-xl p-3 text-sm break-words', m.isInternal ? 'border border-amber-300 bg-amber-50' : 'bg-muted/40')}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>{[m.sender?.firstName, m.sender?.lastName].filter(Boolean).join(' ') || '—'}{m.sender?.role ? ` · ${m.sender.role}` : ''}</span>
                      {m.isInternal && <span className="font-semibold text-amber-700">ملاحظة داخلية</span>}
                    </div>
                    {m.body}
                  </div>
                ))}
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="اكتب الرد..." className="input-field" />
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> ملاحظة داخلية (لا تظهر للعميل)
                </label>
                <button disabled={!!busy || !text.trim()} onClick={() => send(t.id)} className="btn-gold w-full text-sm disabled:opacity-60">{internal ? 'حفظ الملاحظة' : 'إرسال للعميل'}</button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
