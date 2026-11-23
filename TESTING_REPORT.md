# تقرير الاختبارات (TESTING_REPORT)

آخر تحديث: 2026-11-23

## 1. ما يُنفذ فعليًا الآن

### End-to-End (NestJS + Jest)
- الملف: `apps/api/test/app.e2e-spec.ts` (5 حالات).
- الأمر: `cd apps/api && node node_modules/jest/bin/jest.js --config ./test/jest-e2e.json --runInBand`
- النتيجة الأخيرة: **5/5 ناجحة**.

### فحص الأنواع والبناء
- `apps/api`: `nest build` → نجح.
- `apps/web`: `tsc --noEmit` → 0 أخطاء؛ `next build` → نجح.

### فحص المسارات
- كل صفحات الويب ترجع 200 على السيرفر المحلي.

## 2. ما هو ناقص (صريحًا)
- اختبارات وحدات (Unit) للخدمات.
- اختبارات تكامل (Integration) لقاعدة البيانات.
- اختبارات أمان (Rate limiting، صلاحيات سلبية).
- اختبارات أداء (Load).
- تغطية القياس (Coverage).

## 3. مصفوفة الحالة
| النوع | الحالة |
|---|---|
| E2E | ✅ موجود (5 حالات) |
| Unit | ⛔ غير موجود |
| Integration | ⛔ غير موجود |
| Security | ⛔ غير موجود |
| Performance | ⛔ غير موجود |
| Manual smoke (ويب) | ✅ 39 صفحة 200 |

## 4. _command المرجعي
```bash
# e2e
cd apps/api && node node_modules/jest/bin/jest.js --config ./test/jest-e2e.json --runInBand
# types + build
cd apps/api && node node_modules/@nestjs/cli/bin/nest.js build
cd apps/web && npx tsc --noEmit && npm run build
```
