// AZBA API client
/**
 * عنوان الخادم: من متغير البيئة NEXT_PUBLIC_API_URL (فارغ = نفس النطاق).
 * حماية من mixed content: صفحة HTTPS لا تستطيع طلب API بعنوان HTTP،
 * فنرجع تلقائيًا لنفس النطاق (/api) بدل ما يفشل الطلب.
 */
function resolveApiBase(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || '').trim()
  if (!raw) return ''
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    /^http:/i.test(raw)
  ) {
    return ''
  }
  return raw.replace(/\/+$/, '')
}

const API_URL = resolveApiBase()

export class ApiError extends Error {
  code: string
  status: number
  details?: Record<string, string[]>

  constructor(message: string, status: number, code = 'ERROR', details?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined | null>
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  // بلا عنوان مخصص = نفس النطاق مع بادئة /api الافتراضية
  const full = path.startsWith('http') ? path : `${API_URL || '/api'}${path}`
  const base = typeof window !== 'undefined' ? window.location.origin : undefined
  const url = new URL(full, base)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url.toString()
}

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {},
  getToken?: () => string | null,
): Promise<T> {
  const { body, params, headers, ...rest } = options
  const token = getToken?.()

  let res: Response
  try {
    res = await fetch(buildUrl(path, params), {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('تعذر الاتصال بالخادم — تحقّق من اتصالك بالإنترنت', 0, 'NETWORK_ERROR')
  }
  const text = await res.text()
  let data: any = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    // رسائل واضحة بدل «HTTP 404» عندما الرد مش JSON (مثلاً صفحة 404 من نفس النطاق)
    const fallbackMessage =
      res.status === 401
        ? 'بيانات الدخول غير صحيحة'
        : res.status === 404
          ? 'الخدمة غير متاحة حاليًا — حاول لاحقًا'
          : res.status >= 500
            ? 'خطأ في الخادم — حاول لاحقًا'
            : `HTTP ${res.status}`
    const message = data?.message || data?.error?.message || fallbackMessage
    throw new ApiError(
      Array.isArray(message) ? message[0] : message,
      res.status,
      data?.error?.code || data?.code || 'HTTP_ERROR',
      data?.error?.details,
    )
  }

  return data as T
}

export const http = {
  get: <T>(path: string, options?: RequestOptions, getToken?: () => string | null) =>
    api<T>(path, { ...options, method: 'GET' }, getToken),
  post: <T>(path: string, body?: unknown, options?: RequestOptions, getToken?: () => string | null) =>
    api<T>(path, { ...options, method: 'POST', body }, getToken),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions, getToken?: () => string | null) =>
    api<T>(path, { ...options, method: 'PATCH', body }, getToken),
  put: <T>(path: string, body?: unknown, options?: RequestOptions, getToken?: () => string | null) =>
    api<T>(path, { ...options, method: 'PUT', body }, getToken),
  delete: <T>(path: string, options?: RequestOptions, getToken?: () => string | null) =>
    api<T>(path, { ...options, method: 'DELETE' }, getToken),
}

// ---------- Auth storage ----------
const TOKEN_KEY = 'azba_access_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}

export function clearAuth() {
  setToken(null)
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('azba_user')
    } catch {}
  }
}
