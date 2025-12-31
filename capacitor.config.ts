import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.whatsou.app',
  appName: 'WhatSou',
  webDir: 'out',
  server: {
    url: 'https://whatsoubuilder-git-paymob-integration-jevotv-3403s-projects.vercel.app',
    cleartext: true
  }
};

export default config;
