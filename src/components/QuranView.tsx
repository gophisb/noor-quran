import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SURAHS } from "../data/surahs";
import { BISMILLAH, fetchSurah, fetchTafsir, tafsirParts, fmt, type SurahData, type TafsirEntry } from "../lib/api";
import { useRecitation } from "../lib/recitation";
import type { Settings } from "../lib/store";
import { cn } from "../utils/cn";
import { BookmarkIcon, ChevronIcon, SearchIcon } from "./Icons";

interface Props {
  surah: number;
  ayah: number;
  onNavigate: (surah: number, ayah: number) => void;
  settings: Settings;
  onToggleTafsir: () => void;
  bookmarks: { has: (s: number, a: number) => boolean; toggle: (s: number, a: number) => void };
}

export default function QuranView({ surah, ayah, onNavigate, settings, onToggleTafsir, bookmarks }: Props) {
  const [data, setData] = useState<SurahData | null>(null);
  const [tafsir, setTafsir] = useState<TafsirEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [openTafsir, setOpenTafsir] = useState<number | null>(null);
  const [jump, setJump] = useState("");
  const containerRef = useRef<HTMLElement>(null);
  const lastScrolled = useRef<string>("");

  const meta = SURAHS[surah - 1];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    setTafsir(null);
    setOpenTafsir(null);
    Promise.all([fetchSurah(surah), fetchTafsir(surah).catch(() => [] as TafsirEntry[])])
      .then(([s, t]) => {
        if (cancelled) return;
        setData(s);
        setTafsir(t);
      })
      .catch((e: Error) => !cancelled && setError(e.message || "حدث خطأ في التحميل"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [surah]);

  // التمرير إلى الآية المطلوبة
  useEffect(() => {
    if (!data) return;
    const key = `${surah}:${ayah}`;
    if (lastScrolled.current === key) return;
    lastScrolled.current = key;
    const el = document.getElementById(`ayah-${surah}-${ayah}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [ayah, surah, data]);

  // تتبع الآية الظاهرة أثناء التمرير لحفظ موضع القراءة
  useEffect(() => {
    if (!data) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          const n = Number((visible.target as HTMLElement).dataset.ayah);
          if (n && n !== ayah) {
            lastScrolled.current = `${surah}:${n}`;
            onNavigate(surah, n);
          }
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    document.querySelectorAll<HTMLElement>("[data-ayah]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [data, surah, ayah, onNavigate]);

  const globalOf = useCallback((a: number) => data?.ayahs.find((x) => x.numberInSurah === a)?.number, [data]);
  const onAyahChange = useCallback(
    (a: number) => {
      lastScrolled.current = "";
      onNavigate(surah, a);
    },
    [surah, onNavigate]
  );
  const onSurahEnd = useCallback(() => {
    if (surah < 114) onNavigate(surah + 1, 1);
  }, [surah, onNavigate]);

  const rec = useRecitation({ surah, totalAyahs: data?.numberOfAyahs ?? meta.ayahs, globalOf, onAyahChange, onSurahEnd });

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return SURAHS;
    const strip = (s: string) => s.replace(/[\u064B-\u0652\u0670\u06E1\u0671]/g, "").replace(/ٱ/g, "ا");
    return SURAHS.filter(
      (s) => strip(s.name).includes(strip(q)) || s.englishName.toLowerCase().includes(q.toLowerCase()) || String(s.number) === q || fmt(s.number) === q
    );
  }, [query]);

  const scale = settings.fontScale;
  const showBismillah = surah !== 1 && surah !== 9;

  const SurahList = (
    <div className="flex h-full flex-col">
      <div className="relative mb-3">
        <SearchIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40" width={18} height={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن سورة…"
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pr-10 pl-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-teal-300/50 focus:bg-white/10"
        />
      </div>
      <div className="scroll-thin flex-1 space-y-1 overflow-y-auto pl-1">
        {filtered.map((s) => (
          <button
            key={s.number}
            onClick={() => {
              onNavigate(s.number, 1);
              setListOpen(false);
              window.scrollTo({ top: 0 });
            }}
            className={cn("tap-press flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-right transition", s.number === surah ? "bg-teal-400/15 ring-1 ring-teal-300/40" : "hover:bg-white/5")}
          >
            <span className="relative grid h-9 w-9 shrink-0 place-items-center">
              <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full text-teal-300/50">
                <polygon points="20,2 25,8 33,7 32,15 38,20 32,25 33,33 25,32 20,38 15,32 7,33 8,25 2,20 8,15 7,7 15,8" fill="rgba(94,234,212,0.08)" stroke="currentColor" strokeWidth="1" />
              </svg>
              <span className="relative text-xs font-bold text-teal-100">{fmt(s.number)}</span>
            </span>
            <span className="flex-1">
              <span className="block font-amiri text-lg leading-tight text-white">سورة {s.name}</span>
              <span className="block text-[11px] text-white/45">{s.type} · {fmt(s.ayahs)} آية</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const doJump = () => {
    const n = Number(fmt(jump.trim()));
    if (n >= 1 && n <= meta.ayahs) {
      lastScrolled.current = "";
      onNavigate(surah, n);
    }
    setJump("");
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <aside className="glass sticky top-4 hidden h-[calc(100vh-2rem)] w-72 shrink-0 self-start rounded-3xl p-3 lg:block">{SurahList}</aside>

      {listOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden" onClick={() => setListOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="glass relative mr-auto h-full w-80 max-w-[85vw] rounded-l-3xl p-3" onClick={(e) => e.stopPropagation()}>
            {SurahList}
          </div>
        </div>
      )}

      <section ref={containerRef} className="glass flex min-w-0 flex-1 flex-col rounded-3xl p-3 sm:p-5">
        {/* رأس السورة — ثابت */}
        <div className="sticky top-2 z-20 -mx-1 mb-4 rounded-2xl border border-white/10 bg-[#071018]/85 px-3 py-2 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button onClick={() => setListOpen(true)} className="tap-press flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs lg:hidden">
              <SearchIcon width={14} height={14} /> السور
            </button>
            <div className="text-center">
              <h2 className="font-title text-xl gold-text sm:text-2xl">سورة {meta.name}</h2>
              <p className="text-[10px] text-white/50">
                {meta.type} · {fmt(meta.ayahs)} آية · الآية {fmt(ayah)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {/* زر التلاوة المتواصلة */}
              <button
                onClick={() => (rec.state.playing ? rec.pause() : rec.state.ayah !== null && rec.state.surah === surah ? rec.resume() : rec.play(ayah))}
                disabled={!data}
                className={cn(
                  "tap-press flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs transition disabled:opacity-40",
                  rec.state.playing ? "border-gold/50 bg-gold/15 text-gold" : "border-teal-300/40 bg-teal-400/15 text-teal-100"
                )}
                title="تلاوة المنشاوي المتواصلة"
              >
                <span>{rec.state.loading ? "…" : rec.state.playing ? "❚❚" : "▶"}</span>
                {rec.state.playing ? "إيقاف مؤقت" : "تلاوة"}
              </button>
              {(rec.state.playing || rec.state.ayah !== null) && rec.state.surah === surah && (
                <button onClick={rec.stop} className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/70" title="إيقاف">
                  ■
                </button>
              )}
              <button onClick={onToggleTafsir} className={cn("rounded-xl border px-3 py-1.5 text-xs transition", settings.showTafsir ? "border-gold/40 bg-gold/15 text-gold" : "border-white/10 bg-white/5 text-white/60")} title="إظهار/إخفاء التفسير">
                التفسير
              </button>
            </div>
          </div>
          {rec.state.playing && rec.state.ayah && (
            <div className="mt-1.5 flex items-center gap-2 text-[10px] text-gold/80">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
              الشيخ المنشاوي — الآية {fmt(rec.state.ayah)} · تلاوة متواصلة
            </div>
          )}
          {rec.state.error && <p className="mt-1 text-[10px] text-red-300">{rec.state.error}</p>}
        </div>

        {error && <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-center text-sm text-red-200">{error} — تأكد من الاتصال بالإنترنت ثم أعد المحاولة.</div>}

        {loading && !error && (
          <div className="space-y-4 p-4">
            <div className="skeleton mx-auto h-8 w-56 rounded-xl" />
            <div className="skeleton h-24 rounded-2xl" />
            <div className="skeleton h-24 rounded-2xl" />
            <div className="skeleton h-24 rounded-2xl" />
          </div>
        )}

        {data && (
          <div className="space-y-3">
            {/* البسملة */}
            <div className="glass-inner rounded-3xl p-4 text-center">
              <div className="mb-3 text-[11px] text-white/45">
                {surah > 1 && (
                  <button onClick={() => onNavigate(surah - 1, 1)} className="rounded-full border border-white/10 px-3 py-1 hover:bg-white/5">
                    ← سورة {SURAHS[surah - 2].name}
                  </button>
                )}
              </div>
              {showBismillah && <p className="quran-text text-2xl text-teal-100/90 sm:text-3xl">{BISMILLAH}</p>}
              <div className="glow-line mx-auto mt-3 w-2/3" />
            </div>

            {/* الآيات — تمرير رأسي متواصل */}
            {data.ayahs.map((a) => {
              const active = a.numberInSurah === ayah;
              const reciting = rec.state.playing && rec.state.ayah === a.numberInSurah && rec.state.surah === surah;
              const tf = tafsir?.find((t) => t.ayah === a.numberInSurah)?.text;
              const tafsirShown = settings.showTafsir && (openTafsir === a.numberInSurah || active);
              return (
                <article
                  key={a.number}
                  id={`ayah-${surah}-${a.numberInSurah}`}
                  data-ayah={a.numberInSurah}
                  className={cn(
                    "rounded-3xl border p-4 transition-all duration-300 sm:p-6",
                    reciting
                      ? "border-gold/50 bg-gold/[0.07] shadow-[0_0_40px_rgba(230,194,122,0.15)]"
                      : active
                        ? "glass-inner border-teal-300/30"
                        : "border-white/5 bg-white/[0.02]"
                  )}
                >
                  <p className="quran-text text-center" style={{ fontSize: `${1.9 * scale}rem` }} dir="rtl" lang="ar">
                    {a.text}
                    <span className="ayah-mark"> ﴿{fmt(a.numberInSurah)}﴾ </span>
                  </p>
                  {a.sajda && <p className="mt-1 text-center text-xs text-gold">۩ سجدة تلاوة</p>}

                  <div className="mt-3 flex items-center justify-center gap-2 text-[11px]">
                    <button
                      onClick={() => (reciting ? rec.pause() : rec.play(a.numberInSurah))}
                      className={cn("rounded-full border px-3 py-1 transition", reciting ? "border-gold/50 bg-gold/15 text-gold" : "border-white/10 bg-white/5 text-white/70 hover:text-white")}
                    >
                      {reciting ? "❚❚ إيقاف مؤقت" : "▶ تلاوة من هنا"}
                    </button>
                    <button
                      onClick={() => bookmarks.toggle(surah, a.numberInSurah)}
                      className={cn("grid h-7 w-7 place-items-center rounded-full border transition", bookmarks.has(surah, a.numberInSurah) ? "border-gold/50 bg-gold/15 text-gold" : "border-white/10 bg-white/5 text-white/60")}
                      title="علامة"
                    >
                      <BookmarkIcon width={14} height={14} fill={bookmarks.has(surah, a.numberInSurah) ? "currentColor" : "none"} />
                    </button>
                    {settings.showTafsir && (
                      <button
                        onClick={() => setOpenTafsir(openTafsir === a.numberInSurah ? -1 : a.numberInSurah)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70 hover:text-white"
                      >
                        {tafsirShown && openTafsir !== -1 ? "إخفاء التفسير" : "التفسير"}
                      </button>
                    )}
                    <span className="text-white/35">ج {fmt(a.juz)} · ص {fmt(a.page)}</span>
                  </div>

                  {tafsirShown && openTafsir !== -1 && (
                    <div className="fade-up mt-4 border-t border-white/10 pt-4">
                      <h4 className="mb-2 text-center text-xs font-bold text-teal-200">
                        تفسير السعدي <span className="text-white/40">— تيسير الكريم الرحمن</span>
                      </h4>
                      {tf ? (
                        <p className="tafsir-text text-justify" style={{ fontSize: `${1.02 * scale}rem` }}>
                          {tafsirParts(tf).map((p, i) =>
                            p.type === "quran" ? (
                              <span key={i} className="q">﴿{p.value}﴾</span>
                            ) : (
                              <span key={i}>{p.value}</span>
                            )
                          )}
                        </p>
                      ) : (
                        <p className="text-center text-xs text-white/50">تفسير هذه الآية مدرج ضمن تفسير الآيات المجاورة.</p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}

            {/* نهاية السورة */}
            <div className="glass-inner rounded-3xl p-5 text-center">
              <p className="text-sm text-white/60">صدق الله العظيم</p>
              {surah < 114 && (
                <button onClick={() => { onNavigate(surah + 1, 1); window.scrollTo({ top: 0 }); }} className="tap-press mt-3 rounded-full border border-teal-300/40 bg-teal-400/15 px-5 py-2 text-sm text-teal-100">
                  السورة التالية: {SURAHS[surah].name} <ChevronIcon width={14} height={14} className="inline rotate-180" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* شريط سفلي: انتقال سريع */}
        {data && (
          <div className="sticky bottom-20 z-20 mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#071018]/85 px-3 py-2 backdrop-blur-xl lg:bottom-2">
            <input
              type="range"
              min={1}
              max={data.numberOfAyahs}
              value={ayah}
              onChange={(e) => {
                lastScrolled.current = "";
                onNavigate(surah, Number(e.target.value));
              }}
              className="flex-1 accent-teal-300"
            />
            <input
              value={jump}
              onChange={(e) => setJump(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doJump()}
              placeholder="رقم الآية"
              className="w-20 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-center text-xs outline-none focus:border-teal-300/50"
            />
            <span className="w-16 text-center text-xs tabular-nums text-teal-100">
              {fmt(ayah)} / {fmt(data.numberOfAyahs)}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
