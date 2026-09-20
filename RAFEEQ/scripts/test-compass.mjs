// اختبار وحدات لمنطق البوصلة النقي (بدون DOM)
const norm = (deg) => ((deg % 360) + 360) % 360;
const angleDelta = (from, to) => ((to - from + 540) % 360) - 180;
const smoothHeading = (prev, next, a = 0.25) => prev === null ? next : norm(prev + a * angleDelta(prev, next));
const headingFromEvent = (e, rot = 0) => {
  if (typeof e.webkitCompassHeading === "number") return { heading: norm(e.webkitCompassHeading), source: "webkit" };
  if (e.alpha == null) return null;
  return { heading: norm(360 - e.alpha + rot), source: e.absolute ? "absolute" : "relative" };
};
const eq = (a, b, m) => { if (Math.abs(a - b) > 1e-9) { console.log("FAIL", m, a, b); process.exit(1); } console.log("PASS", m); };
eq(headingFromEvent({ alpha: 0, absolute: true }).heading, 0, "android alpha=0 → N");
eq(headingFromEvent({ alpha: 270, absolute: true }).heading, 90, "android alpha=270 → E");
eq(headingFromEvent({ alpha: 270, absolute: true }, 90).heading, 180, "landscape rotation compensated");
eq(headingFromEvent({ webkitCompassHeading: 45, alpha: 0 }).heading, 45, "iOS webkit heading preferred");
eq(angleDelta(350, 10), 20, "delta across 0/360 short way");
eq(angleDelta(10, 350), -20, "delta negative direction");
eq(smoothHeading(358, 2), 359, "smoothing does not jump at wrap");
eq(smoothHeading(null, 123), 123, "first reading passthrough");
console.log("RESULT: PASS");
