import React from 'react';
import { Link } from '@inertiajs/react';
import { LanguageProvider, useLanguage } from '@/Context/LanguageContext';

function PublicLayoutContent({ children }) {
    const { lang, toggleLanguage, t } = useLanguage();

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isNewActive = currentPath === '/complaints/new' || currentPath === '/' || currentPath === '';
    const isTrackActive = currentPath.startsWith('/complaints/track');

    return (
        <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans transition-all duration-200 ${lang === 'ur' ? 'font-urdu' : ''}`}>
            {/* Top Navigation Bar */}
            <header className="bg-emerald-800 text-white shadow-md border-b border-emerald-900 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Branding Logo & Title */}
                        <Link href="/complaints/new" className="flex items-center gap-3 group">
                            <div className="w-12 h-12 rounded-full bg-emerald-700 border-2 border-emerald-400 flex items-center justify-center text-white font-bold text-xl shadow-inner group-hover:scale-105 transition-transform">
                                PMCC
                            </div>
                            <div className="flex flex-col">
                                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-emerald-200 transition-colors">
                                    {t('appName')}
                                </span>
                                <span className="text-xs text-emerald-200 font-medium">
                                    {t('appSubName')}
                                </span>
                            </div>
                        </Link>

                        {/* Right Section: Navigation Links & Language Switcher */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <nav className="hidden md:flex items-center gap-2">
                                <Link
                                    href="/complaints/new"
                                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                        isNewActive
                                            ? 'bg-emerald-950/60 text-white shadow-inner border border-emerald-600/40'
                                            : 'text-emerald-100 hover:bg-emerald-700/60 hover:text-white'
                                    }`}
                                >
                                    {t('navSubmitComplaint')}
                                </Link>
                                <Link
                                    href="/complaints/track"
                                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                        isTrackActive
                                            ? 'bg-emerald-950/60 text-white shadow-inner border border-emerald-600/40'
                                            : 'text-emerald-100 hover:bg-emerald-700/60 hover:text-white'
                                    }`}
                                >
                                    {t('navTrackComplaint')}
                                </Link>
                            </nav>

                            {/* Language Toggle Button */}
                            <button
                                type="button"
                                onClick={toggleLanguage}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-600/50 text-white text-sm font-bold shadow-sm transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                title="Switch Language"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                                <span>{t('langSwitch')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Sub-Navigation Bar */}
                <div className="md:hidden bg-emerald-900/90 border-t border-emerald-700/50 px-4 py-2 flex justify-around text-xs font-semibold">
                    <Link
                        href="/complaints/new"
                        className={`px-3 py-1.5 rounded-md ${
                            isNewActive ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-200'
                        }`}
                    >
                        {t('navSubmitComplaint')}
                    </Link>
                    <Link
                        href="/complaints/track"
                        className={`px-3 py-1.5 rounded-md ${
                            isTrackActive ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-200'
                        }`}
                    >
                        {t('navTrackComplaint')}
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-800 text-slate-400 border-t border-slate-700 text-center py-6 text-xs sm:text-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <p>{t('footerText')}</p>
                </div>
            </footer>
        </div>
    );
}

export default function PublicLayout({ children }) {
    return <PublicLayoutContent>{children}</PublicLayoutContent>;
}
