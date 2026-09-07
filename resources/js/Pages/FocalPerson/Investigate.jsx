import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function FocalPersonInvestigate({
    complaint,
    similarityMatches = [],
    fieldOfficers = [],
    forwardDestinations = [],
    hasConfirmedDuplicate = false,
    currentFp = {},
}) {
    // Side-by-side comparison modal state
    const [comparingMatch, setComparingMatch] = useState(null);
    const [confirmingMatch, setConfirmingMatch] = useState(null);

    // Form state for 4-path classification
    const { data, setData, post, processing, errors, reset } = useForm({
        path: 'handle_directly',
        notes: '',
        destination_id: '',
        remarks: '',
        visit_datetime: '',
        assigned_officer_id: currentFp?.id || '',
        location: `${complaint.district?.name || ''} - ${complaint.tehsil?.name || ''}`,
    });

    const handleClassifySubmit = (e) => {
        e.preventDefault();
        post(route('fp.complaints.classify', complaint.id));
    };

    const handleConfirmDuplicateAction = (match) => {
        post(route('fp.complaints.duplicates.confirm', [complaint.id, match.id]), {
            onSuccess: () => {
                setConfirmingMatch(null);
                setData('path', 'club_with_existing');
            },
        });
    };

    const handleDismissDuplicateAction = (match) => {
        post(route('fp.complaints.duplicates.dismiss', [complaint.id, match.id]));
    };

    const getScoreBadge = (score) => {
        const num = parseFloat(score);
        const percentage = Math.round(num * 100);

        if (num >= 0.85) {
            return (
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300">
                    🔥 High Match ({percentage}%)
                </span>
            );
        }
        if (num >= 0.70) {
            return (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                    ⚡ Medium Match ({percentage}%)
                </span>
            );
        }
        return (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                Low Match ({percentage}%)
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <Link href={route('fp.dashboard')} className="hover:text-emerald-600">
                                ← Focal Person Dashboard
                            </Link>
                            <span>/</span>
                            <span>First Investigation</span>
                            <span>/</span>
                            <span className="font-mono text-emerald-600 font-bold">{complaint.complaint_number}</span>
                        </div>
                        <h2 className="text-xl font-bold leading-tight text-gray-800 dark:text-gray-100">
                            First Investigation & Triage
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300">
                            Stage: Received (Triage)
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Staff Verification View
                        </span>
                    </div>
                </div>
            }
        >
            <Head title={`First Investigation - ${complaint.complaint_number}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Citizen Unmasked Verification Banner */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                                👤
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                    Citizen: {complaint.citizen?.name}
                                </h4>
                                <div className="text-xs text-gray-600 dark:text-gray-300 flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                                    <span>CNIC: <strong className="font-mono">{complaint.citizen?.cnic}</strong></span>
                                    <span>Phone: <strong className="font-mono">{complaint.citizen?.mobile_number}</strong></span>
                                    <span>Location: <strong>{complaint.district?.name} - {complaint.tehsil?.name}</strong></span>
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-emerald-800 dark:text-emerald-300 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-700 shadow-sm">
                            ✓ Unmasked for Departmental Contact
                        </div>
                    </div>

                    {/* Section A: Full Complaint Detail */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-5">
                        <div className="border-b border-gray-100 dark:border-gray-700 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Section A • Complaint Overview
                                </span>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                    {complaint.subject}
                                </h3>
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                                Lodged via {complaint.channel?.name || 'Portal'} on {new Date(complaint.created_at).toLocaleString()}
                            </div>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg">
                            <div>
                                <span className="text-gray-400 block">Department</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {complaint.department?.name}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Sub-Department</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {complaint.sub_department?.name || 'General'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Category</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {complaint.category?.name || 'Uncategorized'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400 block">Jurisdiction</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {complaint.district?.name} ({complaint.tehsil?.name})
                                </span>
                            </div>
                        </div>

                        {/* Grievance Narrative */}
                        <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                Citizen Grievance Narrative
                            </span>
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                                {complaint.details}
                            </div>
                        </div>

                        {/* Attachments */}
                        {complaint.attachments && complaint.attachments.length > 0 && (
                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                    Uploaded Evidentiary Attachments ({complaint.attachments.length})
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {complaint.attachments.map((att) => (
                                        <div
                                            key={att.id}
                                            className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-between"
                                        >
                                            <div className="truncate pr-2">
                                                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                                    📎 {att.file_name}
                                                </p>
                                                <p className="text-[10px] text-gray-400">
                                                    {(att.file_size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                            <a
                                                href={`/storage/${att.file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold"
                                            >
                                                View
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section B: AI Duplicate Suggestions Panel */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-base">⚡</span>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        Section B • AI-Assisted Duplicate Suggestions Panel
                                    </h3>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Human-in-the-loop: AI proposes potential matches. You must explicitly review and confirm or dismiss candidates.
                                </p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                                {similarityMatches.filter(m => m.status === 'pending').length} Pending Suggestions
                            </span>
                        </div>

                        {similarityMatches.length === 0 ? (
                            <div className="p-6 text-center rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-dashed border-gray-200 dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    ✓ No similar past complaints detected by AI matching pipeline.
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    This grievance appears to be unique. Proceed directly to classification in Section C.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {similarityMatches.map((match) => (
                                    <div
                                        key={match.id}
                                        className={`p-4 rounded-xl border transition ${
                                            match.status === 'confirmed'
                                                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                                                : match.status === 'dismissed'
                                                ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 opacity-60'
                                                : 'bg-white dark:bg-gray-800/80 border-purple-200 dark:border-purple-800/60 shadow-sm'
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400">
                                                        Candidate: {match.matched_complaint?.complaint_number || `#${match.matched_complaint_id}`}
                                                    </span>
                                                    {getScoreBadge(match.similarity_score)}
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                        match.status === 'confirmed'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : match.status === 'dismissed'
                                                            ? 'bg-gray-200 text-gray-700'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {match.status}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {match.matched_complaint?.subject}
                                                </h4>
                                                <p className="text-xs text-gray-500 line-clamp-2">
                                                    {match.matched_complaint?.details}
                                                </p>
                                                <div className="text-[11px] text-gray-400">
                                                    Citizen: {match.matched_complaint?.citizen?.name} • CNIC: {match.matched_complaint?.citizen?.cnic} • Tehsil: {match.matched_complaint?.tehsil?.name}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2 sm:self-start">
                                                <button
                                                    type="button"
                                                    onClick={() => setComparingMatch(match)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition"
                                                >
                                                    🔍 Compare Text
                                                </button>

                                                {match.status === 'pending' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => setConfirmingMatch(match)}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition shadow-sm"
                                                        >
                                                            Confirm Duplicate
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDismissDuplicateAction(match)}
                                                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                                        >
                                                            Dismiss
                                                        </button>
                                                    </>
                                                )}

                                                {match.status === 'confirmed' && (
                                                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                                        ✓ Clubbed as Duplicate
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Section C: Four-Path Classification Decision Form */}
                    <form onSubmit={handleClassifySubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
                        <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Section C • Classification Decision
                            </span>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                Select Grievance Triage Pathway
                            </h3>
                            <p className="text-xs text-gray-500">
                                Select exactly one pathway to formalize this grievance and advance it from triage stage.
                            </p>
                            {errors.path && (
                                <p className="text-xs text-rose-600 font-bold mt-2">{errors.path}</p>
                            )}
                        </div>

                        {/* Four Interactive Choice Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Option 1: Handle Directly */}
                            <label
                                className={`cursor-pointer p-4 rounded-xl border-2 transition relative flex flex-col justify-between ${
                                    data.path === 'handle_directly'
                                        ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl">🏢</span>
                                        <input
                                            type="radio"
                                            name="path"
                                            value="handle_directly"
                                            checked={data.path === 'handle_directly'}
                                            onChange={(e) => setData('path', e.target.value)}
                                            className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                        />
                                    </div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-3">
                                        1. Handle Directly
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Grievance falls under our departmental mandate. We will investigate and resolve internally.
                                    </p>
                                </div>
                                <span className="mt-4 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                    Advances stage → Under Investigation
                                </span>
                            </label>

                            {/* Option 2: Club with Existing */}
                            <label
                                className={`p-4 rounded-xl border-2 transition relative flex flex-col justify-between ${
                                    !hasConfirmedDuplicate
                                        ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30'
                                        : data.path === 'club_with_existing'
                                        ? 'cursor-pointer border-purple-600 bg-purple-50/40 dark:bg-purple-950/20 shadow-sm'
                                        : 'cursor-pointer border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl">🔗</span>
                                        <input
                                            type="radio"
                                            name="path"
                                            value="club_with_existing"
                                            disabled={!hasConfirmedDuplicate}
                                            checked={data.path === 'club_with_existing'}
                                            onChange={(e) => setData('path', e.target.value)}
                                            className="text-purple-600 focus:ring-purple-500 h-4 w-4"
                                        />
                                    </div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-3">
                                        2. Club with Existing Master Grievance
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Subsume this complaint under a verified master duplicate grievance.
                                    </p>
                                </div>
                                {!hasConfirmedDuplicate ? (
                                    <span className="mt-4 text-[11px] font-bold text-rose-600">
                                        ⚠️ Requires confirming a duplicate in Section B first
                                    </span>
                                ) : (
                                    <span className="mt-4 text-[11px] font-semibold text-purple-700 dark:text-purple-400">
                                        ✓ Duplicate verified • Status → Clubbed
                                    </span>
                                )}
                            </label>

                            {/* Option 3: Forward Externally */}
                            <label
                                className={`cursor-pointer p-4 rounded-xl border-2 transition relative flex flex-col justify-between ${
                                    data.path === 'forward_externally'
                                        ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl">↗️</span>
                                        <input
                                            type="radio"
                                            name="path"
                                            value="forward_externally"
                                            checked={data.path === 'forward_externally'}
                                            onChange={(e) => setData('path', e.target.value)}
                                            className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                                        />
                                    </div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-3">
                                        3. Forward Externally
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Issue belongs to federal, judicial, or external agency authority outside PMCC departmental reach.
                                    </p>
                                </div>
                                <span className="mt-4 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                                    Requires agency destination & justification
                                </span>
                            </label>

                            {/* Option 4: Schedule Field Visit */}
                            <label
                                className={`cursor-pointer p-4 rounded-xl border-2 transition relative flex flex-col justify-between ${
                                    data.path === 'schedule_field_visit'
                                        ? 'border-amber-600 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl">🚗</span>
                                        <input
                                            type="radio"
                                            name="path"
                                            value="schedule_field_visit"
                                            checked={data.path === 'schedule_field_visit'}
                                            onChange={(e) => setData('path', e.target.value)}
                                            className="text-amber-600 focus:ring-amber-500 h-4 w-4"
                                        />
                                    </div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-3">
                                        4. Schedule Field Visit
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Requires on-site inspection or verification by you or a supervised field officer.
                                    </p>
                                </div>
                                <span className="mt-4 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                                    Requires inspection datetime & officer assignment
                                </span>
                            </label>
                        </div>

                        {/* Pathway Specific Form Inputs */}
                        <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 space-y-4">
                            {data.path === 'handle_directly' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Initial Investigation Directives / Notes (Optional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Add any internal instructions or initial findings for investigating this complaint..."
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs p-3 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                    {errors.notes && <p className="text-xs text-rose-600 mt-1">{errors.notes}</p>}
                                </div>
                            )}

                            {data.path === 'club_with_existing' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                        Clubbing Rationale & Notes (Optional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Record why this complaint is considered identical to the primary master complaint..."
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs p-3 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                            )}

                            {data.path === 'forward_externally' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                            External Agency Destination *
                                        </label>
                                        <select
                                            value={data.destination_id}
                                            onChange={(e) => setData('destination_id', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs p-2.5 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Destination Authority...</option>
                                            {forwardDestinations.map((dest) => (
                                                <option key={dest.id} value={dest.id}>
                                                    {dest.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.destination_id && (
                                            <p className="text-xs text-rose-600 mt-1">{errors.destination_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                            Jurisdictional Remarks / Forwarding Justification *
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={data.remarks}
                                            onChange={(e) => setData('remarks', e.target.value)}
                                            placeholder="Explain why this matter falls under the selected external authority..."
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs p-3 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        {errors.remarks && (
                                            <p className="text-xs text-rose-600 mt-1">{errors.remarks}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {data.path === 'schedule_field_visit' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Proposed Inspection Date & Time *
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={data.visit_datetime}
                                                onChange={(e) => setData('visit_datetime', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs p-2.5 focus:ring-amber-500 focus:border-amber-500"
                                                required
                                            />
                                            {errors.visit_datetime && (
                                                <p className="text-xs text-rose-600 mt-1">{errors.visit_datetime}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                Assign To (Officer) *
                                            </label>
                                            <select
                                                value={data.assigned_officer_id}
                                                onChange={(e) => setData('assigned_officer_id', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs p-2.5 focus:ring-amber-500 focus:border-amber-500"
                                                required
                                            >
                                                <option value={currentFp?.id}>
                                                    Assign to Myself ({currentFp?.name} - Focal Person)
                                                </option>
                                                {fieldOfficers.map((fo) => (
                                                    <option key={fo.id} value={fo.id}>
                                                        {fo.name} (Field Officer - Supervised)
                                                    </option>
                                                ))}
                                            </select>
                                            {fieldOfficers.length === 0 && (
                                                <p className="text-[11px] text-gray-400 mt-1">
                                                    No subordinate field officers linked. You may assign the visit to yourself.
                                                </p>
                                            )}
                                            {errors.assigned_officer_id && (
                                                <p className="text-xs text-rose-600 mt-1">{errors.assigned_officer_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                            Site / Inspection Location
                                        </label>
                                        <input
                                            type="text"
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                            placeholder="Specific address, landmark, or site coordinates..."
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs p-2.5 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                            Field Inspection Terms / Instructions
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Specify what the inspecting officer must verify on-site..."
                                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs p-3 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Row */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                            <Link
                                href={route('fp.dashboard')}
                                className="text-xs text-gray-500 hover:text-gray-700 font-semibold"
                            >
                                ← Cancel and Return to Queue
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
                            >
                                {processing ? 'Submitting Classification...' : 'Commit Classification Decision →'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal 1: Side-by-Side Text Comparison */}
            {comparingMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    Side-by-Side Duplicate Comparison
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Similarity Score: {Math.round(parseFloat(comparingMatch.similarity_score) * 100)}%
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setComparingMatch(null)}
                                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Current Complaint */}
                            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                        Current: {complaint.complaint_number}
                                    </span>
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                                        In Review
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                    {complaint.subject}
                                </h4>
                                <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-white dark:bg-gray-800 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                                    {complaint.details}
                                </div>
                                <div className="text-[11px] text-gray-500">
                                    Citizen: {complaint.citizen?.name} ({complaint.citizen?.cnic})
                                </div>
                            </div>

                            {/* Candidate Match Complaint */}
                            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400">
                                        Candidate: {comparingMatch.matched_complaint?.complaint_number}
                                    </span>
                                    <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-semibold">
                                        Candidate
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                    {comparingMatch.matched_complaint?.subject}
                                </h4>
                                <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-100 dark:border-purple-900/50">
                                    {comparingMatch.matched_complaint?.details}
                                </div>
                                <div className="text-[11px] text-gray-500">
                                    Citizen: {comparingMatch.matched_complaint?.citizen?.name} ({comparingMatch.matched_complaint?.citizen?.cnic})
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => setComparingMatch(null)}
                                className="px-4 py-2 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200"
                            >
                                Close Comparison
                            </button>
                            {comparingMatch.status === 'pending' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const m = comparingMatch;
                                        setComparingMatch(null);
                                        setConfirmingMatch(m);
                                    }}
                                    className="px-4 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                                >
                                    Proceed to Confirm as Duplicate →
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 2: Confirmation Dialog for Confirming Duplicate */}
            {confirmingMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-purple-200 dark:border-purple-800">
                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center text-2xl mx-auto">
                            🔗
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Confirm Duplicate Grievance?
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                You are about to link <strong>{complaint.complaint_number}</strong> as a duplicate under master grievance <strong>{confirmingMatch.matched_complaint?.complaint_number}</strong>.
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg text-xs text-purple-900 dark:text-purple-300 border border-purple-100 dark:border-purple-900/50">
                            ℹ️ An auditable link will be created. The citizen's grievance will remain tied to this master case.
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmingMatch(null)}
                                className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleConfirmDuplicateAction(confirmingMatch)}
                                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm"
                            >
                                Yes, Confirm Duplicate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
