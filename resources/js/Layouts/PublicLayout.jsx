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
        <div className={`min-h-screen bg-pmcc-bg-citizen text-pmcc-text-main flex flex-col font-sans transition-all duration-200 ${lang === 'ur' ? 'font-urdu' : ''}`}>
            {/* Top AJK Flag Ribbon Motif */}
            <AjkRibbon className="h-2 sm:h-2.5 shadow-sm z-50 sticky top-0" />

            {/* Top Navigation Bar */}
            <header className="bg-pmcc-primary text-white shadow-sm border-b border-pmcc-primary-hover sticky top-2 sm:top-2.5 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Branding Logo & Title with Official AJK Flag */}
                        <Link href="/complaints/new" className="flex items-center gap-3.5 group py-1">
                            <div className="relative flex items-center justify-center w-14 h-14 bg-pmcc-primary-hover rounded-md shadow-inner">
                                <img src="/images/ajk-logo.png" alt="AJK Logo" className="w-10 h-10 object-contain drop-shadow-md" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-extrabold text-base sm:text-xl tracking-tight text-white transition-colors drop-shadow-sm">
                                    PMCC
                                </span>
                                <span className="text-sm text-pmcc-accent-soft font-medium flex items-center gap-1 font-urdu mt-[-2px]">
                                    وزیراعظم رابطہ مرکز
                                </span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2 sm:gap-4">
                            <nav className="hidden md:flex items-center gap-2.5">
                                <Link
                                    href="/complaints/new"
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                        isNewActive
                                            ? 'bg-pmcc-accent text-white shadow-md'
                                            : 'text-pmcc-accent-muted hover:bg-pmcc-primary-hover hover:text-white'
                                    }`}
                                >
                                    {t('navSubmitComplaint')}
                                </Link>
                                <Link
                                    href="/complaints/track"
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                        isTrackActive
                                            ? 'bg-pmcc-accent text-white shadow-md'
                                            : 'text-pmcc-accent-muted hover:bg-pmcc-primary-hover hover:text-white'
                                    }`}
                                >
                                    {t('navTrackComplaint')}
                                </Link>
                            </nav>

                            {/* Language Toggle Button */}
                            <button
                                type="button"
                                onClick={toggleLanguage}
                                className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-pmcc-accent hover:bg-opacity-90 text-white text-xs sm:text-sm font-black shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-pmcc-accent"
                                title="Switch Language / زبان تبدیل کریں"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                                <span>{t('langSwitch')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Sub-Navigation Bar */}
                <div className="md:hidden bg-pmcc-primary border-t border-pmcc-primary-hover px-4 py-2.5 flex justify-around text-xs font-bold">
                    <Link
                        href="/complaints/new"
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                            isNewActive ? 'bg-pmcc-accent text-white shadow-sm' : 'text-pmcc-accent-muted hover:bg-pmcc-primary-hover hover:text-white'
                        }`}
                    >
                        {t('navSubmitComplaint')}
                    </Link>
                    <Link
                        href="/complaints/track"
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                            isTrackActive ? 'bg-pmcc-accent text-white shadow-sm' : 'text-pmcc-accent-muted hover:bg-pmcc-primary-hover hover:text-white'
                        }`}
                    >
                        {t('navTrackComplaint')}
                    </Link>
                </div>
            </header>

            <div className="bg-pmcc-primary w-full overflow-hidden leading-none">
                <svg viewBox="0 0 400 46" preserveAspectRatio="none" className="w-full h-4 sm:h-6 block">
                  <path d="M0,46 C50,30 90,34 130,24 C160,17 175,10 195,10 C215,10 225,20 245,26 C275,35 310,28 340,32 C365,35 385,30 400,26 L400,46 Z" fill="#ffffff" opacity="0.08"/>
                  <path d="M0,46 C30,36 60,38 90,30 C115,24 135,14 160,14 C180,14 190,24 208,30 L230,20 C245,13 258,16 270,24 C290,37 320,30 350,34 C370,36 388,32 400,30 L400,46 Z" fill="#ffffff" opacity="0.14"/>
                  <path d="M195,10 L200,4 L205,10" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col justify-center py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full relative z-10">
                {children}
            </main>

            {/* Decorative AJK Ribbon before Footer */}
            <AjkRibbon className="h-1.5" />

            {/* Footer with AJK Identity */}
            <footer className="bg-gradient-to-b from-pmcc-primary-hover to-pmcc-primary text-pmcc-bg-citizen border-t border-pmcc-accent text-center py-7 text-xs sm:text-sm">
                <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-2.5">
                    <div className="flex items-center gap-2">
                        <AjkFlag className="w-6 h-4" />
                        <span className="font-bold text-pmcc-accent tracking-wide">
                            حکومتِ آزاد جموں و کشمیر
                        </span>
                    </div>
                    <p className="text-pmcc-border">{t('footerText')}</p>
                </div>
            </footer>
        </div>
    );
}

export default function PublicLayout({ children }) {
    return <PublicLayoutContent>{children}</PublicLayoutContent>;
}

