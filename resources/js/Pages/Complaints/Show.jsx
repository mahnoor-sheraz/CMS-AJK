import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function ComplaintShow({ complaint }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-gray-800 dark:text-gray-100">
                            Grievance Inspection: {complaint.complaint_number}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Lodged on {new Date(complaint.created_at).toLocaleString()} via Web Portal
                        </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        {complaint.status}
                    </span>
                </div>
            }
        >
            <Head title={`Complaint ${complaint.complaint_number} - PMCC CMS`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {complaint.subject}
                            </h3>
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                {complaint.details}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-700 pt-4 text-sm">
                            <div>
                                <span className="text-xs text-gray-400 block">Department</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {complaint.department?.name || 'Unassigned'}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block">Location</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {complaint.district?.name} - {complaint.tehsil?.name}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block">Citizen</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {complaint.citizen?.name} ({complaint.citizen?.mobile_number})
                                </span>
                            </div>
                        </div>

                        {complaint.attachments && complaint.attachments.length > 0 && (
                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Attachments ({complaint.attachments.length})
                                </h4>
                                <ul className="space-y-1">
                                    {complaint.attachments.map((att) => (
                                        <li key={att.id} className="text-sm text-blue-600 dark:text-blue-400">
                                            📎 {att.file_name} ({(att.file_size / 1024).toFixed(1)} KB)
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
