import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.whatsou.app',
    appName: 'WhatSou',
    webDir: 'out',
    server: {
        // No server.url - we're using static HTML files
        androidScheme: 'https'
    },
    plugins: {
        Camera: {
            permissions: [
                'camera',
                'photos'
            ]
        },
        Geolocation: {
            permissions: [
                'location'
            ]
        },
        PushNotifications: {
            presentationOptions: ["badge", "sound", "alert"]
        },
        CapacitorHttp: {
            enabled: false
        }
    }
};

export default config;
