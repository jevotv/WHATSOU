
import { PushNotifications, Token, ActionPerformed } from '@capacitor/push-notifications';
import { Badge } from '@capawesome/capacitor-badge';
import { Capacitor } from '@capacitor/core';
import { api } from '@/lib/api/client';

export class NotificationService {
    private static initialized = false;

    static async init() {
        if (!Capacitor.isNativePlatform() || this.initialized) return;

        try {
            // Request permission to use push notifications
            const result = await PushNotifications.requestPermissions();

            if (result.receive === 'granted') {
                // Register with Apple / Google to receive push via APNS/FCM
                await PushNotifications.register();
            } else {
                console.warn('Push notification permission denied');
            }

            this.setupListeners();
            this.initialized = true;
        } catch (e) {
            console.error('Error initializing notifications:', e);
        }
    }

    private static setupListeners() {
        // On success, we should be able to receive notifications
        PushNotifications.addListener('registration', (token: Token) => {
            console.log('Push registration success, token: ' + token.value);
            this.sendTokenToBackend(token.value);
        });

        // Some issue with our setup and push will not work
        PushNotifications.addListener('registrationError', (error: any) => {
            console.error('Error on registration: ' + JSON.stringify(error));
        });

        // Show us the notification payload if the app is open on our device
        PushNotifications.addListener('pushNotificationReceived', async (notification) => {
            console.log('Push received: ' + JSON.stringify(notification));
            // Verify if it's an order notification to increment badge
            await this.incrementBadge();
        });

        // Method called when tapping on a notification
        PushNotifications.addListener('pushNotificationActionPerformed', async (notification: ActionPerformed) => {
            console.log('Push action performed: ' + JSON.stringify(notification));
            // Clear badge on open if appropriate, or navigate
            // await this.clearBadge(); 
        });
    }

    private static async sendTokenToBackend(token: string) {
        try {
            // We need a backend endpoint for this. 
            // For now, we just log it, or you can implement the API call.
            console.log('Sending token to backend:', token);
            await api.post('/api/notifications/register-token', { token, platform: Capacitor.getPlatform() });
        } catch (e) {
            console.error('Failed to send token to backend', e);
        }
    }

    static async incrementBadge() {
        if (!Capacitor.isNativePlatform()) return;
        try {
            const { count } = await Badge.get();
            await Badge.set({ count: count + 1 });
        } catch (e) {
            console.error('Error incrementing badge', e);
        }
    }

    static async setBadge(count: number) {
        if (!Capacitor.isNativePlatform()) return;
        try {
            await Badge.set({ count });
        } catch (e) {
            console.error('Error setting badge', e);
        }
    }

    static async clearBadge() {
        if (!Capacitor.isNativePlatform()) return;
        try {
            await Badge.clear();
        } catch (e) {
            console.error('Error clearing badge', e);
        }
    }
}
