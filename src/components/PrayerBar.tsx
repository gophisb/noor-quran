import { useEffect, useMemo, useState } from "react";
import { COUNTRIES, METHOD_LABELS, type MethodKey } from "../data/cities";
import { fmt } from "../lib/api";
import {
  autoMethod,
  computeTimes,
  currentPrayerKey,
  deviceTimezone,
  formatTime,
  getDeviceLocation,
  gregorianDate,
  hijriDate,
  nextPrayer,
  PRAYER_ORDER,
  type LocationState,
} from "../lib/prayer";
import { cn } from "../utils/cn";
import { PinIcon } from "./Icons";

interface Props {
  location: LocationState;
  onLocation: (l: LocationState) => void;
  madhab: "shafi" | "hanafi";
  adhanEnabled: boolean;
  onOpenAdhan: () => void;
}

export function LocationPicker({ location, onLocation, onClose }: { location: LocationState; onLocation: (l: LocationState) => void; onClose: () => void }) {
  const [country, setCountry] = useState(location.countryCode ?? "PS");
  const [locating, setLocating] = useState(false);
  const [manualLat, setManualLat] = useState(String(location.coords.lat.toFixed(4)));
  const [manualLng, setManualLng] = useState(String(location.coords.lng.toFixed(4)));
  const [method, setMethod] = useState<MethodKey>(location.method);
  const c = COUNTRIES.find((x) => x.code === country)!;

  const useDevice = async () => {
    setLocating(true);
    const coords = await getDeviceLocation();
    setLocating(false);
    if (!coords) {
      alert("تعذّر تحديد الموقع. تأكد من منح الإذن أو اختر المدينة يدوياً.");
      return;
    }
    onLocation({
      coords,
      label: `موقعك الحالي (${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)})`,
      tz: deviceTimezone(),
      method: autoMethod(coords),
      source: "device",
    });
    onClose();
  };

  const applyManual = () => {
    const lat = Number(manualLat);
    const lng = Number(manualLng);
    if (Number.isNaN(lat) || Number.isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      alert("إحداثيات غير صحيحة");
      return;
    }
    onLocation({ coords: { lat, lng }, label: `إحداثيات مخصصة`, tz: deviceTimezone(), method, source: "device" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="glass scroll-thin relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 text-center font-title text-2xl gold-text">تحديد الموقع</h3>

        <button
          onClick={useDevice}
          disabled={locating}
          className="tap-press mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-teal-300/40 bg-teal-400/15 py-3 text-sm text-teal-100 hover:bg-teal-400/25 disabled:opacity-50"
        >
          <PinIcon width={18} height={18} /> {locating ? "جارٍ تحديد الموقع…" : "استخدام موقعي الحالي (GPS) — أي مكان في العالم"}
        </button>

        <div className="mb-2 text-xs text-white/50">أو اختر من الدول العربية</div>
        <div className="scroll-thin mb-3 flex gap-1.5 overflow-x-auto pb-2">
          {COUNTRIES.map((k) => (
            <button
              key={k.code}
              onClick={() => setCountry(k.code)}
              className={cn(
                "shrink-0 rounded-xl border px-3 py-1.5 text-xs transition",
                k.code === country ? "border-teal-300/50 bg-teal-400/20 text-teal-100" : "border-white/10 bg-white/5 text-white/70"
              )}
            >
              {k.flag} {k.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {c.cities.map((city) => (
            <button
              key={city.name}
              onClick={() => {
                onLocation({
                  coords: { lat: city.lat, lng: city.lng },
                  label: `${city.name}، ${c.name}`,
                  tz: c.tz,
                  method: c.method,
                  source: "city",
                  countryCode: c.code,
                  city: city.name,
                });
                onClose();
              }}
              className={cn(
                "rounded-xl border px-2 py-2 text-sm transition",
                location.city === city.name && location.countryCode === c.code
                  ? "border-gold/50 bg-gold/15 text-gold"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              )}
            >
              {city.name}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-white/45">طريقة الحساب المعتمدة: {METHOD_LABELS[c.method]}</p>

        <details className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
          <summary className="cursor-pointer text-xs text-white/70">إدخال إحداثيات يدوياً (لأي بقعة على الأرض)</summary>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <input value={manualLat} onChange={(e) => setManualLat(e.target.value)} placeholder="خط العرض" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-teal-300/50" dir="ltr" />
            <input value={manualLng} onChange={(e) => setManualLng(e.target.value)} placeholder="خط الطول" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-teal-300/50" dir="ltr" />
          </div>
          <select value={method} onChange={(e) => setMethod(e.target.value as MethodKey)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none">
            {(Object.keys(METHOD_LABELS) as MethodKey[]).map((m) => (
              <option key={m} value={m} className="bg-slate-900">{METHOD_LABELS[m]}</option>
            ))}
          </select>
          <button onClick={applyManual} className="mt-2 w-full rounded-xl bg-teal-400/20 py-2 text-sm text-teal-100">تطبيق</button>
        </details>
      </div>
    </div>
  );
}

export default function PrayerBar({ location, onLocation, madhab, adhanEnabled, onOpenAdhan }: Props) {
  const [now, setNow] = useState(new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // المواقيت ثابتة خلال اليوم؛ نعيد الحساب فقط عند تغيّر اليوم أو الموقع أو المذهب
  const dayKey = now.toDateString();
  const times = useMemo(() => computeTimes(location, new Date(dayKey), madhab), [location, madhab, dayKey]);
  const next = nextPrayer(location, now, madhab);
  const current = currentPrayerKey(times, now);
  const rem = Math.max(0, Math.floor(next.remainingMs / 1000));
  const hh = Math.floor(rem / 3600), mm = Math.floor((rem % 3600) / 60), ss = rem % 60;

  return (
    <div className="glass rounded-3xl p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 sm:w-56 sm:shrink-0 sm:border-l sm:border-white/10 sm:pl-4">
          <button
            onClick={onOpenAdhan}
            className={cn(
              "relative grid h-12 w-12 shrink-0 place-items-center rounded-full border transition",
              adhanEnabled ? "border-teal-300/40 bg-teal-400/10" : "border-white/15 bg-white/5"
            )}
            title="إعدادات الأذان"
          >
            {adhanEnabled && <span className="absolute inset-0 rounded-full border border-teal-300/40 pulse-ring" />}
            <span className={cn("text-xl", adhanEnabled ? "text-teal-200" : "text-white/40")}>{adhanEnabled ? "🔔" : "🔕"}</span>
          </button>
          <div className="leading-tight">
            <div className="text-[11px] text-teal-200/70">الصلاة القادمة</div>
            <div className="text-lg font-bold text-white">{next.name}</div>
            <div className="text-[11px] tabular-nums text-white/60">
              بعد {fmt(String(hh).padStart(2, "0"))}:{fmt(String(mm).padStart(2, "0"))}:{fmt(String(ss).padStart(2, "0"))}
            </div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-6 gap-1">
          {PRAYER_ORDER.map((p) => {
            const isCurrent = current === p.key;
            const isNext = next.key === p.key;
            return (
              <div
                key={p.key}
                className={cn(
                  "flex flex-col items-center rounded-2xl px-1 py-2 transition",
                  isCurrent && "bg-teal-400/10 ring-1 ring-teal-300/40",
                  isNext && !isCurrent && "bg-white/5"
                )}
              >
                <span className={cn("text-[10px]", isCurrent ? "text-teal-200" : "text-white/40")}>{isCurrent ? "●" : "○"}</span>
                <span className={cn("font-amiri text-base sm:text-lg", isCurrent ? "glow-text text-teal-100" : "text-white/85")}>{p.name}</span>
                <span className="text-[11px] tabular-nums text-white/60 sm:text-xs">{formatTime(times[p.key], location.tz)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-1 border-t border-white/5 pt-2 text-[11px] text-white/50">
        <span>{hijriDate(now, location.tz)}</span>
        <button onClick={() => setPickerOpen(true)} className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-teal-100 hover:bg-white/10">
          <PinIcon width={13} height={13} /> {location.label} — تغيير
        </button>
        <span>{gregorianDate(now, location.tz)}</span>
      </div>

      {pickerOpen && <LocationPicker location={location} onLocation={onLocation} onClose={() => setPickerOpen(false)} />}
    </div>
  );
}
