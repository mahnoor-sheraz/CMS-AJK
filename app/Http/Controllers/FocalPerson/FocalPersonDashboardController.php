<?php

namespace App\Http\Controllers\FocalPerson;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintReassignmentRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FocalPersonDashboardController extends Controller
{
    /**
     * Display the Departmental Focal Person Dashboard.
     * Backing database queries strictly enforce department scoping via Eloquent query scopes.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        // Enforce role check at controller entry point
        if (! $user || (! $user->isFocalPerson() && ! $user->isDirector())) {
            abort(403, 'Unauthorized access to Focal Person Dashboard. (ERR_FORBIDDEN_ROLE)');
        }

        // 1. Department Scoped Metrics Query (Guaranteed by scopeAccessibleBy)
        $scopedComplaints = Complaint::accessibleBy($user);

        $metrics = [
            'total_complaints' => (clone $scopedComplaints)->count(),
            'submitted' => (clone $scopedComplaints)->where('status', 'submitted')->count(),
            'under_investigation' => (clone $scopedComplaints)->where('status', 'under_investigation')->count(),
            'resolved' => (clone $scopedComplaints)->where('status', 'resolved')->count(),
        ];

        // 2. Department Complaints Queue Query (Strictly filtered by department_id)
        $departmentComplaints = (clone $scopedComplaints)
            ->with(['citizen', 'district', 'tehsil', 'assignedFp'])
            ->latest()
            ->take(15)
            ->get();

        // 3. Department Field Officers Query (Strictly filtered by user's department_id)
        $fieldOfficers = User::accessibleBy($user)
            ->where('role', 'field_officer')
            ->where('is_active', true)
            ->select(['id', 'name', 'email', 'department_id'])
            ->get();

        // 4. Department Reassignment Requests Query (Scoped to requests where department is source or destination)
        $reassignmentRequests = ComplaintReassignmentRequest::accessibleBy($user)
            ->with(['complaint', 'fromDepartment', 'toDepartment', 'requester'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('FocalPerson/Dashboard', [
            'department' => $user->department,
            'metrics' => $metrics,
            'complaints' => $departmentComplaints,
            'fieldOfficers' => $fieldOfficers,
            'reassignmentRequests' => $reassignmentRequests,
        ]);
    }
}
