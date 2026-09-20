# PROJECT_STATE — نُور (القرآن الكريم وتفسير السعدي)
> مصدر الحقيقة الوحيد لحالة المشروع. يُحدَّث بعد كل مهمة. لا يُخترع من الذاكرة.

- **Project:** houd11 — React 19 + Vite 7 + Tailwind 4، مخرَج ملف HTML واحد (`dist/index.html`)
- **Current milestone:** M3 — APK أندرويد محايد (الكود مكتمل؛ بانتظار اختبار الهاتف)
- **Current task:** — (لا مهمة جارية)
- **Last completed task:** TASK-018 خط بناء APK (2026-09-17)
- **Current branch:** n/a — **لا يوجد مستودع Git بعد** (انظر Known risks)
- **Last verified build:** web `dist/index.html` ≈ 821 KB ✓ · **APK** `app-debug.apk` 4.85 MB ✓ (Gradle 8.11.1, JDK 21, SDK 35) — sha256 db30605c…89def
- **Build status:** PASS
- **Test status:** PASS — verify-invariants 4/4 · test-compass 8/8 · verify-prayer-times 5/5 · apksigner verify ✓ · aapt2 badging: app.houd11.quran / نُور / 9 صلاحيات / res/raw/adhan_*.mp3 ✓
- **Known bugs:** لا شيء مفتوح
- **Known risks:**
  - R1: لا Git ⇒ لا rollback آلي. **الإجراء المطلوب من الإنسان:** `git init` ورفع أول commit.
  - R2 (مغلق): الثنائيات لا تصمد بين الجلسات ⇒ الصوت الآن base64 نصّي في `src/assets/*.ts`؛ `android/` قابل لإعادة التوليد آلياً عبر `RAFEEQ/scripts/prepare-android.mjs`.
  - R3 (كود منجز): على أندرويد الأذان يُرفع بإشعار محلي مجدول حتى والتطبيق مغلق — يحتاج تحققاً على هاتف حقيقي (TASK-019).
  - R5: `public/houd11.apk` نسخة debug موقّعة بمفتاح مؤقت (مثبَّتة وقابلة للتجربة)؛ الإصدار الرسمي يُبنى في GitHub Actions بمفتاح دائم (TASK-020).
  - R4: التلاوة تحتاج إنترنت (بث). تنزيل السور للاستماع دون اتصال مؤجل (TASK-011).
- **Active decisions:** ADR-001..004
- **Blocked tasks:** TASK-009 (Git) — يتطلب إجراء بشري
- **Next recommended task:** TASK-019 اختبار القبول على هاتف حقيقي (RUNBOOK §6) ثم TASK-020 مفتاح التوقيع الدائم
- **Last checkpoint:** 2026-09-17 — بعد TASK-018؛ كل البوابات PASS؛ APK مُنتَج ومُتحقَّق منه
