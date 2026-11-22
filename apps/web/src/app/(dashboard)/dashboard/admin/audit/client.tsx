'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { ScrollText } from 'lucide-react'
import { http } from '@/lib/api'
import {
  AdminCard, AUDIT_ACTION_AR, DataTable, EmptyState, ErrorState, FilterBar, FilterSelect,
  LoadingState, PageHeader, Pagination, StatusBadge, TableCell, TableRow, auditActionTone,
  formatDateTime, fullName, getToken,
} from '../_components/admin-ui'

interface AuditRow {
  id?: string
  action?: string | null
  entity?: string | null
  entityId?: string | null
  ipAddress?: string | null
  createdAt?: string
  user?: { firstName?: string | null; lastName?: string | null; email?: string | null; role?: string | null } | null
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

const EMPTY_META: Meta = { page: 1, limit: 20, total: 0, totalPages: 1, hasNext: false, hasPrev: false }

const ACTION_OPTIONS = [
  { value: '', label: 'كل الإجراءات' },
  ...Object.entries(AUDIT_ACTION_AR).map(([value, label]) => ({ value, label })),
]

export function AuditClient() {
  const [rows, setRows] = useState<AuditRow[]>([])
  const [meta, setMeta] = useState<Meta>(EMPTY_META)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')
  const [entityType, setEntityType] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await http.get<any>(
        '/admin/audit-logs',
        { params: { page, limit: 20, action, entityType } },
        () => getToken(),
      )
      setRows(Array.isArray(res?.data) ? res.data : [])
      setMeta(res?.meta ?? { ...EMPTY_META, page })
    } catch (e: any) {
      setRows([])
      setError(e?.message || 'تعذر تحميل سجلات التدقيق')
    } finally {
      setLoading(false)
    }
  }, [page, action, entityType])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-6">
      <PageHeader
        title="سجلات التدقيق"
        subtitle="تتبع كل العمليات التي تمت على المنصة مع المستخدم والوقت"
        icon={ScrollText}
      />

      <FilterBar>
        <FilterSelect
          label="الإجراء"
          value={action}
          onChange={(v) => {
            setAction(v)
            setPage(1)
          }}
          options={ACTION_OPTIONS}
        />
        <input
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value)
            setPage(1)
          }}
          placeholder="نوع الكيان (مثال: Project)"
          className="input-field w-full sm:w-56"
        />
      </FilterBar>

      <AdminCard className="p-0">
        {loading ? (
          <LoadingState label="جارٍ تحميل سجلات التدقيق..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void load()} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="لا توجد سجلات تدقيق"
            hint="جرّب تغيير عوامل التصفية"
          />
        ) : (
          <>
            <DataTable head={['التاريخ', 'المستخدم', 'الإجراء', 'الكيان']} minWidth={720}>
              {rows.map((r, i) => (
                <TableRow key={r.id ?? i}>
                  <TableCell>
                    <div className="whitespace-nowrap text-xs text-foreground">
                      {formatDateTime(r.createdAt)}
                    </div>
                    {r.ipAddress ? (
                      <div className="text-[11px] text-muted-foreground" dir="ltr">
                        {r.ipAddress}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-semibold text-foreground">{fullName(r.user)}</div>
                    {r.user?.role ? (
                      <div className="text-[11px] text-muted-foreground">{r.user.role}</div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={auditActionTone(r.action)}>
                      {AUDIT_ACTION_AR[r.action ?? ''] ?? r.action ?? '—'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-semibold text-primary">{r.entity || '—'}</div>
                    {r.entityId ? (
                      <div className="text-[11px] text-muted-foreground" dir="ltr">
                        {r.entityId}
                      </div>
                    ) : null}
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
