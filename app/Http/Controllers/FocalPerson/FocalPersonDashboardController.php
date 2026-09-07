<?php

namespace App\Http\Controllers\FocalPerson;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Complaint;
use App\Models\ComplaintReassignmentRequest;
use App\Models\District;
use App\Models\Tehsil;
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

        // 1. Department Scoped Metrics Query (Strictly department isolated)
        $scopedComplaints = Complaint::accessibleBy($user);

        $now = now();
        $metrics = [
            'new_unassigned' => (clone $scopedComplaints)->where('stage', 'application_submission')->count(),
            'under_investigation' => (clone $scopedComplaints)->where('stage', 'investigation_by_department')->where('status', 'under_investigation')->count(),
            'awaiting_confirmation' => (clone $scopedComplaints)->where('stage', 'investigation_by_department')->whereIn('status', ['pending_field_visit', 'forwarded_external'])->count(),
            'resolved_this_month' => (clone $scopedComplaints)->where('status', 'resolved')
                ->whereMonth('updated_at', $now->month)
                ->whereYear('updated_at', $now->year)
                ->count(),
            'total_complaints' => (clone $scopedComplaints)->count(),
        ];

        // 2. Query with eager-loaded relations
        $query = (clone $scopedComplaints)
            ->with([
                'citizen',
                'district',
                'tehsil',
                'category',
                'assignedFp',
                'similarityMatches' => fn ($sm) => $sm->where('status', 'pending'),
                'reassignmentRequests' => fn ($rr) => $rr->where('status', 'pending'),
            ]);

        // Search: complaint number, subject, citizen name, citizen CNIC
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('complaint_number', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('cnic', 'like', "%{$search}%")
                    ->orWhereHas('citizen', function ($cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%")
                            ->orWhere('cnic', 'like', "%{$search}%")
                            ->orWhere('mobile_number', 'like', "%{$search}%");
                    });
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Category filter
        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // District filter
        if ($districtId = $request->input('district_id')) {
            $query->where('district_id', $districtId);
        }

        // Tehsil filter
        if ($tehsilId = $request->input('tehsil_id')) {
            $query->where('tehsil_id', $tehsilId);
        }

        // Date range filter
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        // "Has duplicate suggestion" toggle (unconfirmed pending match)
        if ($request->boolean('has_duplicate')) {
            $query->whereHas('similarityMatches', function ($sm) {
                $sm->where('status', 'pending');
            });
        }

        // 3. Transform complaints with computed attributes (Days Open, SLA overdue, indicators)
        $departmentComplaints = $query
            ->latest()
            ->take(50)
            ->get()
            ->map(function ($c) use ($now) {
                $submittedDate = $c->submitted_at ?? $c->created_at;
                $daysOpen = $submittedDate ? (int) $submittedDate->diffInDays($now) : 0;

                return [
                    'id' => $c->id,
                    'complaint_number' => $c->complaint_number,
                    'subject' => $c->subject,
                    'status' => $c->status,
                    'stage' => $c->stage,
                    'department_id' => $c->department_id,
                    'created_at' => $c->created_at->toISOString(),
                    'submitted_at' => $submittedDate ? $submittedDate->toISOString() : null,
                    'submitted_date_formatted' => $submittedDate ? $submittedDate->format('M d, Y') : 'N/A',
                    'days_open' => $daysOpen,
                    'is_overdue' => $daysOpen > 15,
                    'has_pending_duplicate' => $c->similarityMatches->isNotEmpty(),
                    'has_pending_reassignment' => $c->reassignmentRequests->isNotEmpty(),
                    'citizen' => $c->citizen ? [
                        'id' => $c->citizen->id,
                        'name' => $c->citizen->name,
                        'cnic' => $c->citizen->cnic,
                        'mobile_number' => $c->citizen->mobile_number,
                    ] : null,
                    'category' => $c->category ? [
                        'id' => $c->category->id,
                        'name' => $c->category->name,
                    ] : null,
                    'district' => $c->district ? [
                        'id' => $c->district->id,
                        'name' => $c->district->name,
                    ] : null,
                    'tehsil' => $c->tehsil ? [
                        'id' => $c->tehsil->id,
                        'name' => $c->tehsil->name,
                    ] : null,
                ];
            });

        // 4. Department Field Officers Query
        $fieldOfficers = User::accessibleBy($user)
            ->where('role', 'field_officer')
            ->where('is_active', true)
            ->select(['id', 'name', 'email', 'department_id'])
            ->get();

        // 5. Department Reassignment Requests Query
        $reassignmentRequests = ComplaintReassignmentRequest::accessibleBy($user)
            ->with(['complaint', 'fromDepartment', 'toDepartment', 'requester'])
            ->latest()
            ->take(5)
            ->get();

        // 6. Reference Data for Filter Bar
        $categories = Category::where('is_active', true)
            ->when($user->department_id, fn ($q) => $q->where('department_id', $user->department_id))
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $districts = District::select(['id', 'name'])->orderBy('name')->get();
        $tehsils = Tehsil::select(['id', 'district_id', 'name'])->orderBy('name')->get();

        return Inertia::render('FocalPerson/Dashboard', [
            'department' => $user->department,
            'metrics' => $metrics,
            'complaints' => $departmentComplaints,
            'fieldOfficers' => $fieldOfficers,
            'reassignmentRequests' => $reassignmentRequests,
            'categories' => $categories,
            'districts' => $districts,
            'tehsils' => $tehsils,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', ''),
                'category_id' => $request->input('category_id', ''),
                'district_id' => $request->input('district_id', ''),
                'tehsil_id' => $request->input('tehsil_id', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to' => $request->input('date_to', ''),
                'has_duplicate' => $request->boolean('has_duplicate'),
            ],
        ]);
    }
}
