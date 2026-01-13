/**
 * API Client for making authenticated requests to the backend.
 * Used by dashboard pages to communicate with API routes.
 *
 * On Capacitor (native app), API calls go to the remote server.
 * On web, API calls go to the same origin.
 */

import { Capacitor } from '@capacitor/core';

// Use remote API for native apps (Capacitor), local for web
const getApiBase = (): string => {
    if (typeof window === 'undefined') {
        return process.env.NEXT_PUBLIC_SITE_URL || 'https://whatsou.com';
    }

    // On native platform, always use the remote API
    if (Capacitor.isNativePlatform()) {
        return 'https://whatsou.com';
    }

    // On web, use same origin
    return window.location.origin;
};

const API_BASE = getApiBase();

class ApiClient {
    private token: string | null = null;

    /**
     * Set the authentication token (called after login)
     */
    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
        }
    }

    /**
     * Get the current token from memory or localStorage
     */
    getToken(): string | null {
        if (this.token) return this.token;
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('auth_token');
        }
        return this.token;
    }

    /**
     * Clear the token (called on logout)
     */
    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
        }
    }

    /**
     * Check if user is authenticated (has a token)
     */
    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    /**
     * Make an authenticated fetch request
     */
    async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = this.getToken();

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            // If unauthorized, clear token
            if (response.status === 401) {
                // TEMPORARY DEBUG: Don't clear token automatically to debug 401 loop
                // this.clearToken();
                console.error('API Unauthorized (401) - Token NOT cleared for debugging');
            }
            throw new Error(data.error || `API Error: ${response.status}`);
        }

        return data as T;
    }

    // Convenience methods
    get<T>(endpoint: string): Promise<T> {
        return this.fetch<T>(endpoint, { method: 'GET' });
    }

    post<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.fetch<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    put<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.fetch<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    delete<T>(endpoint: string): Promise<T> {
        return this.fetch<T>(endpoint, { method: 'DELETE' });
    }
}

// Export singleton instance
export const api = new ApiClient();
