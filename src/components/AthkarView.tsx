import { useEffect, useMemo, useState } from "react";
import { ATHKAR } from "../data/athkar";
import { fmt } from "../lib/api";
import { useAthkarProgress } from "../lib/store";
import { cn } from "../utils/cn";
import { HeartIcon, ResetIcon } from "./Icons";

export default function AthkarView({ fontScale }: { fontScale: number }) {
  const [catId, setCatId] = useState(ATHKAR[0].id);
  const [index, setIndex] = useState(0);
  const [beat, setBeat] = useState(false);
  const { progress, setCount, resetAll } = useAthkarProgress();

  const cat = ATHKAR.find((c) => c.id === catId)!;
  const item = cat.items[Math.min(index, cat.items.length - 1)];
  const count = progress[item.id] ?? 0;
  const done = count >= item.count;
  const pct = Math.min(100, (count / item.count) * 100);

  const catTotal = useMemo(
    () => cat.items.reduce((acc, d) => acc + Math.min(progress[d.id] ?? 0, d.count), 0),
    [cat, progress]
  );
  const catMax = cat.items.reduce((a, d) => a + d.count, 0);

  useEffect(() => setIndex(0), [catId]);

  const tap = () => {
    if (done) {
      // الانتقال للذكر التالي
      if (index < cat.items.length - 1) setIndex(index + 1);
      return;
    }
    const next = count + 1;
    setCount(item.id, next);
    setBeat(true);
    setTimeout(() => setBeat(false), 220);
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate(next >= item.count ? [30, 40, 30] : 12);
      } catch {
        /* ignore */
      }
    }
    if (next >= item.count && index < cat.items.length - 1) {
      setTimeout(() => setIndex((i) => Math.min(i + 1, cat.items.length - 1)), 900);
    }
  };

  const R = 96;
  const C = 2 * Math.PI * R;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      {/* الذكر */}
      <section className="glass rounded-3xl p-4 sm:p-6">
        {/* التصنيفات */}
        <div className="scroll-thin mb-4 flex gap-2 overflow-x-auto pb-1">
          {ATHKAR.map((c) => (
            <button
              key={c.id}
              onClick={() => setCatId(c.id)}
              className={cn(
                "tap-press flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2 text-sm transition",
                c.id === catId
                  ? "border-teal-300/40 bg-teal-400/15 text-teal-100"
                  : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10"
              )}
            >
              <span className="text-base">{c.icon}</span> {c.title}
            </button>
          ))}
        </div>

        <div className="glass-inner fade-up rounded-3xl p-4 sm:p-8" key={item.id}>
          <div className="mb-3 flex items-center justify-between text-xs text-white/50">
            <span>
              {fmt(index + 1)} / {fmt(cat.items.length)}
            </span>
            <span>{cat.title}</span>
          </div>
          <div className="glow-line mx-auto mb-6 w-1/2" />
          <p
            className="quran-text text-center leading-[2.4]"
            style={{ fontSize: `${(item.text.length > 120 ? 1.35 : 1.9) * fontScale}rem` }}
          >
            {item.text}
          </p>
          {item.note && <p className="mt-4 text-center text-xs text-gold/90">{item.note}</p>}

          {/* العدّاد النابض */}
          <button
            onClick={tap}
            className="tap-press group relative mx-auto mt-8 block h-60 w-60 select-none rounded-full outline-none"
            aria-label="تسبيح"
          >
            <svg viewBox="0 0 220 220" className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="110" cy="110" r={R} stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
              <circle
                cx="110"
                cy="110"
                r={R}
                stroke={done ? "#e6c27a" : "#5eead4"}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={C}
                strokeDashoffset={C - (C * pct) / 100}
                style={{
                  transition: "stroke-dashoffset .35s ease, stroke .3s",
                  filter: `drop-shadow(0 0 10px ${done ? "rgba(230,194,122,.7)" : "rgba(94,234,212,.7)"})`,
                }}
              />
            </svg>
            <span className="absolute inset-4 rounded-full border border-teal-300/20 bg-gradient-to-b from-teal-400/10 to-transparent" />
            {!done && <span className="absolute inset-8 rounded-full border border-teal-300/30 pulse-ring" />}
            <span className="relative flex h-full flex-col items-center justify-center gap-1">
              <span
                className={cn(
                  "grid h-14 w-14 place-items-center rounded-full transition",
                  done ? "bg-gold/20 text-gold" : "bg-teal-400/15 text-teal-200",
                  beat && "scale-125",
                  !done && "heartbeat"
                )}
              >
                <HeartIcon width={28} height={28} fill="currentColor" />
              </span>
              <span className="mt-1 text-3xl font-bold tabular-nums text-white">
                {fmt(count)}
                <span className="text-lg text-white/50"> / {fmt(item.count)}</span>
              </span>
              <span className="text-xs text-white/50">{done ? (index < cat.items.length - 1 ? "تم ✓ — اضغط للتالي" : "تقبّل الله") : "اضغط للتسبيح"}</span>
            </span>
          </button>

          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setIndex(Math.max(0, index - 1))}
              disabled={index === 0}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm disabled:opacity-30"
            >
              السابق
            </button>
            <button
              onClick={() => setCount(item.id, 0)}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white"
              title="إعادة العدّ"
            >
              <ResetIcon width={18} height={18} />
            </button>
            <button
              onClick={() => setIndex(Math.min(cat.items.length - 1, index + 1))}
              disabled={index === cat.items.length - 1}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm disabled:opacity-30"
            >
              التالي
            </button>
          </div>
        </div>
      </section>

      {/* قائمة الأذكار في التصنيف */}
      <aside className="glass flex flex-col rounded-3xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-teal-100">{cat.title}</h3>
          <button onClick={resetAll} className="text-[11px] text-white/45 hover:text-white">
            تصفير اليوم
          </button>
        </div>
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-l from-teal-300 to-emerald-400 transition-all"
            style={{ width: `${(catTotal / catMax) * 100}%` }}
          />
        </div>
        <div className="scroll-thin max-h-[28rem] flex-1 space-y-1 overflow-y-auto">
          {cat.items.map((d, i) => {
            const c = Math.min(progress[d.id] ?? 0, d.count);
            const ok = c >= d.count;
            return (
              <button
                key={d.id}
                onClick={() => setIndex(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-right text-sm transition",
                  i === index ? "bg-teal-400/15 ring-1 ring-teal-300/30" : "hover:bg-white/5"
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px]",
                    ok ? "bg-gold/20 text-gold" : "bg-white/10 text-white/60"
                  )}
                >
                  {ok ? "✓" : fmt(i + 1)}
                </span>
                <span className="line-clamp-1 flex-1 font-amiri text-base text-white/85">{d.text}</span>
                <span className="text-[11px] tabular-nums text-white/45">
                  {fmt(c)}/{fmt(d.count)}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
