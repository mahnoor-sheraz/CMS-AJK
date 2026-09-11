import React from 'react';
import { Link } from '@inertiajs/react';
import { useLanguage } from '@/Context/LanguageContext';

function PublicLayoutContent({ children }) {
    const { lang, toggleLanguage } = useLanguage();
    const isUrdu = lang === 'ur';

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isTrackActive = currentPath.startsWith('/complaints/track');
    const isNewActive = currentPath === '/complaints/new' || currentPath === '/' || currentPath === '';

    return (
        <div
            dir={isUrdu ? 'rtl' : 'ltr'}
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: '#faf7f2',
                color: '#2a2623',
                fontFamily: isUrdu ? "'Noto Naskh Arabic', 'Archivo', sans-serif" : "'Archivo', sans-serif",
                lineHeight: isUrdu ? 1.75 : 1.55,
                fontSize: '15px',
            }}
        >
            {/* ── Top Government Golden / Amber Strip ── */}
            <div
                style={{
                    background: 'linear-gradient(90deg, #c8891a, #d49f34)',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap',
                    padding: '8px clamp(16px, 4vw, 56px)',
                    fontSize: '12.5px',
                    letterSpacing: '.01em',
                    fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Archivo', sans-serif",
                }}
            >
                <span>{isUrdu ? 'حکومت آزاد جموں و کشمیر' : 'Government of Azad Jammu & Kashmir'}</span>
                <span style={{ opacity: 0.9 }}>{isUrdu ? 'عوامی خدمت پورٹل ۲۴/۷' : '24/7 Citizen Service Portal'}</span>
            </div>

            {/* ── Forest Green Main Header ── */}
            <header
                style={{
                    background: '#344e41',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '18px',
                    flexWrap: 'wrap',
                    padding: '14px clamp(16px, 4vw, 56px)',
                }}
            >
                <Link
                    href="/complaints/new"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '13px',
                        textDecoration: 'none',
                    }}
                >
                    <div
                        style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            background: '#fff',
                            color: '#344e41',
                            display: 'grid',
                            placeItems: 'center',
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 800,
                            fontSize: '15px',
                            boxShadow: '0 4px 14px rgba(0,0,0,.16)',
                            flexShrink: 0,
                        }}
                    >
                        PM
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <span
                            style={{
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 800,
                                fontSize: '22px',
                                color: '#fff',
                                letterSpacing: '.03em',
                                lineHeight: 1.05,
                            }}
                        >
                            PMCC
                        </span>
                        <span
                            style={{
                                fontSize: '12px',
                                color: '#efd9ab',
                                fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Archivo', sans-serif",
                            }}
                        >
                            {isUrdu ? 'وزیرِ اعظم رابطہ مرکز' : "Prime Minister's Contact Centre"}
                        </span>
                    </div>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Only show 'File a complaint' button if NOT on the file complaint form */}
                    {!isNewActive && (
                        <Link
                            href="/complaints/new"
                            style={{
                                background: '#ec3013',
                                color: '#fff',
                                border: 0,
                                borderRadius: '999px',
                                fontFamily: isUrdu ? "'Noto Naskh Arabic', sans-serif" : "'Archivo', sans-serif",
                                fontWeight: 700,
                                fontSize: '13.5px',
                                padding: '12px 22px',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                boxShadow: '0 6px 16px rgba(0,0,0,.18)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'transform .18s cubic-bezier(.2,.8,.2,1), box-shadow .18s',
                            }}
                        >
                            {isUrdu ? 'شکایت درج کریں' : 'File a complaint'}
                        </Link>
                    )}

                    <Link
                        href="/complaints/track"
                        style={{
                            background: isTrackActive ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.08)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,.28)',
                            borderRadius: '999px',
                            fontFamily: isUrdu ? "'Noto Naskh Arabic', sans-serif" : "'Archivo', sans-serif",
                            fontWeight: 600,
                            fontSize: '13.5px',
                            padding: '11px 19px',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'background .2s, transform .18s',
                        }}
                    >
                        {isUrdu ? 'شکایت ٹریک کریں' : 'Track complaint'}
                    </Link>

                    <button
                        type="button"
                        onClick={toggleLanguage}
                        title="English / اردو"
                        style={{
                            background: 'transparent',
                            color: '#efd9ab',
                            border: '1px solid rgba(239,217,171,.45)',
                            borderRadius: '999px',
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 700,
                            fontSize: '12.5px',
                            padding: '11px 16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'background .2s, transform .18s',
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20" />
                        </svg>
                        <span>{isUrdu ? 'English' : 'اردو'}</span>
                    </button>
                </div>
            </header>

            {/* ── Main Children Container (Balanced padding for seamless viewport fit) ── */}
            <main
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: 'clamp(14px, 2vw, 24px) clamp(12px, 3vw, 44px) clamp(14px, 2vw, 20px)',
                }}
            >
                {children}
            </main>

            {/* ── Helpline Bar ── */}
            <div
                style={{
                    padding: '4px clamp(16px, 4vw, 56px) 14px',
                    textAlign: 'center',
                    fontSize: '13px',
                    color: '#6b645e',
                    fontFamily: isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Archivo', sans-serif",
                }}
            >
                {isUrdu
                    ? 'مدد چاہیے؟ کال کریں 0800-786-01 · اردو اور انگریزی میں دستیاب'
                    : 'Need help? Call 0800-786-01 · Available in English and Urdu'}
            </div>

            {/* ── Forest Green Footer ── */}
            <footer
                style={{
                    background: '#344e41',
                    color: 'rgba(255,255,255,.72)',
                    padding: '14px clamp(16px, 4vw, 56px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                    fontSize: '12.5px',
                    fontFamily: isUrdu ? "'Noto Naskh Arabic', sans-serif" : "'Archivo', sans-serif",
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                        style={{
                            background: '#eeb84e',
                            color: '#344e41',
                            borderRadius: '999px',
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 800,
                            fontSize: '11px',
                            letterSpacing: '.05em',
                            padding: '6px 11px',
                        }}
                    >
                        AJK
                    </span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>
                        {isUrdu ? 'حکومت آزاد جموں و کشمیر' : 'Government of Azad Jammu & Kashmir'}
                    </span>
                </div>
                <span>{isUrdu ? 'شہریوں کے لیے تیار کردہ' : 'Built for citizens'}</span>
            </footer>
        </div>
    );
}

export default function PublicLayout({ children }) {
    return <PublicLayoutContent>{children}</PublicLayoutContent>;
}
