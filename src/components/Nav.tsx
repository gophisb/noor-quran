import { BeadsIcon, BellIcon, BookIcon, CompassIcon, HomeIcon, UserIcon } from "./Icons";
import { cn } from "../utils/cn";

export type View = "home" | "quran" | "adhan" | "athkar" | "qibla" | "profile";

const ITEMS: { id: View; label: string; Icon: typeof HomeIcon }[] = [
  { id: "home", label: "الرئيسية", Icon: HomeIcon },
  { id: "quran", label: "القرآن", Icon: BookIcon },
  { id: "adhan", label: "الأذان", Icon: BellIcon },
  { id: "athkar", label: "الأذكار", Icon: BeadsIcon },
  { id: "qibla", label: "القبلة", Icon: CompassIcon },
  { id: "profile", label: "حسابي", Icon: UserIcon },
];

export default function Nav({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <>
      {/* الشريط الجانبي — للشاشات الكبيرة */}
      <nav className="glass sticky top-4 hidden w-24 shrink-0 flex-col items-center gap-2 self-start rounded-[2.5rem] px-2 py-6 lg:flex">
        {ITEMS.map(({ id, label, Icon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={cn(
                "tap-press group flex w-full flex-col items-center gap-1 rounded-2xl px-2 py-3 text-[11px] transition",
                active
                  ? "bg-teal-400/15 text-teal-100 shadow-[0_0_24px_rgba(94,234,212,0.25)] ring-1 ring-teal-300/40"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <span
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-full transition",
                  active ? "bg-teal-400/20 text-teal-200" : "bg-white/5"
                )}
              >
                <Icon />
              </span>
              {label}
            </button>
          );
        })}
      </nav>

      {/* الشريط السفلي — للجوال */}
      <nav className="glass fixed inset-x-3 bottom-3 z-30 flex justify-around rounded-3xl px-2 py-2 lg:hidden">
        {ITEMS.map(({ id, label, Icon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={cn(
                "tap-press flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] transition",
                active ? "bg-teal-400/15 text-teal-100" : "text-white/55"
              )}
            >
              <Icon width={20} height={20} />
              {label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
