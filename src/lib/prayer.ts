// مواقيت الصلاة — حساب فلكي محلي دقيق (يعمل بدون إنترنت) لأي نقطة على الأرض
import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  HighLatitudeRule,
  Madhab,
  PrayerTimes as AdhanPrayerTimes,
  Qibla,
} from "adhan";
import { COUNTRIES, type MethodKey } from "../data/cities";

export interface Coords {
  lat: number;
  lng: number;
}

export interface LocationState {
  coords: Coords;
  label: string;
  tz: string; // IANA timezone
  method: MethodKey;
  source: "device" | "city" | "default";
  countryCode?: string;
  city?: string;
}

export type PrayerKey = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

export const PRAYER_ORDER: { key: PrayerKey; name: string }[] = [
  { key: "fajr", name: "الفجر" },
  { key: "sunrise", name: "الشروق" },
  { key: "dhuhr", name: "الظهر" },
  { key: "asr", name: "العصر" },
  { key: "maghrib", name: "المغرب" },
  { key: "isha", name: "العشاء" },
];

export const KAABA: Coords = { lat: 21.422487, lng: 39.826206 };

export const DEFAULT_LOCATION: LocationState = {
  coords: { lat: 31.7683, lng: 35.2137 },
  label: "القدس، فلسطين",
  tz: "Asia/Jerusalem",
  method: "Jordan",
  source: "default",
  countryCode: "PS",
  city: "القدس",
};

/** طرق حساب إقليمية غير مضمّنة في المكتبة — الزوايا حسب الجهات الرسمية */
const REGIONAL: Partial<Record<MethodKey, () => CalculationParameters>> = {
  Jordan: () => {
    const p = new CalculationParameters("Other", 18, 18);
    p.methodAdjustments = { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 5, isha: 0 };
    return p;
  },
  Tunisia: () => new CalculationParameters("Other", 18, 18),
  Libya: () => new CalculationParameters("Other", 18.5, 18.5),
  Morocco: () => {
    const p = new CalculationParameters("Other", 19, 17);
    p.methodAdjustments = { fajr: 0, sunrise: 0, dhuhr: 5, asr: 0, maghrib: 5, isha: 0 };
    return p;
  },
  Algeria: () => {
    const p = new CalculationParameters("Other", 18, 17);
    p.methodAdjustments = { fajr: 0, sunrise: 0, dhuhr: 3, asr: 0, maghrib: 3, isha: 0 };
    return p;
  },
};

export function paramsFor(method: MethodKey, madhab: "shafi" | "hanafi" = "shafi", coords?: Coords): CalculationParameters {
  const builtin = CalculationMethod as unknown as Record<string, () => CalculationParameters>;
  const factory = REGIONAL[method] ?? builtin[method] ?? CalculationMethod.MuslimWorldLeague;
  let p: CalculationParameters;
  try {
    p = factory();
  } catch {
    p = CalculationMethod.MuslimWorldLeague();
  }
  p.madhab = madhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  try {
    p.highLatitudeRule = coords
      ? HighLatitudeRule.recommended(new Coordinates(coords.lat, coords.lng))
      : HighLatitudeRule.MiddleOfTheNight;
  } catch {
    p.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
  }
  return p;
}

function safeCoords(coords: Coords): Coords {
  const lat = Number(coords?.lat);
  const lng = Number(coords?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return DEFAULT_LOCATION.coords;
  }
  return { lat, lng };
}

export interface DayTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

export function computeTimes(loc: LocationState, date = new Date(), madhab: "shafi" | "hanafi" = "shafi"): DayTimes {
  const coords = safeCoords(loc?.coords ?? DEFAULT_LOCATION.coords);
  try {
    const pt = new AdhanPrayerTimes(new Coordinates(coords.lat, coords.lng), date, paramsFor(loc?.method ?? "MuslimWorldLeague", madhab, coords));
    return { fajr: pt.fajr, sunrise: pt.sunrise, dhuhr: pt.dhuhr, asr: pt.asr, maghrib: pt.maghrib, isha: pt.isha };
  } catch {
    const pt = new AdhanPrayerTimes(
      new Coordinates(DEFAULT_LOCATION.coords.lat, DEFAULT_LOCATION.coords.lng),
      date,
      CalculationMethod.MuslimWorldLeague()
    );
    return { fajr: pt.fajr, sunrise: pt.sunrise, dhuhr: pt.dhuhr, asr: pt.asr, maghrib: pt.maghrib, isha: pt.isha };
  }
}

/** تنسيق وقت بحسب المنطقة الزمنية للموقع المختار */
export function formatTime(d: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat("ar-EG-u-nu-latn", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz }).format(d);
  } catch {
    return new Intl.DateTimeFormat("ar-EG-u-nu-latn", { hour: "numeric", minute: "2-digit", hour12: true }).format(d);
  }
}

export function hijriDate(d = new Date(), tz?: string): string {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-latn", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: tz,
    }).format(d);
  } catch {
    return "";
  }
}

export function gregorianDate(d = new Date(), tz?: string): string {
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "numeric", month: "long", year: "numeric", timeZone: tz }).format(d);
}

export interface NextPrayer {
  key: PrayerKey;
  name: string;
  at: Date;
  remainingMs: number;
}

/** الصلاة القادمة (تستثني الشروق) مع مراعاة يوم الغد */
export function nextPrayer(loc: LocationState, now = new Date(), madhab: "shafi" | "hanafi" = "shafi"): NextPrayer {
  const today = computeTimes(loc, now, madhab);
  const list = PRAYER_ORDER.filter((p) => p.key !== "sunrise");
  for (const p of list) {
    const at = today[p.key];
    if (at.getTime() > now.getTime()) return { key: p.key, name: p.name, at, remainingMs: at.getTime() - now.getTime() };
  }
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const t = computeTimes(loc, tomorrow, madhab);
  return { key: "fajr", name: "الفجر", at: t.fajr, remainingMs: t.fajr.getTime() - now.getTime() };
}

export function currentPrayerKey(times: DayTimes, now = new Date()): PrayerKey {
  let cur: PrayerKey = "isha";
  for (const p of PRAYER_ORDER) {
    if (times[p.key].getTime() <= now.getTime()) cur = p.key;
  }
  return cur;
}

export function getDeviceLocation(): Promise<Coords | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 10000, maximumAge: 300000, enableHighAccuracy: true }
    );
  });
}

/** اختيار طريقة الحساب المناسبة تلقائياً بحسب أقرب دولة عربية، أو رابطة العالم الإسلامي كافتراضي عالمي */
export function autoMethod(coords: Coords): MethodKey {
  let best: { d: number; m: MethodKey } | null = null;
  for (const c of COUNTRIES) {
    for (const city of c.cities) {
      const d = Math.hypot(city.lat - coords.lat, city.lng - coords.lng);
      if (!best || d < best.d) best = { d, m: c.method };
    }
  }
  return best && best.d < 6 ? best.m : "MuslimWorldLeague";
}

export function deviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function qiblaBearing(from: Coords): number {
  return Qibla(new Coordinates(from.lat, from.lng));
}

export function distanceToKaaba(from: Coords): number {
  const R = 6371;
  const φ1 = (from.lat * Math.PI) / 180;
  const φ2 = (KAABA.lat * Math.PI) / 180;
  const Δφ = ((KAABA.lat - from.lat) * Math.PI) / 180;
  const Δλ = ((KAABA.lng - from.lng) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
