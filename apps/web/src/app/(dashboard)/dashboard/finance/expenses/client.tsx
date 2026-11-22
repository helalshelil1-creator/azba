'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Receipt, Plus, RefreshCw, Check, ChevronLeft, ChevronRight, Wallet,
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
}

interface Expense {
  id: string
  expenseDate?: string
  description?: string | null
  amount?: any
  totalAmount?: any
  vatAmount?: any
  category?: string | null
  subCategory?: string | null
  vendorName?: string | null
  invoiceNumber?: string | null
  paymentStatus?: string
  status?: string
  account?: { code?: string; name?: string } | null
  project?: { name?: string } | null
  farm?: { name?: string } | null
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface ExpenseForm {
  accountId: string
  category: string
  amount: string
  vatAmount: string
  expenseDate: string
  description: string
  vendorName: string
  invoiceNumber: string
}

const emptyForm: ExpenseForm = {
  accountId: '',
  category: 'FEED',
  amount: '',
  vatAmount: '',
  expenseDate: todayInputValue(),
  description: '',
  vendorName: '',
  invoiceNumber: '',
}

const CATEGORY_AR: Record<string, string> = {
  FEED: 'علف',
  VETERINARY: 'بيطري',
  LABOR: 'عمالة',
  MAINTENANCE: 'صيانة',
  UTILITIES: 'مرافق',
  TRANSPORT: 'نقل',
  ADMIN: 'إدارية',
  OTHER: 'أخرى',
}

const PAYMENT_AR: Record<string, { ar: string; tone: string }> = {
  PENDING: { ar: 'معلق', tone: 'warning' },
  UNPAID: { ar: 'غير مدفوع', tone: 'danger' },
  PARTIAL: { ar: 'مدفوع جزئيًا', tone: 'info' },
  PAID: { ar: 'مدفوع', tone: 'success' },
  REJECTED: { ar: 'مرفوض', tone: 'danger' },
}

const LIMIT = 10

export function ExpensesClient() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: LIMIT, total: 0, totalPages: 0, hasNext: false, hasPrev: false })
  const [accounts, setAccounts] = useState<AccountOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<ExpenseForm>(emptyForm)

  const loadAccounts = useCallback(async () => {
    try {
      const res = await http.get<AccountOption[]>('/financial/accounts', {}, getToken)
      setAccounts(Array.isArray(res) ? res : [])
    } catch {
      setAccounts([])
    }
  }, [])

  const load = useCallback(async (p = page) => {
    setLoading(true)
    setError(null)
    try {
      const res = await http.get<{ data?: Expense[]; meta?: Meta }>(
        '/financial/expenses',
        { params: { page: p, limit: LIMIT } },
        getToken,
      )
      setExpenses(Array.isArray(res?.data) ? res.data : [])
      setMeta(res?.meta ?? { page: p, limit: LIMIT, total: 0, totalPages: 0, hasNext: false, hasPrev: false })
    } catch (e: any) {
      setError(e?.message || 'تعذر تحميل المصروفات')
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

  const update = <K extends keyof ExpenseForm>(key: K, value: ExpenseForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccess(null)
    if (!form.accountId) { setFormError('يرجى اختيار الحساب'); return }
    if (!form.expenseDate) { setFormError('يرجى تحديد تاريخ المصروف'); return }
    if (num(form.amount) <= 0) { setFormError('يرجى إدخال مبلغ صحيح'); return }
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        accountId: form.accountId,
        category: form.category,
        amount: num(form.amount),
        vatAmount: form.vatAmount ? num(form.vatAmount) : undefined,
        expenseDate: form.expenseDate,
        description: form.description.trim() || undefined,
        vendorName: form.vendorName.trim() || undefined,
        invoiceNumber: form.invoiceNumber.trim() || undefined,
      }
      await http.post('/financial/expenses', payload, {}, getToken)
      setSuccess('تم تسجيل المصروف بنجاح')
      setShowForm(false)
      setForm({ ...emptyForm, accountId: accounts[0]?.id || '' })
      setPage(1)
      await load(1)
    } catch (err: any) {
      setFormError(err?.message || 'تعذر تسجيل المصروف')
    } finally {
      setSubmitting(false)
    }
  }

  const total = expenses.reduce((s, x) => s + num(x?.totalAmount ?? x?.amount), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="المصروفات"
        subtitle="تسجيل ومتابعة مصروفات التشغيل حسب البند والحساب"
        icon={Receipt}
        actions={
          <>
            <button onClick={() => setShowForm((v) => !v)} className="btn-gold">
              <Plus className="h-4 w-4" />
              {showForm ? 'إغلاق' : 'مصروف جديد'}
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
          <h3 className="font-bold text-primary">تسجيل مصروف</h3>
          <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="الحساب" required>
              <select
                className="input-field"
                value={form.accountId}
                onChange={(e) => update('accountId', e.target.value)}
              >
                <option value="">اختر الحساب</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                ))}
              </select>
            </Field>
            <Field label="البند" required>
              <select
                className="input-field"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
              >
                {Object.entries(CATEGORY_AR).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="التاريخ" required>
              <input
                type="date"
                className="input-field"
                value={form.expenseDate}
                onChange={(e) => update('expenseDate', e.target.value)}
              />
            </Field>
            <Field label="المبلغ" required>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                value={form.amount}
                onChange={(e) => update('amount', e.target.value)}
                placeholder="0.00"
              />
            </Field>
            <Field label="ضريبة القيمة المضافة">
              <input
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                value={form.vatAmount}
                onChange={(e) => update('vatAmount', e.target.value)}
                placeholder="اختياري"
              />
            </Field>
            <Field label="رقم الفاتورة">
              <input
                className="input-field"
                value={form.invoiceNumber}
                onChange={(e) => update('invoiceNumber', e.target.value)}
                placeholder="اختياري"
              />
            </Field>
            <Field label="البيان" className="sm:col-span-2">
              <input
                className="input-field"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="وصف المصروف"
              />
            </Field>
            <Field label="اسم المورّد">
              <input
                className="input-field"
                value={form.vendorName}
                onChange={(e) => update('vendorName', e.target.value)}
                placeholder="اختياري"
              />
            </Field>
            {formError && (
              <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
              <button type="submit" disabled={submitting} className="btn-gold">
                {submitting ? 'جارٍ الحفظ...' : 'حفظ المصروف'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-0">
        {loading ? (
          <LoadingState label="جارٍ تحميل المصروفات..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => load(page)} />
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="لا توجد مصروفات"
            hint="ابدأ بتسجيل أول مصروف تشغيلي"
            action={<button onClick={() => setShowForm(true)} className="btn-gold">مصروف جديد</button>}
          />
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <h3 className="font-bold text-primary">سجل المصروفات</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wallet className="h-4 w-4 text-gold" />
                إجمالي الصفحة: <span className="font-bold text-primary">{formatEGP(total)}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-ivory/50 text-xs text-muted-foreground">
                    <th className="px-6 py-3 text-right font-semibold">التاريخ</th>
                    <th className="px-6 py-3 text-right font-semibold">البيان</th>
                    <th className="px-6 py-3 text-right font-semibold">الحساب</th>
                    <th className="px-6 py-3 text-right font-semibold">المبلغ</th>
                    <th className="px-6 py-3 text-right font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((x) => {
                    const st = PAYMENT_AR[String(x?.paymentStatus)] || { ar: String(x?.paymentStatus || '—'), tone: 'default' }
                    return (
                      <tr key={x?.id} className="border-b border-border/40 hover:bg-ivory/40">
                        <td className="px-6 py-4 text-xs text-muted-foreground">{formatDate(x?.expenseDate)}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-primary">
                            {x?.description || CATEGORY_AR[String(x?.category)] || String(x?.category || '—')}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {CATEGORY_AR[String(x?.category)] || x?.category || ''}
                            {x?.vendorName ? ` — ${x.vendorName}` : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {x?.account?.code ? `${x.account.code} - ${x.account.name}` : '—'}
                        </td>
                        <td className="px-6 py-4 font-semibold text-primary">
                          {formatEGP(num(x?.totalAmount ?? x?.amount))}
                        </td>
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
                صفحة {meta.page} من {Math.max(1, meta.totalPages)} — {formatNumber(meta.total)} مصروف
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
