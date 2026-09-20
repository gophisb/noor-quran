// يُطبّق تخصيصات «نُور» فوق مشروع Android الذي يولّده Capacitor — idempotent وقابل لإعادة التشغيل
// يُستدعى بعد: npx cap add android  (أو تلقائيًا في CI)
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const APP = join(ROOT, "android", "app");
const MAIN = join(APP, "src", "main");
const RES = join(MAIN, "res");
if (!existsSync(join(ROOT, "android", "gradlew"))) {
  console.error("android/ غير موجود — شغّل: npx cap add android");
  process.exit(1);
}
const write = (rel, content) => {
  const p = join(ROOT, rel);
  mkdirSync(join(p, ".."), { recursive: true });
  writeFileSync(p, content);
  console.log("wrote", rel);
};

// 1) صوت الأذان في res/raw (يُفكّ من base64 المضمّن في المصدر)
for (const [ts, raw] of [["adhanAlaqsa.ts", "adhan_alaqsa.mp3"], ["adhanMadinah.ts", "adhan_madinah.mp3"]]) {
  const src = readFileSync(join(ROOT, "src", "assets", ts), "utf8");
  const b64 = src.match(/base64,([A-Za-z0-9+/=]+)/)[1];
  mkdirSync(join(RES, "raw"), { recursive: true });
  writeFileSync(join(RES, "raw", raw), Buffer.from(b64, "base64"));
  console.log("wrote android/app/src/main/res/raw/" + raw);
}

// 2) الصلاحيات
const manifestPath = join(MAIN, "AndroidManifest.xml");
let manifest = readFileSync(manifestPath, "utf8");
const perms = [
  "android.permission.INTERNET",
  "android.permission.ACCESS_COARSE_LOCATION",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.POST_NOTIFICATIONS",
  "android.permission.SCHEDULE_EXACT_ALARM",
  "android.permission.USE_EXACT_ALARM",
  "android.permission.RECEIVE_BOOT_COMPLETED",
  "android.permission.VIBRATE",
  "android.permission.WAKE_LOCK",
];
for (const p of perms) {
  if (!manifest.includes(`"${p}"`)) manifest = manifest.replace("</manifest>", `    <uses-permission android:name="${p}" />\n</manifest>`);
}
// الاتجاه عمودي افتراضيًا لثبات البوصلة والقراءة
if (!manifest.includes("android:screenOrientation")) manifest = manifest.replace('android:launchMode="singleTask"', 'android:launchMode="singleTask"\n            android:screenOrientation="portrait"');
writeFileSync(manifestPath, manifest);
console.log("patched AndroidManifest.xml");

// 3) الاسم والألوان
write("android/app/src/main/res/values/strings.xml", `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">نُور</string>
    <string name="title_activity_main">نُور</string>
    <string name="package_name">app.noor.quran</string>
    <string name="custom_url_scheme">app.noor.quran</string>
</resources>
`);
write("android/app/src/main/res/values/colors.xml", `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#0B1A22</color>
    <color name="colorPrimaryDark">#050B14</color>
    <color name="colorAccent">#5EEAD4</color>
</resources>
`);

// الخلفية تُعرَّف في ملف Capacitor الافتراضي ic_launcher_background.xml — نكتبه بلوننا بدل تكراره
write("android/app/src/main/res/values/ic_launcher_background.xml", `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#071019</color>
</resources>
`);
// الأيقونات النقطية القديمة لـ anydpi تُزال حتى لا تتعارض مع الـXML التكيفي
for (const f of ["ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png"]) { const p = join(RES, "mipmap-anydpi-v26", f); if (existsSync(p)) rmSync(p); }

// 4) أيقونة التطبيق التكيفية (Vector — نص خالص، تصمد في المستودع)
const foreground = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp"
    android:viewportWidth="108" android:viewportHeight="108">
    <!-- هلال -->
    <path android:fillColor="#E6C27A"
        android:pathData="M60,26 A24,24 0 1,0 60,82 A19,19 0 1,1 60,26 Z"/>
    <!-- نجمة ثمانية (زخرفة إسلامية) -->
    <path android:fillColor="#5EEAD4"
        android:pathData="M72,42 L75,50 L83,53 L75,56 L72,64 L69,56 L61,53 L69,50 Z"/>
    <!-- سطر مصحف -->
    <path android:strokeColor="#5EEAD4" android:strokeWidth="2.5" android:strokeLineCap="round"
        android:pathData="M34,88 L74,88"/>
</vector>
`;
write("android/app/src/main/res/drawable/ic_launcher_foreground.xml", foreground);
write("android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml", `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
`);
write("android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml", `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
`);
// أيقونة شريط الحالة للإشعار (أبيض أحادي)
write("android/app/src/main/res/drawable/ic_stat_noor.xml", `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24">
    <path android:fillColor="#FFFFFF" android:pathData="M12,3 A9,9 0 1,0 12,21 A7,7 0 1,1 12,3 Z"/>
</vector>
`);

// 5) الإصدار والتوقيع (release يوقَّع من متغيرات البيئة إن وُجدت، وإلا يُبنى debug)
const gradlePath = join(APP, "build.gradle");
let gradle = readFileSync(gradlePath, "utf8");
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const versionName = process.env.APP_VERSION || "0.3.0";
const versionCode = Number(process.env.APP_VERSION_CODE || versionName.split(".").reduce((a, b) => a * 100 + Number(b), 0));
gradle = gradle.replace(/versionCode \d+/, `versionCode ${versionCode}`).replace(/versionName "[^"]*"/, `versionName "${versionName}"`);
if (!gradle.includes("NOOR_SIGNING")) {
  gradle = gradle.replace(
    "    buildTypes {\n        release {",
    `    // NOOR_SIGNING — مفاتيح التوقيع من البيئة (CI) دون تخزينها في المستودع
    signingConfigs {
        release {
            if (System.getenv("KEYSTORE_FILE")) {
                storeFile file(System.getenv("KEYSTORE_FILE"))
                storePassword System.getenv("KEYSTORE_PASSWORD")
                keyAlias System.getenv("KEY_ALIAS")
                keyPassword System.getenv("KEY_PASSWORD")
            }
        }
    }
    buildTypes {
        release {
            if (System.getenv("KEYSTORE_FILE")) { signingConfig signingConfigs.release }`
  );
}
writeFileSync(gradlePath, gradle);
console.log(`patched build.gradle (versionName ${versionName}, versionCode ${versionCode}, app ${pkg.name})`);
console.log("DONE prepare-android");
