// شريط ثابت يوضح أن هذه نسخة تجريبية. يُعطَّل فقط بضبط NEXT_PUBLIC_DEMO_MODE=0 وقت البناء.
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== '0'

export function DemoBanner() {
  if (!DEMO_MODE) return null
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-[92px] z-[60] flex justify-center px-3 md:bottom-3"
    >
      <div className="pointer-events-auto rounded-full border border-amber-300 bg-amber-100 px-4 py-1.5 text-center text-xs font-bold text-amber-900 shadow-lg">
        نسخة تجريبية: بيانات وهمية، لا استثمار ولا دفع ولا سحب حقيقي
      </div>
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
