# TASK_LEDGER

| ID | الهدف | الملفات المسموحة | معيار القبول | التحقق | الخطر | الحالة |
|---|---|---|---|---|---|---|
| TASK-001 | أرقام غربية 0-9 في كل الواجهة | `lib/api.ts`, `lib/prayer.ts`, components | 0 أرقام عربية-هندية في الحزمة | `verify-invariants` INV-005 | LOW | ✅ DONE |
| TASK-002 | دقة البوصلة (مصدر مطلق، دوران الشاشة، تنعيم، مؤشر جودة) | `lib/compass.ts`, `components/QiblaView.tsx` | 8 اختبارات وحدة PASS + اختبار يدوي | `test-compass.mjs` | MED | ✅ DONE (يدوي معلّق TASK-008) |
| TASK-003 | طرق حساب رسمية (فلسطين/الأردن/المغرب/الجزائر/تونس/ليبيا) | `lib/prayer.ts`, `data/cities.ts` | انحراف ≤3 دقائق عن المرجع | `verify-prayer-times.mjs` | MED | ✅ DONE (worst 1 min) |
| TASK-004 | موثوقية الأذان: فتح قفل الصوت، إيقاف مضمون | `lib/adhan.ts` | عنصر صوتي واحد؛ لا AbortError مزعج | مراجعة + يدوي | MED | ✅ DONE |
| TASK-005 | نظافة الكود | `src/**` | tsc strict-unused نظيف، لا exports ميتة | `verify-invariants` INV-010 | LOW | ✅ DONE |
| TASK-006 | استعادة `src/assets` المفقودة | `src/assets/` | ملفات MP3 صالحة (ID3) | `ls -la`, header check | HIGH | ✅ DONE |
| TASK-007 | حوكمة RAFEEQ V3 | `RAFEEQ/**` | كل الملفات موجودة + scripts تعمل | `verify-invariants.mjs` | LOW | ✅ DONE |
| TASK-008 | اختبار قبول يدوي على هاتف حقيقي | — | قائمة RUNBOOK §3 كاملة | بشري | MED | 🔲 TODO |
| TASK-009 | تهيئة Git + أول commit + tag v0.2.0 | — | `git log` يظهر commit موقّع | بشري | HIGH | ⛔ BLOCKED (بشري) |
| TASK-010 | تسجيل أذان الأقصى بجودة أعلى برخصة واضحة | `src/assets/`, ADR-003 | ≥128kbps، مصدر موثق | يدوي | LOW | 🔲 TODO |
| TASK-011 | تنزيل سور للاستماع دون اتصال (Cache API) | `lib/recitation.ts`, ProfileView | سورة محمّلة تعمل بوضع الطيران | يدوي | MED | 🔲 TODO |
| TASK-012 | الأربعون النووية مع شرح موثق المصدر | `data/nawawi.ts`, view جديد | كل حديث بمصدره ودرجته | مراجعة بشرية | MED | 🔲 TODO |
| TASK-013 | PWA (manifest + service worker) تمهيدًا لـ APK | `public/`, `vite.config.ts` (بموافقة) | Lighthouse PWA installable | Lighthouse | MED | 🔲 TODO |
| TASK-014 | تحويل APK (Capacitor) + أذان بالخلفية | مشروع android/ | APK يعمل + أذان بالخلفية | جهاز حقيقي | HIGH | 🔲 TODO (M3) |

## سجل الفشل (Failure → Cause → Resolution → Prevention)
- F-001 (TASK-003): انحراف 5 دقائق في مغرب القدس. السبب: إغفال +5 دقائق احتياط الأوقاف الأردنية. الحل: `methodAdjustments.maghrib=5`. الوقاية: بوابة `verify-prayer-times` بحد 3 دقائق.
- F-002 (TASK-006): `src/assets` مفقود رغم استيراده. السبب: عدم ثبات بيئة العمل. الحل: إعادة التنزيل من المصدر الموثق. الوقاية: health-check يفحص الأصول + Git.

## M3 — APK
| ID | الهدف | الملفات | معيار القبول | التحقق | الخطر | الحالة |
|---|---|---|---|---|---|---|
| TASK-015 | تضمين الأذان كـ base64 نصّي (علاج جذري لـ F-002) | `src/assets/*.ts`, `lib/adhan.ts` | بناء ناجح بعد جلسة جديدة | `verify-invariants` | MED | ✅ DONE |
| TASK-016 | مشروع Capacitor Android + `prepare-android.mjs` | `capacitor.config.ts`, `android/`, script | `cap sync` ينجح؛ الصلاحيات/الصوت/الأيقونة موجودة | تشغيل السكربت | MED | ✅ DONE |
| TASK-017 | الأذان بالخلفية (LocalNotifications) | `lib/nativeAdhan.ts`, `App.tsx` | يُرفع الأذان والتطبيق مغلق | جهاز حقيقي (TASK-019) | HIGH | ✅ CODE DONE / ⏳ يدوي |
| TASK-018 | خط بناء APK في GitHub Actions + توقيع | `.github/workflows/android-apk.yml` | Artifact `houd11.apk` + sha256 | تشغيل الـworkflow | MED | ✅ DONE (بانتظار push) |
| TASK-019 | اختبار قبول على هاتف: تثبيت، أذان بالخلفية، GPS، بوصلة | — | RUNBOOK §6 | بشري | HIGH | 🔲 TODO |
| TASK-020 | مفتاح توقيع دائم (`keytool`) وإضافته كأسرار | — | Release موقّع بمفتاح ثابت | بشري | MED | 🔲 TODO |

- F-003 (TASK-015): `src/assets/*.mp3` اختفت مجدداً بين الجلسات. السبب: بيئة العمل لا تحفظ الملفات الثنائية. الحل: base64 داخل `.ts`. الوقاية: لا ملفات ثنائية مصدرية في المشروع؛ الثنائيات تُشتق من نصوص عبر scripts.
