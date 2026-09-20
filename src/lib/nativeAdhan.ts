// الأذان في الخلفية على أندرويد — إشعارات محلية مجدولة بصوت الأذان (تعمل والتطبيق مغلق)
import { Capacitor } from "@capacitor/core";
import { LocalNotifications, type LocalNotificationSchema } from "@capacitor/local-notifications";
import type { AdhanSettings, MuadhinId } from "./adhan";
import { computeTimes, PRAYER_ORDER, type LocationState, type PrayerKey } from "./prayer";

export const isNative = () => Capacitor.isNativePlatform();

const DAYS_AHEAD = 3; // تُعاد الجدولة عند كل فتح/استئناف للتطبيق
const PRAYER_INDEX: Record<Exclude<PrayerKey, "sunrise">, number> = { fajr: 1, dhuhr: 2, asr: 3, maghrib: 4, isha: 5 };

/** معرّف ثابت لكل (يوم، صلاة) لتفادي التكرار: YYYYMMDD * 10 + رقم الصلاة */
function notificationId(at: Date, prayer: Exclude<PrayerKey, "sunrise">): number {
  const y = at.getFullYear(), m = at.getMonth() + 1, d = at.getDate();
  return (y * 10000 + m * 100 + d) * 10 + PRAYER_INDEX[prayer];
}

/** قناة لكل مؤذن لأن صوت القناة يُثبَّت عند إنشائها (Android 8+) */
const CHANNELS: Record<MuadhinId, { id: string; name: string; sound: string }> = {
  alaqsa: { id: "adhan_alaqsa", name: "الأذان — المسجد الأقصى", sound: "adhan_alaqsa.mp3" },
  madinah: { id: "adhan_madinah", name: "الأذان — المسجد النبوي", sound: "adhan_madinah.mp3" },
};

let channelsReady = false;
async function ensureChannels() {
  if (channelsReady) return;
  for (const c of Object.values(CHANNELS)) {
    await LocalNotifications.createChannel({
      id: c.id,
      name: c.name,
      description: "رفع الأذان عند دخول وقت الصلاة",
      importance: 5,
      visibility: 1,
      sound: c.sound,
      vibration: true,
      lights: true,
      lightColor: "#5EEAD4",
    });
  }
  channelsReady = true;
}

export async function requestNativePermissions(): Promise<boolean> {
  if (!isNative()) return false;
  const p = await LocalNotifications.requestPermissions();
  return p.display === "granted";
}

/**
 * يلغي كل الجدولة السابقة ويعيد جدولة الأذان للأيام القادمة.
 * آمن للاستدعاء المتكرر (idempotent).
 */
export async function scheduleNativeAdhan(location: LocationState, settings: AdhanSettings): Promise<number> {
  if (!isNative()) return 0;
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length) await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
  if (!settings.enabled) return 0;
  if (!(await requestNativePermissions())) return 0;
  await ensureChannels();

  const channel = CHANNELS[settings.muadhin];
  const now = Date.now();
  const list: LocalNotificationSchema[] = [];
  for (let day = 0; day < DAYS_AHEAD; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    const times = computeTimes(location, date, settings.madhab);
    for (const p of PRAYER_ORDER) {
      if (p.key === "sunrise") continue;
      const key = p.key as Exclude<PrayerKey, "sunrise">;
      if (!settings.perPrayer[key]) continue;
      const at = times[key];
      if (at.getTime() <= now) continue;
      list.push({
        id: notificationId(at, key),
        title: `حان الآن موعد صلاة ${p.name}`,
        body: location.label,
        channelId: channel.id,
        sound: channel.sound,
        schedule: { at, allowWhileIdle: true },
        smallIcon: "ic_stat_noor",
        autoCancel: true,
        extra: { prayer: key },
      });
    }
  }
  if (list.length) await LocalNotifications.schedule({ notifications: list });
  return list.length;
}
