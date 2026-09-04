<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InternalComplaintController extends Controller
{
    /**
     * Display the specified complaint for internal authorized personnel.
     * Enforces that the backing database query strictly adheres to the user's role and departmental scope.
     */
    public function show(Request $request, int $id): Response
    {
        $user = $request->user();

        // The backing database query applies scopeAccessibleBy, guaranteeing:
        // - Admin: can query any complaint
        // - Director & Focal Person: can only query complaints in their department
        // - Field Officer: can only query complaints assigned to them
        // If unauthorized, firstOrFail throws 404 (or we abort 403), preventing IDOR leakage.
        $complaint = Complaint::accessibleBy($user)
            ->with([
                'citizen',
                'district',
                'tehsil',
                'department',
                'subDepartment',
                'category',
                'assignedFp',
                'attachments',
                'investigations.assignedOfficer',
                'statusHistories.changedBy',
                'reassignmentRequests',
            ])
            ->where('id', $id)
            ->first();

        if (! $complaint) {
            // If the complaint exists globally but is outside this user's scope, abort with 403 Forbidden
            if (Complaint::where('id', $id)->exists()) {
                abort(403, 'You are not authorized to view complaints outside your departmental scope. (ERR_FORBIDDEN_ROLE)');
            }

            abort(404, 'Complaint not found.');
        }

        return Inertia::render('Complaints/Show', [
            'complaint' => $complaint,
        ]);
    }
}
