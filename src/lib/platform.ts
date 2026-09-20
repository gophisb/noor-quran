// Platform helpers intentionally avoid importing Capacitor so web boot stays dependency-light.
export const isBrowser = () => typeof window !== "undefined";
