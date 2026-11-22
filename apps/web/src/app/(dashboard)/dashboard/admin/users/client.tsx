'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, ShieldCheck, Trash2, Users } from 'lucide-react'
import { http } from '@/lib/api'
import { formatNumber } from '@/lib/utils'
import {
  AdminCard, DataTable, EmptyState, ErrorState, FilterBar, FilterSelect, LoadingState,
  PageHeader, Pagination, SearchInput, StatusBadge, TableCell, TableRow, formatDate,
  getToken, toNum, userStatusTone, USER_ROLE_AR, USER_STATUS_AR,
} from '../_components/admin-ui'

interface UserRow {
  id: string
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  role?: string | null
  status?: string | null
  avatar?: string | null
  lastLoginAt?: string | null
  createdAt?: string
  _count?: { investments?: number } | null
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

export function UsersClient() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [meta, setMeta] = useState<Meta>(EMPTY_META)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await http.get<any>(
        '/users',
        { params: { page, limit: 10, search, role, status } },
        () => getToken(),
      )
      setUsers(Array.isArray(res?.data) ? res.data : [])
      setMeta(res?.meta ?? { ...EMPTY_META, page })
    } catch (e: any) {
      setUsers([])
      setError(e?.message || 'تعذر تحميل المستخدمين')
    } finally {
      setLoading(false)
    }
  }, [page, search, role, status])

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    void load()
  }, [load])

  const changeRole = async (id: string, nextRole: string) => {
    setBusy(id)
    try {
      await http.patch(`/users/${id}/role`, { role: nextRole }, {}, () => getToken())
      toast.success('تم تحديث دور المستخدم')
      await load()
    } catch (e: any) {
      toast.error(e?.message || 'تعذر تحديث الدور')
    } finally {
      setBusy(null)
    }
  }

  const changeStatus = async (id: string, nextStatus: string) => {
    setBusy(id)
    try {
      await http.patch(`/users/${id}/status`, { status: nextStatus }, {}, () => getToken())
      toast.success('تم تحديث حالة المستخدم')
      await load()
    } catch (e: any) {
      toast.error(e?.message || 'تعذر تحديث الحالة')
    } finally {
      setBusy(null)
    }
  }

  const removeUser = async (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع.')) return
    setBusy(id)
    try {
      await http.delete(`/users/${id}`, {}, () => getToken())
      toast.success('تم حذف المستخدم')
      await load()
    } catch (e: any) {
      toast.error(e?.message || 'تعذر حذف المستخدم')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة المستخدمين"
        subtitle="عرض وتصفية المستخدمين وتغيير الأدوار والحالات"
        icon={ShieldCheck}
      />

      <FilterBar>
        <SearchInput
          value={searchInput}
          onChange={(v) => {
            setSearchInput(v)
            setPage(1)
          }}
          placeholder="ابحث بالاسم أو البريد أو الهاتف..."
        />
        <FilterSelect
          label="الدور"
          value={role}
          onChange={(v) => {
            setRole(v)
            setPage(1)
          }}
          options={[
            { value: '', label: 'كل الأدوار' },
            ...Object.entries(USER_ROLE_AR).map(([value, label]) => ({ value, label })),
          ]}
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
            ...Object.entries(USER_STATUS_AR).map(([value, label]) => ({ value, label })),
          ]}
        />
      </FilterBar>

      <AdminCard className="p-0">
        {loading ? (
          <LoadingState label="جارٍ تحميل المستخدمين..." />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void load()} />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="لا يوجد مستخدمون مطابقون"
            hint="جرّب تعديل البحث أو عوامل التصفية"
          />
        ) : (
          <>
            <DataTable
              head={['الاسم', 'البريد الإلكتروني', 'الدور', 'الحالة', 'إجراءات']}
              minWidth={760}
            >
              {users.map((u) => {
                const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || '—'
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-ivory">
                          {u.firstName?.[0] ?? name[0] ?? '؟'}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-primary">{name}</div>
                          {u.phone ? (
                            <div className="text-[11px] text-muted-foreground" dir="ltr">
                              {u.phone}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-foreground" dir="ltr">
                        {u.email || '—'}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {formatNumber(toNum(u._count?.investments))} استثمار
                      </div>
                    </TableCell>
                    <TableCell>
                      <select
                        value={u.role ?? ''}
                        disabled={busy === u.id}
                        onChange={(e) => {
                          const next = e.target.value
                          if (next && next !== u.role) void changeRole(u.id, next)
                        }}
                        className="input-field w-full min-w-[9rem] py-2 text-xs disabled:opacity-50"
                        aria-label="الدور"
                      >
                        {Object.entries(USER_ROLE_AR).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <StatusBadge tone={userStatusTone(u.status)}>
                          {USER_STATUS_AR[u.status ?? ''] ?? u.status ?? '—'}
                        </StatusBadge>
                        <select
                          value={u.status ?? ''}
                          disabled={busy === u.id}
                          onChange={(e) => {
                            const next = e.target.value
                            if (next && next !== u.status) void changeStatus(u.id, next)
                          }}
                          className="input-field w-full min-w-[9rem] py-1.5 text-[11px] disabled:opacity-50"
                          aria-label="الحالة"
                        >
                          {Object.entries(USER_STATUS_AR).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => void removeUser(u.id)}
                        disabled={busy === u.id}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                        aria-label="حذف المستخدم"
                        title="حذف المستخدم"
                      >
                        {busy === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </DataTable>
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              onPage={setPage}
            />
          </>
        )}
      </AdminCard>

      <p className="text-center text-[11px] text-muted-foreground">
        آخر تحديث: {formatDate(new Date().toISOString())}
      </p>
    </div>
  )
}
