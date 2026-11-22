# النشر — AZBA | عزبة

المستودع: https://github.com/helalshelil1-creator/azba

## المكوّنات

| المكوّن | التقنية | مكان النشر المقترح |
|---|---|---|
| `apps/web` | Next.js 14 | Vercel |
| `apps/api` | NestJS 10 | Railway / Render / Fly.io (Node) |
| قاعدة البيانات | PostgreSQL 16 | Neon / Supabase / Railway |

> **مهم:** تطبيق Vercel وحده لا يكفي — يحتاج الخادم (API) وقاعدة بيانات يمكن الوصول إليها من الإنترنت. قاعدة البيانات المحلية على جهازك غير متاحة من Vercel.

---

## 1) قاعدة البيانات (PostgreSQL)

1. أنشئ قاعدة مجانية على [Neon](https://neon.tech) أو [Supabase](https://supabase.com).
2. انسخ عنوان الاتصال `postgresql://...`.
3. شغّل الهجرات والبيانات الأولية:

```bash
cd packages/database
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy
npm run db:seed
```

---

## 2) نشر واجهة الويب على Vercel

1. سجّل الدخول إلى Vercel ثم **Add New → Project** واختر مستودع `azba`.
2. **Root Directory** = `apps/web`.
3. أضف متغير البيئة:
   - `NEXT_PUBLIC_API_URL` = عنوان الخادم بالصيغة `https://<api-host>/api`
   - `NEXT_PUBLIC_SITE_URL` = `https://<your-domain>`
4. أمر البناء: `npm run build` (يوجد `prebuild` يبني الحزم المحلية تلقائيًا).
5. Deploy → ستحصل على رابط `https://azba.vercel.app` (أو أي اسم -project).

### ربط دومين مخصص
Vercel → Project → Settings → Domains → أضف الدومين واتبع إعدادات DNS.

---

## 3) نشر الخادم (API)

مثال على Railway:

1. New Project → Deploy from GitHub → اختر `azba`.
2. Root Directory = `apps/api`.
3. متغيرات البيئة:

```
NODE_ENV=production
PORT=4000
API_PREFIX=api
DATABASE_URL=postgresql://...
JWT_SECRET=<سلسلة عشوائية 32+ حرف>
JWT_REFRESH_SECRET=<سلسلة عشوائية>
CORS_ORIGINS=https://<your-domain>
```

4. أمر البناء: `npm run build`
5. أمر التشغيل: `npm run start:prod`
6. فعّل Generate Domain.

---

## 4) التحقق بعد النشر

```bash
curl https://<api-host>/health          # status: ok, database: up
curl https://<api-host>/api/projects      # 200 JSON
```

ثم افتح الموقع وجرّب: تسجيل حساب → تصفح الفرص → استثمار (Sandbox) → المحفظة.

---

## 5) أوامر Vercel CLI (اختياري)

```bash
npx vercel login
npx vercel --prod
```

متغيرات مطلوبة للنشر التفاعلي: `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID`.
