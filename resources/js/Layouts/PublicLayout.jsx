import React from 'react';
import { Link } from '@inertiajs/react';
import { useLanguage } from '@/Context/LanguageContext';
import AjkFlag from '@/Components/AjkFlag';
import AjkRibbon from '@/Components/AjkRibbon';

function PublicLayoutContent({ children }) {
    const { lang, toggleLanguage, t } = useLanguage();

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isNewActive = currentPath === '/complaints/new' || currentPath === '/' || currentPath === '';
    const isTrackActive = currentPath.startsWith('/complaints/track');

    return (
        <div className={`min-h-screen bg-gradient-to-b from-emerald-50/40 via-slate-50 to-slate-100 text-slate-900 flex flex-col font-sans transition-all duration-200 ${lang === 'ur' ? 'font-urdu' : ''}`}>
            {/* Top AJK Flag Ribbon Motif */}
            <AjkRibbon className="h-2 sm:h-2.5 shadow-sm z-50 sticky top-0" />

            {/* Top Navigation Bar with Deep Kashmir Green & Golden-Amber Accents */}
            <header className="bg-gradient-to-r from-[#034d28] via-[#045c32] to-[#034d28] text-white shadow-lg border-b-2 border-amber-400/90 sticky top-2 sm:top-2.5 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Branding Logo & Title with Official AJK Flag */}
                        <Link href="/complaints/new" className="flex items-center gap-3.5 group py-1">
                            <div className="relative">
                                <AjkFlag className="w-12 h-8 sm:w-14 sm:h-9 ring-2 ring-amber-400/80 shadow-md group-hover:scale-105 transition-transform" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-extrabold text-base sm:text-xl tracking-tight text-white group-hover:text-amber-200 transition-colors drop-shadow-sm">
                                    {t('appName')}
                                </span>
                                <span className="text-xs text-amber-300/90 font-medium flex items-center gap-1">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                    {t('appSubName')}
                                </span>
                            </div>
                        </Link>

                        {/* Right Section: Navigation Links & Saffron-Gold Language Switcher */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <nav className="hidden md:flex items-center gap-2.5">
                                <Link
                                    href="/complaints/new"
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                        isNewActive
                                            ? 'bg-emerald-950/80 text-amber-300 border-2 border-amber-400 shadow-md shadow-emerald-950/30'
                                            : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-amber-200'
                                    }`}
                                >
                                    {t('navSubmitComplaint')}
                                </Link>
                                <Link
                                    href="/complaints/track"
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                        isTrackActive
                                            ? 'bg-emerald-950/80 text-amber-300 border-2 border-amber-400 shadow-md shadow-emerald-950/30'
                                            : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-amber-200'
                                    }`}
                                >
                                    {t('navTrackComplaint')}
                                </Link>
                            </nav>

                            {/* Saffron-Gold Language Toggle Button */}
                            <button
                                type="button"
                                onClick={toggleLanguage}
                                className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-[#034d28] text-xs sm:text-sm font-black shadow-md border border-amber-200/60 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                title="Switch Language / زبان تبدیل کریں"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#034d28]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                                <span>{t('langSwitch')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Sub-Navigation Bar */}
                <div className="md:hidden bg-emerald-950/90 border-t border-emerald-800 px-4 py-2.5 flex justify-around text-xs font-bold">
                    <Link
                        href="/complaints/new"
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                            isNewActive ? 'bg-emerald-900 text-amber-300 border border-amber-400/80 shadow-sm' : 'text-emerald-200'
                        }`}
                    >
                        {t('navSubmitComplaint')}
                    </Link>
                    <Link
                        href="/complaints/track"
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                            isTrackActive ? 'bg-emerald-900 text-amber-300 border border-amber-400/80 shadow-sm' : 'text-emerald-200'
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

            {/* Decorative AJK Ribbon before Footer */}
            <AjkRibbon className="h-1.5" />

            {/* Footer with AJK Identity */}
            <footer className="bg-gradient-to-b from-slate-900 to-emerald-950 text-slate-300 border-t border-amber-500/40 text-center py-7 text-xs sm:text-sm">
                <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-2.5">
                    <div className="flex items-center gap-2">
                        <AjkFlag className="w-6 h-4" />
                        <span className="font-bold text-amber-300 tracking-wide">
                            حکومتِ آزاد جموں و کشمیر
                        </span>
                    </div>
                    <p className="text-slate-400">{t('footerText')}</p>
                </div>
            </footer>
        </div>
    );
}

export default function PublicLayout({ children }) {
    return <PublicLayoutContent>{children}</PublicLayoutContent>;
}

