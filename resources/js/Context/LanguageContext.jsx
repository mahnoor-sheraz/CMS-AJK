import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('pmcc_lang') || 'ur';
        }
        return 'ur';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('pmcc_lang', lang);
            document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
            document.documentElement.lang = lang;
        }
    }, [lang]);

    const toggleLanguage = () => {
        setLang((prevLang) => (prevLang === 'ur' ? 'en' : 'ur'));
    };

    const t = (key, params = {}) => {
        let text = translations[lang]?.[key] || translations['en']?.[key] || key;
        Object.keys(params).forEach((paramKey) => {
            text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
        });
        return text;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        return {
            lang: 'ur',
            setLang: () => {},
            toggleLanguage: () => {},
            t: (key, params = {}) => {
                let text = translations['ur']?.[key] || translations['en']?.[key] || key;
                Object.keys(params).forEach((paramKey) => {
                    text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
                });
                return text;
            },
        };
    }
    return context;
}
