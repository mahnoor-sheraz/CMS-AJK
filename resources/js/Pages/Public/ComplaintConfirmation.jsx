import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/Context/LanguageContext';

export default function ComplaintConfirmation({ complaint }) {
    const { lang, t } = useLanguage();
    const [copied, setCopied] = useState(false);

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
                                    : 'Complaint details are unavailable or the current session has expired. Please use the tracking portal to search for your grievance.'}
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

    return (
        <PublicLayout>
            <Head title={t('confTitle')} />

            <div className="max-w-2xl mx-auto py-8">
                <div className="relative overflow-hidden bg-white rounded-3xl p-8 sm:p-12 shadow-lg border border-slate-200/80 text-center space-y-6 before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-gradient-to-r before:from-amber-500 before:via-[#046A38] before:to-amber-500">
                    {/* Success Icon with AJK Green & Gold Ring */}
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-[#034d28] ring-4 ring-amber-400/80 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="space-y-2">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">
                            {t('confTitle')}
                        </h1>
                        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
                            {t('confSubtitle')}
                        </p>
                        <div className="w-20 h-1 bg-gradient-to-r from-amber-500 via-[#046A38] to-amber-500 mx-auto mt-2 rounded-full"></div>
                    </div>

                    {/* Complaint Number Card */}
                    <div className="bg-gradient-to-br from-emerald-50 via-amber-50/40 to-white border-2 border-amber-400/90 rounded-2xl p-6 max-w-md mx-auto space-y-3 shadow-sm">
                        <span className="text-xs font-black text-[#034d28] tracking-wider uppercase block">
                            {t('confNumberLabel')}
                        </span>
                        <div className="text-3xl sm:text-4xl font-black text-emerald-950 font-mono tracking-wider">
                            {complaint?.complaint_number}
                        </div>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-[#034d28] transition-all shadow-sm active:scale-95 border border-amber-300"
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
                    </div>

                    {/* Notice */}
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        {t('confInfoNotice')}
                    </p>

                    {/* Action Buttons */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                        <Link
                            href="/complaints/track"
                            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#034d28] via-[#046A38] to-[#034d28] hover:from-[#023b1f] hover:to-[#034d28] text-white font-extrabold rounded-xl text-sm transition-all shadow-md text-center border-b-4 border-amber-500 active:border-b-0 active:translate-y-1"
                        >
                            {t('btnTrackNow')}
                        </Link>
                        <Link
                            href="/complaints/new"
                            className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-[#034d28] font-bold rounded-xl text-sm transition-all border-2 border-[#034d28]/30 hover:border-[#034d28] text-center"
                        >
                            {t('btnSubmitAnother')}
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
