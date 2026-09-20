// طبقة الوصول للبيانات — النص القرآني والتفسير من مصادر موثوقة مع تخزين محلي
export interface Ayah {
  numberInSurah: number;
  number: number;
  text: string;
  juz: number;
  page: number;
  sajda: boolean;
}

export interface SurahData {
  number: number;
  name: string;
  englishName: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export interface TafsirEntry {
  ayah: number;
  surah: number;
  text: string;
}

const QURAN_API = "https://api.alquran.cloud/v1/surah";
const TAFSIR_API = "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/ar-tafsir-as-saadi";

export const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

const memCache = new Map<string, unknown>();

function readStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* التخزين ممتلئ — نتجاهل */
  }
}

async function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  if (memCache.has(key)) return memCache.get(key) as T;
  const stored = readStorage<T>(key);
  if (stored) {
    memCache.set(key, stored);
    return stored;
  }
  const data = await loader();
  memCache.set(key, data);
  writeStorage(key, data);
  return data;
}

/** جلب سورة كاملة بالرسم العثماني */
export function fetchSurah(number: number): Promise<SurahData> {
  return cached(`surah:${number}`, async () => {
    const res = await fetch(`${QURAN_API}/${number}/quran-uthmani`);
    if (!res.ok) throw new Error("تعذّر تحميل السورة");
    const json = await res.json();
    const d = json.data;
    const ayahs: Ayah[] = d.ayahs.map((a: Ayah & { sajda: unknown }) => {
      let text = (a.text as string).replace(/^\uFEFF/, "");
      // البسملة تأتي ملحقة بأول آية في المصدر؛ نفصلها لعرضها كترويسة مستقلة
      // (ما عدا الفاتحة حيث البسملة آية منها، والتوبة حيث لا بسملة)
      if (a.numberInSurah === 1 && number !== 1 && number !== 9 && text.startsWith(BISMILLAH)) {
        text = text.slice(BISMILLAH.length).trimStart();
      }
      return {
      numberInSurah: a.numberInSurah,
      number: a.number,
      text,
      juz: a.juz,
      page: a.page,
      sajda: Boolean(a.sajda),
      };
    });
    return {
      number: d.number,
      name: d.name,
      englishName: d.englishName,
      revelationType: d.revelationType,
      numberOfAyahs: d.numberOfAyahs,
      ayahs,
    };
  });
}

/** جلب تفسير السعدي لسورة كاملة */
export function fetchTafsir(number: number): Promise<TafsirEntry[]> {
  return cached(`tafsir-saadi:${number}`, async () => {
    const res = await fetch(`${TAFSIR_API}/${number}.json`);
    if (!res.ok) throw new Error("تعذّر تحميل التفسير");
    const json = (await res.json()) as TafsirEntry[];
    return json.map((t) => ({ ayah: t.ayah, surah: t.surah, text: t.text || "" }));
  });
}

/** تنسيق نص التفسير: تحويل الأقواس {} إلى نص مميز */
export function tafsirParts(text: string): { type: "quran" | "text"; value: string }[] {
  const parts: { type: "quran" | "text"; value: string }[] = [];
  const re = /\{([^}]*)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ type: "text", value: text.slice(last, m.index) });
    parts.push({ type: "quran", value: m[1] });
    last = re.lastIndex;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts;
}

/**
 * تنسيق الأرقام للعرض — أرقام غربية (0-9) في كل التطبيق (قرار ADR-004).
 * تُحوَّل أي أرقام عربية-هندية واردة من مصادر خارجية إلى غربية.
 */
export function fmt(n: number | string): string {
  return String(n).replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}
