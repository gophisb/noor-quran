# ARCHITECTURE

```
index.html (RTL, خطوط Amiri Quran / Tajawal / Aref Ruqaa)
src/
  main.tsx                 نقطة الدخول
  App.tsx                  الحالة العليا: view, settings, lastRead, location, adhan; الجدولة؛ شريط الأذان
  components/
    Nav.tsx                6 أقسام: home, quran, adhan, athkar, qibla, profile
    PrayerBar.tsx          شريط المواقيت + LocationPicker (22 دولة، GPS، إحداثيات يدوية)
    QuranView.tsx          تمرير رأسي متصل آية-آية، تفسير تحت الآية، تلاوة المنشاوي المتواصلة
    AdhanView.tsx          تجربة/إيقاف، اختيار المؤذن، صوت، لكل صلاة، مذهب
    QiblaView.tsx          بوصلة (useCompass) + قرص SVG
    AthkarView.tsx         مسبحة نابضة + أذكار
    HomeView.tsx           آية اليوم + متابعة + علامات
    ProfileView.tsx        إعدادات + مصادر
  lib/
    prayer.ts              محرك المواقيت (adhan lib) + طرق إقليمية + Intl (nu-latn) + قبلة
    adhan.ts               عنصر صوت مشترك، unlock، scheduler (كل 1s، نافذة 60s، مرة/صلاة/يوم)
    compass.ts             headingFromEvent / smoothHeading / useCompass
    recitation.ts          مشغل آية-آية مع prefetch وfallback
    api.ts                 جلب القرآن/التفسير + cache + fmt()
    store.ts               useLocalState (localStorage: noor:*)
  data/
    surahs.ts (114)  cities.ts (22 دولة)  athkar.ts
    nativeAdhan.ts         (أندرويد) جدولة إشعارات محلية بصوت الأذان — Capacitor LocalNotifications
  assets/ adhanAlaqsa.ts, adhanMadinah.ts (base64 نصّي)
capacitor.config.ts        appId app.houd11.quran, webDir dist
android/                   مشروع Android (يولَّد بـ cap add + prepare-android.mjs)
.github/workflows/         android-apk.yml — بوابة RAFEEQ ثم APK موقّع
RAFEEQ/                    الحوكمة والذاكرة الدائمة والاختبارات
```

## تدفقات رئيسية
- **المواقيت:** `LocationState` → `computeTimes()` (محلي) → عرض بـ `formatTime(tz)`.
- **الأذان:** `useAdhanScheduler` يفحص كل ثانية؛ عند دخول الوقت `play()` على العنصر المشترك + شريط علوي بزر إيقاف.
- **التلاوة:** `useRecitation.play(a)` → `ended` → الآية التالية → نهاية السورة → `onSurahEnd` (السورة التالية).
- **البوصلة:** `deviceorientationabsolute` مفضل؛ `webkitCompassHeading` على iOS؛ تعويض `screen.orientation.angle`؛ تنعيم دائري α=0.25.

## قيود
- ملف واحد (vite-plugin-singlefile) ⇒ لا code-splitting؛ الأصول الصوتية مضمّنة base64.
- لا خادم؛ كل الحالة في localStorage.
