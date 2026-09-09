import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/Context/LanguageContext';

export default function ComplaintConfirmation({ complaint }) {
    const { lang, setLang, toggleLanguage, t } = useLanguage();
    const [copied, setCopied] = useState(false);
    const isRtl = lang === 'ur';

    if (!complaint || !complaint.complaint_number) {
        return (
            <PublicLayout>
                <Head title={t('trackNotFound')} />
                <div className="max-w-2xl mx-auto py-12">
                    <div className="relative overflow-hidden bg-white rounded-3xl p-8 sm:p-12 shadow-lg border border-amber-300 text-center space-y-6 before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-gradient-to-r before:from-amber-500 before:via-orange-500 before:to-amber-500">
                        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto text-amber-800 ring-4 ring-amber-200 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-black bg-amber-100 text-amber-900 border border-amber-300">
                                ERR_COMPLAINT_NOT_FOUND
                            </div>
                            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                                {t('trackNotFound')}
                            </h2>
                            <p className="text-sm text-slate-600 max-w-md mx-auto">
                                {lang === 'ur'
                                    ? 'شکایت کی تفصیلات دستیاب نہیں ہیں یا سیشن ختم ہو چکا ہے۔ براہ کرم ٹریکنگ صفحے پر جائیں۔'
                                    : 'Complaint details are unavailable or the current session has expired. Please use the tracking portal to search for your complaint.'}
                            </p>
                        </div>
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                            <Link
                                href="/complaints/track"
                                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#034d28] to-[#046A38] text-white font-extrabold rounded-xl text-sm transition-all shadow-md text-center border-b-4 border-amber-500"
                            >
                                {t('btnTrackNow')}
                            </Link>
                            <Link
                                href="/complaints/new"
                                className="w-full sm:w-auto px-7 py-3.5 bg-white text-[#034d28] font-bold rounded-xl text-sm border-2 border-[#034d28]/30 hover:border-[#034d28] text-center"
                            >
                                {t('btnSubmitAnother')}
                            </Link>
                        </div>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    const handleCopy = () => {
        if (complaint?.complaint_number) {
            navigator.clipboard.writeText(complaint.complaint_number);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Format dates cleanly
    const submittedDateFormatted = complaint.submitted_at
        ? new Date(complaint.submitted_at).toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : '—';

    // Format CNIC with standard dashes (XXXXX-XXXXXXX-X)
    const formattedCnic = (cnic) => {
        if (!cnic) return '—';
        const clean = String(cnic).replace(/[^0-9]/g, '');
        if (clean.length === 13) {
            return `${clean.slice(0, 5)}-${clean.slice(5, 12)}-${clean.slice(12)}`;
        }
        return cnic;
    };

    // Department name resolution
    const departmentDisplay = lang === 'ur'
        ? (complaint.department?.name_ur || complaint.department?.name || t('optOther'))
        : (complaint.department?.name || t('optOther'));

    const subDepartmentDisplay = lang === 'ur'
        ? (complaint.sub_department?.name_ur || complaint.sub_department?.name || t('reviewSubDeptNone'))
        : (complaint.sub_department?.name || t('reviewSubDeptNone'));

    const categoryDisplay = lang === 'ur'
        ? (complaint.category?.name_ur || complaint.category?.name || t('optOther'))
        : (complaint.category?.name || t('optOther'));

    const districtDisplay = lang === 'ur'
        ? (complaint.district?.name_ur || complaint.district?.name || '—')
        : (complaint.district?.name || '—');

    const tehsilDisplay = lang === 'ur'
        ? (complaint.tehsil?.name_ur || complaint.tehsil?.name || '—')
        : (complaint.tehsil?.name || '—');

    const genderDisplay = () => {
        const g = complaint.citizen?.gender;
        if (g === 'male') return t('optMale');
        if (g === 'female') return t('optFemale');
        return t('reviewGenderNotSpecified');
    };

    const statusDisplay = () => {
        const s = complaint.status;
        if (s === 'submitted') return t('statusSubmitted');
        if (s === 'under_investigation') return t('statusUnderInvestigation');
        if (s === 'resolved') return t('statusResolved');
        if (s === 'rejected') return t('statusRejected');
        return s || t('statusSubmitted');
    };

    return (
        <PublicLayout>
            <Head title={`${complaint.complaint_number} - ${t('confTitle')}`} />

            <div className="max-w-4xl mx-auto py-6 sm:py-8 space-y-8">
                {/* ========================================================================= */}
                {/* 1. TOP SUCCESS HERO & COMPLAINT NUMBER BADGE */}
                {/* ========================================================================= */}
                <div className="relative overflow-hidden bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200/80 text-center space-y-6 before:absolute before:top-0 before:left-0 before:right-0 before:h-2 before:bg-gradient-to-r before:from-amber-500 via-[#046A38] to-amber-500">
                    {/* Success Checkmark Icon */}
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-[#034d28] ring-4 ring-amber-400/80 shadow-md animate-bounce-short">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    {/* Headline */}
                    <div className="space-y-2 max-w-2xl mx-auto">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#034d28] border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {lang === 'ur' ? 'اندراج مکمل ہو گیا' : 'Submission Completed'}
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">
                            {t('confTitle')}
                        </h1>
                        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                            {t('confSubtitle')}
                        </p>
                        <div className="w-24 h-1 bg-gradient-to-r from-amber-500 via-[#046A38] to-amber-500 mx-auto mt-3 rounded-full"></div>
                    </div>

                    {/* Prominent Complaint Tracking Number Card */}
                    <div className="bg-gradient-to-br from-emerald-50/90 via-amber-50/40 to-white border-2 border-amber-400/90 rounded-2xl p-6 max-w-lg mx-auto space-y-3 shadow-md">
                        <span className="text-xs font-black text-[#034d28] tracking-widest uppercase block">
                            {t('confNumberLabel')}
                        </span>
                        <div className="text-3xl sm:text-4xl font-black text-emerald-950 font-mono tracking-wider select-all">
                            {complaint.complaint_number}
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-1">
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="inline-flex items-center gap-2 text-xs font-black px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-[#034d28] transition-all shadow-sm active:scale-95 border border-amber-300"
                            >
                                {copied ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{t('confCopied')}</span>
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span>{t('confCopyBtn')}</span>
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 transition-all shadow-xs border border-slate-300 active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                <span>{t('confPrintReceipt')}</span>
                            </button>
                        </div>
                    </div>

                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        {t('confInfoNotice')}
                    </p>
                </div>

                {/* ========================================================================= */}
                {/* 2. TRANSLATION PREVIEW CONTROL & INTERACTIVE GUIDE */}
                {/* ========================================================================= */}
                <div className="bg-gradient-to-r from-emerald-900 via-[#034d28] to-emerald-950 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-emerald-700/50">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1 max-w-xl">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-xs">
                                    🌐
                                </span>
                                <h3 className="font-extrabold text-sm sm:text-base text-amber-300">
                                    {t('confTranslateGuideTitle')}
                                </h3>
                            </div>
                            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                                {t('confTranslateGuideDesc')}
                            </p>
                        </div>

                        {/* Interactive Language Switcher Toggle */}
                        <div className="flex items-center gap-2 bg-emerald-950/60 p-1.5 rounded-xl border border-emerald-600/40 shrink-0 w-full md:w-auto justify-center">
                            <button
                                type="button"
                                onClick={() => setLang('ur')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    lang === 'ur'
                                        ? 'bg-amber-400 text-emerald-950 shadow-sm font-black'
                                        : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                                }`}
                            >
                                <span>🇵🇰</span>
                                <span>اردو (Urdu)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setLang('en')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    lang === 'en'
                                        ? 'bg-amber-400 text-emerald-950 shadow-sm font-black'
                                        : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                                }`}
                            >
                                <span>🇬🇧</span>
                                <span>English</span>
                            </button>
                        </div>
                    </div>

                    {/* Explanatory callout explaining the translation mechanism */}
                    <div className="mt-4 pt-3.5 border-t border-emerald-800/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-emerald-200/90">
                        <div className="flex items-start gap-2">
                            <span className="text-amber-400 font-black">1.</span>
                            <span>{lang === 'ur' ? 'ہیڈر بٹن: اوپر ہیڈر میں موجود زبان کا بٹن کسی بھی وقت استعمال کریں۔' : 'Header Toggle: Click the language switch at the top right of any page.'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-amber-400 font-black">2.</span>
                            <span>{lang === 'ur' ? 'فوری تبادلہ: تمام سرکاری محکموں، اضلاع اور تفصیلات کا فوری ترجمہ۔' : 'Instant Switch: Translates departments, districts, and status in real-time.'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-amber-400 font-black">3.</span>
                            <span>{lang === 'ur' ? 'پرنٹ سپورٹ: رسید کو اردو یا انگریزی دونوں میں پرنٹ کیا جا سکتا ہے۔' : 'Printable Receipt: Print your official proof in English or Urdu anytime.'}</span>
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* 3. FULL SUBMISSION PREVIEW CARD (OFFICIAL RECEIPT) */}
                {/* ========================================================================= */}
                <div id="printable-receipt" className="bg-white rounded-3xl shadow-lg border border-slate-200/90 overflow-hidden">
                    {/* Receipt Banner */}
                    <div className="bg-gradient-to-r from-emerald-50 via-amber-50/50 to-emerald-50 p-6 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#034d28] text-amber-300 mb-1.5 shadow-xs">
                                {complaint.complaint_number}
                            </div>
                            <h2 className="text-lg sm:text-xl font-black text-emerald-950">
                                {t('confPreviewTitle')}
                            </h2>
                            <p className="text-xs text-slate-500">
                                {t('confPreviewSubtitle')}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-3 py-1 rounded-lg bg-white border border-slate-300 font-bold text-slate-700">
                                {t('confChannelLabel')} {t('confWebPortal')}
                            </span>
                            <span className="px-3 py-1 rounded-lg bg-emerald-100 text-[#034d28] border border-emerald-300 font-extrabold">
                                {t('confStatusLabel')} {statusDisplay()}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">
                        {/* Section 1: Citizen Profile */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                            <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/60 pb-2">
                                <span>👤</span> {t('confSectionCitizen')}
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
                                <div>
                                    <span className="text-slate-400 block text-[11px]">{t('labelName')}</span>
                                    <span className="font-bold text-slate-900">{complaint.citizen?.name || '—'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">{t('labelCnic')}</span>
                                    <span className="font-mono font-bold text-slate-900">{formattedCnic(complaint.cnic || complaint.citizen?.cnic)}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">{t('labelMobile')}</span>
                                    <span className="font-mono font-bold text-slate-900">{complaint.citizen?.mobile_number || '—'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">{t('labelGender')}</span>
                                    <span className="font-bold text-slate-900">{genderDisplay()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Location & Jurisdiction */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                            <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/60 pb-2">
                                <span>📍</span> {t('confSectionLocation')}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                                <div>
                                    <span className="text-slate-400 block text-[11px]">{t('labelDistrict')}</span>
                                    <span className="font-bold text-slate-900">{districtDisplay}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">{t('labelTehsil')}</span>
                                    <span className="font-bold text-slate-900">{tehsilDisplay}</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Complaint & Department Details */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
                            <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/60 pb-2">
                                <span>🏛️</span> {t('confSectionComplaint')}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                                <div>
                                    <span className="text-slate-400 block text-[11px]">{t('labelDepartment')}</span>
                                    <span className="font-bold text-emerald-950">{departmentDisplay}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">{t('labelSubDepartment')}</span>
                                    <span className="font-semibold text-slate-800">{subDepartmentDisplay}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[11px]">{t('labelCategory')}</span>
                                    <span className="font-semibold text-slate-800">{categoryDisplay}</span>
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <span className="text-slate-400 block text-[11px]">{t('labelSubject')}</span>
                                <h4 className="text-base font-extrabold text-emerald-950 mt-0.5">
                                    {complaint.subject || '—'}
                                </h4>
                            </div>

                            {/* Full Narrative Details */}
                            <div>
                                <span className="text-slate-400 block text-[11px]">{t('labelDetails')}</span>
                                <div className="mt-1 p-4 rounded-xl bg-white border border-slate-200/80 text-slate-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed shadow-xs">
                                    {complaint.details || '—'}
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Attached Evidence */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                            <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200/60 pb-2">
                                <span>📎</span> {t('confSectionAttachments')}
                            </h3>

                            {complaint.attachments && complaint.attachments.length > 0 ? (
                                <ul className="divide-y divide-slate-200/70 border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                                    {complaint.attachments.map((att, idx) => (
                                        <li key={idx} className="p-3 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2.5 truncate">
                                                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                                                <span className="font-medium text-slate-900 truncate">{att.file_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 text-[11px] text-slate-400 font-mono">
                                                <span>{(att.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                                                <span className="px-2 py-0.5 rounded bg-slate-100 uppercase text-[10px] text-slate-600 font-bold">
                                                    {att.file_type?.split('/')[1] || 'FILE'}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs text-slate-400 italic">
                                    {t('confNoAttachments')}
                                </p>
                            )}
                        </div>

                        {/* Submission Metadata Timestamp */}
                        <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                            <span>🕒 {t('confSubmittedDate')}</span>
                            <span className="font-semibold text-slate-600">{submittedDateFormatted}</span>
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* 4. BOTTOM ACTION BUTTONS */}
                {/* ========================================================================= */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 pb-8">
                    <Link
                        href="/complaints/track"
                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#034d28] via-[#046A38] to-[#034d28] hover:from-[#023b1f] hover:to-[#034d28] text-white font-extrabold rounded-xl text-sm sm:text-base transition-all shadow-lg text-center border-b-4 border-amber-500 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2"
                    >
                        <span>{t('btnTrackNow')}</span>
                        <span className={isRtl ? 'rotate-180' : ''}>→</span>
                    </Link>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-sm sm:text-base transition-all border-2 border-slate-300 text-center flex items-center justify-center gap-2 shadow-xs"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        <span>{t('confPrintReceipt')}</span>
                    </button>

                    <Link
                        href="/complaints/new"
                        className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-emerald-50 text-[#034d28] font-bold rounded-xl text-sm sm:text-base transition-all border-2 border-[#034d28]/30 hover:border-[#034d28] text-center"
                    >
                        {t('btnSubmitAnother')}
                    </Link>
                </div>
            </div>
        </PublicLayout>
    );
}
