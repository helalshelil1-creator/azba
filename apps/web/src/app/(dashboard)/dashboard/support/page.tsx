'use client'

import React, { useEffect, useState } from 'react'
import { Loader2, AlertTriangle, Plus, MessageSquare, Send } from 'lucide-react'
import { http, getToken } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-store'
import { StaffConsole } from './staff-console'

const STAFF_ROLES = ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER_SUPPORT', 'SUPPORT_AGENT', 'SUPPORT_MANAGER']

const STATUS: Record<string, { ar: string; cls: string }> = {
  OPEN: { ar: 'مفتوحة', cls: 'badge-warning' },
  IN_PROGRESS: { ar: 'قيد المعالجة', cls: 'badge-info' },
  PENDING_USER: { ar: 'بانتظار ردك', cls: 'badge-warning' },
  RESOLVED: { ar: 'تم الحل', cls: 'badge-success' },
  CLOSED: { ar: 'مغلقة', cls: 'badge-default' },
  ESCALATED: { ar: 'مُصعّدة', cls: 'badge-danger' },
  ASSIGNED: { ar: 'مسندة', cls: 'badge-info' },
}
const CATEGORIES = ['TECHNICAL', 'BILLING', 'INVESTMENT', 'FARM', 'VETERINARY', 'LEGAL', 'GENERAL']
const CAT_AR: Record<string, string> = {
  TECHNICAL: 'تقني', BILLING: 'فواتير', INVESTMENT: 'استثمار', FARM: 'مزرعة',
  VETERINARY: 'بيطري', LEGAL: 'قانوني', GENERAL: 'عام',
}

interface Ticket {
  id: string; ticketNumber: string; subject: string; description: string
  category: string; priority: string; status: string; createdAt: string
  messages?: { id: string; message: string; createdAt: string; sender?: any }[]
}

export default function SupportPage() {
  const { user } = useAuth()
  const isStaff = !!user && STAFF_ROLES.includes(String(user.role))
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('GENERAL')
  const [priority, setPriority] = useState('MEDIUM')
  const [submitting, setSubmitting] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await http.get<any>('/support/tickets?page=1&limit=50', {}, getToken)
      setTickets(res?.data ?? [])
    } catch (e: any) {
      setError(e?.message || 'تعذر تحميل التذاكر')
    } finally { setLoading(false) }
  }

  useEffect(() => { if (!isStaff) load(); else setLoading(false) }, [isStaff])

  const create = async () => {
    if (subject.trim().length < 5 || description.trim().length < 10) {
      toast.error('يرجى إدخال عنوان ووصف أوفى')
      return
    }
    setSubmitting(true)
    try {
      await http.post('/support/tickets', { subject, description, category, priority }, {}, getToken)
      toast.success('تم إرسال طلبك وسيتم الرد قريبًا')
      setSubject(''); setDescription(''); setShowForm(false)
      load()
    } catch (e: any) {
      toast.error(e?.message || 'تعذر إرسال الطلب')
    } finally { setSubmitting(false) }
  }

  const reply = async (id: string) => {
    if (!replyText.trim()) return
    try {
      await http.post(`/support/tickets/${id}/reply`, { message: replyText }, {}, getToken)
      toast.success('تم إرسال الرد')
      setReplyText(''); setReplyTo(null)
      load()
    } catch (e: any) {
      toast.error(e?.message || 'تعذر إرسال الرد')
    }
  }

  if (isStaff && user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">لوحة الدعم</h1>
          <p className="mt-1 text-sm text-muted-foreground">كل تذاكر العملاء.</p>
        </div>
        <StaffConsole staffId={String(user.id)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">الدعم الفني</h1>
          <p className="mt-1 text-sm text-muted-foreground">تذاكرك ومحادثاتك مع فريق الدعم.</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="btn-gold flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" /> طلب جديد
        </button>
      </div>

      {showForm && (
        <div className="space-y-3 rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="عنوان الطلب" className="input-field" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="اشرح مشكلتك بالتفصيل..." rows={4} className="input-field" />
          <div className="flex flex-col gap-3 sm:flex-row">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field sm:w-44">
              {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_AR[c]}</option>)}
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field sm:w-40">
              <option value="LOW">أولوية منخفضة</option>
              <option value="MEDIUM">أولوية متوسطة</option>
              <option value="HIGH">أولوية عالية</option>
              <option value="URGENT">عاجل</option>
            </select>
            <button onClick={create} disabled={submitting} className="btn-gold flex items-center justify-center gap-2 sm:flex-1 disabled:opacity-60">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              إرسال
            </button>
          </div>
        </div>
      )}

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

      {!loading && !error && tickets.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-white py-20 text-center text-sm text-muted-foreground">
          لا توجد تذاكر بعد — أنشئ طلبك الأول.
        </div>
      )}

      <div className="space-y-4">
        {tickets.map((t) => {
          const st = STATUS[t.status] ?? { ar: t.status, cls: 'badge-default' }
          return (
            <div key={t.id} className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground" dir="ltr">{t.ticketNumber}</span>
                    <span className={cn('badge', st.cls)}>{st.ar}</span>
                    {t.category && <span className="badge badge-outline">{CAT_AR[t.category] ?? t.category}</span>}
                  </div>
                  <h3 className="mt-2 font-bold text-primary">{t.subject}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/75">{t.description}</p>
                </div>
                <button onClick={() => setReplyTo(replyTo === t.id ? null : t.id)} className="btn-outline flex items-center gap-2 text-xs">
                  <MessageSquare className="h-3.5 w-3.5" /> رد
                </button>
              </div>
              {replyTo === t.id && (
                <div className="mt-4 flex gap-2">
                  <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="اكتب ردك..." className="input-field" />
                  <button onClick={() => reply(t.id)} className="btn-gold shrink-0 px-5 text-sm">إرسال</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
