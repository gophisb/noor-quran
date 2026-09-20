# INVARIANTS — ثوابت لا يجوز كسرها

| ID | المستوى | الثابت | كيفية التحقق |
|---|---|---|---|
| INV-001 | CRITICAL | التطبيق يُبنى ويعمل (`npm run build` ينجح) | `npm run build` |
| INV-002 | CRITICAL | النص القرآني لا يُكتب يدويًا ولا يُولَّد؛ مصدره Tanzil فقط | `verify-invariants.mjs` يفحص أن `src/` لا يحوي نصوص آيات مضمّنة سوى البسملة/آية اليوم بالمرجع |
| INV-003 | CRITICAL | لا محتوى ديني مولَّد (تفسير/حديث/ذكر) — كل نص من مصدر موثق | مراجعة بشرية + ADR |
| INV-004 | HIGH | المواقيت تُحسب محليًا (بلا إنترنت) بانحراف ≤ 3 دقائق عن المرجع | `verify-prayer-times.mjs` |
| INV-005 | HIGH | جميع الأرقام المعروضة غربية 0-9 | `verify-invariants.mjs` يفحص `dist/index.html` = 0 أرقام عربية-هندية |
| INV-006 | HIGH | عنصر صوتي واحد مشترك للأذان؛ زر الإيقاف يوقفه دائمًا | مراجعة `lib/adhan.ts` + اختبار يدوي |
| INV-007 | HIGH | التنقل الرئيسي (6 أقسام) يبقى يعمل | اختبار يدوي / E2E |
| INV-008 | MEDIUM | بيانات المستخدم في localStorage (`noor:*`) لا تُفسد عند الترقية | مفاتيح مستقرة؛ أي تغيير schema ⇒ migration |
| INV-009 | MEDIUM | لا dependency جديدة بدون ADR | مراجعة `package.json` مقابل `DECISIONS/` |
| INV-010 | MEDIUM | `tsc --noUnusedLocals --noUnusedParameters` بدون أخطاء | `node RAFEEQ/scripts/verify-invariants.mjs` |
