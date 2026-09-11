import React from 'react';
import AjkFlag from '@/Components/AjkFlag';

/**
 * Clean, official printable copy of the filed complaint.
 * Visible on screen during print preview / PDF export, and hidden otherwise.
 */
export default function ComplaintPrintDocument({ complaint, isUrdu = false }) {
    if (!complaint) return null;

    const citizen = complaint.citizen || {};
    const department = complaint.department || {};
    const subDepartment = complaint.sub_department || complaint.subDepartment || {};
    const category = complaint.category || {};
    const district = complaint.district || {};
    const tehsil = complaint.tehsil || {};
    const attachments = complaint.attachments || [];

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString(isUrdu ? 'ur-PK' : 'en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            return dateStr;
        }
    };

    const uiFont = isUrdu ? "'Noto Naskh Arabic', 'Archivo', sans-serif" : "'Archivo', sans-serif";
    const displayFont = isUrdu ? "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif" : "'Archivo', sans-serif";

    return (
        <div
            id="pmcc-printable-complaint"
            className="print-only-container"
            dir={isUrdu ? 'rtl' : 'ltr'}
            style={{
                display: 'none',
                fontFamily: uiFont,
                color: '#1a1a1a',
                lineHeight: 1.6,
                backgroundColor: '#ffffff',
                padding: '24px 32px',
                maxWidth: '820px',
                margin: '0 auto',
            }}
        >
            {/* Top Official Header */}
            <div style={{ borderBottom: '3px double #344e41', paddingBottom: '16px', marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: '#344e41',
                                color: '#fff',
                                display: 'grid',
                                placeItems: 'center',
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 900,
                                fontSize: '18px',
                                letterSpacing: '.04em',
                                flexShrink: 0,
                            }}
                        >
                            PM
                        </div>
                        <div>
                            <div style={{ fontFamily: displayFont, fontWeight: 800, fontSize: '20px', color: '#344e41', lineHeight: 1.2 }}>
                                {isUrdu ? 'وزیرِ اعظم رابطہ مرکز — آزاد حکومت ریاست جموں و کشمیر' : "Prime Minister's Contact Centre — GoAJK"}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b645e', marginTop: '3px' }}>
                                {isUrdu ? 'شہری شکایات و تدارک پورٹل | تصدیق شدہ کاپی' : 'Citizen Grievance Redressal Portal | Official Complaint Record'}
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: isUrdu ? 'left' : 'right', flexShrink: 0 }}>
                        <AjkFlag className="w-12 h-8" />
                    </div>
                </div>
            </div>

            {/* Tracking Banner */}
            <div
                style={{
                    background: '#f7f4ed',
                    border: '1.5px solid #d4c7b0',
                    borderRadius: '12px',
                    padding: '14px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                }}
            >
                <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.08em', color: '#736b63', fontWeight: 700 }}>
                        {isUrdu ? 'شکایت ٹریکنگ نمبر' : 'Complaint Tracking Number'}
                    </div>
                    <div dir="ltr" style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: '22px', color: '#344e41', letterSpacing: '.02em', marginTop: '2px' }}>
                        {complaint.complaint_number}
                    </div>
                </div>
                <div style={{ textAlign: isUrdu ? 'left' : 'right' }}>
                    <div style={{ fontSize: '11.5px', color: '#736b63' }}>
                        {isUrdu ? 'تاریخِ اندراج' : 'Lodged On'}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#2a2623' }}>
                        {formatDate(complaint.submitted_at || complaint.created_at)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#2d6a4f', fontWeight: 700, marginTop: '2px' }}>
                        {isUrdu ? `صورتحال: ${complaint.status || 'درج شدہ'}` : `Status: ${(complaint.status || 'submitted').replace(/_/g, ' ').toUpperCase()}`}
                    </div>
                </div>
            </div>

            {/* Section 1: Complainant Details */}
            <div style={{ marginBottom: '22px' }}>
                <div
                    style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        color: '#344e41',
                        borderBottom: '1.5px solid #e6ded2',
                        paddingBottom: '5px',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '.04em',
                    }}
                >
                    {isUrdu ? '۱. شکایت کنندہ کی معلومات (Citizen Information)' : '1. Citizen Information'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px', fontSize: '13px' }}>
                    <div>
                        <span style={{ color: '#736b63', display: 'block', fontSize: '11px' }}>{isUrdu ? 'مکمل نام' : 'Full Name'}</span>
                        <strong style={{ color: '#2a2623' }}>{citizen.name || complaint.name || '—'}</strong>
                    </div>
                    <div>
                        <span style={{ color: '#736b63', display: 'block', fontSize: '11px' }}>{isUrdu ? 'قومی شناختی کارڈ نمبر' : 'CNIC Number'}</span>
                        <strong dir="ltr" style={{ color: '#2a2623' }}>{citizen.cnic || complaint.cnic || '—'}</strong>
                    </div>
                    <div>
                        <span style={{ color: '#736b63', display: 'block', fontSize: '11px' }}>{isUrdu ? 'موبائل نمبر' : 'Mobile Number'}</span>
                        <strong dir="ltr" style={{ color: '#2a2623' }}>{citizen.mobile_number || complaint.mobile_number || '—'}</strong>
                    </div>
                    <div>
                        <span style={{ color: '#736b63', display: 'block', fontSize: '11px' }}>{isUrdu ? 'جنس' : 'Gender'}</span>
                        <strong style={{ color: '#2a2623', textTransform: 'capitalize' }}>
                            {citizen.gender ? (isUrdu ? (citizen.gender === 'male' ? 'مرد' : 'عورت') : citizen.gender) : (complaint.gender || '—')}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Section 2: Administrative Jurisdiction & Department */}
            <div style={{ marginBottom: '22px' }}>
                <div
                    style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        color: '#344e41',
                        borderBottom: '1.5px solid #e6ded2',
                        paddingBottom: '5px',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '.04em',
                    }}
                >
                    {isUrdu ? '۲. متعلقہ محکمہ و مقام (Department & Location)' : '2. Department & Location'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px', fontSize: '13px' }}>
                    <div>
                        <span style={{ color: '#736b63', display: 'block', fontSize: '11px' }}>{isUrdu ? 'ضلع' : 'District'}</span>
                        <strong style={{ color: '#2a2623' }}>{isUrdu ? (district.name_ur || district.name || '—') : (district.name || '—')}</strong>
                    </div>
                    <div>
                        <span style={{ color: '#736b63', display: 'block', fontSize: '11px' }}>{isUrdu ? 'تحصیل' : 'Tehsil'}</span>
                        <strong style={{ color: '#2a2623' }}>{isUrdu ? (tehsil.name_ur || tehsil.name || '—') : (tehsil.name || '—')}</strong>
                    </div>
                    <div>
                        <span style={{ color: '#736b63', display: 'block', fontSize: '11px' }}>{isUrdu ? 'محکمہ' : 'Department'}</span>
                        <strong style={{ color: '#2a2623' }}>{isUrdu ? (department.name_ur || department.name || '—') : (department.name || '—')}</strong>
                    </div>
                    <div>
                        <span style={{ color: '#736b63', display: 'block', fontSize: '11px' }}>{isUrdu ? 'زمرہ / ذیلی زمرہ' : 'Category / Sub-category'}</span>
                        <strong style={{ color: '#2a2623' }}>
                            {category.name ? (isUrdu ? (category.name_ur || category.name) : category.name) : (subDepartment.name ? (isUrdu ? (subDepartment.name_ur || subDepartment.name) : subDepartment.name) : '—')}
                        </strong>
                    </div>
                </div>
            </div>

            {/* Section 3: Grievance Details */}
            <div style={{ marginBottom: '22px' }}>
                <div
                    style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        color: '#344e41',
                        borderBottom: '1.5px solid #e6ded2',
                        paddingBottom: '5px',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '.04em',
                    }}
                >
                    {isUrdu ? '۳. شکایت کی تفصیلات (Complaint Details)' : '3. Complaint Details'}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <span style={{ color: '#736b63', display: 'block', fontSize: '11px' }}>{isUrdu ? 'موضوع' : 'Subject'}</span>
                    <strong style={{ fontSize: '14.5px', color: '#2a2623' }}>{complaint.subject || '—'}</strong>
                </div>
                <div>
                    <span style={{ color: '#736b63', display: 'block', fontSize: '11px' }}>{isUrdu ? 'تفصیل' : 'Details'}</span>
                    <div
                        style={{
                            background: '#faf7f2',
                            border: '1px solid #e6ded2',
                            borderRadius: '8px',
                            padding: '12px 14px',
                            fontSize: '13px',
                            lineHeight: 1.65,
                            whiteSpace: 'pre-wrap',
                            color: '#2a2623',
                            marginTop: '4px',
                        }}
                    >
                        {complaint.details || '—'}
                    </div>
                </div>
            </div>

            {/* Section 4: Attached Evidence */}
            {attachments.length > 0 && (
                <div style={{ marginBottom: '22px' }}>
                    <div
                        style={{
                            fontSize: '13px',
                            fontWeight: 800,
                            color: '#344e41',
                            borderBottom: '1.5px solid #e6ded2',
                            paddingBottom: '5px',
                            marginBottom: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '.04em',
                        }}
                    >
                        {isUrdu ? `۴. منسلک ثبوت (${attachments.length} فائلیں)` : `4. Evidence Files Attached (${attachments.length})`}
                    </div>
                    <ul style={{ margin: 0, paddingInlineStart: '20px', fontSize: '12.5px', color: '#2a2623' }}>
                        {attachments.map((att, i) => (
                            <li key={i} style={{ marginBottom: '3px' }}>
                                {att.file_name || att.file_path?.split('/').pop() || `File ${i + 1}`}
                                {att.file_type ? ` (${att.file_type})` : ''}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Verification Footer & Signoff */}
            <div style={{ borderTop: '1.5px dashed #c2b8a7', paddingTop: '14px', marginTop: '26px', fontSize: '11px', color: '#6b645e', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <div>{isUrdu ? 'یہ دستاویز کمپیوٹر سے تیار کی گئی ہے اور اس پر کسی دستی دستخط کی ضرورت نہیں ہے۔' : 'This is a computer-generated document verified by PMCC GoAJK.'}</div>
                    <div style={{ marginTop: '2px' }}>
                        {isUrdu ? 'شکایت کی پیش رفت جاننے کے لیے پورٹل وزٹ کریں: ' : 'Track this grievance anytime online: '}
                        <strong>pmcc.ajk.gov.pk/complaints/track</strong>
                    </div>
                </div>
                <div style={{ textAlign: isUrdu ? 'left' : 'right' }}>
                    <div style={{ fontWeight: 700, color: '#344e41' }}>PMCC GoAJK</div>
                    <div>{new Date().toLocaleDateString('en-GB')}</div>
                </div>
            </div>
        </div>
    );
}
