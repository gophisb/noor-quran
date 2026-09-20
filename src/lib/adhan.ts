// محرك الأذان: تشغيل/إيقاف موثوق + جدولة تلقائية عند دخول الوقت
import { useCallback, useEffect, useRef, useState } from "react";
import { ADHAN_ALAQSA as alaqsa, ADHAN_MADINAH as madinah } from "../assets";
import { useLocalState } from "./store";
import { computeTimes, PRAYER_ORDER, type LocationState, type PrayerKey } from "./prayer";

export const MUADHINS = [
  { id: "alaqsa", name: "أذان المسجد الأقصى — القدس", src: alaqsa },
  { id: "madinah", name: "أذان المسجد النبوي — المدينة", src: madinah },
] as const;
export type MuadhinId = (typeof MUADHINS)[number]["id"];

export interface AdhanSettings {
  enabled: boolean;
  muadhin: MuadhinId;
  volume: number; // 0–1
  perPrayer: Record<Exclude<PrayerKey, "sunrise">, boolean>;
  madhab: "shafi" | "hanafi";
}

export const DEFAULT_ADHAN: AdhanSettings = {
  enabled: true,
  muadhin: "alaqsa",
  volume: 1,
  perPrayer: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
  madhab: "shafi",
};

export function useAdhanSettings() {
  return useLocalState<AdhanSettings>("noor:adhan", DEFAULT_ADHAN);
}

/** عنصر صوتي واحد مشترك في التطبيق كله لضمان أن الإيقاف يعمل دائماً */
let sharedAudio: HTMLAudioElement | null = null;
function getAudio() {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = "auto";
  }
  return sharedAudio;
}

/**
 * فتح قفل الصوت عند أول تفاعل من المستخدم — بدونه تمنع المتصفحات التشغيل التلقائي
 * عند دخول وقت الصلاة. يُنفَّذ مرة واحدة فقط.
 */
let unlocked = false;
export function unlockAudioOnFirstGesture() {
  if (unlocked) return;
  const unlock = () => {
    if (unlocked) return;
    const a = getAudio();
    a.muted = true;
    a.src = MUADHINS[0].src;
    a.play()
      .then(() => {
        a.pause();
        a.currentTime = 0;
        unlocked = true;
      })
      .catch(() => {
        /* سيُعاد عند اللمسة التالية */
      })
      .finally(() => {
        a.muted = false;
      });
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock);
}

export function useAdhanPlayer(settings: AdhanSettings) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    unlockAudioOnFirstGesture();
    const a = getAudio();
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    const onTime = () => setProgress(a.duration ? a.currentTime / a.duration : 0);
    const onPause = () => setPlaying(!a.paused && !a.ended);
    const onPlay = () => setPlaying(true);
    a.addEventListener("ended", onEnd);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("pause", onPause);
    a.addEventListener("play", onPlay);
    return () => {
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("play", onPlay);
    };
  }, []);

  useEffect(() => {
    getAudio().volume = settings.volume;
  }, [settings.volume]);

  const stop = useCallback(() => {
    const a = getAudio();
    a.pause();
    a.currentTime = 0;
    setPlaying(false);
    setProgress(0);
  }, []);

  const play = useCallback(
    async (muadhin?: MuadhinId) => {
      const a = getAudio();
      const m = MUADHINS.find((x) => x.id === (muadhin ?? settings.muadhin)) ?? MUADHINS[0];
      // إيقاف أي تشغيل سابق قبل البدء
      a.pause();
      a.muted = false;
      if (!a.src.endsWith(m.src)) a.src = m.src;
      a.currentTime = 0;
      a.volume = settings.volume;
      setError(null);
      try {
        await a.play();
        setPlaying(true);
      } catch (e) {
        if ((e as Error).name === "AbortError") return; // تشغيل جديد قاطع السابق — ليس خطأ
        setError("تعذّر تشغيل الصوت — اضغط زر التشغيل مرة أخرى للسماح بالصوت.");
        setPlaying(false);
      }
    },
    [settings.muadhin, settings.volume]
  );

  const toggle = useCallback(() => (playing ? stop() : play()), [playing, play, stop]);

  return { playing, progress, error, play, stop, toggle };
}

/** الجدولة: يفحص كل ثانية هل دخل وقت صلاة مفعّلة فيرفع الأذان مرة واحدة فقط */
export function useAdhanScheduler(
  location: LocationState,
  settings: AdhanSettings,
  play: () => void,
  onFire?: (key: PrayerKey) => void
) {
  const firedRef = useRef<string>("");
  useEffect(() => {
    if (!settings.enabled) return;
    const id = setInterval(() => {
      const now = new Date();
      const times = computeTimes(location, now, settings.madhab);
      for (const p of PRAYER_ORDER) {
        if (p.key === "sunrise") continue;
        if (!settings.perPrayer[p.key as keyof AdhanSettings["perPrayer"]]) continue;
        const t = times[p.key].getTime();
        const diff = now.getTime() - t;
        // نافذة 60 ثانية بعد دخول الوقت
        if (diff >= 0 && diff < 60_000) {
          const stamp = `${now.toDateString()}-${p.key}`;
          if (firedRef.current !== stamp) {
            firedRef.current = stamp;
            play();
            onFire?.(p.key);
            if ("Notification" in window && Notification.permission === "granted") {
              try {
                new Notification(`حان الآن موعد صلاة ${p.name}`, { body: location.label, silent: true });
              } catch {
                /* ignore */
              }
            }
          }
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, [location, settings, play, onFire]);
}
