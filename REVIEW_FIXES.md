# ملاحظات الإصلاحات (مراجعة الكود)

هذا الملف يفصل بين **تصحيحات** (أخطاء واضحة) و**قرارات سياسة** (محتاجة قرار من صاحب المشروع). لا يعني أن المنصة جاهزة لأموال حقيقية.

## تصحيحات
- Rate limit: حد عام 100/دقيقة، و10/دقيقة فقط على register/login/refresh/forgot/reset.
- RolesGuard: عضوية صريحة (الأدوار المذكورة + SUPER_ADMIN) بدل التدرج بالمستوى.
- منع تصعيد الصلاحيات: ADMIN لا يعدّل/يوقف/يحذف ADMIN أو SUPER_ADMIN ولا يمنح أدوارًا إدارية، ولا أحد يعدّل نفسه.
- JWT: لا أسرار افتراضية. في الإنتاج يرفض الخادم التشغيل لو JWT_SECRET أو JWT_REFRESH_SECRET ناقص أو أقل من 32 حرفًا.
- Refresh: تحقق من التوقيع والحالة، تدوير، تخزين SHA-256 فقط، كشف إعادة الاستخدام، دعم الكوكي.
- استعادة كلمة المرور: رمز مخزن كبصمة، استخدام واحد، إبطال الجلسات، إرسال SMTP، صفحة /reset-password.
- الحجوزات: تحرير المنتهي يعيد العداد بدقة، فحص عدد الأسهم الفعلية، إلغاء/انتهاء ذري، cron كل دقيقة (لا يعمل على Vercel serverless؛ الانتهاء الكسول يغطي ذلك).
- تأكيد الاستثمار: تأكيد ذري (لا تأكيد مزدوج)، المشروع FUNDED فقط عند عدم وجود أسهم متاحة ولا حجوزات معلقة، تجاهل providerRef القادم من العميل.
- السحب: خصم مشروط ذري، لا سحب بالسالب.
- المالية: اعتماد المصروف، عكس القيد، اعتماد/تنفيذ التوزيع بحجز ذري (لا تكرار قيد أو صرف). المصروف المرفوض لا يدخل في الأرباح/الخسائر ولا في حساب التوزيع. حالة المصروف (status) تتحدث عند الاعتماد/الرفض.
- التبعيات: 0 ثغرات في npm audit --omit=dev بعد الترقية (Nest 11، Next 15.5.29، zod 4، nodemailer 10، uuid 11، وoverrides للحزم الفرعية)، مع React 18.3.1 مثبتًا.
- الهجرات (migrations) تطابق schema.prisma بلا انحراف (تم التحقق بقاعدة بيانات مؤقتة).

## قرارات سياسة (لم تُغيَّر أو لم تُخترع)
- الدفع الحقيقي: غير مربوط ببوابة. لا يُقبل إلا SANDBOX، والباقي يرجع 400. يحتاج قرار: أي بوابة، وكيف التحقق (webhook)، ومعنى الرسوم (إجمالي/صافي).
- محفظة الدفع التجريبي: لم تعد تُخصم (كانت تصبح بالسالب ولا يوجد مسار إيداع). لو تريد الدفع من المحفظة فهذا يحتاج مسار إيداع وقاعدة رسوم.
- مصفوفة الأدوار: صارت صريحة. أدوار كانت تنجح بالتدرج فقط (مثل FINANCE_MANAGER في مسارات المزارع) لم تعد تنجح. أضفنا SUPPORT_AGENT وSUPPORT_MANAGER لمسارات الدعم للحفاظ على وصولهم. راجع كل @Roles قبل الإنتاج.
- المصروفات المعلقة (غير المعتمدة وغير المرفوضة) ما زالت تُحسب في الأرباح (لم نغيّر هذا السلوك). هل تُحسب أم لا قرار محاسبي.
- نسب التوزيع (شركة 20%، رسوم 2%، ضريبة 5%) وتوزيع كسور القروش المتبقية.
- SMTP: يحتاج مزود تختاره أنت. بدون SMTP_HOST لا يُرسل بريد (يُسجَّل تحذير فقط).

## قبل أي نشر
1. اضبط JWT_SECRET وJWT_REFRESH_SECRET (32 حرفًا+) على الاستضافة، وإلا لن يعمل الخادم.
2. جلسات الدخول الحالية (refresh tokens مخزنة نصًا) ستبطل ويحتاج المستخدمون تسجيل الدخول مرة.
3. اضبط APP_URL وSMTP_* لو تريد استعادة كلمة المرور بالبريد، وPAYMENTS_SANDBOX_ENABLED=false لو تريد إيقاف الدفع التجريبي.
4. شغّل `npm run test:int` في apps/api على قاعدة بيانات اختبار فارغة فقط.

## Round 3 (projects / farms / animals / serverless shim)
Corrections (bugs, no policy invented):
- Creating a second project failed: share numbers were "1..n" but `shareNumber` is globally unique. Now `<project code>-<n>`.
- Editing a draft project's shares/price left shares, available count and amounts inconsistent, and `animalIds` was written straight into the update. Now recomputed in one transaction (blocked if reservations/investments exist).
- Public project detail exposed drafts/cancelled/deleted projects; public farm detail exposed the manager's email and phone and deleted farms.
- Animal detail/QR routes were open to any logged-in user (including investors). Now limited to staff roles (the roles already used by the staff screens plus FARM_EMPLOYEE).
- Death could be recorded twice (pen count decremented twice); transfers of a dead animal or to the same pen were accepted. Vet report approval was not atomic (concurrent approvals created duplicate versions).
- Vercel shim: no cookie parser (cookie refresh returned 401), no helmet, no trust proxy (all visitors shared one throttle bucket).
Policy choices still open: SMTP provider, role matrix, pending expenses in profit, fees/tax/company share/leftover cents, real payment provider, wallet funding.
Deploy note: vercel.json builds only apps/web; the API function also needs `prisma generate` at build time (not verified, no Vercel access).
