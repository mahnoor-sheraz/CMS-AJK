import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/Context/LanguageContext';
import ComplaintPrintDocument from '@/Components/ComplaintPrintDocument';

export default function ComplaintTrack({ complaint = null, searched = false, notFound = false, searchParams = {} }) {
    const { lang } = useLanguage();
    const isUrdu = lang === 'ur';

    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        complaint_number: searchParams.complaint_number || (complaint?.complaint_number || ''),
        cnic: searchParams.cnic || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        const cleanComplaint = (data.complaint_number || '').trim();

        if (!cleanComplaint) {
            setError('complaint_number', isUrdu ? 'براہِ کرم ٹریکنگ نمبر درج کریں۔' : 'Please enter a tracking number.');
            return;
        }

        post('/complaints/track');
    };

    const uiFont = isUrdu ? "'Noto Naskh Arabic', 'Archivo', sans-serif" : "'Archivo', sans-serif";
    const displayFont = isUrdu ? "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif" : "'Archivo', sans-serif";

    // Format dates helper
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        try {
            const d = new Date(dateString);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
            const monthsUr = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'];
            const day = d.getDate();
            const month = isUrdu ? monthsUr[d.getMonth()] : months[d.getMonth()];
            const year = d.getFullYear();
            return isUrdu ? `${day} ${month} ${year}` : `${day} ${month} ${year}`;
        } catch {
            return dateString;
        }
    };

    // Calculate Due date (15 working days / ~21 calendar days from submitted_at)
    const getDueDate = (submittedAt) => {
        if (!submittedAt) return '—';
        try {
            const d = new Date(submittedAt);
            d.setDate(d.getDate() + 15);
            return formatDate(d);
        } catch {
            return '—';
        }
    };

    // Map complaint status / stage to the 4 timeline stages shown in screenshot
    // 1. Complaint received (Logged at the Contact Centre)
    // 2. Assigned to department (Case officer notified)
    // 3. Under investigation (Field verification in progress)
    // 4. Resolution (Pending / Resolved)
    const getTimelineStages = (c) => {
        const stage = c?.stage || 'application_submission';
        const status = c?.status || 'submitted';

        // Stage progress index: 0 = received, 1 = assigned, 2 = investigation, 3 = resolved
        let activeIdx = 0;
        if (status === 'resolved' || status === 'closed' || stage === 'resolved' || stage === 'closed') {
            activeIdx = 3;
        } else if (stage === 'investigation' || status === 'investigating' || status === 'in_progress') {
            activeIdx = 2;
        } else if (stage === 'assignment' || stage === 'assigned' || c?.assigned_fp_id || status === 'assigned') {
            activeIdx = 1;
        } else {
            activeIdx = 0;
        }

        return [
            {
                title: isUrdu ? 'شکایت موصول ہو گئی' : 'Complaint received',
                desc: isUrdu ? 'رابطہ مرکز میں اندراج کر لیا گیا' : 'Logged at the Contact Centre',
                state: activeIdx >= 0 ? 'completed' : 'pending',
            },
            {
                title: isUrdu ? 'متعلقہ محکمے کو تفویض' : 'Assigned to department',
                desc: isUrdu ? 'کیس افسر کو مطلع کر دیا گیا' : 'Case officer notified',
                state: activeIdx >= 1 ? (activeIdx > 1 ? 'completed' : 'active') : 'pending',
            },
            {
                title: isUrdu ? 'زیرِ تفتیش / کارروائی' : 'Under investigation',
                desc: isUrdu ? 'موقع پر تصدیق اور جانچ پڑتال جاری ہے' : 'Field verification in progress',
                state: activeIdx >= 2 ? (activeIdx > 2 ? 'completed' : 'active') : 'pending',
            },
            {
                title: isUrdu ? 'حل و فیصلہ' : 'Resolution',
                desc: activeIdx >= 3
                    ? (isUrdu ? 'شکایت کا ازالہ مکمل' : 'Resolved and verified')
                    : (isUrdu ? 'زیرِ التواء' : 'Pending'),
                state: activeIdx >= 3 ? 'completed' : 'pending',
            }
        ];
    };

    // Format human-friendly status badge
    const getStatusBadge = (c) => {
        const s = (c?.status || '').toLowerCase();
        const stage = (c?.stage || '').toLowerCase();

        if (s === 'resolved' || s === 'closed' || stage === 'resolved') {
            return {
                text: isUrdu ? 'حل شدہ' : 'Resolved',
                color: '#2d6a4f',
                bg: '#e8f5e9',
                dot: '#2d6a4f',
            };
        }
        if (stage === 'investigation' || s === 'in_progress' || s === 'investigating') {
            return {
                text: isUrdu ? 'زیرِ تفتیش' : 'Under investigation',
                color: '#344e41',
                bg: '#eaf2ec',
                dot: '#c8891a',
            };
        }
        if (stage === 'assignment' || c?.assigned_fp_id || s === 'assigned') {
            return {
                text: isUrdu ? 'تفویض شدہ' : 'Assigned',
                color: '#344e41',
                bg: '#eaf2ec',
                dot: '#344e41',
            };
        }
        return {
            text: isUrdu ? 'موصول شدہ' : 'Received',
            color: '#344e41',
            bg: '#eaf2ec',
            dot: '#c8891a',
        };
    };

    return (
        <PublicLayout>
            <Head title={isUrdu ? 'شکایت کی صورتحال — PMCC' : 'Complaint Status — PMCC'} />

            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '21px',
                    alignItems: 'stretch',
                    width: '100%',
                    maxWidth: '1140px',
                    margin: '0 auto',
                }}
            >
                {/* ── LEFT POSTER SIDEBAR (Where is my complaint?) ── */}
                <aside
                    style={{
                        flex: '0 0 350px',
                        minWidth: '280px',
                        maxWidth: '380px',
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'linear-gradient(158deg, #344e41, #283d33)',
                        color: '#f6fbf7',
                        borderRadius: '21px',
                        padding: '22px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px',
                        boxShadow: '0 14px 34px rgba(42,38,35,.08)',
                    }}
                >
                    {/* Floating ambient orb */}
                    <div
                        style={{
                            position: 'absolute',
                            insetInlineEnd: '-60px',
                            top: '-60px',
                            width: '200px',
                            height: '200px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle at 32% 32%, rgba(200,137,26,.34), rgba(200,137,26,0) 70%)',
                            pointerEvents: 'none',
                            animation: 'pmccFloat 9s ease-in-out infinite',
                        }}
                    />

                    <div>
                        {/* Status Chip */}
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '7px',
                                fontSize: '11px',
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 700,
                                letterSpacing: '.02em',
                                color: '#e2ae4e',
                                background: 'rgba(200,137,26,.15)',
                                borderRadius: '999px',
                                padding: '5px 12px',
                                width: 'fit-content',
                            }}
                        >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e2ae4e', display: 'block' }} />
                            <span>{isUrdu ? 'شکایت کی صورتحال' : 'Complaint status'}</span>
                        </div>

                        {/* Title: Where is my complaint? */}
                        <h1
                            style={{
                                fontFamily: displayFont,
                                fontWeight: 800,
                                color: '#eeb84e',
                                fontSize: isUrdu ? 'clamp(20px, 2.2vw, 26px)' : 'clamp(22px, 2.4vw, 28px)',
                                lineHeight: isUrdu ? 1.5 : 1.15,
                                letterSpacing: isUrdu ? 'normal' : '-.015em',
                                margin: '16px 0 0',
                            }}
                        >
                            {isUrdu ? 'میری شکایت کہاں تک پہنچی؟' : 'Where is my complaint?'}
                        </h1>

                        {/* Subtitle */}
                        <p
                            style={{
                                margin: '12px 0 0',
                                fontSize: '13.5px',
                                color: 'rgba(255,255,255,.82)',
                                lineHeight: 1.5,
                            }}
                        >
                            {isUrdu
                                ? 'ایس ایم ایس میں موصول ٹریکنگ نمبر درج کریں اور اب تک کی ہر کارروائی دیکھیں۔'
                                : 'Enter the tracking number from your SMS to see every step taken so far.'}
                        </p>
                    </div>
                </aside>

                {/* ── RIGHT MAIN CONTENT CARD ── */}
                <section
                    style={{
                        flex: '1 1 540px',
                        background: '#fff',
                        borderRadius: '21px',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                        overflow: 'hidden',
                        boxShadow: '0 14px 34px rgba(42,38,35,.08)',
                        padding: '22px 28px',
                        gap: '18px',
                    }}
                >
                    {/* Search Field Row */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: uiFont, color: '#2a2623' }}>
                            {isUrdu ? 'ٹریکنگ نمبر' : 'Tracking number'}
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'nowrap' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <span
                                    style={{
                                        position: 'absolute',
                                        insetInlineStart: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#a9a29b',
                                        pointerEvents: 'none',
                                        display: 'flex',
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <circle cx="11" cy="11" r="7" />
                                        <path d="m20 20-3.5-3.5" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    dir="ltr"
                                    className="pmcc-input"
                                    value={data.complaint_number}
                                    onChange={e => {
                                        setData('complaint_number', e.target.value);
                                        if (errors.complaint_number) clearErrors('complaint_number');
                                    }}
                                    placeholder="PMCC-2026-000023"
                                    style={{
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        background: '#faf7f2',
                                        border: `1.5px solid ${errors.complaint_number ? '#ec3013' : '#e6ded2'}`,
                                        borderRadius: '13px',
                                        font: 'inherit',
                                        fontSize: '14px',
                                        padding: '10px 14px',
                                        paddingInlineStart: '40px',
                                        color: '#2a2623',
                                        outline: 'none',
                                        transition: 'border-color .2s, box-shadow .2s, background .2s',
                                    }}
                                />
                            </div>

                            {/* Red Pill Button: Track */}
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
                                    fontSize: '13.5px',
                                    padding: '11px 24px',
                                    cursor: processing ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 6px 16px rgba(236,48,19,.24)',
                                    transition: 'transform .18s, background .18s, box-shadow .18s',
                                    flexShrink: 0,
                                }}
                                onMouseEnter={e => { if (!processing) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => { if (!processing) e.currentTarget.style.transform = 'none'; }}
                            >
                                {processing ? (isUrdu ? 'تلاش جاری...' : 'Searching...') : (isUrdu ? 'ٹریک کریں' : 'Track')}
                            </button>
                        </div>
                        {errors.complaint_number && (
                            <span style={{ fontSize: '12px', color: '#ec3013', marginTop: '2px' }}>
                                {errors.complaint_number}
                            </span>
                        )}
                    </form>

                    {/* Complaint Not Found Banner */}
                    {searched && notFound && (
                        <div
                            className="animate-pmcc-enter"
                            style={{
                                background: '#fdf3e0',
                                border: '1.5px solid #e2ae4e',
                                borderRadius: '16px',
                                padding: '16px',
                                textAlign: 'center',
                                color: '#8a5c07',
                            }}
                        >
                            <div style={{ fontWeight: 700, fontSize: '14.5px' }}>
                                {isUrdu ? 'کوئی شکایت نہیں ملی' : 'Complaint not found'}
                            </div>
                            <div style={{ fontSize: '12.5px', marginTop: '4px' }}>
                                {isUrdu
                                    ? 'براہِ کرم اپنا ٹریکنگ نمبر درست درج کریں (مثال: PMCC-2026-000023)۔'
                                    : 'Please check your tracking number format (e.g. PMCC-2026-000023).'}
                            </div>
                        </div>
                    )}

                    {/* Active Complaint Card & Timeline */}
                    {complaint && (
                        <div className="animate-pmcc-enter" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Top Details Card */}
                            <div
                                style={{
                                    background: '#faf7f2',
                                    borderRadius: '16px',
                                    padding: '16px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: '14px',
                                    flexWrap: 'wrap',
                                    border: '1px solid #e6ded2',
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {/* Tracking Number Heading */}
                                    <div
                                        dir="ltr"
                                        style={{
                                            fontFamily: "'Archivo', sans-serif",
                                            fontWeight: 900,
                                            fontSize: 'clamp(20px, 2.2vw, 25px)',
                                            color: '#344e41',
                                            letterSpacing: '-.01em',
                                        }}
                                    >
                                        {complaint.complaint_number}
                                    </div>
                                    {/* Subject */}
                                    <div style={{ fontSize: '13.5px', color: '#6b645e', maxWidth: '65ch', lineHeight: 1.45 }}>
                                        {complaint.subject}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    {/* Status Badge (e.g. Under investigation) */}
                                    {(() => {
                                        const badge = getStatusBadge(complaint);
                                        return (
                                            <div
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    background: badge.bg,
                                                    color: badge.color,
                                                    borderRadius: '999px',
                                                    padding: '5px 14px',
                                                    fontSize: '12.5px',
                                                    fontFamily: uiFont,
                                                    fontWeight: 700,
                                                    boxShadow: 'inset 0 0 0 1px rgba(52,78,65,.1)',
                                                }}
                                            >
                                                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: badge.dot, display: 'block' }} />
                                                <span>{badge.text}</span>
                                            </div>
                                        );
                                    })()}

                                    {/* Download Copy Button */}
                                    <button
                                        type="button"
                                        onClick={handlePrint}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: '#344e41',
                                            color: '#fff',
                                            border: 0,
                                            borderRadius: '999px',
                                            padding: '6px 14px',
                                            fontSize: '12.5px',
                                            fontFamily: uiFont,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(52,78,65,.18)',
                                            transition: 'transform .18s, background .18s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                                        title={isUrdu ? 'فارم کی کاپی ڈاؤن لوڈ یا پرنٹ کریں' : 'Download or print a copy of this form'}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        <span>{isUrdu ? 'فارم ڈاؤن لوڈ کریں' : 'Download copy'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* 3 Info Stat Cards: Submitted, Department, Due by */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                                {/* Submitted */}
                                <div style={{ background: '#faf7f2', borderRadius: '13px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid #e6ded2' }}>
                                    <span style={{ fontSize: '11.5px', color: '#8b847d', fontWeight: 500 }}>
                                        {isUrdu ? 'تاریخِ اندراج' : 'Submitted'}
                                    </span>
                                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#2a2623' }}>
                                        {formatDate(complaint.submitted_at || complaint.created_at)}
                                    </span>
                                </div>

                                {/* Department */}
                                <div style={{ background: '#faf7f2', borderRadius: '13px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid #e6ded2' }}>
                                    <span style={{ fontSize: '11.5px', color: '#8b847d', fontWeight: 500 }}>
                                        {isUrdu ? 'محکمہ' : 'Department'}
                                    </span>
                                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#2a2623', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {isUrdu
                                            ? (complaint.department?.name_ur || complaint.department?.name || 'بجلی / متعلقہ محکمہ')
                                            : (complaint.department?.name?.replace(/\(.*?\)/g, '').trim() || 'Electricity')}
                                    </span>
                                </div>

                                {/* Due by */}
                                <div style={{ background: '#faf7f2', borderRadius: '13px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid #e6ded2' }}>
                                    <span style={{ fontSize: '11.5px', color: '#8b847d', fontWeight: 500 }}>
                                        {isUrdu ? 'تکمیل کی متوقع تاریخ' : 'Due by'}
                                    </span>
                                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#2a2623' }}>
                                        {getDueDate(complaint.submitted_at || complaint.created_at)}
                                    </span>
                                </div>
                            </div>

                            {/* ── VERTICAL TIMELINE ── */}
                            <div style={{ marginTop: '6px', paddingInlineStart: '8px' }}>
                                {getTimelineStages(complaint).map((step, idx, arr) => {
                                    const isLast = idx === arr.length - 1;
                                    const isDone = step.state === 'completed';
                                    const isActive = step.state === 'active';

                                    const dotBg = isDone || isActive ? '#2d6a4f' : '#fff';
                                    const dotBorder = isDone || isActive ? '#2d6a4f' : '#d8d1c5';
                                    const lineColor = isDone ? '#2d6a4f' : '#e6ded2';
                                    const titleColor = isDone || isActive ? '#2a2623' : '#8b847d';
                                    const descColor = isDone || isActive ? '#6b645e' : '#a9a29b';

                                    return (
                                        <div key={idx} style={{ display: 'flex', gap: '14px', position: 'relative' }}>
                                            {/* Column with indicator and connecting line */}
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '18px' }}>
                                                {/* Circle Marker */}
                                                <div
                                                    style={{
                                                        width: '16px',
                                                        height: '16px',
                                                        borderRadius: '50%',
                                                        background: dotBg,
                                                        border: `2.5px solid ${dotBorder}`,
                                                        boxSizing: 'border-box',
                                                        marginTop: '3px',
                                                        flexShrink: 0,
                                                        zIndex: 2,
                                                    }}
                                                />
                                                {/* Connecting line */}
                                                {!isLast && (
                                                    <div
                                                        style={{
                                                            width: '2.5px',
                                                            flexGrow: 1,
                                                            background: lineColor,
                                                            minHeight: '30px',
                                                            margin: '2px 0',
                                                            borderRadius: '999px',
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            {/* Text details */}
                                            <div style={{ paddingBottom: isLast ? '0px' : '20px' }}>
                                                <div style={{ fontWeight: 800, fontSize: '13.5px', color: titleColor, fontFamily: uiFont }}>
                                                    {step.title}
                                                </div>
                                                <div style={{ fontSize: '12px', color: descColor, marginTop: '2px', fontFamily: uiFont }}>
                                                    {step.desc}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* Hidden on screen, visible on print/save to PDF */}
            {complaint && (
                <ComplaintPrintDocument complaint={complaint} isUrdu={isUrdu} />
            )}
        </PublicLayout>
    );
}
