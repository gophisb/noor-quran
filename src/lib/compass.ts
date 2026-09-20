// البوصلة — قراءة اتجاه الجهاز بدقة: مصدر مطلق أولاً، تصحيح دوران الشاشة، تنعيم دائري
import { useCallback, useEffect, useRef, useState } from "react";

export type CompassPermission = "idle" | "granted" | "denied" | "unsupported";

export interface CompassReading {
  heading: number | null; // درجات من الشمال الحقيقي/المغناطيسي، باتجاه عقارب الساعة
  accuracy: number | null; // ± درجات إن وفّرها الجهاز (iOS)
  source: "absolute" | "webkit" | "relative" | null;
}

type OrientationEvt = DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };

/** زاوية دوران الشاشة (0 / 90 / 180 / 270) */
export function screenAngle(): number {
  const so = typeof screen !== "undefined" ? screen.orientation : undefined;
  if (so && typeof so.angle === "number") return so.angle;
  const legacy = (window as unknown as { orientation?: number }).orientation;
  return typeof legacy === "number" ? legacy : 0;
}

/** تحويل حدث الاتجاه إلى زاوية اتجاه (0–360) — نقيّة وقابلة للاختبار */
export function headingFromEvent(e: OrientationEvt, screenRotation = 0): { heading: number; source: CompassReading["source"] } | null {
  if (typeof e.webkitCompassHeading === "number" && !Number.isNaN(e.webkitCompassHeading)) {
    // iOS: القيمة جاهزة من الشمال المغناطيسي، وتراعي دوران الشاشة داخلياً
    return { heading: norm(e.webkitCompassHeading), source: "webkit" };
  }
  if (e.alpha === null || e.alpha === undefined) return null;
  // Android: alpha تدور عكس عقارب الساعة؛ نعوّض دوران الشاشة
  return { heading: norm(360 - e.alpha + screenRotation), source: e.absolute ? "absolute" : "relative" };
}

export const norm = (deg: number) => ((deg % 360) + 360) % 360;

/** أقصر فرق زاوي بين اتجاهين (−180..180) */
export function angleDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

/** تنعيم دائري (مرشّح منخفض التمرير) — يمنع القفز عند عبور 0/360 */
export function smoothHeading(prev: number | null, next: number, alpha = 0.25): number {
  if (prev === null) return next;
  return norm(prev + alpha * angleDelta(prev, next));
}

export function useCompass() {
  const [permission, setPermission] = useState<CompassPermission>("idle");
  const [reading, setReading] = useState<CompassReading>({ heading: null, accuracy: null, source: null });
  const smoothed = useRef<number | null>(null);
  const hasAbsolute = useRef(false);

  useEffect(() => {
    if (permission !== "granted") return;
    const onAbsolute = (e: Event) => {
      hasAbsolute.current = true;
      apply(e as OrientationEvt);
    };
    const onRelative = (e: Event) => {
      const ev = e as OrientationEvt;
      // إن كان المصدر المطلق متاحاً نتجاهل النسبي (إلا على iOS حيث webkitCompassHeading هو المصدر المطلق)
      if (hasAbsolute.current && typeof ev.webkitCompassHeading !== "number") return;
      apply(ev);
    };
    const apply = (ev: OrientationEvt) => {
      const h = headingFromEvent(ev, screenAngle());
      if (!h) return;
      smoothed.current = smoothHeading(smoothed.current, h.heading);
      setReading({
        heading: smoothed.current,
        accuracy: typeof ev.webkitCompassAccuracy === "number" && ev.webkitCompassAccuracy >= 0 ? ev.webkitCompassAccuracy : null,
        source: h.source,
      });
    };
    window.addEventListener("deviceorientationabsolute", onAbsolute, true);
    window.addEventListener("deviceorientation", onRelative, true);
    return () => {
      window.removeEventListener("deviceorientationabsolute", onAbsolute, true);
      window.removeEventListener("deviceorientation", onRelative, true);
    };
  }, [permission]);

  const enable = useCallback(async () => {
    if (typeof DeviceOrientationEvent === "undefined") return setPermission("unsupported");
    const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof D.requestPermission === "function") {
      try {
        setPermission((await D.requestPermission()) === "granted" ? "granted" : "denied");
      } catch {
        setPermission("denied");
      }
    } else {
      setPermission("granted");
    }
  }, []);

  return { permission, reading, enable };
}
