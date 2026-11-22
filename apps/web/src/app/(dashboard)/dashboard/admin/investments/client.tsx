'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Briefcase } from 'lucide-react'
import { http } from '@/lib/api'
import { formatEGP, formatNumber } from '@/lib/utils'
import {
  AdminCard, DataTable, EmptyState, ErrorState, FilterBar, FilterSelect, INVESTMENT_STATUS_AR,
  LoadingState, PageHeader, Pagination, StatusBadge, TableCell, TableRow, formatDate, fullName,
  getToken, investmentStatusTone, toNum,
} from '../_components/admin-ui'

interface InvestmentRow {
  id: string
  contractNumber?: string | null
  shareCount?: number
  unitPrice?: number | string | null
  netAmount?: number | string | null
  totalAmount?: number | string | null
  grossAmount?: number | string | null
  status?: string | null
  currency?: string | null
  createdAt?: string
  project?: { id?: string; name?: string; code?: string } | null
  user?: { id?: string; firstName?: string | null; lastName?: string | null; email?: string | null } | null
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

export function InvestmentsClient() {
  const [rows, setRows] = useState<InvestmentRow[]>([])
  const [meta, setMeta] = useState<Meta>(EMPTY_META)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await http.get<any>(
        '/investments/admin/all',
        { params: { page, limit: 10, status } },
        () => getToken(),
      )
      setRows(Array.isArray(res?.data) ? res.data : [])
      setMeta(res?.meta ?? { ...EMPTY_META, page })
    } catch (e: any) {
      setRows([])
      setError(e?.message || 'تعذر تحميل الاستثمارات')
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => {
    void load()
  }, [load])

  const totalAmount = rows.reduce((s, r) => s + toNum(r.netAmount ?? r.totalAmount), 0)
  const totalShares = rows.reduce((s, r) => s + toNum(r.shareCount), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة الاستثمارات"
        subtitle="كل عقود الاستثمار والمستثمرين والمشاريع المرتبطة بها"
        icon={Briefcase}
      />

      <FilterBar>
        <FilterSelect
          label="الحالة"
          value={status}
          onChange={(v) => {
            setStatus(v)
            setPage(1)
          }}
          options={[
            { value: '', label: 'كل الحالات' },
            ...Object.entries(INVESTMENT_STATUS_AR).map(([value, label]) => ({ value, label })),
          ]}
        />
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground sm:mr-auto">
          <span>
            إجمالي الصفحة: <span className="font-semibold text-primary">{formatEGP(totalAmount)}</span>
          </span>
          <span>
            الأسهم: <span className="font-semibold text-primary">{formatNumber(totalShares)}</span>
          </span>
        </div>
      </FilterBar>

      <AdminCard className="p-0">
        {loading ? (
          <LoadingState label="جارٍ تحميل الاستثمارات..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void load()} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="لا توجد استثمارات مطابقة"
            hint="جرّب تغيير عامل تصفية الحالة"
          />
        ) : (
          <>
            <DataTable
              head={['العقد', 'المستثمر', 'المشروع', 'الأسهم', 'المبلغ', 'الحالة']}
              minWidth={860}
            >
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-semibold text-primary" dir="ltr">
                      {r.contractNumber || '—'}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{formatDate(r.createdAt)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-semibold text-foreground">{fullName(r.user)}</div>
                    {r.user?.email ? (
                      <div className="text-[11px] text-muted-foreground" dir="ltr">
                        {r.user.email}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-semibold text-foreground">{r.project?.name || '—'}</div>
                    {r.project?.code ? (
                      <div className="text-[11px] text-muted-foreground" dir="ltr">
                        {r.project.code}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-primary">{formatNumber(toNum(r.shareCount))}</span>
                    <span className="mr-1 text-[11px] text-muted-foreground">سهم</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-primary">{formatEGP(toNum(r.netAmount ?? r.totalAmount))}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={investmentStatusTone(r.status)}>
                      {INVESTMENT_STATUS_AR[r.status ?? ''] ?? r.status ?? '—'}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </DataTable>
            <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} onPage={setPage} />
          </>
        )}
      </AdminCard>
    </div>
  )
}
