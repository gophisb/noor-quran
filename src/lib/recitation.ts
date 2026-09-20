// مشغّل تلاوة الشيخ محمد صديق المنشاوي (مرتل) — آية بعد آية بشكل متواصل
import { useCallback, useEffect, useRef, useState } from "react";

const pad = (n: number, w: number) => String(n).padStart(w, "0");
export const ayahAudioUrl = (surah: number, ayah: number) =>
  `https://everyayah.com/data/Minshawy_Murattal_128kbps/${pad(surah, 3)}${pad(ayah, 3)}.mp3`;
// مصدر بديل بالرقم العام للآية
export const ayahAudioFallback = (globalNumber: number) =>
  `https://cdn.islamic.network/quran/audio/128/ar.minshawi/${globalNumber}.mp3`;

let shared: HTMLAudioElement | null = null;
function audio() {
  if (!shared) {
    shared = new Audio();
    shared.preload = "auto";
  }
  return shared;
}

export interface RecitationState {
  playing: boolean;
  surah: number | null;
  ayah: number | null;
  loading: boolean;
  error: string | null;
}

interface Options {
  surah: number;
  totalAyahs: number;
  globalOf: (ayah: number) => number | undefined;
  onAyahChange?: (ayah: number) => void;
  onSurahEnd?: () => void;
}

export function useRecitation({ surah, totalAyahs, globalOf, onAyahChange, onSurahEnd }: Options) {
  const [state, setState] = useState<RecitationState>({ playing: false, surah: null, ayah: null, loading: false, error: null });
  const stateRef = useRef(state);
  stateRef.current = state;
  const triedFallback = useRef(false);
  const prefetch = useRef<HTMLAudioElement | null>(null);

  const loadAndPlay = useCallback(
    async (s: number, a: number, useFallback = false) => {
      const el = audio();
      el.pause();
      const g = globalOf(a);
      el.src = useFallback && g ? ayahAudioFallback(g) : ayahAudioUrl(s, a);
      setState({ playing: true, surah: s, ayah: a, loading: true, error: null });
      onAyahChange?.(a);
      try {
        await el.play();
        setState((st) => ({ ...st, loading: false }));
        // تحميل الآية التالية مسبقاً لتلاوة متصلة بلا انقطاع
        if (a < totalAyahs) {
          prefetch.current = prefetch.current ?? new Audio();
          prefetch.current.preload = "auto";
          prefetch.current.src = ayahAudioUrl(s, a + 1);
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setState((st) => ({ ...st, playing: false, loading: false, error: "تعذّر تشغيل التلاوة — تحقق من الاتصال بالإنترنت" }));
      }
    },
    [globalOf, onAyahChange, totalAyahs]
  );

  useEffect(() => {
    const el = audio();
    const onEnded = () => {
      const st = stateRef.current;
      if (!st.playing || st.ayah === null || st.surah === null) return;
      if (st.ayah < totalAyahs) {
        triedFallback.current = false;
        loadAndPlay(st.surah, st.ayah + 1);
      } else {
        setState((s) => ({ ...s, playing: false }));
        onSurahEnd?.();
      }
    };
    const onError = () => {
      const st = stateRef.current;
      if (!st.playing || st.ayah === null || st.surah === null) return;
      if (!triedFallback.current) {
        triedFallback.current = true;
        loadAndPlay(st.surah, st.ayah, true);
      } else {
        setState((s) => ({ ...s, playing: false, loading: false, error: "تعذّر تحميل صوت هذه الآية" }));
      }
    };
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);
    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
    };
  }, [loadAndPlay, totalAyahs, onSurahEnd]);

  const play = useCallback(
    (fromAyah = 1) => {
      triedFallback.current = false;
      loadAndPlay(surah, fromAyah);
    },
    [surah, loadAndPlay]
  );

  const stop = useCallback(() => {
    const el = audio();
    el.pause();
    el.currentTime = 0;
    setState((s) => ({ ...s, playing: false, loading: false }));
  }, []);

  const pause = useCallback(() => {
    audio().pause();
    setState((s) => ({ ...s, playing: false }));
  }, []);

  const resume = useCallback(async () => {
    const st = stateRef.current;
    if (st.ayah === null || st.surah !== surah) return play(1);
    try {
      await audio().play();
      setState((s) => ({ ...s, playing: true }));
    } catch {
      play(st.ayah);
    }
  }, [play, surah]);

  // إيقاف التلاوة عند تغيير السورة
  useEffect(() => {
    if (stateRef.current.surah !== null && stateRef.current.surah !== surah) stop();
  }, [surah, stop]);

  return { state, play, stop, pause, resume };
}
