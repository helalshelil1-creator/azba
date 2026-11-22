'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ClipboardList, Plus, RefreshCw, Trash2, Check, ChevronLeft, ChevronRight, Scale,
} from 'lucide-react'
import { http } from '@/lib/api'
import { formatEGP, formatNumber } from '@/lib/utils'
import {
  PageHeader, LoadingState, ErrorState, EmptyState, Field, num, formatDate, StatusBadge, todayInputValue,
} from '@/app/(dashboard)/dashboard/finance/_ui'

const getToken = () => (typeof window === 'undefined' ? null : localStorage.getItem('azba_access_token'))

interface AccountOption {
  id: string
  code: string
  name: string
  type?: string
}

interface JournalLine {
  accountId: string
  type: 'DEBIT' | 'CREDIT'
  amount: string
  description: string
}

interface JournalEntry {
  id: string
  entryNumber?: string
  date?: string
  description?: string
  reference?: string | null
  totalDebit?: any
  totalCredit?: any
  status?: string
  entries?: any[]
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

const STATUS_AR: Record<string, { ar: string; tone: string }> = {
  POSTED: { ar: 'مُرحّل', tone: 'success' },
  DRAFT: { ar: 'مسودة', tone: 'warning' },
  REVERSED: { ar: 'معكوس', tone: 'danger' },
}

const LIMIT = 10

function emptyLine(accountId = ''): JournalLine {
  return { accountId, type: 'DEBIT', amount: '', description: '' }
}

export function JournalClient() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: LIMIT, total: 0, totalPages: 0, hasNext: false, hasPrev: false })
  const [accounts, setAccounts] = useState<AccountOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [date, setDate] = useState(todayInputValue())
  const [description, setDescription] = useState('')
  const [reference, setReference] = useState('')
  const [lines, setLines] = useState<JournalLine[]>([emptyLine()])

  const loadAccounts = useCallback(async () => {
    try {
      const res = await http.get<AccountOption[]>('/financial/accounts', {}, getToken)
      const list = Array.isArray(res) ? res : []
      setAccounts(list)
      return list
    } catch {
      setAccounts([])
      return []
    }
  }, [])

  const load = useCallback(async (p = page) => {
    setLoading(true)
    setError(null)
    try {
      const res = await http.get<{ data?: JournalEntry[]; meta?: Meta }>(
        '/financial/journal-entries',
        { params: { page: p, limit: LIMIT } },
        getToken,
      )
      setEntries(Array.isArray(res?.data) ? res.data : [])
      setMeta(res?.meta ?? { page: p, limit: LIMIT, total: 0, totalPages: 0, hasNext: false, hasPrev: false })
    } catch (e: any) {
      setError(e?.message || 'تعذر تحميل قيود اليومية')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  useEffect(() => {
    load(page)
  }, [load, page])

  useEffect(() => {
    if (!showForm) return
    if (lines.length === 0) setLines([emptyLine(accounts[0]?.id || '')])
    else setLines((prev) => prev.map((l, i) => (i === 0 && !l.accountId && accounts[0]?.id ? { ...l, accountId: accounts[0].id } : l)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm, accounts.length])

  const totals = useMemo(() => {
    const debit = lines.reduce((s, l) => s + (l.type === 'DEBIT' ? num(l.amount) : 0), 0)
    const credit = lines.reduce((s, l) => s + (l.type === 'CREDIT' ? num(l.amount) : 0), 0)
    return { debit, credit, diff: debit - credit }
  }, [lines])

  const updateLine = <K extends keyof JournalLine>(index: number, key: K, value: JournalLine[K]) =>
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [key]: value } : l)))

  const addLine = () => setLines((prev) => [...prev, emptyLine(accounts[0]?.id || '')])
  const removeLine = (index: number) => setLines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))

  const resetForm = () => {
    setDate(todayInputValue())
    setDescription('')
    setReference('')
    setLines([emptyLine(accounts[0]?.id || '')])
    setFormError(null)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccess(null)
    if (!date) { setFormError('يرجى تحديد تاريخ القيد'); return }
    if (!description.trim() || description.trim().length < 3) { setFormError('الوصف يجب أن يكون 3 أحرف على الأقل'); return }
    const validLines = lines.filter((l) => l.accountId && num(l.amount) > 0)
    if (validLines.length < 2) { setFormError('القيد يحتاج إلى طرفين (مدين ودائن) على الأقل'); return }
    if (Math.abs(totals.diff) > 0.001) { setFormError('القيد غير متوازن: إجمالي المدين يجب أن يساوي إجمالي الدائن'); return }
    setSubmitting(true)
    try {
      const payload = {
        date,
        description: description.trim(),
        reference: reference.trim() || undefined,
        entries: validLines.map((l) => ({
          accountId: l.accountId,
          type: l.type,
          amount: num(l.amount),
          description: l.description.trim() || undefined,
        })),
      }
      await http.post('/financial/journal-entries', payload, {}, getToken)
      setSuccess('تم إنشاء القيد بنجاح')
      setShowForm(false)
      resetForm()
      setPage(1)
      await load(1)
    } catch (err: any) {
      setFormError(err?.message || 'تعذر إنشاء القيد')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="قيود اليومية"
        subtitle="قيد العمليات المحاسبية اليومية مع الأرصدة المدينة والدائنة"
        icon={ClipboardList}
        actions={
          <>
            <button onClick={() => setShowForm((v) => !v)} className="btn-gold">
              <Plus className="h-4 w-4" />
              {showForm ? 'إغلاق' : 'قيد جديد'}
            </button>
            <button
              onClick={() => load(page)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/60 text-primary hover:bg-primary/5"
              aria-label="تحديث"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </>
        }
      />

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}

      {showForm && (
        <div className="card">
          <h3 className="font-bold text-primary">إنشاء قيد يومية</h3>
          <form onSubmit={submit} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="التاريخ" required>
                <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
              <Field label="الوصف" required className="sm:col-span-2">
                <input
                  className="input-field"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف العملية المحاسبية"
                />
              </Field>
              <Field label="المرجع">
                <input
                  className="input-field"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="اختياري"
                />
              </Field>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-ivory/50 text-xs text-muted-foreground">
                    <th className="px-4 py-2 text-right font-semibold">الحساب</th>
                    <th className="px-4 py-2 text-right font-semibold">النوع</th>
                    <th className="px-4 py-2 text-right font-semibold">المبلغ</th>
                    <th className="px-4 py-2 text-right font-semibold">الوصف</th>
                    <th className="px-4 py-2 text-right font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, i) => (
                    <tr key={i} className="border-b border-border/40">
                      <td className="px-2 py-2">
                        <select
                          className="input-field py-2"
                          value={l.accountId}
                          onChange={(e) => updateLine(i, 'accountId', e.target.value)}
                        >
                          <option value="">اختر الحساب</option>
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <select
                          className="input-field py-2"
                          value={l.type}
                          onChange={(e) => updateLine(i, 'type', e.target.value as 'DEBIT' | 'CREDIT')}
                        >
                          <option value="DEBIT">مدين</option>
                          <option value="CREDIT">دائن</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="input-field py-2"
                          value={l.amount}
                          onChange={(e) => updateLine(i, 'amount', e.target.value)}
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          className="input-field py-2"
                          value={l.description}
                          onChange={(e) => updateLine(i, 'description', e.target.value)}
                          placeholder="وصف السطر"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => removeLine(i)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                          aria-label="حذف السطر"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={addLine} className="btn-outline text-xs">
                <Plus className="h-4 w-4" />
                إضافة سطر
              </button>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">المدين:</span>
                  <span className="font-bold text-emerald-600">{formatEGP(totals.debit)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">الدائن:</span>
                  <span className="font-bold text-red-600">{formatEGP(totals.credit)}</span>
                </div>
                <span className={`badge ${Math.abs(totals.diff) < 0.001 && totals.debit > 0 ? 'badge-success' : 'badge-warning'}`}>
                  {Math.abs(totals.diff) < 0.001 && totals.debit > 0 ? 'متوازن' : 'غير متوازن'}
                </span>
              </div>
            </div>

            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{formError}</div>
            )}

            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="btn-gold">
                {submitting ? 'جارٍ الحفظ...' : 'ترحيل القيد'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-0">
        {loading ? (
          <LoadingState label="جارٍ تحميل قيود اليومية..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => load(page)} />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="لا توجد قيود يومية"
            hint="ابدأ بإنشاء أول قيد محاسبي"
            action={<button onClick={() => setShowForm(true)} className="btn-gold">قيد جديد</button>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-ivory/50 text-xs text-muted-foreground">
                    <th className="px-6 py-3 text-right font-semibold">التاريخ</th>
                    <th className="px-6 py-3 text-right font-semibold">الوصف</th>
                    <th className="px-6 py-3 text-right font-semibold">إجمالي المدين</th>
                    <th className="px-6 py-3 text-right font-semibold">إجمالي الدائن</th>
                    <th className="px-6 py-3 text-right font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((je) => {
                    const st = STATUS_AR[String(je?.status)] || { ar: String(je?.status || '—'), tone: 'default' }
                    return (
                      <tr key={je?.id} className="border-b border-border/40 hover:bg-ivory/40">
                        <td className="px-6 py-4 text-xs text-muted-foreground">{formatDate(je?.date)}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-primary">{je?.description}</div>
                          {je?.entryNumber && <div className="text-[10px] text-muted-foreground" dir="ltr">{je.entryNumber}</div>}
                        </td>
                        <td className="px-6 py-4 font-semibold text-emerald-600">{formatEGP(num(je?.totalDebit))}</td>
                        <td className="px-6 py-4 font-semibold text-red-600">{formatEGP(num(je?.totalCredit))}</td>
                        <td className="px-6 py-4">
                          <StatusBadge label={st.ar} tone={st.tone} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-border/60 px-6 py-4 text-xs text-muted-foreground">
              <span>
                صفحة {meta.page} من {Math.max(1, meta.totalPages)} — {formatNumber(meta.total)} قيد
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!meta.hasPrev}
                  className="btn-outline px-4 py-2 text-xs disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                  السابق
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!meta.hasNext}
                  className="btn-outline px-4 py-2 text-xs disabled:opacity-50"
                >
                  التالي
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
