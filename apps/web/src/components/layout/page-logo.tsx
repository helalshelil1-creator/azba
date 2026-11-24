/* eslint-disable @next/next/no-img-element */
/** الشعار الأصلي في منتصف أعلى الصفحة، فوق المحتوى */
export function PageLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <img
        src="/logo.webp"
        alt="AZBA | عزبة"
        width={612}
        height={408}
        draggable={false}
        className="h-24 w-auto select-none drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)] sm:h-28"
      />
    </div>
  )
}
