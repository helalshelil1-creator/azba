'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { BookOpen, Plus, RefreshCw, Check, X } from 'lucide-react'
import { http } from '@/lib/api'
import {
  PageHeader, LoadingState, ErrorState, EmptyState, Field, StatusBadge, num,
} from '@/app/(dashboard)/dashboard/finance/_ui'

const getToken = () => (typeof window === 'undefined' ? null : localStorage.getItem('azba_access_token'))

interface Account {
  id: string
  code: string
  name: string
  nameEn?: string | null
  type: string
  subType?: string | null
  level?: number
  parentId?: string | null
  isActive?: boolean
  description?: string | null
  children?: Account[]
  parent?: Account | null
}

interface AccountForm {
  code: string
  name: string
  nameEn: string
  type: string
  subType: string
  parentId: string
  level: number
}

const emptyForm: AccountForm = {
  code: '',
  name: '',
  nameEn: '',
  type: 'ASSET',
  subType: '',
  parentId: '',
  level: 1,
}

const TYPE_AR: Record<string, string> = {
  ASSET: 'أصول',
  LIABILITY: 'التزامات',
  EQUITY: 'حقوق الملكية',
  REVENUE: 'إيرادات',
  EXPENSE: 'مصروفات',
}

const TYPE_TONE: Record<string, string> = {
  ASSET: 'default',
  LIABILITY: 'warning',
  EQUITY: 'gold',
  REVENUE: 'success',
  EXPENSE: 'danger',
}

export function AccountsClient() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<AccountForm>(emptyForm)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await http.get<Account[]>('/financial/accounts', {}, getToken)
      setAccounts(Array.isArray(res) ? res : [])
    } catch (e: any) {
      setError(e?.message || 'تعذر تحميل شجرة الحسابات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const rows = useMemo(() => {
    const out: { account: Account; depth: number }[] = []
    const walk = (list: Account[] | undefined, depth: number) => {
      ;(list || [])
        .slice()
        .sort((a, b) => String(a?.code || '').localeCompare(String(b?.code || '')))
        .forEach((a) => {
          out.push({ account: a, depth })
          if (a?.children && a.children.length) walk(a.children, depth + 1)
        })
    }
    walk(accounts, 0)
    return out
  }, [accounts])

  const update = <K extends keyof AccountForm>(key: K, value: AccountForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccess(null)
    if (!form.code.trim() || !form.name.trim() || !form.type) {
      setFormError('يرجى استكمال الحقول المطلوبة')
      return
    }
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        code: form.code.trim(),
        name: form.name.trim(),
        nameEn: form.nameEn.trim() || undefined,
        type: form.type,
        subType: form.subType.trim() || undefined,
        parentId: form.parentId || undefined,
        }
      await http.post('/financial/accounts', payload, {}, getToken)
      setSuccess('تم إنشاء الحساب بنجاح')
      setForm(emptyForm)
      setShowForm(false)
      await load()
    } catch (err: any) {
      setFormError(err?.message || 'تعذر إنشاء الحساب')
    } finally {
      setSubmitting(false)
    }
  }

  const parentOptions = rows.map((r) => r.account)

  return (
    <div className="space-y-6">
      <PageHeader
        title="شجرة الحسابات"
        subtitle="إدارة الحسابات المحاسبية والتسلسل الهرمي للدليل المحاسبي"
        icon={BookOpen}
        actions={
          <>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="btn-gold"
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? 'إغلاق' : 'حساب جديد'}
            </button>
            <button
              onClick={load}
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
          <h3 className="font-bold text-primary">إنشاء حساب جديد</h3>
          <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="كود الحساب" required>
              <input
                className="input-field"
                value={form.code}
                onChange={(e) => update('code', e.target.value)}
                placeholder="مثال: 1001"
              />
            </Field>
            <Field label="اسم الحساب" required>
              <input
                className="input-field"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="بال Arabic"
              />
            </Field>
            <Field label="الاسم بالإنجليزية">
              <input
                className="input-field"
                dir="ltr"
                value={form.nameEn}
                onChange={(e) => update('nameEn', e.target.value)}
                placeholder="English name"
              />
            </Field>
            <Field label="النوع" required>
              <select
                className="input-field"
                value={form.type}
                onChange={(e) => update('type', e.target.value)}
              >
                {Object.entries(TYPE_AR).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="النوع الفرعي">
              <input
                className="input-field"
                value={form.subType}
                onChange={(e) => update('subType', e.target.value)}
                placeholder="اختياري"
              />
            </Field>
            <Field label="المستوى">
              <input
                type="number"
                min={1}
                max={6}
                className="input-field"
                value={form.level}
                onChange={(e) => update('level', Number(e.target.value))}
              />
            </Field>
            <Field label="الحساب الأب" className="sm:col-span-2 lg:col-span-3">
              <select
                className="input-field"
                value={form.parentId}
                onChange={(e) => update('parentId', e.target.value)}
              >
                <option value="">— حساب رئيسي (مستوى أول) —</option>
                {parentOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} - {a.name}
                  </option>
                ))}
              </select>
            </Field>
            {formError && (
              <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
              <button type="submit" disabled={submitting} className="btn-gold">
                {submitting ? 'جارٍ الحفظ...' : 'حفظ الحساب'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-0">
        {loading ? (
          <LoadingState label="جارٍ تحميل شجرة الحسابات..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="لا توجد حسابات"
            hint="ابدأ بإنشاء أول حساب 或 طلب إنشاء الدليل المحاسبي الافتراضي"
            action={<button onClick={() => setShowForm(true)} className="btn-gold">حساب جديد</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-ivory/50 text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-right font-semibold">الكود</th>
                  <th className="px-4 py-3 text-right font-semibold">الاسم</th>
                  <th className="px-4 py-3 text-right font-semibold">الاسم بالإنجليزية</th>
                  <th className="px-4 py-3 text-right font-semibold">النوع</th>
                  <th className="px-4 py-3 text-right font-semibold">المستوى</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ account: a, depth }) => (
                  <tr key={a?.id} className="border-b border-border/40 hover:bg-ivory/40">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground" dir="ltr">
                      {a?.code}
                    </td>
                    <td
                      className="px-4 py-3 font-semibold text-primary"
                      style={{ paddingInlineStart: `${16 + depth * 18}px` }}
                    >
                      {depth > 0 && <span className="ml-2 text-gold">└</span>}
                      {a?.name}
                      {a?.subType && <span className="mr-2 text-[10px] text-muted-foreground">({a.subType})</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground" dir="ltr">
                      {a?.nameEn || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={TYPE_AR[String(a?.type)] || String(a?.type || '—')}
                        tone={TYPE_TONE[String(a?.type)] || 'default'}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{num(a?.level)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
