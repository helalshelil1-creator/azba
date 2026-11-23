# المعمارية (ARCHITECTURE)

## 1. نظرة عامة

```
المستخدم (جوال/متصفح)
      │ HTTPS
      ▼
┌─────────────────────────┐        ┌──────────────────────────┐
│  apps/web (Next.js)     │ ─────▶ │  apps/api (NestJS)       │
│  App Router + Tailwind  │  HTTP  │  REST /api/*             │
│  React Server/Client    │        │  Guards + RBAC           │
└─────────────────────────┘        └───────────┬──────────────┘
                                                │ Prisma
                                                ▼
                                     ┌──────────────────────────┐
                                     │  PostgreSQL              │
                                     │  (migrations + seed)     │
                                     └──────────────────────────┘
```

## 2. الطبقات

### الواجهة (apps/web)
- `app/(marketing)` — صفحات عامة (الرئيسية، الفرص، المزارع، من نحن، الإفصاحات، الخصوصية، الشروط).
- `app/(auth)` — دخول/تسجيل/استعادة.
- `app/(dashboard)/dashboard/**` — لوحات محمية (`layout.tsx` يتحقق من الجلسة).
- `components/` — navbar, footer, mobile-menu, marketing sections, dashboard sidebar/mobile-nav.
- `lib/api.ts` — عميل HTTP يقرأ `NEXT_PUBLIC_API_URL`.
- `lib/animals.ts` — خريطة نوع الحيوان ← اسم وصورة.

### الخادم (apps/api)
- `app.module.ts` — يسجّل `JwtAuthGuard` و`RolesGuard` كـ `APP_GUARD` (حماية شاملة).
- `modules/*` — auth, users, investments, projects, farms, animals, financial, notifications, support, admin.
- كل وحدة: controller + service + dto.

### قاعدة البيانات (packages/database)
- `prisma/schema.prisma` — 66 نموذجًا.
- `prisma/migrations/*` — 4 هجرات.
- `prisma/seed.ts` — بيانات أولية (أدوار، حسابات، مزرعة، حيوانات، مشاريع، إعدادات).

## 3. الحزم المشتركة
- `packages/shared` — أنواع/ثوابت (brand, locale, errors, api).
- `packages/ui` — مكوّنات (Logo, Button, Card, Input, Badge).
- `packages/config` — tailwind/tsconfig مشترك.

## 4. التكامل
- الواجهة لا تلمس القاعدة مباشرة؛ كل شيء عبر `/api/*`.
- `NEXT_PUBLIC_API_URL` يحدد عنوان الخادم (فارغ = نفس النطاق).
- الهوية (Access/Refresh) في `lib/auth-store.tsx`.

## 5. محددات معمارية حالية
- لا يوجد طبقة تخزين مؤقت (Cache) ولا طابور رسائل.
- الإشعارات داخل التطبيق فقط (لا Push/SMS/بريد فعلي بعد).
- المدفوعات Sandbox.
