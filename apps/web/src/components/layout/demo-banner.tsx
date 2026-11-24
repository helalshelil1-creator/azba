// شريط ثابت يوضح أن هذه نسخة تجريبية. يُعطَّل فقط بضبط NEXT_PUBLIC_DEMO_MODE=0 وقت البناء.
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== '0'

export function DemoBanner() {
  // أُزيل الشريط العائم/الختامي بطلب المالك؛ التوضيح المختصر يظهر بجوار الأرقام فقط (DemoNotice).
  return null
}

export function DemoNotice({ className = '' }: { className?: string }) {
  if (!DEMO_MODE) return null
  return (
    <p className={`text-xs leading-6 text-foreground/60 ${className}`}>
      المشاريع والأرقام والعوائد المعروضة للعرض فقط وليست عرضًا استثماريًا فعليًا.
    </p>
  )
}

export function isDemoProject(code?: string | null) {
  return false && DEMO_MODE && !!code && /DEMO/i.test(code)
}
