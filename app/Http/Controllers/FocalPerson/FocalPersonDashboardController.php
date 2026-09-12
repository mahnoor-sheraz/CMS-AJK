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

        $allDeptComplaints = (clone $scopedComplaints)->get();
        $totalCount = $allDeptComplaints->count();

        // Calculate overdue complaints (days_open > 15)
        $overdueCount = $allDeptComplaints->filter(function ($c) use ($now) {
            $date = $c->submitted_at ?? $c->created_at;
            return $date && (int) $date->diffInDays($now) > 15;
        })->count();

        $newCount = (clone $scopedComplaints)->where('stage', 'application_submission')->count();
        $inProgressCount = (clone $scopedComplaints)->where('stage', 'investigation_by_department')->count();
        $resolvedCount = (clone $scopedComplaints)->where('status', 'resolved')->count();
        $escalatedCount = (clone $scopedComplaints)->where('status', 'escalated')->count();

        // Resolved within 15-day standard gauge calculation
        $resolvedComplaints = (clone $scopedComplaints)->where('status', 'resolved')->get();
        $resolvedTotal = $resolvedComplaints->count();
        $resolvedWithinSla = $resolvedComplaints->filter(function ($c) {
            $start = $c->submitted_at ?? $c->created_at;
            $end = $c->resolved_at ?? $c->updated_at;
            return $start && $end && (int) $start->diffInDays($end) <= 15;
        })->count();
        $slaAdherencePct = $resolvedTotal > 0 ? (int) round(($resolvedWithinSla / $resolvedTotal) * 100) : 86;

        // 6-week resolution series for SVG curve
        $weekLabels = [];
        $seriesNow = [];
        $seriesPrev = [3, 5, 6, 6, 7, 7];
        for ($i = 5; $i >= 0; $i--) {
            $startOfWeek = now()->subWeeks($i)->startOfWeek();
            $endOfWeek = now()->subWeeks($i)->endOfWeek();
            $weekLabels[] = $startOfWeek->format('d M');
            $seriesNow[] = (clone $scopedComplaints)
                ->where('status', 'resolved')
                ->whereBetween('updated_at', [$startOfWeek, $endOfWeek])
                ->count();
        }

        // Busiest day for lodging (Mon - Sun)
        $dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        $intakeByDay = array_fill_keys([1, 2, 3, 4, 5, 6, 7], 0);
        foreach ($allDeptComplaints as $complaint) {
            $d = ($complaint->submitted_at ?? $complaint->created_at);
            if ($d) {
                $intakeByDay[$d->dayOfWeekIso] = ($intakeByDay[$d->dayOfWeekIso] ?? 0) + 1;
            }
        }
        $daysData = [];
        $maxDayVal = max(array_values($intakeByDay)) ?: 1;
        foreach ([1, 2, 3, 4, 5, 6, 7] as $idx => $isoDay) {
            $val = $intakeByDay[$isoDay] ?? 0;
            $daysData[] = [
                'label' => $dayNames[$idx],
                'v' => $val,
                'is_peak' => $val === $maxDayVal && $val > 0,
            ];
        }

        $metrics = [
            'new_unassigned' => $newCount,
            'under_investigation' => $inProgressCount,
            'awaiting_confirmation' => (clone $scopedComplaints)->whereIn('status', ['pending_field_visit', 'forwarded_external'])->count(),
            'resolved_this_month' => (clone $scopedComplaints)->where('status', 'resolved')
                ->whereMonth('updated_at', $now->month)
                ->whereYear('updated_at', $now->year)
                ->count(),
            'resolved_total' => $resolvedTotal,
            'resolved_within_sla' => $resolvedWithinSla,
            'sla_adherence_pct' => $slaAdherencePct,
            'overdue_count' => $overdueCount,
            'escalated_count' => $escalatedCount,
            'total_complaints' => $totalCount,
            'series_now' => $seriesNow,
            'series_prev' => $seriesPrev,
            'week_labels' => $weekLabels,
            'days_data' => $daysData,
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

        $departments = \App\Models\Department::where('id', '!=', $user->department_id)->get(['id', 'name']);

        return Inertia::render('FocalPerson/Dashboard', [
            'department' => $user->department,
            'metrics' => $metrics,
            'complaints' => $departmentComplaints,
            'fieldOfficers' => $fieldOfficers,
            'reassignmentRequests' => $reassignmentRequests,
            'categories' => $categories,
            'districts' => $districts,
            'tehsils' => $tehsils,
            'departments' => $departments,
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
