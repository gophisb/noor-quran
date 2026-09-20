import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.houd11.quran",
  appName: "houd11",
  webDir: "dist",
  android: {
    allowMixedContent: false,
    backgroundColor: "#050b14",
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_noor",
      iconColor: "#5EEAD4",
    },
  },
};

export default config;
