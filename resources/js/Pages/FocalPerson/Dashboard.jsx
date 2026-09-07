import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function FocalPersonDashboard({
    department = null,
    metrics = {},
    complaints = [],
    fieldOfficers = [],
    reassignmentRequests = [],
    categories = [],
    districts = [],
    tehsils = [],
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [districtId, setDistrictId] = useState(filters.district_id || '');
    const [tehsilId, setTehsilId] = useState(filters.tehsil_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [hasDuplicate, setHasDuplicate] = useState(Boolean(filters.has_duplicate));

    // Filter tehsils based on selected district
    const availableTehsils = districtId
        ? tehsils.filter((t) => String(t.district_id) === String(districtId))
        : tehsils;

    const handleFilterSubmit = (e) => {
        e?.preventDefault();
        router.get(
            route('fp.dashboard'),
            {
                search: search || undefined,
                status: status || undefined,
                category_id: categoryId || undefined,
                district_id: districtId || undefined,
                tehsil_id: tehsilId || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                has_duplicate: hasDuplicate ? '1' : undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatus('');
        setCategoryId('');
        setDistrictId('');
        setTehsilId('');
        setDateFrom('');
        setDateTo('');
        setHasDuplicate(false);
        router.get(route('fp.dashboard'), {}, { preserveState: true, replace: true });
    };

    // Format display label for stored stage values
    const formatStage = (stage) => {
        switch (stage) {
            case 'application_submission':
                return 'Received';
            case 'investigation_by_department':
                return 'Under Investigation';
            case 'updated_info':
                return 'Resolved';
            default:
                return stage || 'Received';
        }
    };

    // Row click routing rule:
    // application_submission -> First Investigation
    // investigation_by_department -> Action / Resolution (or Inspect)
    const handleRowClick = (complaint) => {
        if (complaint.stage === 'application_submission') {
            router.visit(route('fp.complaints.investigate', complaint.id));
        } else {
            router.visit(route('fp.complaints.show', complaint.id));
        }
    };

    const hasActiveFilters = Boolean(
        search || status || categoryId || districtId || tehsilId || dateFrom || dateTo || hasDuplicate
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-gray-800 dark:text-gray-100">
                            Departmental Grievance Dashboard
                        </h2>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                            {department ? `${department.name} (${department.code})` : 'Department Unassigned'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                            🔒 Departmental Scope Enforced
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                            15-Day SLA Threshold
                        </span>
                    </div>
                </div>
            }
        >
            <Head title={`Focal Person Dashboard - ${department?.name || 'Department'}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* KPI Strip: Exactly 4 Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {/* Card 1: New / Unassigned */}
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                    New / Unassigned
                                </p>
                                <span className="text-lg">📥</span>
                            </div>
                            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                                {metrics.new_unassigned ?? 0}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-1">Awaiting First Investigation</p>
                        </div>

                        {/* Card 2: Under Investigation */}
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                    Under Investigation
                                </p>
                                <span className="text-lg">🔍</span>
                            </div>
                            <p className="mt-2 text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                {metrics.under_investigation ?? 0}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-1">Active Departmental Enquiries</p>
                        </div>

                        {/* Card 3: Awaiting Resolution Confirmation */}
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                    Awaiting Confirmation
                                </p>
                                <span className="text-lg">⏳</span>
                            </div>
                            <p className="mt-2 text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                                {metrics.awaiting_confirmation ?? 0}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-1">Pending Inspection or Forwarding</p>
                        </div>

                        {/* Card 4: Resolved This Month */}
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                    Resolved This Month
                                </p>
                                <span className="text-lg">✅</span>
                            </div>
                            <p className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {metrics.resolved_this_month ?? 0}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-1">Closed with citizen summary</p>
                        </div>
                    </div>

                    {/* Department Complaints Queue Table Container */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    Departmental Grievances Queue
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Scoped to {department?.name || 'assigned department'} • Click any row to proceed with triage or inspection
                                </p>
                            </div>
                            <span className="text-xs font-medium text-gray-500">
                                Showing {complaints.length} records
                            </span>
                        </div>

                        {/* Comprehensive Filter Bar */}
                        <form
                            onSubmit={handleFilterSubmit}
                            className="p-4 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-700 space-y-3 text-xs"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {/* Search */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                        Keyword Search
                                    </label>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Complaint #, CNIC, Citizen..."
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="submitted">New Submission (Triage)</option>
                                        <option value="under_investigation">Under Investigation</option>
                                        <option value="pending_field_visit">Pending Field Visit</option>
                                        <option value="clubbed">Clubbed</option>
                                        <option value="forwarded_external">Forwarded External</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* District */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                        District
                                    </label>
                                    <select
                                        value={districtId}
                                        onChange={(e) => {
                                            setDistrictId(e.target.value);
                                            setTehsilId('');
                                        }}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="">All Districts</option>
                                        {districts.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                                {/* Tehsil */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                        Tehsil
                                    </label>
                                    <select
                                        value={tehsilId}
                                        onChange={(e) => setTehsilId(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="">All Tehsils</option>
                                        {availableTehsils.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date From */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                        Date From
                                    </label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                {/* Date To */}
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                        Date To
                                    </label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-xs px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                {/* Action Buttons & Duplicate Toggle */}
                                <div className="flex items-center gap-3 justify-between sm:justify-end pb-0.5">
                                    <label className="inline-flex items-center cursor-pointer select-none text-gray-700 dark:text-gray-300 font-medium">
                                        <input
                                            type="checkbox"
                                            checked={hasDuplicate}
                                            onChange={(e) => setHasDuplicate(e.target.checked)}
                                            className="rounded border-gray-300 text-purple-600 shadow-sm focus:ring-purple-500 w-4 h-4 mr-1.5"
                                        />
                                        <span>⚡ AI Duplicates</span>
                                    </label>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="submit"
                                            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
                                        >
                                            Filter
                                        </button>
                                        {hasActiveFilters && (
                                            <button
                                                type="button"
                                                onClick={handleResetFilters}
                                                className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition"
                                                title="Reset all filters"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Complaint Queue Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Complaint #</th>
                                        <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Citizen (Unmasked)</th>
                                        <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Category</th>
                                        <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">District / Tehsil</th>
                                        <th className="px-5 py-3 text-center font-semibold text-gray-600 dark:text-gray-300">Submitted Date</th>
                                        <th className="px-5 py-3 text-center font-semibold text-gray-600 dark:text-gray-300">Current Stage</th>
                                        <th className="px-5 py-3 text-center font-semibold text-gray-600 dark:text-gray-300">Days Open</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {complaints.map((c) => (
                                        <tr
                                            key={c.id}
                                            onClick={() => handleRowClick(c)}
                                            className="hover:bg-emerald-50/40 dark:hover:bg-gray-700/60 cursor-pointer transition"
                                            title={
                                                c.stage === 'application_submission'
                                                    ? 'Click to open First Investigation & Triage'
                                                    : 'Click to open Complaint Inspection & Action'
                                            }
                                        >
                                            {/* Column 1: Complaint Number + Indicators */}
                                            <td className="px-5 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                <div className="flex items-center gap-1.5">
                                                    <span>{c.complaint_number}</span>
                                                    {c.has_pending_duplicate && (
                                                        <span
                                                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 text-[11px]"
                                                            title="⚡ AI Duplicate Suggestion Pending"
                                                        >
                                                            ⚡
                                                        </span>
                                                    )}
                                                    {c.has_pending_reassignment && (
                                                        <span
                                                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 text-[11px]"
                                                            title="🔄 Reassignment Request Pending Director Review"
                                                        >
                                                            🔄
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] font-normal text-gray-500 dark:text-gray-400 max-w-xs truncate mt-0.5">
                                                    {c.subject}
                                                </div>
                                            </td>

                                            {/* Column 2: Citizen's Full Name and Full CNIC (Unmasked) */}
                                            <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {c.citizen?.name || 'N/A'}
                                                </div>
                                                <div className="text-[11px] font-mono text-gray-500">
                                                    CNIC: {c.citizen?.cnic || 'N/A'}
                                                </div>
                                                <div className="text-[11px] text-gray-400">
                                                    📞 {c.citizen?.mobile_number || 'N/A'}
                                                </div>
                                            </td>

                                            {/* Column 3: Category */}
                                            <td className="px-5 py-3 text-gray-700 dark:text-gray-300 font-medium">
                                                {c.category?.name || 'General Grievance'}
                                            </td>

                                            {/* Column 4: District / Tehsil */}
                                            <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                                                <div>{c.tehsil?.name || 'N/A'}</div>
                                                <div className="text-[11px] text-gray-400">{c.district?.name}</div>
                                            </td>

                                            {/* Column 5: Submitted Date */}
                                            <td className="px-5 py-3 text-center text-gray-600 dark:text-gray-300 font-medium">
                                                {c.submitted_date_formatted}
                                            </td>

                                            {/* Column 6: Current Stage Badge */}
                                            <td className="px-5 py-3 text-center">
                                                <span
                                                    className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                        c.stage === 'application_submission'
                                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300'
                                                            : c.stage === 'investigation_by_department'
                                                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-300'
                                                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300'
                                                    }`}
                                                >
                                                    {formatStage(c.stage)}
                                                </span>
                                            </td>

                                            {/* Column 7: Days Open (Red if > 15 days) */}
                                            <td className="px-5 py-3 text-center">
                                                {c.is_overdue ? (
                                                    <span
                                                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-400 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700"
                                                        title="SLA Alert: Exceeded 15-day policy threshold"
                                                    >
                                                        ⚠️ {c.days_open}d (Overdue)
                                                    </span>
                                                ) : c.days_open > 7 ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                                        {c.days_open}d
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                        {c.days_open}d
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}

                                    {complaints.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                <div className="text-2xl mb-1">📭</div>
                                                <p className="text-sm font-medium">No complaints found matching current filters.</p>
                                                {hasActiveFilters && (
                                                    <button
                                                        type="button"
                                                        onClick={handleResetFilters}
                                                        className="mt-2 text-xs text-emerald-600 hover:underline font-semibold"
                                                    >
                                                        Clear all filters
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Subordinate Field Officers and Reassignment Requests */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Department Field Officers */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                                Departmental Field Officers
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">
                                Subordinates and field investigators in {department?.name || 'your department'}
                            </p>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {fieldOfficers.map((fo) => (
                                    <div key={fo.id} className="py-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{fo.name}</p>
                                            <span className="text-xs text-gray-500">{fo.email}</span>
                                        </div>
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-semibold">
                                            Active Officer
                                        </span>
                                    </div>
                                ))}
                                {fieldOfficers.length === 0 && (
                                    <p className="text-sm text-gray-500 py-4 text-center">No field officers assigned to this department.</p>
                                )}
                            </div>
                        </div>

                        {/* Department Reassignment Requests */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                                Department Reassignment Requests
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">
                                Cross-department routing requests awaiting Director review
                            </p>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {reassignmentRequests.map((req) => (
                                    <div key={req.id} className="py-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {req.complaint?.complaint_number}: {req.from_department?.name} → {req.to_department?.name}
                                            </p>
                                            <span className="text-xs text-gray-500">
                                                Reason: {req.reason} • By: {req.requester?.name}
                                            </span>
                                        </div>
                                        <span className={`px-2 py-0.5 text-xs rounded font-semibold ${
                                            req.status === 'pending'
                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                                : req.status === 'approved'
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                ))}
                                {reassignmentRequests.length === 0 && (
                                    <p className="text-sm text-gray-500 py-4 text-center">No active reassignment requests.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
