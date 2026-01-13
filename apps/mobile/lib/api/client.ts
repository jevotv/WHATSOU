/**
 * API Client for mobile app.
 * All API calls go to the remote server (whatsou.com).
 */

const API_BASE = 'https://whatsou.com';

class ApiClient {
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
        }
    }

    getToken(): string | null {
        if (this.token) return this.token;
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('auth_token');
        }
        return this.token;
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
        }
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

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
            if (response.status === 401) {
                this.clearToken();
            }
            throw new Error(data.error || `API Error: ${response.status}`);
        }

        return data as T;
    }

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

export const api = new ApiClient();
