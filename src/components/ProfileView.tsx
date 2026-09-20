import { SURAHS } from "../data/surahs";
import { fmt } from "../lib/api";
import type { Bookmark, LastRead, Settings } from "../lib/store";
import { cn } from "../utils/cn";

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
  lastRead: LastRead;
  bookmarks: Bookmark[];
  onOpen: (surah: number, ayah: number) => void;
  onToggleBookmark: (s: number, a: number) => void;
}

export default function ProfileView({ settings, onChange, lastRead, bookmarks, onOpen, onToggleBookmark }: Props) {
  const clearCache = () => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("surah:") || k.startsWith("tafsir-saadi:"))
      .forEach((k) => localStorage.removeItem(k));
    alert("تم مسح النصوص المخزنة. سيُعاد تحميلها عند الحاجة.");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="glass rounded-3xl p-5 sm:p-6">
        <h2 className="mb-4 font-title text-2xl gold-text">الإعدادات</h2>

        <label className="block text-sm">
          <span className="text-white/70">الاسم (اختياري)</span>
          <input
            value={settings.name}
            onChange={(e) => onChange({ ...settings, name: e.target.value })}
            placeholder="مثال: عبدالله"
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-teal-300/50"
          />
        </label>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">حجم خط المصحف</span>
            <span className="text-teal-100">{fmt(Math.round(settings.fontScale * 100))}%</span>
          </div>
          <input
            type="range"
            min={0.8}
            max={1.6}
            step={0.05}
            value={settings.fontScale}
            onChange={(e) => onChange({ ...settings, fontScale: Number(e.target.value) })}
            className="mt-2 w-full accent-teal-300"
          />
          <div className="glass-inner mt-3 rounded-2xl p-4">
            <p className="quran-text text-center" style={{ fontSize: `${1.6 * settings.fontScale}rem` }}>
              ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-white/70">إظهار تفسير السعدي افتراضياً</span>
          <button
            onClick={() => onChange({ ...settings, showTafsir: !settings.showTafsir })}
            className={cn(
              "relative h-7 w-12 rounded-full border transition",
              settings.showTafsir ? "border-teal-300/50 bg-teal-400/30" : "border-white/15 bg-white/10"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5.5 w-5.5 rounded-full bg-white shadow transition-all",
                settings.showTafsir ? "right-0.5" : "right-[1.55rem]"
              )}
              style={{ height: 22, width: 22 }}
            />
          </button>
        </div>

        <div className="glow-line my-6" />
        <button
          onClick={clearCache}
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 text-sm text-white/70 hover:bg-white/10"
        >
          مسح النصوص المخزنة محلياً
        </button>
      </section>

      <div className="space-y-4">
        <section className="glass rounded-3xl p-5">
          <h3 className="mb-3 text-sm font-bold text-teal-100">إحصاءاتي</h3>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="glass-inner rounded-2xl p-3">
              <div className="text-[11px] text-white/50">آخر قراءة</div>
              <div className="mt-1 font-amiri text-lg">سورة {SURAHS[lastRead.surah - 1].name}</div>
              <div className="text-xs text-white/50">آية {fmt(lastRead.ayah)}</div>
            </div>
            <div className="glass-inner rounded-2xl p-3">
              <div className="text-[11px] text-white/50">العلامات</div>
              <div className="mt-1 text-2xl font-bold text-teal-100">{fmt(bookmarks.length)}</div>
            </div>
          </div>
        </section>

        <section className="glass rounded-3xl p-5">
          <h3 className="mb-3 text-sm font-bold text-teal-100">العلامات المحفوظة</h3>
          {bookmarks.length === 0 ? (
            <p className="text-xs text-white/45">لا توجد علامات.</p>
          ) : (
            <div className="scroll-thin max-h-72 space-y-1 overflow-y-auto">
              {bookmarks.map((b) => (
                <div
                  key={`${b.surah}-${b.ayah}`}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-white/5"
                >
                  <button onClick={() => onOpen(b.surah, b.ayah)} className="flex-1 text-right">
                    <span className="font-amiri text-base">سورة {SURAHS[b.surah - 1].name}</span>
                    <span className="mr-2 text-xs text-white/50">آية {fmt(b.ayah)}</span>
                  </button>
                  <button onClick={() => onToggleBookmark(b.surah, b.ayah)} className="text-xs text-red-300/80 hover:text-red-200">
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="glass rounded-3xl p-5 text-xs leading-relaxed text-white/55">
          <h3 className="mb-2 text-sm font-bold text-teal-100">المصادر</h3>
          <p>النص القرآني بالرسم العثماني من مشروع Tanzil عبر AlQuran Cloud. تفسير «تيسير الكريم الرحمن» للشيخ عبدالرحمن السعدي رحمه الله. مواقيت الصلاة من AlAdhan (أم القرى).</p>
        </section>
      </div>
    </div>
  );
}
