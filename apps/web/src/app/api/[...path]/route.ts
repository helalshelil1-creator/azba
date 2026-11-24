// وكيل ثابت الوجهة (same-origin) لواجهة AZBA API على Vercel.
// الوجهة محددة بمتغير بيئة واحد ولا تقبل أي عنوان من الطلب، فلا يعمل كوكيل مفتوح.
// يسمح بكوكي refresh كـ same-site: يحمل الرد Set-Cookie على نطاق الموقع نفسه.
// على Netlify لا يُستخدم (إعادة التوجيه في netlify.toml تسبق هذا المسار).
export const dynamic = 'force-dynamic'

const ORIGIN = (process.env.API_PROXY_ORIGIN || '').replace(/\/+$/, '')
const DROP_REQ = new Set(['host', 'connection', 'content-length', 'x-forwarded-host', 'x-forwarded-proto'])
const DROP_RES = new Set(['content-encoding', 'content-length', 'transfer-encoding', 'connection'])

// نسخة العرض الشخصي غير التجاري: حجب عمليات الأموال حتى على مستوى الوكيل (نفس قواعد DemoModeGuard في الـ API)
const DEMO = process.env.DEMO_MODE === '1'
const BLOCKED = [
  /^\/investments\/reservations$/,
  /^\/investments\/confirm$/,
  /^\/investments\/wallet\/withdraw$/,
  /^\/financial\/distributions\/[^/]+\/execute$/,
]

async function handle(req: Request, ctx: { params: { path: string[] } }) {
  if (!ORIGIN) return new Response('Not Found', { status: 404 })
  const route = '/' + (ctx.params.path || []).map(encodeURIComponent).join('/')
  if (DEMO && req.method === 'POST' && BLOCKED.some((r) => r.test(route))) {
    return Response.json({ message: 'هذه نسخة تجريبية: لا يمكن إنشاء استثمار أو دفع أو سحب أموال.', statusCode: 403 }, { status: 403 })
  }
  const inUrl = new URL(req.url)
  const target = ORIGIN + (inUrl.search || '')
  const headers = new Headers()
  req.headers.forEach((v, k) => { if (!DROP_REQ.has(k.toLowerCase())) headers.set(k, v) })
  headers.set('x-azba-route', route)
  headers.delete('origin')
  const hasBody = !['GET', 'HEAD'].includes(req.method)
  const res = await fetch(target, {
    method: req.method,
    headers,
    body: hasBody ? await req.arrayBuffer() : undefined,
    redirect: 'manual',
    cache: 'no-store',
  })
  const out = new Headers()
  res.headers.forEach((v, k) => { if (!DROP_RES.has(k.toLowerCase()) && k.toLowerCase() !== 'set-cookie') out.append(k, v) })
  const cookies = (res.headers as any).getSetCookie?.() as string[] | undefined
  cookies?.forEach((c) => out.append('set-cookie', c))
  out.set('cache-control', 'no-store')
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: out })
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE, handle as OPTIONS, handle as HEAD }
