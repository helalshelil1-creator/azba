'use client'

/**
 * Language context for the public marketing layer.
 * Arabic is the default and its content is untouched; English is an additive layer.
 * Persisted in localStorage ('azba-lang'); flips <html lang/dir> on change.
 */
import React, { createContext, useContext, useEffect, useState } from 'react'

export type Lang = 'ar' | 'en'

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'ar',
  setLang: () => {},
})

const STORAGE_KEY = 'azba-lang'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('ar')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'en' || saved === 'ar') setLang(saved)
    } catch {
      /* storage unavailable: keep default */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* ignore */
    }
  }, [lang])

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}

/** Pick the string for the active language. */
export function tx(lang: Lang, ar: string, en: string): string {
  return lang === 'ar' ? ar : en
}
