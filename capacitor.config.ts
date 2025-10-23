import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.59d5b5db67bf4705af2eee96d82c9cdb',
  appName: 'FreshTrack',
  webDir: 'dist',
  server: {
    url: 'https://59d5b5db-67bf-4705-af2e-ee96d82c9cdb.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
    },
  },
};

export default config;
