'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { http, getToken, setToken, clearAuth, ApiError } from './api'

export interface SafeUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  avatar?: string | null
  role: string
  status: string
  emailVerified: boolean
  preferredLang: string
  updatedAt?: string | null
}

export interface AuthState {
  user: SafeUser | null
  token: string | null
  loading: boolean
  error: string | null
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  clearError: () => void
}

export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  preferredLang?: string
}

const USER_KEY = 'azba_user'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function loadStoredUser(): SafeUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as SafeUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: getToken(),
    loading: true,
    error: null,
  })

  // Try to load user on mount
  useEffect(() => {
    const stored = loadStoredUser()
    const token = getToken()
    if (stored && token) {
      setState({ user: stored, token, loading: false, error: null })
      // Refresh to validate
      http
        .get<{ user: SafeUser }>('/auth/me', {}, () => token)
        .then((res) => {
          const user = (res as any).user ?? (res as any)
          setState((s) => ({ ...s, user, loading: false }))
          try {
            localStorage.setItem(USER_KEY, JSON.stringify(user))
          } catch {}
        })
        .catch(() => {
          clearAuth()
          setState({ user: null, token: null, loading: false, error: null })
        })
    } else {
      setState((s) => ({ ...s, loading: false }))
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await http.post<any>('/auth/login', { email, password })
      const token = res.accessToken
      const user = res.user
      setToken(token)
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      } catch {}
      setState({ user, token, loading: false, error: null })
    } catch (err) {
      // نفرّق بين كلمة سر خاطئة وفشل الاتصال وخطأ الخادم
      const message =
        err instanceof ApiError
          ? err.code === 'NETWORK_ERROR'
            ? 'تعذر الاتصال بالخادم — تحقّق من اتصالك بالإنترنت'
            : err.message || 'بيانات الدخول غير صحيحة'
          : 'تعذر تسجيل الدخول'
      setState((s) => ({ ...s, loading: false, error: message }))
      throw err
    }
  }, [])

  const register = useCallback(async (data: RegisterPayload) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await http.post<any>('/auth/register', data)
      const token = res.accessToken
      const user = res.user
      setToken(token)
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      } catch {}
      setState({ user, token, loading: false, error: null })
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.code === 'NETWORK_ERROR'
            ? 'تعذر الاتصال بالخادم — تحقّق من اتصالك بالإنترنت'
            : err.message || 'تعذر إنشاء الحساب'
          : 'تعذر إنشاء الحساب'
      setState((s) => ({ ...s, loading: false, error: message }))
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await http.post('/auth/logout', {}, {}, () => getToken())
    } catch {}
    clearAuth()
    setState({ user: null, token: null, loading: false, error: null })
  }, [])

  const refresh = useCallback(async () => {
    try {
      const res = await http.post<any>('/auth/refresh', {
        refreshToken: typeof window !== 'undefined' ? localStorage.getItem('azba_refresh') : null,
      })
      if (res.accessToken) setToken(res.accessToken)
      setState((s) => ({ ...s, token: res.accessToken }))
    } catch {
      clearAuth()
      setState({ user: null, token: null, loading: false, error: null })
    }
  }, [])

  const clearError = useCallback(() => setState((s) => ({ ...s, error: null })), [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refresh, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
