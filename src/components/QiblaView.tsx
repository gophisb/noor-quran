import { useState } from "react";
import { fmt } from "../lib/api";
import { angleDelta, useCompass } from "../lib/compass";
import { distanceToKaaba, qiblaBearing, type LocationState } from "../lib/prayer";
import { cn } from "../utils/cn";
import { PinIcon } from "./Icons";
import { LocationPicker } from "./PrayerBar";

interface Props {
  location: LocationState;
  onLocation: (l: LocationState) => void;
}

const DIRECTIONS: [string, number][] = [["ش", 0], ["ق", 90], ["ج", 180], ["غ", 270]];

export default function QiblaView({ location, onLocation }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { permission, reading, enable } = useCompass();

  const bearing = qiblaBearing(location.coords);
  const distance = distanceToKaaba(location.coords);
  const heading = reading.heading;

  // القرص يدور عكس اتجاه الجهاز ليبقى الشمال ثابتاً؛ والمؤشر يشير إلى القبلة نسبةً للقرص
  const dialRotation = heading === null ? 0 : -heading;
  const needleRotation = bearing + dialRotation;
  const offset = heading === null ? null : Math.abs(angleDelta(heading, bearing));
  const aligned = offset !== null && offset < 4;
  const turnHint = offset === null ? "" : angleDelta(heading!, bearing) > 0 ? "أدر الجهاز يميناً" : "أدر الجهاز يساراً";

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <section className="glass rounded-3xl p-4 sm:p-8">
        <h2 className="text-center font-title text-2xl gold-text sm:text-3xl">اتجاه القبلة</h2>
        <p className="mt-1 text-center text-xs text-white/50">{location.source === "device" ? "بناءً على موقعك الحالي (GPS)" : location.label}</p>
        <div className="mt-2 text-center">
          <button onClick={() => setPickerOpen(true)} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-teal-100 hover:bg-white/10">
            <PinIcon width={12} height={12} /> تغيير الموقع
          </button>
        </div>

        <div className="relative mx-auto mt-8 aspect-square w-full max-w-sm">
          <div className={cn("absolute inset-0 rounded-full border transition-shadow duration-500", aligned ? "border-gold/60 shadow-[0_0_60px_rgba(230,194,122,0.35)]" : "border-teal-300/30 shadow-[0_0_40px_rgba(94,234,212,0.15)]")} />

          <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full transition-transform duration-200 ease-out" style={{ transform: `rotate(${dialRotation}deg)` }}>
            {Array.from({ length: 72 }).map((_, i) => (
              <line key={i} x1="100" y1="6" x2="100" y2={i % 9 === 0 ? 18 : i % 3 === 0 ? 13 : 10} stroke={i % 18 === 0 ? "#5eead4" : "rgba(255,255,255,0.35)"} strokeWidth={i % 18 === 0 ? 2 : 1} transform={`rotate(${i * 5} 100 100)`} />
            ))}
            {DIRECTIONS.map(([label, angle]) => (
              <text key={label} x="100" y="34" textAnchor="middle" fill={angle === 0 ? "#5eead4" : "rgba(255,255,255,0.7)"} fontSize="12" fontWeight="700" transform={`rotate(${angle} 100 100)`} style={{ fontFamily: "Tajawal" }}>
                {label}
              </text>
            ))}
            <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(94,234,212,0.2)" strokeDasharray="2 6" />
          </svg>

          <div className="absolute inset-0 transition-transform duration-200 ease-out" style={{ transform: `rotate(${needleRotation}deg)` }}>
            <div className="absolute left-1/2 top-[13%] -translate-x-1/2">
              <div className={cn("h-0 w-0 border-x-[10px] border-b-[22px] border-x-transparent", aligned ? "border-b-gold" : "border-b-teal-300")} style={{ filter: "drop-shadow(0 0 8px rgba(94,234,212,.8))" }} />
            </div>
            <div className="absolute left-1/2 top-[24%] h-[26%] w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-teal-300 to-transparent" />
          </div>

          <div className="absolute inset-0 grid place-items-center">
            <div className={cn("grid h-16 w-16 place-items-center rounded-2xl border transition", aligned ? "border-gold bg-gold/20" : "border-teal-300/40 bg-black/50")}>
              <div className="relative h-9 w-9 rounded-sm bg-gradient-to-b from-zinc-800 to-black ring-1 ring-gold/60">
                <div className="absolute inset-x-0 top-2 h-1 bg-gold/70" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 text-center">
          <div className="glass-inner rounded-2xl p-3">
            <div className="text-[11px] text-white/50">زاوية القبلة من الشمال</div>
            <div className="mt-1 text-2xl font-bold text-teal-100">{fmt(bearing.toFixed(1))}°</div>
          </div>
          <div className="glass-inner rounded-2xl p-3">
            <div className="text-[11px] text-white/50">المسافة إلى الكعبة</div>
            <div className="mt-1 text-2xl font-bold text-teal-100">{Math.round(distance).toLocaleString("en-US")} كم</div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm">
          {permission === "granted" ? (
            heading === null ? (
              <p className="text-white/60">بانتظار بيانات البوصلة… حرّك الجهاز على شكل 8 للمعايرة</p>
            ) : aligned ? (
              <p className="font-bold text-gold">✓ أنت متجه نحو القبلة</p>
            ) : (
              <p className="text-teal-200">
                {turnHint} {fmt(Math.round(offset!))}° · اتجاهك الحالي {fmt(Math.round(heading))}°
              </p>
            )
          ) : (
            <button onClick={enable} className="tap-press rounded-full border border-teal-300/40 bg-teal-400/15 px-6 py-2.5 text-sm text-teal-100 hover:bg-teal-400/25">
              تفعيل البوصلة الحية
            </button>
          )}
          {permission === "granted" && heading !== null && (
            <p className="mt-1 text-[11px] text-white/40">
              المصدر: {reading.source === "relative" ? "نسبي (دقة أقل — أعد المعايرة)" : "مطلق"}
              {reading.accuracy !== null && ` · الدقة ±${fmt(Math.round(reading.accuracy))}°`}
            </p>
          )}
          {permission === "denied" && <p className="mt-2 text-xs text-red-300">تم رفض إذن البوصلة.</p>}
          {permission === "unsupported" && <p className="mt-2 text-xs text-white/50">البوصلة غير مدعومة على هذا الجهاز — استخدم الزاوية المعروضة مع بوصلة خارجية.</p>}
        </div>
      </section>

      <aside className="glass rounded-3xl p-5 text-sm leading-relaxed text-white/75">
        <h3 className="mb-3 font-bold text-teal-100">كيف تستخدم البوصلة؟</h3>
        <ol className="list-inside list-decimal space-y-2">
          <li>حدّد موقعك (GPS أو اختر مدينتك) لحساب زاوية القبلة.</li>
          <li>اضغط «تفعيل البوصلة الحية» وامسك الجهاز أفقياً بعيداً عن المعادن والمغناطيس.</li>
          <li>حرّك الجهاز على شكل 8 مرة أو مرتين للمعايرة.</li>
          <li>أدر جسمك حتى يتوهج المؤشر باللون الذهبي.</li>
        </ol>
        <div className="glow-line my-4" />
        <p className="text-xs text-white/50">الزاوية محسوبة بالدائرة العظمى إلى الكعبة المشرفة (21.42° N, 39.83° E). تعتمد دقة البوصلة على مستشعرات جهازك؛ على أجهزة أندرويد يُستخدم المصدر المطلق عند توفره.</p>
      </aside>

      {pickerOpen && <LocationPicker location={location} onLocation={onLocation} onClose={() => setPickerOpen(false)} />}
    </div>
  );
}
