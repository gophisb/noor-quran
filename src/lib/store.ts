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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isSettings = (value: unknown): value is Settings =>
  isRecord(value) &&
  Number.isFinite(value.fontScale) &&
  value.fontScale >= 0.5 &&
  value.fontScale <= 2 &&
  typeof value.showTafsir === "boolean" &&
  typeof value.name === "string";

const isLastRead = (value: unknown): value is LastRead =>
  isRecord(value) &&
  Number.isInteger(value.surah) &&
  value.surah >= 1 &&
  value.surah <= 114 &&
  Number.isInteger(value.ayah) &&
  value.ayah >= 1 &&
  value.ayah <= 300;

const isBookmark = (value: unknown): value is Bookmark =>
  isRecord(value) &&
  Number.isInteger(value.surah) &&
  value.surah >= 1 &&
  value.surah <= 114 &&
  Number.isInteger(value.ayah) &&
  value.ayah >= 1 &&
  value.ayah <= 300 &&
  Number.isFinite(value.addedAt);

const isBookmarks = (value: unknown): value is Bookmark[] =>
  Array.isArray(value) && value.every(isBookmark);

const isAthkarState = (value: unknown): value is { day: string; progress: Record<string, number> } =>
  isRecord(value) &&
  typeof value.day === "string" &&
  isRecord(value.progress) &&
  Object.values(value.progress).every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0);

function hydrate<T>(initial: T, raw: string, validate?: (value: unknown) => value is T): T {
  const parsed: unknown = JSON.parse(raw);

  if (Array.isArray(initial)) {
    if (!Array.isArray(parsed)) return initial;
    return !validate || validate(parsed) ? (parsed as T) : initial;
  }

  if (isRecord(initial) && isRecord(parsed)) {
    const merged = { ...initial, ...parsed };
    return !validate || validate(merged) ? (merged as T) : initial;
  }

  return !validate || validate(parsed) ? (parsed as T) : initial;
}

export function useLocalState<T>(
  key: string,
  initial: T,
  validate?: (value: unknown) => value is T
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? hydrate(initial, raw, validate) : initial;
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
  return useLocalState<Settings>("noor:settings", DEFAULT_SETTINGS, isSettings);
}

export function useLastRead() {
  return useLocalState<LastRead>("noor:lastRead", { surah: 1, ayah: 1 }, isLastRead);
}

export function useBookmarks() {
  const [list, setList] = useLocalState<Bookmark[]>("noor:bookmarks", [], isBookmarks);

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
  const initial = { day: today, progress: {} as AthkarProgress };
  const [state, setState] = useLocalState("noor:athkar", initial, isAthkarState);

  useEffect(() => {
    if (state.day !== today) setState({ day: today, progress: {} });
  }, [state.day, today, setState]);

  const setCount = useCallback(
    (id: string, n: number) =>
      setState((s) => ({ day: today, progress: { ...s.progress, [id]: Math.max(0, n) } })),
    [setState, today]
  );

  const resetAll = useCallback(() => setState({ day: today, progress: {} }), [setState, today]);

  return { progress: state.progress, setCount, resetAll };
}
