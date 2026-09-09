import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function FocalPersonComplaintResolve({
    complaint,
    departments = [],
    latestReassignmentRequest = null,
}) {
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [showCascadeConfirm, setShowCascadeConfirm] = useState(false);

    // Form for new progress note
    const progressForm = useForm({
        notes: '',
    });

    // Form for resolution
    const resolveForm = useForm({
        resolution_status: 'resolved',
        action_summary: '',
        attachment: null,
    });

    // Form for reassignment
    const reassignForm = useForm({
        to_department_id: '',
        reason: '',
    });

    const submitProgressNote = (e) => {
        e.preventDefault();
        progressForm.post(route('fp.complaints.progress-note', complaint.id), {
            onSuccess: () => progressForm.reset(),
        });
    };

    const attemptResolveSubmit = (e) => {
        e.preventDefault();
        if (complaint.clubbed_children && complaint.clubbed_children.length > 0) {
            setShowCascadeConfirm(true);
        } else {
            submitResolve();
        }
    };

    const submitResolve = () => {
        resolveForm.post(route('fp.complaints.resolve.store', complaint.id), {
            onSuccess: () => setShowCascadeConfirm(false),
        });
    };

    const submitReassign = (e) => {
        e.preventDefault();
        reassignForm.post(route('fp.complaints.reassign', complaint.id), {
            onSuccess: () => setShowReassignModal(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Action / Resolution: {complaint.complaint_number}</h2>}
        >
            <Head title={`Resolve ${complaint.complaint_number}`} />

            <div className="py-12">
                <div className="max-w-[1600px] mx-auto sm:px-6 lg:px-8 space-y-6">

                    {latestReassignmentRequest && latestReassignmentRequest.status === 'rejected' && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <span className="text-red-500">⚠️</span>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Reassignment Request Rejected
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>
                                            <strong>Director Note:</strong> {latestReassignmentRequest.review_notes}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {latestReassignmentRequest && latestReassignmentRequest.status === 'pending' && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md mb-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <span className="text-yellow-500">🔄</span>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Reassignment Request Pending
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>
                                            This complaint is currently pending approval to be reassigned to another department. You may continue to investigate or resolve it if necessary, but it may be moved from your queue soon.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Header Details */}
                    <div className="bg-white p-6 shadow sm:rounded-lg flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Complaint Details</h3>
                            <p className="text-sm text-gray-600"><strong>Subject:</strong> {complaint.subject}</p>
                            <p className="text-sm text-gray-600"><strong>Citizen:</strong> {complaint.citizen?.name} (CNIC: {complaint.citizen?.cnic})</p>
                            <p className="text-sm text-gray-600 mt-2"><strong>Description:</strong> {complaint.details}</p>
                        </div>
                        <div>
                            {!latestReassignmentRequest || latestReassignmentRequest.status !== 'pending' ? (
                                <button
                                    onClick={() => setShowReassignModal(true)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium transition"
                                >
                                    Request Reassignment
                                </button>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pmcc-accent/10 text-pmcc-accent">
                                    Reassignment Pending
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Investigation Log Section */}
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Investigation Log</h3>
                        
                        <div className="space-y-4 mb-6">
                            {complaint.investigations && complaint.investigations.length > 0 ? (
                                complaint.investigations.map((inv, idx) => (
                                    <div key={idx} className="border-l-4 border-blue-500 pl-4 py-1 bg-gray-50 rounded-r">
                                        <div className="flex justify-between">
                                            <span className="text-xs font-semibold text-gray-500 uppercase">{inv.investigation_type.replace(/_/g, ' ')}</span>
                                            <span className="text-xs text-gray-500">{new Date(inv.created_at).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-800 mt-1">{inv.notes}</p>
                                        <p className="text-xs text-gray-400 mt-1">By: {inv.focal_person?.name}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 italic">No investigation logs yet.</p>
                            )}
                        </div>

                        {/* Add Progress Note */}
                        <form onSubmit={submitProgressNote} className="bg-gray-50 p-4 rounded border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Add Progress Note</h4>
                            <textarea
                                value={progressForm.data.notes}
                                onChange={e => progressForm.setData('notes', e.target.value)}
                                className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                rows="3"
                                placeholder="Call logs, meeting notes, or field visit outcomes..."
                            ></textarea>
                            {progressForm.errors.notes && <p className="text-sm text-red-600 mt-1">{progressForm.errors.notes}</p>}
                            <div className="mt-3 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={progressForm.processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50 transition"
                                >
                                    Add Note
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Resolution Action Section */}
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Resolution Action</h3>
                        
                        <form onSubmit={attemptResolveSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Outcome</label>
                                <select
                                    value={resolveForm.data.resolution_status}
                                    onChange={e => resolveForm.setData('resolution_status', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm sm:text-sm"
                                >
                                    <option value="resolved">Resolved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="escalated">Escalate to Admin</option>
                                </select>
                                {resolveForm.errors.resolution_status && <p className="text-sm text-red-600 mt-1">{resolveForm.errors.resolution_status}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Resolution Summary</label>
                                <p className="text-xs text-gray-500 mb-2">This will be visible to the citizen on their public tracker. Minimum 100 characters.</p>
                                <textarea
                                    value={resolveForm.data.action_summary}
                                    onChange={e => resolveForm.setData('action_summary', e.target.value)}
                                    className="block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm sm:text-sm"
                                    rows="5"
                                    required
                                ></textarea>
                                {resolveForm.errors.action_summary && <p className="text-sm text-red-600 mt-1">{resolveForm.errors.action_summary}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Evidence / Attachment (Required)</label>
                                <input
                                    type="file"
                                    onChange={e => resolveForm.setData('attachment', e.target.files[0])}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    required
                                />
                                {resolveForm.errors.attachment && <p className="text-sm text-red-600 mt-1">{resolveForm.errors.attachment}</p>}
                            </div>

                            <div className="flex justify-end gap-3">
                                <Link
                                    href={route('fp.dashboard')}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={resolveForm.processing}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 transition"
                                >
                                    Submit Resolution
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>

            {/* Cascade Confirmation Modal */}
            {showCascadeConfirm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Cascade Resolution</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            This will also apply the "{resolveForm.data.resolution_status}" status to {complaint.clubbed_children.length} clubbed complaint(s). Are you sure you want to proceed?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowCascadeConfirm(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitResolve}
                                disabled={resolveForm.processing}
                                className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium disabled:opacity-50"
                            >
                                Confirm & Resolve All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reassignment Modal */}
            {showReassignModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Request Reassignment</h3>
                        <form onSubmit={submitReassign}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Destination Department</label>
                                <select
                                    value={reassignForm.data.to_department_id}
                                    onChange={e => reassignForm.setData('to_department_id', e.target.value)}
                                    className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md sm:text-sm"
                                    required
                                >
                                    <option value="">Select a department...</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                                {reassignForm.errors.to_department_id && <p className="text-sm text-red-600 mt-1">{reassignForm.errors.to_department_id}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                <textarea
                                    value={reassignForm.data.reason}
                                    onChange={e => reassignForm.setData('reason', e.target.value)}
                                    className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md sm:text-sm"
                                    rows="3"
                                    required
                                ></textarea>
                                {reassignForm.errors.reason && <p className="text-sm text-red-600 mt-1">{reassignForm.errors.reason}</p>}
                            </div>
                            <div className="flex justify-end gap-3">
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
                                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium disabled:opacity-50"
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
