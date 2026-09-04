<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class AdminDashboardController extends Controller
{
    /**
     * Display the System Administrator Dashboard.
     * Backing database queries strictly enforce the 'admin' role check.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        // Enforce role check before executing database queries
        if (! $user || ! $user->isAdmin()) {
            abort(403, 'Unauthorized access to System Administrator Dashboard. (ERR_FORBIDDEN_ROLE)');
        }

        // 1. Global Complaint Metrics Query (Admin is authorized for nationwide aggregation)
        $metrics = [
            'total_complaints' => Complaint::count(),
            'pending_complaints' => Complaint::whereIn('status', ['submitted', 'under_investigation'])->count(),
            'resolved_complaints' => Complaint::where('status', 'resolved')->count(),
            'total_departments' => Department::where('is_active', true)->count(),
            'total_users' => User::where('is_active', true)->count(),
        ];

        // 2. Department Breakdown Query
        $departmentBreakdown = Department::where('is_active', true)
            ->withCount([
                'complaints',
                'complaints as pending_count' => fn ($q) => $q->whereIn('status', ['submitted', 'under_investigation']),
                'complaints as resolved_count' => fn ($q) => $q->where('status', 'resolved'),
            ])
            ->orderBy('display_order')
            ->get();

        // 3. Recent Complaints Query
        $recentComplaints = Complaint::with(['department', 'district', 'citizen'])
            ->latest()
            ->take(8)
            ->get();

        // 4. System Audit Activity Log Query (Restricted to global admin)
        $recentActivities = Activity::with('causer')
            ->latest()
            ->take(8)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'metrics' => $metrics,
            'departmentBreakdown' => $departmentBreakdown,
            'recentComplaints' => $recentComplaints,
            'recentActivities' => $recentActivities,
        ]);
    }
}
