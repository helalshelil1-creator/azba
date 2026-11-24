'use client'

import { useEffect, useState } from 'react'
import { X, Share, MoreVertical } from 'lucide-react'

type BIPEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const KEY = 'azba_install_prompt_v1'

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function remember(value: string) {
  try {
    localStorage.setItem(KEY, value)
  } catch {
    /* التخزين غير متاح: لن نكرر العرض في هذه الجلسة */
  }
}

/** ترحيب بزر «ثبّت التطبيق على هاتفك». يظهر مرة واحدة، ولا يتكرر بعد الإغلاق. */
export function InstallPrompt() {
  const [mode, setMode] = useState<'none' | 'native' | 'ios' | 'manual'>('none')
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    try {
      if (localStorage.getItem(KEY)) return
    } catch {
      /* ignore */
    }
    if (isStandalone()) return

    const ua = navigator.userAgent
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua)
    const isIOS = /iPhone|iPad|iPod/i.test(ua)
    let timer: ReturnType<typeof setTimeout> | undefined
    let got = false

    const onBip = (e: Event) => {
      e.preventDefault()
      got = true
      setDeferred(e as BIPEvent)
      clearTimeout(timer)
      timer = setTimeout(() => setMode('native'), 2500)
    }
    const onInstalled = () => {
      remember('installed')
      setMode('none')
    }
    window.addEventListener('beforeinstallprompt', onBip)
    window.addEventListener('appinstalled', onInstalled)

    if (isMobile) {
      // iOS ولا متصفحات بلا تثبيت مباشر: خطوات يدوية بعد فترة إن لم يصل حدث التثبيت
      timer = setTimeout(() => {
        if (!got) setMode(isIOS ? 'ios' : 'manual')
      }, 4000)
    }
    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', onBip)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (mode === 'none') return null

  const dismiss = () => {
    remember('dismissed')
    setMode('none')
  }

  const install = async () => {
    if (!deferred) return
    try {
      await deferred.prompt()
      const choice = await deferred.userChoice
      remember(choice.outcome === 'accepted' ? 'installed' : 'dismissed')
    } catch {
      remember('dismissed')
    }
    setMode('none')
  }

  return (
    <div
      role="dialog"
      aria-label="تثبيت التطبيق"
      className="fixed inset-x-3 bottom-24 z-[70] mx-auto max-w-md rounded-2xl border border-gold/40 bg-primary-950/95 p-4 text-white shadow-2xl backdrop-blur sm:bottom-6"
    >
      <button
        onClick={dismiss}
        aria-label="إغلاق"
        className="absolute left-2 top-2 rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-xl" draggable={false} />
        <div className="min-w-0 flex-1 pl-5">
          <p className="text-base font-bold leading-snug">أهلًا بك في عزبة</p>
          <p className="mt-1 text-sm leading-relaxed text-ivory/80">
            {mode === 'native' && 'افتح عزبة مباشرة من شاشتك الرئيسية، مثل أي تطبيق.'}
            {mode === 'ios' && 'لتثبيت عزبة على الآيفون:'}
            {mode === 'manual' && 'لتثبيت عزبة على هاتفك:'}
          </p>
          {mode === 'ios' && (
            <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-ivory/80">
              اضغط <Share className="inline h-4 w-4 text-gold" /> مشاركة، ثم «إضافة إلى الشاشة الرئيسية».
            </p>
          )}
          {mode === 'manual' && (
            <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-ivory/80">
              افتح قائمة المتصفح <MoreVertical className="inline h-4 w-4 text-gold" /> ثم اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».
            </p>
          )}
        </div>
      </div>
      {mode === 'native' ? (
        <button onClick={install} className="btn-gold mt-3 w-full">
          ثبّت التطبيق على هاتفك
        </button>
      ) : (
        <button
          onClick={dismiss}
          className="mt-3 w-full rounded-xl border border-white/25 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          تمام
        </button>
      )}
    </div>
  )
}
