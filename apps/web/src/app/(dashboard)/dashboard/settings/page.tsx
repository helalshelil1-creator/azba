'use client'

import React, { useState } from 'react'
import { Bell, Globe, ShieldCheck, Save, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-store'
import { http } from '@/lib/api'
import { Card } from '@azba/ui/card'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user } = useAuth()
  const [prefs, setPrefs] = useState({ emailNotifs: true, smsNotifs: true, pushNotifs: true, lang: user?.preferredLang ?? 'ar', currency: 'EGP' })
  const [saving, setSaving] = useState(false)
  const save = async () => { setSaving(true); try { await http.patch('/users/me', { preferredLang: prefs.lang }); toast.success('تم حفظ الإعدادات') } catch (e: any) { toast.error(e?.message || 'تعذر الحفظ') } finally { setSaving(false) } }
  const toggle = 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors'
  const on = 'bg-gold'

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">الإعدادات</h2>
      <Card>
        <h3 className="flex items-center gap-2 font-bold text-primary"><Bell className="h-5 w-5 text-gold" /> الإشعارات</h3>
        <div className="mt-5 space-y-4">
          {[['emailNotifs', 'إشعارات البريد الإلكتروني'], ['smsNotifs', 'إشعارات الرسائل النصية'], ['pushNotifs', 'إشعارات التطبيق']].map(([k, label]) => (
            <label key={k} className="flex cursor-pointer items-center justify-between">
              <span className="text-sm text-foreground/80">{label}</span>
              <button type="button" onClick={() => setPrefs((p) => ({ ...p, [k]: !p[k as keyof typeof p] }))} className={`${toggle} ${prefs[k as keyof typeof prefs] ? on : 'bg-border'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${prefs[k as keyof typeof prefs] ? '-translate-x-6' : '-translate-x-1'}`} />
              </button>
            </label>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="flex items-center gap-2 font-bold text-primary"><Globe className="h-5 w-5 text-gold" /> اللغة والعملة</h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1.5 block text-xs text-muted-foreground">اللغة</label>
            <select className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:border-gold focus:outline-none" value={prefs.lang} onChange={(e) => setPrefs({ ...prefs, lang: e.target.value })}>
              <option value="ar">العربية</option><option value="en">English</option>
            </select>
          </div>
          <div><label className="mb-1.5 block text-xs text-muted-foreground">العملة</label>
            <select className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:border-gold focus:outline-none" value={prefs.currency} onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}>
              <option value="EGP">جنيه مصري (EGP)</option><option value="USD">دولار أمريكي (USD)</option><option value="SAR">ريال سعودي (SAR)</option>
            </select>
          </div>
        </div>
      </Card>
      <button onClick={save} disabled={saving} className="btn-gold">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ الإعدادات</button>
      <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-white p-4 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0 text-gold" />
        الأمان: استخدام كلمة مرور قوية وتفعيل التحقق بخطوتين يحمي حسابك واستثماراتك.
      </div>
    </div>
  )
}
