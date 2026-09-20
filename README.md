# houd11 — القرآن الكريم وتفسير السعدي

<div align="center">

![houd11](https://img.shields.io/badge/houd11-القرآن_الكريم-teal?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-7-purple?style=flat-square&logo=vite)
![Capacitor](https://img.shields.io/badge/Capacitor-7-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

تطبيق إسلامي متكامل — القرآن الكريم بالرسم العثماني مع تفسير السعدي، مواقيت الصلاة، الأذان، الأذكار، واتجاه القبلة.

</div>

---

## ✨ المزايا

| الميزة | التفاصيل |
|--------|-----------|
| 📖 **القرآن الكريم** | كامل بالرسم العثماني، تصفح رأسي متواصل آية بعد آية |
| 📝 **تفسير السعدي** | تيسير الكريم الرحمن — تحت كل آية مباشرة |
| 🎙️ **تلاوة المنشاوي** | بث متواصل آية بعد آية بدون تكرار |
| 🕌 **مواقيت الصلاة** | حساب فلكي محلي (بدون إنترنت) لجميع الدول العربية |
| 📡 **الأذان التلقائي** | أذان القدس أو المدينة — يعمل حتى والتطبيق مغلق (أندرويد) |
| 🧭 **القبلة** | بوصلة حية دقيقة مع تعويض دوران الشاشة |
| 📿 **الأذكار** | مسبحة رقمية مع أذكار الصباح والمساء |
| 🔢 **أرقام غربية** | 0-9 في كل التطبيق بدون استثناء |
| 📱 **APK أندرويد** | تطبيق أصلي قابل للتثبيت المباشر (sideload) |

---

## 🏗️ التقنيات

```
React 19 + TypeScript + Vite 7 + Tailwind CSS 4
Capacitor 7 (Android APK)
adhan (حساب مواقيت الصلاة)
vite-plugin-singlefile (ملف HTML واحد)
```

---

## 📦 تشغيل المشروع محلياً

```bash
# تثبيت الاعتماديات
npm install

# تشغيل بيئة التطوير
npm run dev

# بناء الويب
npm run build

# معاينة الإنتاج
npm run preview
```

---

## 📱 بناء APK الأندرويد

### المتطلبات
- Node.js 20+
- JDK 21
- Android SDK 35

```bash
# بناء الويب أولاً
npm run build

# إعداد مشروع Android (مرة واحدة)
npx cap add android
node RAFEEQ/scripts/prepare-android.mjs
npx cap sync android

# البناء
cd android && ./gradlew assembleRelease
```

### البناء التلقائي (GitHub Actions)
كل `push` إلى `main` يبني APK تلقائياً ويرفعه كـ Artifact.
كل `tag` بصيغة `v*` ينشئ Release مع APK.

---

## 🔐 إعداد مفتاح التوقيع الدائم

لتوقيع APK بمفتاح ثابت (مطلوب للتحديثات المستقبلية):

```bash
# إنشاء المفتاح (مرة واحدة للأبد — احفظ الملف في مكان آمن)
keytool -genkey -v \
  -keystore noor-release.jks \
  -alias noor \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

ثم في GitHub → Settings → Secrets → Actions، أضف:

| السر | القيمة |
|------|--------|
| `KEYSTORE_BASE64` | `base64 -w 0 noor-release.jks` |
| `KEYSTORE_PASSWORD` | كلمة مرور الـ keystore |
| `KEY_ALIAS` | `noor` |
| `KEY_PASSWORD` | كلمة مرور المفتاح |

---

## 📁 هيكل المشروع

```
src/
  App.tsx                 الحالة العليا والتنسيق
  components/
    QuranView.tsx         عرض القرآن والتفسير والتلاوة
    AdhanView.tsx         إعدادات الأذان
    PrayerBar.tsx         شريط المواقيت وتحديد الموقع
    QiblaView.tsx         البوصلة واتجاه القبلة
    AthkarView.tsx        الأذكار والمسبحة
    HomeView.tsx          الصفحة الرئيسية
    ProfileView.tsx       الإعدادات والملف الشخصي
  lib/
    prayer.ts             حساب المواقيت (adhan lib)
    adhan.ts              مشغل الأذان والجدولة
    compass.ts            البوصلة الدقيقة
    recitation.ts         مشغل التلاوة المتواصلة
    api.ts                جلب القرآن والتفسير مع كاش
    store.ts              حالة التطبيق (localStorage)
    nativeAdhan.ts        إشعارات الأذان (أندرويد)
  data/
    surahs.ts             بيانات السور (114)
    cities.ts             المدن والدول (22 دولة عربية)
    athkar.ts             نصوص الأذكار
  assets/
    adhanAlaqsa.ts        أذان الأقصى (base64)
    adhanMadinah.ts       أذان المدينة (base64)
RAFEEQ/                   توثيق المشروع وحوكمته
.github/workflows/        بناء APK تلقائي
```

---

## 📊 المصادر

| المحتوى | المصدر |
|---------|--------|
| النص القرآني | [Tanzil](https://tanzil.net) — الرسم العثماني |
| تفسير السعدي | [tafsir_api](https://github.com/spa5k/tafsir_api) — تيسير الكريم الرحمن |
| التلاوة | [EveryAyah](https://everyayah.com) — الشيخ المنشاوي |
| المواقيت | [adhan-js](https://github.com/batoulapps/adhan-js) + طرق إقليمية رسمية |

---

## 🏛️ الحوكمة

يخضع هذا المشروع لـ **RAFEEQ Engineering Constitution V3** — نظام حوكمة يضمن:
- أمانة النص الديني (لا توليد، لا كتابة يدوية للنصوص القرآنية)
- ثوابت لا تُكسر (`RAFEEQ/INVARIANTS.md`)
- توثيق كل قرار هندسي (`RAFEEQ/DECISIONS/`)
- اختبارات آلية للمواقيت والبوصلة والأرقام

---

## 📄 الرخصة

MIT — استخدم حر مع الإشارة للمصدر.

النصوص الدينية (القرآن الكريم وتفسير السعدي) محفوظة لأصحابها وفق شروط مصادرها الأصلية.
