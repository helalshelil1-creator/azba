'use client'

import React, { useState } from 'react'
import { User, ShieldCheck, Save, Loader2, KeyRound } from 'lucide-react'
import { useAuth } from '@/lib/auth-store'
import { http } from '@/lib/api'
import { Card } from '@azba/ui/card'
import { toast } from 'sonner'

export default function AccountPage() {
  const { user, refresh } = useAuth()
  const [form, setForm] = useState({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', email: user?.email ?? '', phone: user?.phone ?? '', preferredLang: user?.preferredLang ?? 'ar' })
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  const save = async () => {
    setSaving(true)
    try { await http.patch('/users/me', form); await refresh(); toast.success('تم حفظ بياناتك') }
    catch (e: any) { toast.error(e?.message || 'تعذر الحفظ') } finally { setSaving(false) }
  }
  const savePwd = async () => {
    if (pwd.next !== pwd.confirm) { toast.error('كلمتا المرور غير متطابقتين'); return }
    setSavingPwd(true)
    try { await http.post('/auth/change-password', pwd); toast.success('تم تغيير كلمة المرور'); setPwd({ current: '', next: '', confirm: '' }) }
    catch (e: any) { toast.error(e?.message || 'تعذر التغيير') } finally { setSavingPwd(false) }
  }

  const field = 'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:border-gold focus:outline-none'

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">حسابي</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="flex items-center gap-2 font-bold text-primary"><User className="h-5 w-5 text-gold" /> البيانات الشخصية</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">الاسم الأول</label><input className={field} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">اسم العائلة</label><input className={field} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">البريد الإلكتروني</label><input dir="ltr" className={field} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">الهاتف</label><input dir="ltr" className={field} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">اللغة</label>
              <select className={field} value={form.preferredLang} onChange={(e) => setForm({ ...form, preferredLang: e.target.value })}>
                <option value="ar">العربية</option><option value="en">English</option>
              </select>
            </div>
          </div>
          <button onClick={save} disabled={saving} className="btn-gold mt-5"><Save className="h-4 w-4" />{saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}</button>
        </Card>

        <Card>
          <h3 className="flex items-center gap-2 font-bold text-primary"><KeyRound className="h-5 w-5 text-gold" /> كلمة المرور</h3>
          <div className="mt-5 space-y-4">
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">كلمة المرور الحالية</label><input type="password" dir="ltr" className={field} value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">كلمة المرور الجديدة</label><input type="password" dir="ltr" className={field} value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-muted-foreground">تأكيد كلمة المرور</label><input type="password" dir="ltr" className={field} value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} /></div>
          </div>
          <button onClick={savePwd} disabled={savingPwd} className="btn-outline mt-5">{savingPwd ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} تغيير كلمة المرور</button>
        </Card>
      </div>
      <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-white p-4 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0 text-gold" />
        الدّور: <span className="font-bold text-primary">{user?.role}</span> — آخر تحديث {user?.updatedAt ? new Date(user.updatedAt).toLocaleString('ar-EG') : '—'}
      </div>
    </div>
  )
}
