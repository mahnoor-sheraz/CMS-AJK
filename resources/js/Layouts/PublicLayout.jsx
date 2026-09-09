import React from 'react';
import { Link } from '@inertiajs/react';
import { useLanguage } from '@/Context/LanguageContext';

function PublicLayoutContent({ children }) {
    const { lang, toggleLanguage, t } = useLanguage();

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isNewActive  = currentPath === '/complaints/new' || currentPath === '/' || currentPath === '';
    const isTrackActive = currentPath.startsWith('/complaints/track');

    return (
        <div className="portal-shell">
            {/* ── Utility bar — yellow background, exactly like V0 ── */}
            <div className="utility-bar">
                <span>{lang === 'ur' ? 'حکومتِ آزاد جموں و کشمیر' : 'GOVERNMENT OF AZAD JAMMU & KASHMIR'}</span>
                <span>{lang === 'ur' ? 'عوامی خدمت پورٹل · 24/7' : 'Public service portal · 24/7'}</span>
            </div>

            {/* ── Header — dark green, yellow bottom border ── */}
            <header className="site-header">
                <Link href="/complaints/new" className="brand-lockup" aria-label="PMCC home">
                    <div className="seal" aria-hidden="true">
                        <span>PM</span><i>CC</i>
                    </div>
                    <div>
                        <p className="brand-name">PMCC</p>
                        <p className="brand-urdu" lang="ur" dir="rtl">وزیراعظم رابطہ مرکز</p>
                    </div>
                </Link>

                <nav className="header-actions" aria-label="Main navigation">
                    <Link
                        href="/complaints/new"
                        className={`nav-link${isNewActive ? ' active' : ''}`}
                    >
                        {lang === 'ur' ? 'شکایت درج کریں' : 'File a complaint'}
                    </Link>
                    <Link
                        href="/complaints/track"
                        className={`nav-link${isTrackActive ? ' active' : ''}`}
                    >
                        {lang === 'ur' ? 'شکایت ٹریک کریں' : 'Track complaint'}
                        {!isTrackActive && <span aria-hidden="true">↗</span>}
                    </Link>
                    <button
                        className="language-button"
                        type="button"
                        onClick={toggleLanguage}
                        aria-label="Change language"
                    >
                        <span>EN</span><span lang="ur">اردو</span>
                    </button>
                </nav>
            </header>

            {/* ── Page content ── */}
            {children}

            {/* ── Footer — exactly like V0 ── */}
            <footer className="site-footer">
                <span className="footer-mark" aria-hidden="true">AJK</span>
                <span lang="ur" dir="rtl">حکومتِ آزاد جموں و کشمیر</span>
                <span className="footer-note">Built for citizens</span>
            </footer>
        </div>
    );
}

export default function PublicLayout({ children }) {
    return <PublicLayoutContent>{children}</PublicLayoutContent>;
}
