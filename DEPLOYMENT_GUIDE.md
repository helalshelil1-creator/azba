# دليل التشغيل والنشر (DEPLOYMENT_GUIDE)

آخر تحديث: 2026-11-23

## 1. المتغيرات المطلوبة

### الواجهة (apps/web) — Vercel
| المتغير | الاستخدام |
|---|---|
| `NEXT_PUBLIC_API_URL` | عنوان الخادم (مثال `https://<api-host>/api`) |
| `NEXT_PUBLIC_SITE_URL` | عنوان الموقع لـ metadata |

### الخادم (apps/api) — Railway/Render
| المتغير | الاستخدام |
|---|---|
| `DATABASE_URL` | اتصال PostgreSQL |
| `DIRECT_URL` | (اختياري) للترحيلات |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | توقيع التوكنات |
| `CORS_ORIGINS` | مصادر الواجهة المسموح بها |
| `PORT` | منفذ الاستماع |
| `PAYMENT_PROVIDER` | `sandbox` حاليًا |

## 2. الواجهة على Vercel
1. Import المستودع `helalshelil1-creator/azba`.
2. **Root Directory** = `apps/web`.
3. أضف متغيرات البيئة.
4. Deploy.
- `apps/web/vercel.json`: `framework: nextjs`، بدون `regions` (تم إزالة `cai1` غير الصالح).

## 3. الخادم
- Render: `apps/api/render.yaml`.
- Railway: `apps/api/railway.toml` (+ تحديد Root Dir = `apps/api`).
- أمر البناء: `npm install && npm run build` · التشغيل: `npm run start:prod` · الصحة: `/health`.

## 4. قاعدة البيانات
```bash
cd packages/database
npx prisma migrate deploy      # في الإنتاج
npm run db:seed                # بيانات أولية (يُستخدم بحذر)
```

## 5. التشغيل المحلي
```bash
# PostgreSQL 16 كخدمة ويندوز: THARWA_PG (البيانات C:\pgdata) · قاعدة azba
cd apps/api && node dist/main.js          # المنفذ 4000
cd apps/web && npm run dev                # المنفذ 3000
```

## 6. حالة النشر الفعلية
- **لم يتم النشر بعد.** لا توكن Vercel متاح؛ لا قاعدة سحابية.
- يتطلب: `npx vercel login` من المستخدم + `DATABASE_URL` سحابي.

## 7. اختبارات ما قبل النشر (إلزامية)
- e2e 5/5 ✅
- فحص أنواع + بناء ✅
- مسح الصفحات 200 ✅
- متغيرات الإنتاج مضبوطة ⏳
