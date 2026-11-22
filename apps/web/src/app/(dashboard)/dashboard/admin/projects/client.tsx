'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FolderKanban, Loader2, Trash2 } from 'lucide-react'
import { http } from '@/lib/api'
import { cn, formatEGP, formatNumber } from '@/lib/utils'
import {
  AdminCard, ANIMAL_TYPE_AR, DataTable, EmptyState, ErrorState, FilterBar, FilterSelect,
  LoadingState, PageHeader, Pagination, PROJECT_PURPOSE_AR, PROJECT_STATUS_AR, SearchInput,
  StatusBadge, TableCell, TableRow, getToken, projectStatusTone, toNum,
} from '../_components/admin-ui'

interface ProjectRow {
  id: string
  code?: string
  name?: string
  nameEn?: string | null
  animalType?: string
  breed?: string
  status?: string
  purpose?: string | null
  totalShares?: number
  soldShares?: number
  availableShares?: number
  totalBudget?: number | string | null
  fundedAmount?: number | string | null
  raisedAmount?: number | string | null
  fundedPercent?: number
  farm?: { name?: string; governorate?: string } | null
  createdAt?: string
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

const EMPTY_META: Meta = { page: 1, limit: 10, total: 0, totalPages: 1, hasNext: false, hasPrev: false }

export function ProjectsClient() {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [meta, setMeta] = useState<Meta>(EMPTY_META)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await http.get<any>(
        '/projects/all',
        { params: { page, limit: 10, search, status } },
        () => getToken(),
      )
      setProjects(Array.isArray(res?.data) ? res.data : [])
      setMeta(res?.meta ?? { ...EMPTY_META, page })
    } catch (e: any) {
      setProjects([])
      setError(e?.message || 'تعذر تحميل المشاريع')
    } finally {
      setLoading(false)
    }
  }, [page, search, status])

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    void load()
  }, [load])

  const changeStatus = async (id: string, nextStatus: string) => {
    setBusy(id)
    try {
      await http.patch(`/projects/${id}/status`, { status: nextStatus }, {}, () => getToken())
      toast.success('تم تحديث حالة المشروع')
      await load()
    } catch (e: any) {
      toast.error(e?.message || 'تعذر تحديث حالة المشروع')
      await load()
    } finally {
      setBusy(null)
    }
  }

  const removeProject = async (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) return
    setBusy(id)
    try {
      await http.delete(`/projects/${id}`, {}, () => getToken())
      toast.success('تم حذف المشروع')
      await load()
    } catch (e: any) {
      toast.error(e?.message || 'تعذر حذف المشروع')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة المشاريع"
        subtitle="متابعة المشاريع واعتمادها ونشرها أو حذفها"
        icon={FolderKanban}
      />

      <FilterBar>
        <SearchInput
          value={searchInput}
          onChange={(v) => {
            setSearchInput(v)
            setPage(1)
          }}
          placeholder="ابحث بالاسم أو الكود أو السلالة..."
        />
        <FilterSelect
          label="الحالة"
          value={status}
          onChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
          options={[
            { value: '', label: 'كل الحالات' },
            ...Object.entries(PROJECT_STATUS_AR).map(([value, label]) => ({ value, label })),
          ]}
        />
      </FilterBar>

      <AdminCard className="p-0">
        {loading ? (
          <LoadingState label="جارٍ تحميل المشاريع..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void load()} />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="لا توجد مشاريع مطابقة"
            hint="جرّب تعديل البحث أو عامل التصفية"
          />
        ) : (
          <>
            <DataTable
              head={['الاسم', 'النوع', 'الحالة', 'التمويل', 'الأسهم', 'إجراءات']}
              minWidth={900}
            >
              {projects.map((p) => {
                const budget = toNum(p.totalBudget)
                const funded = toNum(p.fundedAmount ?? p.raisedAmount)
                const pct =
                  budget > 0
                    ? Math.min(100, Math.round((funded / budget) * 100))
                    : toNum(p.fundedPercent)
                const sold = toNum(p.soldShares)
                const total = toNum(p.totalShares)
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-semibold text-primary">{p.name || '—'}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        {p.code ? <span dir="ltr">{p.code}</span> : null}
                        {p.farm?.name ? <span>{p.farm.name}</span> : null}
                        {p.purpose ? <span>{PROJECT_PURPOSE_AR[p.purpose] ?? p.purpose}</span> : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-foreground">
                        {ANIMAL_TYPE_AR[p.animalType ?? ''] ?? p.animalType ?? '—'}
                      </div>
                      {p.breed ? <div className="text-[11px] text-muted-foreground">{p.breed}</div> : null}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <StatusBadge tone={projectStatusTone(p.status)}>
                          {PROJECT_STATUS_AR[p.status ?? ''] ?? p.status ?? '—'}
                        </StatusBadge>
                        <select
                          value={p.status ?? ''}
                          disabled={busy === p.id}
                          onChange={(e) => {
                            const next = e.target.value
                            if (next && next !== p.status) void changeStatus(p.id, next)
                          }}
                          className="input-field w-full min-w-[10rem] py-1.5 text-[11px] disabled:opacity-50"
                          aria-label="حالة المشروع"
                        >
                          {Object.entries(PROJECT_STATUS_AR).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[11rem]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-primary">{formatEGP(funded)}</span>
                          <span className="text-muted-foreground">من {formatEGP(budget)}</span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ivory">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              pct >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-l from-gold to-gold-600',
                            )}
                            style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                          />
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">{formatNumber(pct)}٪ مموّل</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-semibold text-foreground">
                        {formatNumber(sold)} / {formatNumber(total)}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        متاح: {formatNumber(toNum(p.availableShares))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => void removeProject(p.id)}
                        disabled={busy === p.id}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                        aria-label="حذف المشروع"
                        title="حذف المشروع"
                      >
                        {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </DataTable>
            <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} onPage={setPage} />
          </>
        )}
      </AdminCard>
    </div>
  )
}
