import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function FocalPersonInvestigate({
    complaint,
    similarityMatches = [],
    fieldOfficers = [],
    forwardDestinations = [],
    hasConfirmedDuplicate = false,
    departments = [],
    latestReassignmentRequest = null,
    currentFp = {},
}) {
    // Side-by-side comparison state (inline expand or modal)
    const [expandedMatchId, setExpandedMatchId] = useState(null);
    const [comparingMatch, setComparingMatch] = useState(null);
    const [confirmingMatch, setConfirmingMatch] = useState(null);
    const [skippedMatchIds, setSkippedMatchIds] = useState([]);
    const [skipNotice, setSkipNotice] = useState(null);
    const [showReassignModal, setShowReassignModal] = useState(false);

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

    // Form for reassignment
    const reassignForm = useForm({
        to_department_id: '',
        reason: '',
    });

    const handleClassifySubmit = (e) => {
        e.preventDefault();
        post(route('fp.complaints.classify', complaint.id));
    };

    const submitReassign = (e) => {
        e.preventDefault();
        reassignForm.post(route('fp.complaints.reassign', complaint.id), {
            onSuccess: () => setShowReassignModal(false),
        });
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

    const handleSkipAction = (match) => {
        setSkippedMatchIds((prev) => [...prev, match.id]);
        setSkipNotice(
            `Suggestion for ${match.matched_complaint?.complaint_number || '#' + match.matched_complaint_id} skipped. It remains pending and will resurface on your next visit.`
        );
        setTimeout(() => setSkipNotice(null), 6000);
    };

    // Translate similarity_score into a label (High / Medium / Low) without raw numbers
    const getScoreBadge = (score, label) => {
        const computedLabel = label || (parseFloat(score) >= 0.85 ? 'High' : parseFloat(score) >= 0.70 ? 'Medium' : 'Low');

        if (computedLabel === 'High') {
            return (
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300">
                    🔥 High Similarity
                </span>
            );
        }
        if (computedLabel === 'Medium') {
            return (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                    ⚡ Medium Similarity
                </span>
            );
        }
        return (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200">
                Low Similarity
            </span>
        );
    };

    // Filter active pending matches that are not skipped in this session
    const visibleMatches = similarityMatches.filter(
        (m) => m.status === 'pending' && !skippedMatchIds.includes(m.id)
    );

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
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#8C8C8C]/10 text-[#8C8C8C] border border-[#8C8C8C]/20">
                            Stage: Received (Triage)
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Staff Verification View
                        </span>
                        {!latestReassignmentRequest || latestReassignmentRequest.status !== 'pending' ? (
                            <button
                                onClick={() => setShowReassignModal(true)}
                                className="px-3 py-1 bg-white border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium transition ml-2"
                            >
                                Request Reassignment
                            </button>
                        ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 ml-2">
                                Reassignment Pending
                            </span>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`First Investigation - ${complaint.complaint_number}`} />

            <div className="py-8">
                <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 space-y-8">
                    {latestReassignmentRequest && latestReassignmentRequest.status === 'rejected' && (
                        <div className="bg-rose-50 dark:bg-rose-900/30 border-l-4 border-rose-500 p-4 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <span className="text-rose-500">⚠️</span>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-rose-800 dark:text-rose-200">
                                        Reassignment Request Rejected
                                    </h3>
                                    <div className="mt-2 text-sm text-rose-700 dark:text-rose-300">
                                        <p>
                                            <strong>Director Note:</strong> {latestReassignmentRequest.review_notes}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {latestReassignmentRequest && latestReassignmentRequest.status === 'pending' && (
                        <div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 p-4 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <span className="text-amber-500">🔄</span>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                        Reassignment Request Pending
                                    </h3>
                                    <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                                        <p>
                                            This complaint is currently pending approval to be reassigned to another department. You may continue to investigate or resolve it if necessary, but it may be moved from your queue soon.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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

                    {/* Section A: Full Complaint Detail (Read-Only) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-5">
                        <div className="border-b border-gray-100 dark:border-gray-700 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                                    Section A • Full Complaint Detail (Read-Only)
                                </span>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                    {complaint.subject}
                                </h3>
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                                Complaint Number: <strong className="font-mono text-emerald-700 dark:text-emerald-400">{complaint.complaint_number}</strong>
                            </div>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                            <div>
                                <span className="text-gray-400 block font-medium">Citizen Full Name</span>
                                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                                    {complaint.citizen?.name}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400 block font-medium">Citizen CNIC</span>
                                <span className="font-mono font-bold text-gray-900 dark:text-gray-100 text-sm">
                                    {complaint.citizen?.cnic}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400 block font-medium">Submission Channel</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {complaint.channel?.name || 'Web Portal'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400 block font-medium">Submission Timestamp</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {new Date(complaint.submitted_at || complaint.created_at).toLocaleString()}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400 block font-medium">Category</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {complaint.category?.parent ? complaint.category.parent.name : complaint.category?.name || 'Uncategorized'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400 block font-medium">Subcategory</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {complaint.category?.parent ? complaint.category.name : 'General / None'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400 block font-medium">Location</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {complaint.district?.name} — {complaint.tehsil?.name}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400 block font-medium">Department</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {complaint.department?.name}
                                </span>
                            </div>
                        </div>

                        {/* Complaint Narrative */}
                        <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                Citizen Complaint Description
                            </span>
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                                {complaint.details}
                            </div>
                        </div>

                        {/* Attachments */}
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                Attachments ({complaint.attachments ? complaint.attachments.length : 0})
                            </span>
                            {complaint.attachments && complaint.attachments.length > 0 ? (
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
                            ) : (
                                <p className="text-xs text-gray-400 italic">No evidentiary attachments uploaded.</p>
                            )}
                        </div>
                    </div>

                    {/* Section B: AI Duplicate Suggestions Panel */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-base">⚡</span>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                        Section B • AI Duplicate Suggestions Panel
                                    </h3>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Review AI similarity candidates. Confirm duplicates to club under a master complaint, mark distinct complaints as not a duplicate, or skip to decide later.
                                </p>
                            </div>
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                                {visibleMatches.length} Candidate{visibleMatches.length === 1 ? '' : 's'} Pending Review
                            </span>
                        </div>

                        {/* Skip notice feedback */}
                        {skipNotice && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                                <span>ℹ️ {skipNotice}</span>
                                <button
                                    type="button"
                                    onClick={() => setSkipNotice(null)}
                                    className="text-amber-700 hover:text-amber-900 font-bold ml-2"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {visibleMatches.length === 0 ? (
                            <div className="p-8 text-center rounded-xl bg-gray-50 dark:bg-gray-900/30 border border-dashed border-gray-200 dark:border-gray-700">
                                <div className="text-2xl mb-1">🔍</div>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    No similar complaints found
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    No action required. This complaint does not match existing records.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {visibleMatches.map((match) => {
                                    const isExpanded = expandedMatchId === match.id;
                                    const snippet = match.matched_complaint?.details
                                        ? match.matched_complaint.details.length > 160
                                            ? match.matched_complaint.details.slice(0, 160) + '...'
                                            : match.matched_complaint.details
                                        : 'No complaint details recorded.';

                                    return (
                                        <div
                                            key={match.id}
                                            className="p-5 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-white dark:bg-gray-800/90 shadow-sm space-y-3"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <div className="space-y-1.5 flex-1 pr-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded">
                                                            {match.matched_complaint?.complaint_number || `#${match.matched_complaint_id}`}
                                                        </span>
                                                        {getScoreBadge(match.similarity_score, match.similarity_label)}
                                                        <span className="text-xs text-gray-500">
                                                            Lodged on {new Date(match.matched_complaint?.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {match.matched_complaint?.subject}
                                                    </h4>

                                                    {/* Text snippet */}
                                                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                                        <strong className="text-gray-400 font-normal">Snippet: </strong>
                                                        "{snippet}"
                                                    </p>

                                                    <div className="text-[11px] text-gray-400 flex flex-wrap gap-x-3 pt-0.5">
                                                        <span>Citizen: {match.matched_complaint?.citizen?.name}</span>
                                                        <span>CNIC: {match.matched_complaint?.citizen?.cnic}</span>
                                                        <span>Channel: {match.matched_complaint?.channel?.name || 'Web'}</span>
                                                        <span>Location: {match.matched_complaint?.district?.name} - {match.matched_complaint?.tehsil?.name}</span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons: Compare, Confirm as duplicate, Not a duplicate, Skip */}
                                                <div className="flex flex-wrap sm:flex-col lg:flex-row items-center gap-2 sm:self-start shrink-0 pt-2 sm:pt-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                                            isExpanded
                                                                ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-300 text-purple-800 dark:text-purple-300'
                                                                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border-gray-300 text-gray-700 dark:text-gray-200'
                                                        }`}
                                                    >
                                                        {isExpanded ? 'Hide Comparison' : '↔️ Compare'}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setConfirmingMatch(match)}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition shadow-sm"
                                                    >
                                                        Confirm as duplicate
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDismissDuplicateAction(match)}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition"
                                                    >
                                                        Not a duplicate
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleSkipAction(match)}
                                                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 transition"
                                                    >
                                                        Skip
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Inline 'Compare' expand showing both complaints' text side-by-side */}
                                            {isExpanded && (
                                                <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-900/50">
                                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                        Side-by-Side Narrative Comparison
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Current Complaint */}
                                                        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                                                    Current Complaint: {complaint.complaint_number}
                                                                </span>
                                                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">
                                                                    Under Review
                                                                </span>
                                                            </div>
                                                            <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                                                                {complaint.subject}
                                                            </h5>
                                                            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line border border-emerald-100 dark:border-emerald-900/40 max-h-56 overflow-y-auto">
                                                                {complaint.details}
                                                            </div>
                                                            <div className="text-[11px] text-gray-500 flex justify-between">
                                                                <span>Citizen: {complaint.citizen?.name}</span>
                                                                <span className="font-mono">{complaint.citizen?.cnic}</span>
                                                            </div>
                                                        </div>

                                                        {/* Candidate Complaint */}
                                                        <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-mono text-xs font-bold text-purple-800 dark:text-purple-300">
                                                                    Candidate: {match.matched_complaint?.complaint_number}
                                                                </span>
                                                                {getScoreBadge(match.similarity_score, match.similarity_label)}
                                                            </div>
                                                            <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                                                                {match.matched_complaint?.subject}
                                                            </h5>
                                                            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line border border-purple-100 dark:border-purple-900/40 max-h-56 overflow-y-auto">
                                                                {match.matched_complaint?.details}
                                                            </div>
                                                            <div className="text-[11px] text-gray-500 flex justify-between">
                                                                <span>Citizen: {match.matched_complaint?.citizen?.name}</span>
                                                                <span className="font-mono">{match.matched_complaint?.citizen?.cnic}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
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
                                Select Complaint Triage Pathway
                            </h3>
                            <p className="text-xs text-gray-500">
                                Select exactly one pathway to formalize this complaint and advance it from triage stage.
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
                                        Complaint falls under our departmental mandate. We will investigate and resolve internally.
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
                                        2. Club with Existing Master Complaint
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Subsume this complaint under a verified master duplicate complaint.
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
                                <div className="mt-1">
                                    {getScoreBadge(comparingMatch.similarity_score, comparingMatch.similarity_label)}
                                </div>
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
                                Confirm as Duplicate Complaint?
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Confirming this will club complaint <strong>{complaint.complaint_number}</strong> under matched complaint <strong>{confirmingMatch.matched_complaint?.complaint_number || '#' + confirmingMatch.matched_complaint_id}</strong> before committing.
                            </p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg text-xs text-purple-900 dark:text-purple-300 border border-purple-100 dark:border-purple-900/50">
                            ℹ️ This action creates a record in <code>complaint_clubs</code> and updates this candidate match to <strong>confirmed</strong>.
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

            {/* Modal 3: Request Reassignment */}
            {showReassignModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Request Department Reassignment</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            If this complaint was assigned to your department in error, you can request to route it to the correct department. This requires Director approval.
                        </p>
                        <form onSubmit={submitReassign} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Target Department</label>
                                <select
                                    value={reassignForm.data.to_department_id}
                                    onChange={e => reassignForm.setData('to_department_id', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm sm:text-sm"
                                    required
                                >
                                    <option value="">Select correct department...</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                                {reassignForm.errors.to_department_id && <p className="text-sm text-red-600 mt-1">{reassignForm.errors.to_department_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reason for Reassignment</label>
                                <textarea
                                    value={reassignForm.data.reason}
                                    onChange={e => reassignForm.setData('reason', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm sm:text-sm"
                                    rows="3"
                                    required
                                ></textarea>
                                {reassignForm.errors.reason && <p className="text-sm text-red-600 mt-1">{reassignForm.errors.reason}</p>}
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowReassignModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={reassignForm.processing}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
