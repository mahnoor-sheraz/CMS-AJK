import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function FocalPersonDashboard({
    department = null,
    metrics = {},
    complaints = [],
    fieldOfficers = [],
    reassignmentRequests = [],
}) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-gray-800 dark:text-gray-100">
                            Departmental Grievance Portal
                        </h2>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                            {department ? `${department.name} (${department.code})` : 'Department Unassigned'}
                        </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                        Departmental Scope Enforced
                    </span>
                </div>
            }
        >
            <Head title={`Focal Person Dashboard - ${department?.name || 'Department'}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Department Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Department Complaints
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                                {metrics.total_complaints ?? 0}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                New Submissions
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                                {metrics.submitted ?? 0}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                Under Investigation
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                {metrics.under_investigation ?? 0}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                Resolved Complaints
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {metrics.resolved ?? 0}
                            </p>
                        </div>
                    </div>

                    {/* Department Complaints Queue */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    Departmental Grievances Queue
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Backing query strictly restricted to {department?.name || 'assigned department'}
                                </p>
                            </div>
                            <span className="text-xs font-medium text-gray-500">
                                Showing {complaints.length} records
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Complaint #</th>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Subject</th>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Citizen & Contact</th>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Tehsil</th>
                                        <th className="px-6 py-3 text-center font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                        <th className="px-6 py-3 text-right font-semibold text-gray-600 dark:text-gray-300">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {complaints.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                {c.complaint_number}
                                            </td>
                                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                                                {c.subject}
                                            </td>
                                            <td className="px-6 py-3 text-gray-600 dark:text-gray-300">
                                                <div>{c.citizen?.name || 'N/A'}</div>
                                                <div className="text-xs text-gray-400">{c.citizen?.mobile_number}</div>
                                            </td>
                                            <td className="px-6 py-3 text-gray-500 dark:text-gray-400">
                                                {c.tehsil?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <Link
                                                    href={route('fp.complaints.show', c.id)}
                                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                >
                                                    Inspect →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {complaints.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                No grievances in your department's queue.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Two-Column Grid: Field Officers & Reassignment Requests */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Department Field Officers */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
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
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                                Department Reassignment Requests
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">
                                Outgoing and incoming misrouted grievances
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
                                        <span className="px-2 py-0.5 text-xs rounded font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
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
