import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useLanguage } from '@/Context/LanguageContext';

export default function ComplaintTrack({ complaint = null, searched = false, notFound = false, searchParams = {} }) {
    const { lang, t } = useLanguage();

    const { data, setData, post, processing, errors } = useForm({
        complaint_number: searchParams.complaint_number || '',
        cnic: searchParams.cnic || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/complaints/track');
    };

    // Helper mapping for current stage step index (1, 2, or 3)
    const getStageIndex = (stage) => {
        switch (stage) {
            case 'application_submission':
                return 1;
            case 'investigation_by_department':
                return 2;
            case 'updated_info':
            case 'resolved':
            case 'not_resolvable':
            case 'rejected':
                return 3;
            default:
                return 1;
        }
    };

    const currentStageIndex = complaint ? getStageIndex(complaint.stage) : 1;

    const stages = [
        { id: 1, key: 'application_submission', name: t('stage1Name') },
        { id: 2, key: 'investigation_by_department', name: t('stage2Name') },
        { id: 3, key: 'updated_info', name: t('stage3Name') },
    ];

    // Helper status badge styling and text
    const getStatusInfo = (status) => {
        switch (status) {
            case 'submitted':
                return { label: t('statusSubmitted'), bg: 'bg-blue-100 text-blue-800 border-blue-300' };
            case 'under_investigation':
                return { label: t('statusUnderInvestigation'), bg: 'bg-amber-100 text-amber-800 border-amber-300' };
            case 'pending_field_visit':
                return { label: t('statusPendingFieldVisit'), bg: 'bg-purple-100 text-purple-800 border-purple-300' };
            case 'clubbed':
                return { label: t('statusClubbed'), bg: 'bg-slate-100 text-slate-800 border-slate-300' };
            case 'forwarded_external':
                return { label: t('statusForwardedExternal'), bg: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
            case 'not_resolvable':
                return { label: t('statusNotResolvable'), bg: 'bg-orange-100 text-orange-800 border-orange-300' };
            case 'resolved':
                return { label: t('statusResolved'), bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
            case 'rejected':
                return { label: t('statusRejected'), bg: 'bg-red-100 text-red-800 border-red-300' };
            default:
                return { label: status, bg: 'bg-slate-100 text-slate-800 border-slate-300' };
        }
    };

    return (
        <PublicLayout>
            <Head title={t('trackTitle')} />

            {/* Header Banner with AJK Badge */}
            <div className="mb-8 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-amber-400/80 text-[#034d28] text-xs font-bold mb-3 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>{lang === 'ur' ? 'حکومتِ آزاد کشمیر — شکایات ٹریکنگ سسٹم' : 'Govt of Azad Jammu & Kashmir — Grievance Tracking'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight mb-2">
                    {t('trackTitle')}
                </h1>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    {t('trackSubtitle')}
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-amber-500 via-[#046A38] to-amber-500 mx-auto mt-3 rounded-full"></div>
            </div>

            {/* Search Form Card */}
            <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 max-w-2xl mx-auto mb-8 before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:via-[#046A38] before:to-amber-500">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm sm:text-base font-semibold text-slate-800 mb-2">
                            {t('trackLabelComplaintNo')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            dir="ltr"
                            value={data.complaint_number}
                            onChange={(e) => setData('complaint_number', e.target.value)}
                            placeholder={t('trackPlaceholderComplaintNo')}
                            className="w-full h-12 rounded-xl border border-slate-300 px-4 text-base focus:border-emerald-600 focus:ring-2 focus:ring-amber-400/30 focus:outline-none uppercase font-mono tracking-wider"
                            required
                        />
                        {errors.complaint_number && (
                            <p className="mt-1 text-xs text-red-600 font-medium">{errors.complaint_number}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm sm:text-base font-semibold text-slate-800 mb-2">
                            {t('trackLabelCnic')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            dir="ltr"
                            value={data.cnic}
                            maxLength={13}
                            onChange={(e) => setData('cnic', e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder={t('trackPlaceholderCnic')}
                            className="w-full h-12 rounded-xl border border-slate-300 px-4 text-base focus:border-emerald-600 focus:ring-2 focus:ring-amber-400/30 focus:outline-none"
                            required
                        />
                        {errors.cnic && (
                            <p className="mt-1 text-xs text-red-600 font-medium">{errors.cnic}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3.5 bg-gradient-to-r from-[#034d28] via-[#046A38] to-[#034d28] hover:from-[#023b1f] hover:to-[#034d28] text-white font-extrabold text-sm sm:text-base rounded-xl shadow-md transition-all border-b-4 border-amber-500 active:border-b-0 active:translate-y-1 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>{t('btnTracking')}</span>
                            </>
                        ) : (
                            <span>{t('btnTrackSubmit')}</span>
                        )}
                    </button>
                </form>
            </div>

            {/* RESULTS SECTION */}

            {/* Generic Not Found Alert */}
            {searched && notFound && (
                <div className="max-w-2xl mx-auto bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 text-center space-y-2 text-amber-900 shadow-sm animate-fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-600 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="font-bold text-sm sm:text-base leading-relaxed">
                        {t('trackNotFound')}
                    </p>
                </div>
            )}

            {/* Complaint Found Details Card */}
            {searched && complaint && (
                <div className="relative overflow-hidden max-w-3xl mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-8 animate-fade-in before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-500 before:via-[#046A38] before:to-amber-500">
                    {/* Header Details */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                {t('trackResultTitle')}
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black text-emerald-950 font-mono tracking-wider">
                                {complaint.complaint_number}
                            </h2>
                        </div>

                        {/* Status Badge */}
                        <div>
                            {(() => {
                                const statusInfo = getStatusInfo(complaint.status);
                                return (
                                    <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-extrabold border shadow-sm ${statusInfo.bg}`}>
                                        {statusInfo.label}
                                    </span>
                                );
                            })()}
                        </div>
                    </div>

                    {/* 3-Stage Progress Tracker Bar with AJK Colors */}
                    <div className="py-4">
                        <div className="relative flex items-center justify-between max-w-xl mx-auto">
                            {/* Connecting Line */}
                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0"></div>
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-[#034d28] via-amber-500 to-amber-400 transition-all duration-500 -z-0"
                                style={{
                                    width: currentStageIndex === 1 ? '0%' : currentStageIndex === 2 ? '50%' : '100%',
                                }}
                            ></div>

                            {/* Stage Circles */}
                            {stages.map((stg) => {
                                const isCompleted = stg.id < currentStageIndex;
                                const isCurrent = stg.id === currentStageIndex;

                                return (
                                    <div key={stg.id} className="relative z-10 flex flex-col items-center group">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-md transition-all ${
                                                isCurrent
                                                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-[#034d28] ring-4 ring-amber-300/60 scale-110'
                                                    : isCompleted
                                                    ? 'bg-[#034d28] text-white ring-2 ring-amber-400/90'
                                                    : 'bg-white text-slate-400 border-2 border-slate-300'
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                stg.id
                                            )}
                                        </div>
                                        <span className={`mt-2 text-xs font-bold text-center max-w-[100px] leading-tight ${
                                            isCurrent ? 'text-emerald-900 font-extrabold' : 'text-slate-500'
                                        }`}>
                                            {stg.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Complaint Details Grid */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                        <div>
                            <span className="text-slate-400 font-medium block">{t('labelSubject')}</span>
                            <span className="font-bold text-slate-800">{complaint.subject}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 font-medium block">{t('lblSubmittedOn')}</span>
                            <span className="font-semibold text-slate-700 font-mono">
                                {complaint.submitted_at ? new Date(complaint.submitted_at).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 font-medium block">{t('lblDistrictTehsil')}</span>
                            <span className="font-semibold text-slate-700">
                                {lang === 'ur'
                                    ? `${complaint.district?.name_ur || complaint.district?.name || ''} - ${complaint.tehsil?.name_ur || complaint.tehsil?.name || ''}`
                                    : `${complaint.district?.name || ''} - ${complaint.tehsil?.name || ''}`}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 font-medium block">{t('lblDepartment')}</span>
                            <span className="font-semibold text-slate-700">
                                {complaint.is_uncategorized
                                    ? t('optOther')
                                    : (lang === 'ur' ? complaint.department?.name_ur || complaint.department?.name : complaint.department?.name) || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
