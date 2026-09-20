# AGENTS — تعليمات لأي وكيل يعمل على هذا المستودع

1. اقرأ بالترتيب: `RAFEEQ_CONSTITUTION.md` → `RAFEEQ_POLICY.yaml` → `PROJECT_STATE.md` → `ARCHITECTURE.md` → `TASK_LEDGER.md` → `INVARIANTS.md`.
2. شغّل health-check قبل أي تعديل: `node RAFEEQ/scripts/verify-invariants.mjs`.
3. اختر مهمة واحدة من `TASK_LEDGER.md`؛ لا تتجاوز ملفاتها المسموحة.
4. أصغر تغيير صحيح. أي اكتشاف جانبي ⇒ سطر جديد في الـ Ledger، لا إصلاح فوري.
5. قبل ادعاء "تم": أرفق مخرجات `verify-invariants` (+ `verify-prayer-times` إن مسّت المواقيت، + `test-compass` إن مسّت البوصلة).
6. حدّث `PROJECT_STATE.md` و`CHANGELOG.md` و`TASK_LEDGER.md` بعد كل مهمة.
7. ممنوع قطعيًا: كتابة آية/حديث/ذكر من الذاكرة، إضافة dependency بلا ADR، تعديل ملفات الحوكمة الأساسية.
8. عند الغموض أو خطر أو 3 محاولات فاشلة: توقف واكتب "توقفت لأنني وصلت إلى حد يتطلب قرارًا هندسيًا."

## أدوار
- Developer: ينفذ المهمة. Reviewer: يطبق قائمة §12. Tester: يشغل scripts + الاختبار اليدوي §3 من RUNBOOK. Security: يفحص الأسرار والشبكة.
