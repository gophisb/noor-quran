import { useState } from "react";
import { METHOD_LABELS } from "../data/cities";
import { MUADHINS, type AdhanSettings } from "../lib/adhan";
import { fmt } from "../lib/api";
import { computeTimes, formatTime, PRAYER_ORDER, type LocationState } from "../lib/prayer";
import { cn } from "../utils/cn";
import { LocationPicker } from "./PrayerBar";
import { PinIcon } from "./Icons";

interface Props {
  settings: AdhanSettings;
  onChange: (s: AdhanSettings) => void;
  location: LocationState;
  onLocation: (l: LocationState) => void;
  player: { playing: boolean; progress: number; error: string | null; play: (m?: AdhanSettings["muadhin"]) => void; stop: () => void };
}

export default function AdhanView({ settings, onChange, location, onLocation, player }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const times = computeTimes(location, new Date(), settings.madhab);
  const R = 88;
  const C = 2 * Math.PI * R;

  const requestNotif = async () => {
    if (!("Notification" in window)) return;
    try {
      await Notification.requestPermission();
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
      <section className="glass rounded-3xl p-4 sm:p-6">
        <h2 className="text-center font-title text-2xl gold-text sm:text-3xl">الأذان</h2>
        <p className="mt-1 text-center text-xs text-white/50">يُرفع الأذان تلقائياً عند دخول الوقت — والتطبيق مفتوح</p>

        {/* زر التشغيل الكبير */}
        <div className="mx-auto mt-6 flex max-w-xs flex-col items-center">
          <button
            onClick={() => (player.playing ? player.stop() : player.play())}
            className="tap-press relative h-56 w-56 rounded-full outline-none"
            aria-label={player.playing ? "إيقاف الأذان" : "تشغيل الأذان"}
          >
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="100" cy="100" r={R} stroke="rgba(255,255,255,0.08)" strokeWidth="5" fill="none" />
              <circle
                cx="100" cy="100" r={R}
                stroke={player.playing ? "#e6c27a" : "#5eead4"}
                strokeWidth="5" strokeLinecap="round" fill="none"
                strokeDasharray={C}
                strokeDashoffset={C - C * (player.playing ? player.progress : 0)}
                style={{ transition: "stroke-dashoffset .3s linear", filter: "drop-shadow(0 0 10px rgba(94,234,212,.6))" }}
              />
            </svg>
            <span className={cn("absolute inset-4 rounded-full border bg-gradient-to-b from-teal-400/10 to-transparent", player.playing ? "border-gold/40" : "border-teal-300/20")} />
            {player.playing && <span className="absolute inset-8 rounded-full border border-gold/40 pulse-ring" />}
            <span className="relative flex h-full flex-col items-center justify-center gap-2">
              <span className={cn("grid h-16 w-16 place-items-center rounded-full text-3xl", player.playing ? "bg-gold/20 text-gold" : "bg-teal-400/15 text-teal-200")}>
                {player.playing ? "■" : "▶"}
              </span>
              <span className="text-sm font-bold">{player.playing ? "إيقاف" : "تجربة الأذان"}</span>
              <span className="text-[11px] text-white/50">{MUADHINS.find((m) => m.id === settings.muadhin)?.name}</span>
            </span>
          </button>
          {player.error && <p className="mt-2 text-center text-xs text-red-300">{player.error}</p>}
        </div>

        {/* المؤذن */}
        <div className="mt-8">
          <div className="mb-2 text-sm text-white/70">صوت المؤذن</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {MUADHINS.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex items-center justify-between rounded-2xl border p-3 transition",
                  settings.muadhin === m.id ? "border-teal-300/50 bg-teal-400/15" : "border-white/10 bg-white/5"
                )}
              >
                <button onClick={() => onChange({ ...settings, muadhin: m.id })} className="flex-1 text-right text-sm">
                  {settings.muadhin === m.id ? "◉ " : "○ "}
                  {m.name}
                </button>
                <button
                  onClick={() => (player.playing && settings.muadhin === m.id ? player.stop() : player.play(m.id))}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-xs hover:bg-white/20"
                  title="استماع"
                >
                  {player.playing && settings.muadhin === m.id ? "■" : "▶"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* التفعيل والصوت */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">تفعيل الأذان التلقائي</span>
            <button
              onClick={() => onChange({ ...settings, enabled: !settings.enabled })}
              className={cn("relative h-7 w-12 rounded-full border transition", settings.enabled ? "border-teal-300/50 bg-teal-400/30" : "border-white/15 bg-white/10")}
            >
              <span className="absolute top-0.5 rounded-full bg-white shadow transition-all" style={{ height: 22, width: 22, right: settings.enabled ? 2 : 24 }} />
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">مستوى الصوت</span>
              <span className="text-teal-100">{fmt(Math.round(settings.volume * 100))}%</span>
            </div>
            <input type="range" min={0} max={1} step={0.05} value={settings.volume} onChange={(e) => onChange({ ...settings, volume: Number(e.target.value) })} className="mt-1 w-full accent-teal-300" />
          </div>
          <div>
            <div className="mb-2 text-sm text-white/70">الأذان لكل صلاة</div>
            <div className="grid grid-cols-5 gap-1.5">
              {PRAYER_ORDER.filter((p) => p.key !== "sunrise").map((p) => {
                const k = p.key as keyof AdhanSettings["perPrayer"];
                const on = settings.perPrayer[k];
                return (
                  <button
                    key={p.key}
                    onClick={() => onChange({ ...settings, perPrayer: { ...settings.perPrayer, [k]: !on } })}
                    className={cn("rounded-xl border py-2 text-sm transition", on ? "border-teal-300/50 bg-teal-400/15 text-teal-100" : "border-white/10 bg-white/5 text-white/40")}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">مذهب حساب العصر</span>
            <div className="flex rounded-xl border border-white/10 bg-white/5 p-0.5 text-xs">
              {(["shafi", "hanafi"] as const).map((m) => (
                <button key={m} onClick={() => onChange({ ...settings, madhab: m })} className={cn("rounded-lg px-3 py-1.5", settings.madhab === m ? "bg-teal-400/20 text-teal-100" : "text-white/60")}>
                  {m === "shafi" ? "الجمهور" : "الحنفي"}
                </button>
              ))}
            </div>
          </div>
          {"Notification" in window && Notification.permission !== "granted" && (
            <button onClick={requestNotif} className="w-full rounded-2xl border border-white/10 bg-white/5 py-2 text-xs text-white/70 hover:bg-white/10">
              السماح بإشعارات دخول الوقت
            </button>
          )}
        </div>
      </section>

      <aside className="space-y-4">
        <section className="glass rounded-3xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-teal-100">مواقيت اليوم</h3>
            <button onClick={() => setPickerOpen(true)} className="flex items-center gap-1 text-[11px] text-white/60 hover:text-white">
              <PinIcon width={12} height={12} /> تغيير الموقع
            </button>
          </div>
          <div className="mb-3 rounded-2xl bg-white/5 p-3 text-xs">
            <div className="font-bold text-white">{location.label}</div>
            <div className="mt-1 text-white/50">{METHOD_LABELS[location.method]}</div>
            <div className="text-white/40" dir="ltr">
              {location.coords.lat.toFixed(4)}, {location.coords.lng.toFixed(4)} · {location.tz}
            </div>
          </div>
          <div className="space-y-1">
            {PRAYER_ORDER.map((p) => (
              <div key={p.key} className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-white/5">
                <span className="font-amiri text-lg">{p.name}</span>
                <span className="tabular-nums text-teal-100">{formatTime(times[p.key], location.tz)}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="glass rounded-3xl p-5 text-xs leading-relaxed text-white/55">
          <h3 className="mb-2 text-sm font-bold text-teal-100">عن الدقة</h3>
          <p>
            تُحسب المواقيت فلكياً على جهازك (بلا إنترنت) بخوارزميات معتمدة من الهيئات الرسمية لكل دولة، وتُعرض بتوقيت المدينة المختارة. مع GPS تُطبّق طريقة الحساب المناسبة لمنطقتك تلقائياً.
          </p>
        </section>
      </aside>

      {pickerOpen && <LocationPicker location={location} onLocation={onLocation} onClose={() => setPickerOpen(false)} />}
    </div>
  );
}
