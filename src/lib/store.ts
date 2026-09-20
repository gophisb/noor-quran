import { useCallback, useEffect, useState } from "react";

export interface Settings {
  fontScale: number;
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

function hydrate<T>(initial: T, raw: string): T {
  const parsed: unknown = JSON.parse(raw);

  if (Array.isArray(initial)) {
    return Array.isArray(parsed) ? (parsed as T) : initial;
  }

  if (
    initial !== null &&
    typeof initial === "object" &&
    !Array.isArray(initial) &&
    parsed !== null &&
    typeof parsed === "object" &&
    !Array.isArray(parsed)
  ) {
    return { ...initial, ...(parsed as object) } as T;
  }

  return parsed as T;
}

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? hydrate(initial, raw) : initial;
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
