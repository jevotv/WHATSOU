'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '@/lib/i18n/dictionaries/en.json';
import ar from '@/lib/i18n/dictionaries/ar.json';

type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';
type Dictionary = typeof en;

interface LanguageContextType {
    language: Language;
    direction: Direction;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    dictionary: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaries = {
    en,
    ar,
};

export function LanguageProvider({
    children,
    defaultLanguage = 'en',
}: {
    children: React.ReactNode;
    defaultLanguage?: string;
}) {
    const [language, setLanguageState] = useState<Language>('en'); // Default to 'en' initially to avoid hydration mismatch
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Check localStorage first
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang) {
            setLanguageState(savedLang);
        } else if (defaultLanguage && (defaultLanguage === 'en' || defaultLanguage === 'ar')) {
            // Fallback to store default if provided
            setLanguageState(defaultLanguage as Language);
        }
        setMounted(true);
    }, [defaultLanguage]);

    useEffect(() => {
        if (mounted) {
            document.documentElement.lang = language;
            document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
            localStorage.setItem('language', language);
        }
    }, [language, mounted]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const getNestedValue = (obj: any, path: string): string => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const t = (key: string, params?: Record<string, string | number>): string => {
        let value = getNestedValue(dictionaries[language], key);

        if (!value) {
            console.warn(`Missing translation for key: ${key}`);
            return key;
        }

        if (params) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                value = value.replace(`{${paramKey}}`, String(paramValue));
            });
        }

        return value;
    };

    const contextValue = {
        language,
        direction: (language === 'ar' ? 'rtl' : 'ltr') as Direction,
        setLanguage,
        t,
        dictionary: dictionaries[language],
    };

    // Avoid hydration mismatch by rendering children only after mount, 
    // or render with default structure but be careful about directional content.
    // For simplicity in this app, we'll render immediately but effects will fix direction.
    // However, specifically for LTR/RTL, a flash of wrong direction might happen.
    // To prevent accessible content mismatch, we return children always.

    return (
        <LanguageContext.Provider value={contextValue}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
