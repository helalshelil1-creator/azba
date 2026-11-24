// شريط ثابت يوضح أن هذه نسخة تجريبية. يُعطَّل فقط بضبط NEXT_PUBLIC_DEMO_MODE=0 وقت البناء.
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== '0'

export function DemoBanner() {
  // شريط داخل تدفق الصفحة (غير عائم) في نهاية كل صفحة، مع مساحة محجوزة فوق شريط التنقل السفلي في الموبايل
  if (!DEMO_MODE) return null
  return (
    <div
      role="status"
      className="border-t border-amber-300 bg-amber-100 px-4 py-2 pb-[calc(env(safe-area-inset-bottom,0px)+96px)] text-center text-xs font-bold leading-6 text-amber-900 lg:pb-2"
    >
      نسخة تجريبية: بيانات وهمية، لا استثمار ولا دفع ولا سحب حقيقي
    </div>
  )
}

export function DemoNotice({ className = '' }: { className?: string }) {
  if (!DEMO_MODE) return null
  return (
    <div className={`rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-7 text-amber-900 ${className}`}>
      <strong>نسخة تجريبية.</strong> المشاريع والأرقام والعوائد المعروضة هنا بيانات وهمية للتجربة فقط، وليست عروضًا
      استثمارية حقيقية ولا وعدًا بأي عائد. لا يتم أي استثمار أو دفع أو سحب فعلي في هذه النسخة.
    </div>
  )
}

export function isDemoProject(code?: string | null) {
  return DEMO_MODE && !!code && /DEMO/i.test(code)
}
