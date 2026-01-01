import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.whatsou.app',
  appName: 'WhatSou',
  webDir: 'out',
  server: {
    url: 'https://whatsoubuilder-git-paymob-integration-jevotv-3403s-projects.vercel.app/dashboard',
    cleartext: true,
    allowNavigation: [
      '*.vercel.app',
      'vercel.app',
      '*.vercel.com',
      'vercel.com',
      'github.com',
      '*.github.com',
      'google.com',
      '*.google.com',
      'gitlab.com',
      'bitbucket.org'
    ]
  }
};

export default config;
