import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/Context/LanguageContext';

export default function ComplaintTrack({ complaint = null, searched = false, notFound = false, searchParams = {} }) {
    const { lang, t } = useLanguage();
    const isUrdu = lang === 'ur';

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        complaint_number: searchParams.complaint_number || '',
        cnic: searchParams.cnic || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        let hasError = false;
        const cleanComplaint = (data.complaint_number || '').trim();
        const cleanCnic = (data.cnic || '').replace(/[^0-9]/g, '');

        if (!cleanComplaint) {
            setError('complaint_number', isUrdu ? 'براہِ کرم ٹریکنگ نمبر درج کریں۔' : 'Please enter a tracking number.');
            hasError = true;
        }

        if (!cleanCnic) {
            setError('cnic', isUrdu ? 'شناختی کارڈ نمبر درج کریں۔' : 'Enter a valid CNIC.');
            hasError = true;
        } else if (cleanCnic.length !== 13) {
            setError('cnic', isUrdu ? 'درست ۱۳ ہندسوں کا شناختی کارڈ نمبر درج کریں۔' : 'Enter a valid 13-digit CNIC.');
            hasError = true;
        }

        if (hasError) return;
        post('/complaints/track');
    };

    const uiFont = isUrdu ? "'Noto Naskh Arabic', 'Archivo', sans-serif" : "'Archivo', sans-serif";
    const displayFont = isUrdu ? "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif" : "'Archivo', sans-serif";

    return (
        <PublicLayout>
            <Head title={isUrdu ? 'شکایت ٹریک کریں — PMCC' : 'Track Complaint — PMCC'} />

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
                            {isUrdu ? 'شکایت کی صورتحال' : 'Complaint status'}
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
                            {isUrdu ? 'میری شکایت کہاں تک پہنچی؟' : 'Where is my complaint?'}
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
                                ? 'ایس ایم ایس میں موصول ٹریکنگ نمبر اور شناختی کارڈ نمبر درج کریں اور اب تک کی ہر کارروائی دیکھیں۔'
                                : 'Enter your tracking number and CNIC to see every step and action taken so far.'}
                        </p>
                    </div>

                    {/* How It Works Steps */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                        {[
                            [isUrdu ? '۰۱' : '01', isUrdu ? '۲۴ گھنٹے میں تفویض' : 'Assigned within 24 hours', isUrdu ? 'محکمے کا افسر شکایت کی ذمہ داری لیتا ہے۔' : 'A case officer at the department takes ownership.'],
                            [isUrdu ? '۰۲' : '02', isUrdu ? 'ایس ایم ایس پر اطلاع' : 'Updates by SMS', isUrdu ? 'ہر تبدیلی آپ کے موبائل نمبر پر بھیجی جائے گی۔' : 'Every status change is sent to your mobile number.'],
                            [isUrdu ? '۰۳' : '03', isUrdu ? '۱۵ کام کے دن میں حل' : 'Resolution in 15 working days', isUrdu ? 'حل نہ ہونے پر معاملہ PMCC جائزہ ڈیسک کو جاتا ہے۔' : 'Unresolved cases escalate to the PMCC review desk.']
                        ].map(([n, title, desc]) => (
                            <div key={n} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '14px', alignItems: 'start', padding: '10px 12px', background: 'rgba(255,255,255,.06)', borderRadius: '16px' }}>
                                <span style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(238,184,78,.2)', color: '#eeb84e', border: '1.5px solid rgba(238,184,78,.5)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '13px' }}>{n}</span>
                                <div>
                                    <div style={{ fontFamily: uiFont, fontWeight: 700, fontSize: '14px', color: '#fff' }}>{title}</div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.6)', marginTop: '2px' }}>{desc}</div>
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

                {/* ── RIGHT MAIN FORM / DETAILS CARD ── */}
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
                        padding: 'clamp(24px, 3vw, 44px)',
                        gap: '26px',
                    }}
                >
                    <div>
                        <span
                            style={{
                                display: 'inline-block',
                                background: '#fdf3e0',
                                color: '#8a5c07',
                                borderRadius: '999px',
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 700,
                                fontSize: '12px',
                                padding: '7px 14px',
                            }}
                        >
                            {isUrdu ? 'ٹریکنگ سروس' : 'Tracking Service'}
                        </span>
                        <h2
                            style={{
                                fontFamily: displayFont,
                                fontWeight: 800,
                                color: '#344e41',
                                fontSize: isUrdu ? 'clamp(22px, 2.6vw, 30px)' : 'clamp(24px, 2.8vw, 32px)',
                                margin: '14px 0 0',
                            }}
                        >
                            {isUrdu ? 'شکایت کا سراغ لگائیں' : 'Track Your Complaint'}
                        </h2>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                            {/* Tracking number */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13.5px', fontWeight: 700, fontFamily: uiFont }}>
                                    {isUrdu ? 'ٹریکنگ نمبر' : 'Tracking number'} <span style={{ color: '#ec3013' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    dir="ltr"
                                    value={data.complaint_number}
                                    onChange={e => setData('complaint_number', e.target.value)}
                                    placeholder="CMP-YYYYMMDD-XXXX"
                                    style={{
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        background: '#faf7f2',
                                        border: `1.5px solid ${errors.complaint_number ? '#ec3013' : '#e6ded2'}`,
                                        borderRadius: '16px',
                                        font: 'inherit',
                                        fontSize: '15px',
                                        padding: '15px 18px',
                                        color: '#2a2623',
                                        outline: 'none',
                                    }}
                                />
                                {errors.complaint_number && <span style={{ fontSize: '12px', color: '#ec3013' }}>{errors.complaint_number}</span>}
                            </div>

                            {/* CNIC */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13.5px', fontWeight: 700, fontFamily: uiFont }}>
                                    {isUrdu ? 'قومی شناختی کارڈ نمبر' : 'CNIC number'} <span style={{ color: '#ec3013' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    dir="ltr"
                                    maxLength={13}
                                    value={data.cnic}
                                    onChange={e => setData('cnic', e.target.value.replace(/\D/g, ''))}
                                    placeholder="0000000000000"
                                    style={{
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        background: '#faf7f2',
                                        border: `1.5px solid ${errors.cnic ? '#ec3013' : '#e6ded2'}`,
                                        borderRadius: '16px',
                                        font: 'inherit',
                                        fontSize: '15px',
                                        padding: '15px 18px',
                                        color: '#2a2623',
                                        outline: 'none',
                                    }}
                                />
                                {errors.cnic && <span style={{ fontSize: '12px', color: '#ec3013' }}>{errors.cnic}</span>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            style={{
                                background: '#ec3013',
                                color: '#fff',
                                border: 0,
                                borderRadius: '999px',
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 700,
                                fontSize: '14.5px',
                                padding: '14px 28px',
                                cursor: processing ? 'not-allowed' : 'pointer',
                                alignSelf: 'flex-start',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 8px 20px rgba(236,48,19,.28)',
                            }}
                        >
                            <span>{processing ? (isUrdu ? 'تلاش جاری ہے...' : 'Searching...') : (isUrdu ? 'ٹریک کریں' : 'Track')}</span>
                            <span style={{ fontSize: '16px' }}>{isUrdu ? '←' : '→'}</span>
                        </button>
                    </form>

                    {/* Result Card */}
                    {searched && complaint && (
                        <div className="animate-pmcc-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', background: '#faf7f2', borderRadius: '22px', padding: '18px 20px' }}>
                                <div style={{ minWidth: 0 }}>
                                    <div dir="ltr" style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: 'clamp(20px, 2.6vw, 26px)', color: '#344e41' }}>
                                        {complaint.complaint_number}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#6b645e', marginTop: '6px' }}>
                                        {complaint.subject}
                                    </div>
                                </div>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', background: '#eaf1eb', borderRadius: '999px', color: '#344e41', fontFamily: uiFont, fontWeight: 700, fontSize: '13px', padding: '10px 16px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c8891a', display: 'block', animation: 'pmccRing 2s infinite' }} />
                                    {complaint.status}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '12px' }}>
                                {[
                                    [isUrdu ? 'تاریخِ اندراج' : 'Submitted', complaint.submitted_at ? new Date(complaint.submitted_at).toLocaleDateString() : '—'],
                                    [isUrdu ? 'محکمہ' : 'Department', isUrdu ? (complaint.department?.name_ur || complaint.department?.name || '—') : (complaint.department?.name || '—')],
                                    [isUrdu ? 'ضلع' : 'District', isUrdu ? (complaint.district?.name_ur || complaint.district?.name || '—') : (complaint.district?.name || '—')],
                                ].map(([k, v]) => (
                                    <div key={k} style={{ background: '#faf7f2', borderRadius: '18px', padding: '15px 17px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ fontSize: '12px', color: '#8b847d' }}>{k}</span>
                                        <span style={{ fontSize: '14.5px', fontWeight: 600 }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {searched && notFound && (
                        <div style={{ background: '#fdf3e0', border: '1.5px solid #e2ae4e', borderRadius: '20px', padding: '20px', textAlign: 'center', color: '#8a5c07' }}>
                            <div style={{ fontWeight: 700, fontSize: '16px' }}>{isUrdu ? 'شکایت نہیں ملی' : 'Complaint not found'}</div>
                            <div style={{ fontSize: '13px', marginTop: '6px' }}>
                                {isUrdu
                                    ? 'براہِ کرم ٹریکنگ نمبر اور شناختی کارڈ نمبر دوبارہ چیک کریں۔'
                                    : 'Please verify that your complaint reference number and CNIC match.'}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </PublicLayout>
    );
}
