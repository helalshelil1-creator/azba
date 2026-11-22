// AZBA API client
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

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
  const url = new URL(path.startsWith('http') ? path : `${API_URL}${path}`)
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

  const res = await fetch(buildUrl(path, params), {
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

  const text = await res.text()
  let data: any = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    const message = data?.message || data?.error?.message || `HTTP ${res.status}`
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
