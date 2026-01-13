import { Capacitor } from '@capacitor/core';

export const useCapacitor = () => {
    // Check if we are in a browser environment to avoid SSR issues
    const isAvailable = typeof window !== 'undefined';

    return {
        isNative: isAvailable ? Capacitor.isNativePlatform() : false,
        platform: isAvailable ? Capacitor.getPlatform() : 'web', // 'web', 'ios', 'android'
    };
};
