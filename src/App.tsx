import { Suspense, useCallback, useEffect, useState } from "react";
import Background from "./components/Background";
import Nav, { type View } from "./components/Nav";
import PrayerBar from "./components/PrayerBar";
import HomeView from "./components/HomeView";
import QuranView from "./components/QuranView";
import AthkarView from "./components/AthkarView";
import QiblaView from "./components/QiblaView";
import ProfileView from "./components/ProfileView";
import AdhanView from "./components/AdhanView";
import { autoMethod, DEFAULT_LOCATION, deviceTimezone, getDeviceLocation, type LocationState } from "./lib/prayer";
import { useAdhanPlayer, useAdhanScheduler, useAdhanSettings } from "./lib/adhan";
import { isNative, scheduleNativeAdhan } from "./lib/nativeAdhan";
import { App as CapApp } from "@capacitor/app";
import { useBookmarks, useLastRead, useLocalState, useSettings } from "./lib/store";
import { fmt } from "./lib/api";

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const h = now.getHours();
  const hh = h % 12 === 0 ? 12 : h % 12;
  return (
    <span className="tabular-nums">
      {fmt(hh)}:{fmt(String(now.getMinutes()).padStart(2, "0"))}
      <span className="text-xs text-white/50"> {h >= 12 ? "م" : "ص"}</span>
    </span>
  );
}

export default function App() {
  const [view, setView] = useState<View>("home");
  const [settings, setSettings] = useSettings();
  const [lastRead, setLastRead] = useLastRead();
  const { bookmarks, toggle, has } = useBookmarks();
  const [location, setLocation] = useLocalState<LocationState>("noor:location", DEFAULT_LOCATION);
  const [adhanSettings, setAdhanSettings] = useAdhanSettings();
  const player = useAdhanPlayer(adhanSettings);
  const [banner, setBanner] = useState<string | null>(null);

  // أول تشغيل: محاولة تحديد الموقع تلقائياً إن لم يختر المستخدم موقعاً
  useEffect(() => {
    if (location.source !== "default") return;
    let cancelled = false;
    getDeviceLocation().then((coords) => {
      if (cancelled || !coords) return;
      setLocation({
        coords,
        label: `موقعك الحالي (${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)})`,
        tz: deviceTimezone(),
        method: autoMethod(coords),
        source: "device",
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFire = useCallback((key: string) => {
    const names: Record<string, string> = { fajr: "الفجر", dhuhr: "الظهر", asr: "العصر", maghrib: "المغرب", isha: "العشاء" };
    setBanner(`حان الآن موعد صلاة ${names[key] ?? ""}`);
  }, []);
  // على الويب: الجدولة داخل الصفحة. على أندرويد: الإشعار المحلي بصوت الأذان هو المصدر الوحيد (يعمل والتطبيق مغلق)
  const webScheduler = isNative() ? { ...adhanSettings, enabled: false } : adhanSettings;
  useAdhanScheduler(location, webScheduler, player.play, onFire);

  useEffect(() => {
    if (!isNative()) return;
    const reschedule = () => scheduleNativeAdhan(location, adhanSettings).catch(() => undefined);
    reschedule();
    const sub = CapApp.addListener("resume", reschedule);
    return () => {
      sub.then((h) => h.remove());
    };
  }, [location, adhanSettings]);

  useEffect(() => {
    if (!player.playing) setBanner(null);
  }, [player.playing]);

  const openAyah = useCallback(
    (surah: number, ayah: number) => {
      setLastRead({ surah, ayah });
      setView("quran");
    },
    [setLastRead]
  );

  const navigate = useCallback((surah: number, ayah: number) => setLastRead({ surah, ayah }), [setLastRead]);

  return (
    <div className="relative min-h-screen pb-24 lg:pb-8">
      <Background />

      {banner && (
        <div className="fixed inset-x-3 top-3 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-gold/50 bg-[#0a1a1c]/95 px-4 py-3 shadow-[0_0_40px_rgba(230,194,122,0.3)] backdrop-blur-xl">
          <div>
            <div className="text-sm font-bold text-gold">{banner}</div>
            <div className="text-[11px] text-white/60">{location.label}</div>
          </div>
          <button onClick={player.stop} className="rounded-full border border-gold/40 bg-gold/15 px-4 py-1.5 text-xs text-gold">
            ■ إيقاف الأذان
          </button>
        </div>
      )}

      <header className="pt-5 text-center sm:pt-7">
        <h1 className="font-title text-3xl gold-text sm:text-4xl">نُور</h1>
        <p className="mt-1 text-xs text-white/55 sm:text-sm">
          القرآن الكريم وتفسير السعدي · <Clock />
        </p>
      </header>

      <main className="mx-auto mt-5 flex max-w-7xl gap-4 px-3 sm:px-5">
        <Nav view={view} onChange={setView} />

        <div className="min-w-0 flex-1 space-y-4">
          <PrayerBar location={location} onLocation={setLocation} madhab={adhanSettings.madhab} adhanEnabled={adhanSettings.enabled} onOpenAdhan={() => setView("adhan")} />

          <div className="fade-up" key={view}>
            <Suspense fallback={<div className="glass rounded-3xl p-8 text-center text-sm text-white/60">جارٍ فتح القسم…</div>}>
            {view === "home" && <HomeView lastRead={lastRead} bookmarks={bookmarks} name={settings.name} onOpen={openAyah} onGo={setView} />}
            {view === "quran" && (
              <QuranView
                surah={lastRead.surah}
                ayah={lastRead.ayah}
                onNavigate={navigate}
                settings={settings}
                onToggleTafsir={() => setSettings({ ...settings, showTafsir: !settings.showTafsir })}
                bookmarks={{ has, toggle }}
              />
            )}
            {view === "adhan" && <AdhanView settings={adhanSettings} onChange={setAdhanSettings} location={location} onLocation={setLocation} player={player} />}
            {view === "athkar" && <AthkarView fontScale={settings.fontScale} />}
            {view === "qibla" && <QiblaView location={location} onLocation={setLocation} />}
            {view === "profile" && (
              <ProfileView settings={settings} onChange={setSettings} lastRead={lastRead} bookmarks={bookmarks} onOpen={openAyah} onToggleBookmark={toggle} />
            )}
            </Suspense>
          </div>
        </div>
      </main>

      <footer className="mt-8 pb-4 text-center text-[11px] text-white/35">﴿وَنُنَزِّلُ مِنَ ٱلْقُرْءَانِ مَا هُوَ شِفَآءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ﴾</footer>
    </div>
  );
}
