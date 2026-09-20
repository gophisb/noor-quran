// يقارن محرك المواقيت المحلي (adhan) بمرجع خارجي (AlAdhan API) — الحد المقبول: ≤ 3 دقائق لكل صلاة
import { CalculationMethod, CalculationParameters, Coordinates, PrayerTimes, HighLatitudeRule } from "adhan";

const CASES = [
  { name: "Jerusalem", lat: 31.7683, lng: 35.2137, tz: "Asia/Jerusalem", local: () => { const p = new CalculationParameters("Other", 18, 18); p.methodAdjustments = { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 5, isha: 0 }; return p; }, ref: 23 },
  { name: "Makkah", lat: 21.4225, lng: 39.8262, tz: "Asia/Riyadh", local: CalculationMethod.UmmAlQura, ref: 4 },
  { name: "Cairo", lat: 30.0444, lng: 31.2357, tz: "Africa/Cairo", local: CalculationMethod.Egyptian, ref: 5 },
  { name: "Rabat", lat: 34.0209, lng: -6.8416, tz: "Africa/Casablanca", local: () => { const p = new CalculationParameters("Other", 19, 17); p.methodAdjustments = { fajr: 0, sunrise: 0, dhuhr: 5, asr: 0, maghrib: 5, isha: 0 }; return p; }, ref: 21 },
  { name: "Doha", lat: 25.2854, lng: 51.531, tz: "Asia/Qatar", local: CalculationMethod.Qatar, ref: 10 },
];
const KEYS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
const toMin = (d, tz) => { const [h, m] = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz }).format(d).split(":").map(Number); return h * 60 + m; };
const refMin = (s) => { const [h, m] = s.slice(0, 5).split(":").map(Number); return h * 60 + m; };

let worst = 0, failed = false;
for (const c of CASES) {
  const p = c.local(); p.highLatitudeRule = HighLatitudeRule.recommended(new Coordinates(c.lat, c.lng));
  const pt = new PrayerTimes(new Coordinates(c.lat, c.lng), new Date(), p);
  const local = { Fajr: pt.fajr, Sunrise: pt.sunrise, Dhuhr: pt.dhuhr, Asr: pt.asr, Maghrib: pt.maghrib, Isha: pt.isha };
  const r = await fetch(`https://api.aladhan.com/v1/timings?latitude=${c.lat}&longitude=${c.lng}&method=${c.ref}`).then((x) => x.json());
  const diffs = KEYS.map((k) => Math.abs(toMin(local[k], c.tz) - refMin(r.data.timings[k])));
  const max = Math.max(...diffs); worst = Math.max(worst, max);
  const ok = max <= 3; if (!ok) failed = true;
  console.log(`${ok ? "PASS" : "FAIL"} ${c.name.padEnd(10)} maxΔ=${max}min  Δ=[${diffs.join(",")}]`);
}
console.log(failed ? `RESULT: FAIL (worst ${worst} min)` : `RESULT: PASS (worst ${worst} min)`);
process.exit(failed ? 1 : 0);
