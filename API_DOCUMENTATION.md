# توثيق واجهات API (API_DOCUMENTATION)

Base URL: `/api` · المصادقة: `Authorization: Bearer <accessToken>` · Swagger: `/docs`
إجمالي نقاط النهاية: **102**

## 1. لمحة حسب الوحدة

| الوحدة | المسار | عدد النقاط | الأمثلة |
|---|---|---|---|
| auth | `/api/auth` | 9 | login, refresh, logout, me, password, forgot/reset |
| users | `/api/users` | 6 | list, stats, role, status |
| investments | `/api/investments` | 14 | dashboard, wallet, withdraw, reservations, confirm |
| projects | `/api/projects` | 10 | list, stats, financials, status |
| farms | `/api/farms` | 12 | farms, buildings, pens, employees |
| animals | `/api/animals` | 16 | CRUD, weights, health, vaccinations, vet-reports, feeding |
| financial | `/api/financial` | 19 | accounts, journal-entries, expenses, reports, distributions |
| notifications | `/api/notifications` | 6 | list, read, read-all, stats, send |
| support | `/api/support` | 10 | tickets, assign, reply, resolve, close |
| admin | `/api/admin` | 5 | dashboard, kpis, audit-logs, pending-approvals, seed-accounts |

## 2. الصحة والبيئة
- `GET /health` — خارج بادئة `/api`، يرجع `{ status, database, uptime, version }`.

## 3. قواعد الحماية
- كل النقاط محمية افتراضيًا عبر `JwtAuthGuard` و`RolesGuard` (APP_GUARD).
- المسارات العامة فقط عليها `@Public()` (مثل `health`، `auth/login`، `auth/register`، `projects` العامة).
- الصلاحيات تُفحص على الخادم عبر `@Roles(...)`.

## 4. التحقق (Validation)
- كل DTO يستخدم `class-validator` (`@IsEnum`, `@IsEmail`, `@IsNumber`, ...).
- `ValidationPipe` عالمي يرفض الطلبات غير المطابقة بـ 400.

## 5. نمط الاستجابة
- قائمة: `{ data: [...], meta: { page, limit, total, pages } }`
- عنصر: `{ data: {...} }`
- خطأ: `{ statusCode, message, error }`

## 6. النقاط التي تحتاج توثيقًا أدق
- دقة حقول كل DTO (يُرجى مراجعة `apps/api/src/modules/*/dto/*`).
- لا يوجد إصدار للواجهة (`/api/v1`) بعد.
