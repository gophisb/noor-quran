import { useEffect, useState } from "react";
import { SURAHS } from "../data/surahs";
import { fetchSurah, fetchTafsir, tafsirParts, fmt } from "../lib/api";
import type { Bookmark, LastRead } from "../lib/store";
import type { View } from "./Nav";
import { BookIcon, BeadsIcon, CompassIcon, BookmarkIcon } from "./Icons";

interface Props {
  lastRead: LastRead;
  bookmarks: Bookmark[];
  name: string;
  onOpen: (surah: number, ayah: number) => void;
  onGo: (v: View) => void;
}

/** آية اليوم: تُختار بشكل ثابت حسب التاريخ من مواضع مختارة */
const DAILY_POOL: [number, number][] = [
  [2, 255], [2, 286], [3, 8], [3, 139], [3, 173], [6, 162], [7, 23], [9, 129], [10, 62], [12, 87],
  [13, 28], [14, 7], [16, 97], [17, 82], [18, 10], [20, 25], [21, 87], [24, 35], [25, 74], [27, 19],
  [28, 24], [29, 69], [33, 56], [39, 53], [40, 60], [42, 19], [48, 4], [55, 13], [57, 4], [59, 22],
  [65, 2], [65, 3], [93, 5], [94, 5], [94, 6], [103, 3], [112, 1], [1, 5], [2, 152], [2, 186],
];

export default function HomeView({ lastRead, bookmarks, name, onOpen, onGo }: Props) {
  const [daily, setDaily] = useState<{ surah: number; ayah: number; text: string; tafsir: string } | null>(null);

  useEffect(() => {
    const dayIdx = Math.floor(Date.now() / 86_400_000) % DAILY_POOL.length;
    const [s, a] = DAILY_POOL[dayIdx];
    Promise.all([fetchSurah(s), fetchTafsir(s).catch(() => [])])
      .then(([sd, td]) => {
        const ay = sd.ayahs.find((x) => x.numberInSurah === a);
        const tf = td.find((x) => x.ayah === a)?.text ?? "";
        if (ay) setDaily({ surah: s, ayah: a, text: ay.text, tafsir: tf });
      })
      .catch(() => null);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 18 ? "طاب يومك" : "مساء الخير";
  const lastMeta = SURAHS[lastRead.surah - 1];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        {/* آية اليوم */}
        <section className="glass rounded-3xl p-4 sm:p-6">
          <div className="mb-1 text-center text-xs text-teal-200/80">
            {greeting}
            {name ? `، ${name}` : ""} — آية اليوم
          </div>
          <div className="glass-inner mt-3 rounded-3xl p-4 sm:p-8">
            {daily ? (
              <div className="fade-up">
                <div className="glow-line mx-auto mb-5 w-1/2" />
                <p className="quran-text text-center text-2xl sm:text-3xl">
                  {daily.text}
                  <span className="ayah-mark"> ﴿{fmt(daily.ayah)}﴾ </span>
                </p>
                <p className="mt-3 text-center text-xs text-white/50">
                  سورة {SURAHS[daily.surah - 1].name} — الآية {fmt(daily.ayah)}
                </p>
                {daily.tafsir && (
                  <>
                    <div className="glow-line my-5" />
                    <h3 className="mb-2 text-center text-sm font-bold text-teal-200">من تفسير السعدي</h3>
                    <p className="tafsir-text line-clamp-4 text-justify text-sm sm:text-base">
                      {tafsirParts(daily.tafsir).map((p, i) =>
                        p.type === "quran" ? (
                          <span key={i} className="q">
                            ﴿{p.value}﴾
                          </span>
                        ) : (
                          <span key={i}>{p.value}</span>
                        )
                      )}
                    </p>
                  </>
                )}
                <div className="mt-5 text-center">
                  <button
                    onClick={() => onOpen(daily.surah, daily.ayah)}
                    className="tap-press rounded-full border border-teal-300/40 bg-teal-400/15 px-6 py-2 text-sm text-teal-100 hover:bg-teal-400/25"
                  >
                    قراءة التفسير كاملاً
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="skeleton mx-auto h-10 w-3/4 rounded-xl" />
                <div className="skeleton mx-auto h-4 w-1/3 rounded" />
                <div className="skeleton h-20 rounded-2xl" />
              </div>
            )}
          </div>
        </section>

        {/* اختصارات */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { v: "quran" as View, t: "المصحف", d: "114 سورة مع التفسير", I: BookIcon },
            { v: "athkar" as View, t: "الأذكار", d: "صباح · مساء · تسبيح", I: BeadsIcon },
            { v: "qibla" as View, t: "القبلة", d: "بوصلة حيّة", I: CompassIcon },
          ].map(({ v, t, d, I }) => (
            <button
              key={v}
              onClick={() => onGo(v)}
              className="glass tap-press flex flex-col items-center gap-2 rounded-3xl p-4 text-center transition hover:bg-white/10"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-teal-400/15 text-teal-200">
                <I />
              </span>
              <span className="text-sm font-bold">{t}</span>
              <span className="hidden text-[11px] text-white/50 sm:block">{d}</span>
            </button>
          ))}
        </div>
      </div>

      {/* الجانب: آخر قراءة + العلامات */}
      <aside className="space-y-4">
        <section className="glass rounded-3xl p-5">
          <h3 className="mb-3 text-sm font-bold text-teal-100">متابعة القراءة</h3>
          <button
            onClick={() => onOpen(lastRead.surah, lastRead.ayah)}
            className="glass-inner tap-press w-full rounded-2xl p-4 text-right transition hover:border-teal-300/40"
          >
            <div className="font-amiri text-xl text-white">سورة {lastMeta.name}</div>
            <div className="text-xs text-white/55">
              الآية {fmt(lastRead.ayah)} من {fmt(lastMeta.ayahs)}
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-l from-teal-300 to-emerald-400"
                style={{ width: `${(lastRead.ayah / lastMeta.ayahs) * 100}%` }}
              />
            </div>
          </button>
        </section>

        <section className="glass rounded-3xl p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-teal-100">
            <BookmarkIcon width={16} height={16} /> العلامات المحفوظة
          </h3>
          {bookmarks.length === 0 ? (
            <p className="text-xs text-white/45">لم تحفظ أي علامة بعد. اضغط رمز العلامة أثناء القراءة.</p>
          ) : (
            <div className="scroll-thin max-h-64 space-y-1 overflow-y-auto">
              {bookmarks.map((b) => (
                <button
                  key={`${b.surah}-${b.ayah}`}
                  onClick={() => onOpen(b.surah, b.ayah)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-right text-sm transition hover:bg-white/5"
                >
                  <span className="font-amiri text-base">سورة {SURAHS[b.surah - 1].name}</span>
                  <span className="text-xs text-white/50">آية {fmt(b.ayah)}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}
