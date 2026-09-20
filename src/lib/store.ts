import { useCallback, useEffect, useState } from "react";

export interface Settings {
  fontScale: number; // 0.8 – 1.6
  showTafsir: boolean;
  name: string;
}

export interface LastRead {
  surah: number;
  ayah: number;
}

export interface Bookmark {
  surah: number;
  ayah: number;
  addedAt: number;
}

const DEFAULT_SETTINGS: Settings = { fontScale: 1, showTafsir: true, name: "" };

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? { ...initial, ...(JSON.parse(raw) as T) } : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

export function useSettings() {
  return useLocalState<Settings>("noor:settings", DEFAULT_SETTINGS);
}

export function useLastRead() {
  return useLocalState<LastRead>("noor:lastRead", { surah: 1, ayah: 1 });
}

export function useBookmarks() {
  const [list, setList] = useLocalState<Bookmark[]>("noor:bookmarks", []);
  const toggle = useCallback(
    (surah: number, ayah: number) =>
      setList((prev) => {
        const exists = prev.some((b) => b.surah === surah && b.ayah === ayah);
        return exists
          ? prev.filter((b) => !(b.surah === surah && b.ayah === ayah))
          : [{ surah, ayah, addedAt: Date.now() }, ...prev];
      }),
    [setList]
  );
  const has = useCallback(
    (surah: number, ayah: number) => list.some((b) => b.surah === surah && b.ayah === ayah),
    [list]
  );
  return { bookmarks: list, toggle, has };
}

export interface AthkarProgress {
  [dhikrId: string]: number;
}

export function useAthkarProgress() {
  const today = new Date().toDateString();
  const [state, setState] = useLocalState<{ day: string; progress: AthkarProgress }>("noor:athkar", {
    day: today,
    progress: {},
  });
  // إعادة التعيين يومياً
  useEffect(() => {
    if (state.day !== today) setState({ day: today, progress: {} });
  }, [state.day, today, setState]);
  const setCount = useCallback(
    (id: string, n: number) => setState((s) => ({ day: today, progress: { ...s.progress, [id]: n } })),
    [setState, today]
  );
  const resetAll = useCallback(() => setState({ day: today, progress: {} }), [setState, today]);
  return { progress: state.progress, setCount, resetAll };
}
