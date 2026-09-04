import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function AdminDashboard({
    metrics = {},
    departmentBreakdown = [],
    recentComplaints = [],
    recentActivities = [],
}) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold leading-tight text-gray-800 dark:text-gray-100">
                        System Administrator Central Dashboard
                    </h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                        Global Access Granted
                    </span>
                </div>
            }
        >
            <Head title="Admin Dashboard - PMCC CMS" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Total Grievances
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                                {metrics.total_complaints ?? 0}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                Pending Action
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                                {metrics.pending_complaints ?? 0}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                Resolved Grievances
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {metrics.resolved_complaints ?? 0}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                Active Departments
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                                {metrics.total_departments ?? 0}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                Active System Users
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                                {metrics.total_users ?? 0}
                            </p>
                        </div>
                    </div>

                    {/* Department Breakdown Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Departmental Performance Breakdown
                            </h3>
                            <span className="text-xs text-gray-500">
                                Data enforced by Administrator query scope
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Department</th>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Code</th>
                                        <th className="px-6 py-3 text-center font-semibold text-gray-600 dark:text-gray-300">Total Received</th>
                                        <th className="px-6 py-3 text-center font-semibold text-amber-600 dark:text-amber-400">Pending</th>
                                        <th className="px-6 py-3 text-center font-semibold text-emerald-600 dark:text-emerald-400">Resolved</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {departmentBreakdown.map((dept) => (
                                        <tr key={dept.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{dept.name}</td>
                                            <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{dept.code}</td>
                                            <td className="px-6 py-3 text-center font-bold text-gray-900 dark:text-white">{dept.complaints_count ?? 0}</td>
                                            <td className="px-6 py-3 text-center text-amber-600 font-semibold">{dept.pending_count ?? 0}</td>
                                            <td className="px-6 py-3 text-center text-emerald-600 font-semibold">{dept.resolved_count ?? 0}</td>
                                        </tr>
                                    ))}
                                    {departmentBreakdown.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                No departments registered in the system.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Two-Column Grid: Recent Complaints & Audit Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Recent Complaints */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                                Recent System Grievances
                            </h3>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {recentComplaints.map((c) => (
                                    <div key={c.id} className="py-3 flex justify-between items-center">
                                        <div>
                                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                {c.complaint_number}
                                            </span>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-sm">
                                                {c.subject}
                                            </p>
                                            <span className="text-xs text-gray-500">
                                                {c.department?.name || 'Uncategorized'} • {c.district?.name || 'AJK'}
                                            </span>
                                        </div>
                                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            {c.status}
                                        </span>
                                    </div>
                                ))}
                                {recentComplaints.length === 0 && (
                                    <p className="text-sm text-gray-500 py-4 text-center">No grievances recorded yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Audit Activities */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                                Recent Security & Activity Logs
                            </h3>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {recentActivities.map((act) => (
                                    <div key={act.id} className="py-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {act.description}
                                            </p>
                                            <span className="text-xs text-gray-500">
                                                By: {act.causer?.name || 'System / Citizen'} • {new Date(act.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <span className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                                            {act.log_name}
                                        </span>
                                    </div>
                                ))}
                                {recentActivities.length === 0 && (
                                    <p className="text-sm text-gray-500 py-4 text-center">No activity logged yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
