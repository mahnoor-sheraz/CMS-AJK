import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/Context/LanguageContext';

export default function ComplaintConfirmation({ complaint }) {
    const { lang } = useLanguage();
    const [copied, setCopied] = useState(false);
    const isUrdu = lang === 'ur';

    const handleCopy = () => {
        if (complaint?.complaint_number) {
            try {
                navigator.clipboard.writeText(complaint.complaint_number);
            } catch (e) {}
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const uiFont = isUrdu ? "'Noto Naskh Arabic', 'Archivo', sans-serif" : "'Archivo', sans-serif";
    const displayFont = isUrdu ? "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif" : "'Archivo', sans-serif";

    if (!complaint || !complaint.complaint_number) {
        return (
            <PublicLayout>
                <Head title={isUrdu ? 'شکایت نہیں ملی' : 'Complaint Not Found'} />
                <div style={{ maxWidth: '640px', margin: '40px auto', background: '#fff', borderRadius: '24px', padding: '36px', textAlign: 'center', boxShadow: '0 16px 40px rgba(0,0,0,.08)' }}>
                    <h2 style={{ fontFamily: displayFont, color: '#344e41' }}>{isUrdu ? 'شکایت نہیں ملی' : 'Complaint Not Found'}</h2>
                    <p style={{ color: '#6b645e', margin: '12px 0 24px' }}>
                        {isUrdu ? 'شکایت کی تفصیلات دستیاب نہیں ہیں۔' : 'Complaint details are unavailable.'}
                    </p>
                    <Link href="/complaints/new" style={{ background: '#ec3013', color: '#fff', textDecoration: 'none', padding: '12px 24px', borderRadius: '999px', fontWeight: 700 }}>
                        {isUrdu ? 'نئی شکایت درج کریں' : 'File a complaint'}
                    </Link>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <Head title={`${complaint.complaint_number} — PMCC`} />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(16px, 2vw, 26px)', alignItems: 'stretch', width: '100%', maxWidth: '1320px', margin: '0 auto' }}>

                {/* ── LEFT POSTER SIDEBAR ── */}
                <aside
                    style={{
                        flex: '1 1 340px',
                        minWidth: 0,
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'linear-gradient(158deg, #344e41, #283d33)',
                        color: '#f6fbf7',
                        borderRadius: '28px',
                        padding: 'clamp(26px, 3vw, 40px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'clamp(22px, 2.6vw, 32px)',
                        boxShadow: '0 16px 40px rgba(42,38,35,.1)',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            insetInlineEnd: '-70px',
                            top: '-70px',
                            width: '230px',
                            height: '230px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle at 32% 32%, rgba(200,137,26,.34), rgba(200,137,26,0) 70%)',
                            pointerEvents: 'none',
                            animation: 'pmccFloat 9s ease-in-out infinite',
                        }}
                    />

                    <div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '9px',
                                fontSize: '12px',
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 700,
                                letterSpacing: '.02em',
                                color: '#e2ae4e',
                                background: 'rgba(200,137,26,.15)',
                                borderRadius: '999px',
                                padding: '7px 14px',
                                width: 'fit-content',
                            }}
                        >
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#e2ae4e', display: 'block' }} />
                            {isUrdu ? 'شکایت درج ہو گئی' : 'Complaint recorded'}
                        </div>

                        <h1
                            style={{
                                fontFamily: displayFont,
                                fontWeight: 800,
                                color: '#eeb84e',
                                fontSize: isUrdu ? 'clamp(24px, 3vw, 34px)' : 'clamp(28px, 3.4vw, 40px)',
                                lineHeight: isUrdu ? 1.7 : 1.1,
                                letterSpacing: isUrdu ? 'normal' : '-.015em',
                                margin: '18px 0 0',
                            }}
                        >
                            {isUrdu ? 'آپ کی شکایت درج ہو گئی۔' : 'Your complaint is on record.'}
                        </h1>

                        <p
                            style={{
                                margin: '16px 0 0',
                                fontSize: '15.5px',
                                maxWidth: '40ch',
                                color: 'rgba(255,255,255,.8)',
                                lineHeight: 1.55,
                            }}
                        >
                            {isUrdu
                                ? 'یہ متعلقہ محکمے اور وزیرِ اعظم رابطہ مرکز کو بھیج دی گئی ہے۔ اپنا ٹریکنگ نمبر محفوظ رکھیں۔'
                                : 'It has been forwarded to the department and to the Prime Minister’s Contact Centre. Save your tracking number.'}
                        </p>
                    </div>

                    {/* Next Steps List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                            [isUrdu ? '۰۱' : '01', isUrdu ? '۲۴ گھنٹے میں تفویض' : 'Assigned within 24 hours', isUrdu ? 'محکمے کا افسر شکایت کی ذمہ داری لیتا ہے۔' : 'A case officer at the department takes ownership.'],
                            [isUrdu ? '۰۲' : '02', isUrdu ? 'ایس ایم ایس پر اطلاع' : 'Updates by SMS', isUrdu ? 'ہر تبدیلی آپ کے موبائل نمبر پر بھیجی جائے گی۔' : 'Every status change is sent to your mobile number.'],
                            [isUrdu ? '۰۳' : '03', isUrdu ? '۱۵ کام کے دن میں حل' : 'Resolution in 15 working days', isUrdu ? 'حل نہ ہونے پر معاملہ PMCC جائزہ ڈیسک کو جاتا ہے۔' : 'Unresolved cases escalate to the PMCC review desk.']
                        ].map(([n, title, desc]) => (
                            <div key={n} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '14px', alignItems: 'start', padding: '12px 14px', background: 'rgba(255,255,255,.07)', borderRadius: '18px' }}>
                                <span style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(238,184,78,.2)', color: '#eeb84e', border: '1.5px solid rgba(238,184,78,.5)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '14px' }}>{n}</span>
                                <div>
                                    <div style={{ fontFamily: uiFont, fontWeight: 700, fontSize: '14.5px', color: '#fff' }}>{title}</div>
                                    <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,.6)', marginTop: '2px' }}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            marginTop: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '12.5px',
                            color: 'rgba(255,255,255,.8)',
                            background: 'rgba(255,255,255,.07)',
                            borderRadius: '16px',
                            padding: '12px 14px',
                            fontFamily: uiFont,
                        }}
                    >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#e2ae4e" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <span>{isUrdu ? 'محفوظ اور رازدارانہ' : 'Encrypted and confidential'}</span>
                    </div>
                </aside>

                {/* ── RIGHT MAIN SUCCESS CARD ── */}
                <section
                    style={{
                        flex: '2 1 560px',
                        background: '#fff',
                        borderRadius: '28px',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                        overflow: 'hidden',
                        boxShadow: '0 18px 46px rgba(42,38,35,.1)',
                        padding: 'clamp(24px, 3.6vw, 48px)',
                        gap: '28px',
                    }}
                >
                    {/* Top ticket box */}
                    <div style={{ background: '#faf7f2', borderRadius: '24px', padding: 'clamp(22px, 3vw, 36px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
                        <span style={{ fontFamily: uiFont, fontWeight: 700, fontSize: '13px', color: '#8b847d', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                            {isUrdu ? 'ٹریکنگ نمبر' : 'Tracking number'}
                        </span>
                        <div dir="ltr" style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: 'clamp(26px, 4vw, 40px)', color: '#344e41', letterSpacing: '.03em' }}>
                            {complaint.complaint_number}
                        </div>
                        <p style={{ fontSize: '13.5px', color: '#6b645e', margin: 0, maxWidth: '42ch' }}>
                            {isUrdu ? 'یہ نمبر آپ کے موبائل پر ایس ایم ایس کے ذریعے بھیج دیا گیا ہے۔' : 'An SMS with this number has been sent to your mobile.'}
                        </p>
                        <button
                            type="button"
                            onClick={handleCopy}
                            style={{
                                marginTop: '4px',
                                background: '#fff',
                                color: '#344e41',
                                border: '1.5px solid #e6ded2',
                                borderRadius: '999px',
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 700,
                                fontSize: '13.5px',
                                padding: '11px 22px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'background .2s, transform .2s',
                            }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                            </svg>
                            <span>{copied ? (isUrdu ? 'کاپی ہو گیا' : 'Copied') : (isUrdu ? 'نمبر کاپی کریں' : 'Copy number')}</span>
                        </button>
                    </div>

                    {/* Complaint Summary Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                        {[
                            [isUrdu ? 'موضوع' : 'Subject', complaint.subject || '—'],
                            [isUrdu ? 'محکمہ' : 'Department', isUrdu ? (complaint.department?.name_ur || complaint.department?.name || '—') : (complaint.department?.name || '—')],
                            [isUrdu ? 'ضلع' : 'District', isUrdu ? (complaint.district?.name_ur || complaint.district?.name || '—') : (complaint.district?.name || '—')],
                            [isUrdu ? 'شہری' : 'Citizen', complaint.citizen?.name || '—'],
                        ].map(([k, v]) => (
                            <div key={k} style={{ background: '#faf7f2', borderRadius: '18px', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '12px', color: '#8b847d' }}>{k}</span>
                                <span style={{ fontSize: '15px', fontWeight: 600, color: '#2a2623' }}>{v}</span>
                            </div>
                        ))}
                    </div>

                    {/* Action buttons */}
                    <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
                        <Link
                            href="/complaints/track"
                            style={{
                                background: '#ec3013',
                                color: '#fff',
                                borderRadius: '999px',
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 700,
                                fontSize: '14.5px',
                                padding: '15px 28px',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 8px 20px rgba(236,48,19,.28)',
                            }}
                        >
                            <span>{isUrdu ? 'یہ شکایت ٹریک کریں' : 'Track this complaint'}</span>
                            <span style={{ fontSize: '16px' }}>{isUrdu ? '←' : '→'}</span>
                        </Link>
                        <Link
                            href="/complaints/new"
                            style={{
                                background: '#faf7f2',
                                color: '#344e41',
                                border: '1.5px solid #e6ded2',
                                borderRadius: '999px',
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 700,
                                fontSize: '14.5px',
                                padding: '14px 24px',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <span>{isUrdu ? 'نئی شکایت درج کریں' : 'File another complaint'}</span>
                        </Link>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
