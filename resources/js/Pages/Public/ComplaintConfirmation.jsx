import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/Context/LanguageContext';

export default function ComplaintConfirmation({ complaint }) {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);

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
                <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-md border border-slate-200/80 text-center space-y-6">
                    {/* Success Icon */}
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="space-y-2">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-900 tracking-tight">
                            {t('confTitle')}
                        </h1>
                        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
                            {t('confSubtitle')}
                        </p>
                    </div>

                    {/* Complaint Number Card */}
                    <div className="bg-emerald-50/80 border-2 border-emerald-200 rounded-2xl p-6 max-w-md mx-auto space-y-3">
                        <span className="text-xs font-bold text-emerald-800 tracking-wider uppercase block">
                            {t('confNumberLabel')}
                        </span>
                        <div className="text-3xl sm:text-4xl font-black text-emerald-950 font-mono tracking-wider">
                            {complaint?.complaint_number}
                        </div>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-sm active:scale-95"
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
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/complaints/track"
                            className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-all shadow-md text-center"
                        >
                            {t('btnTrackNow')}
                        </Link>
                        <Link
                            href="/complaints/new"
                            className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all border border-slate-300 text-center"
                        >
                            {t('btnSubmitAnother')}
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
