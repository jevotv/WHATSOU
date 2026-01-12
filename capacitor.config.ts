import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.whatsou.app',
  appName: 'WhatSou',
  webDir: 'out',
  // Note: Removed server.url to enable native plugins.
  // The app now loads from the bundled 'out' folder.
};

export default config;

