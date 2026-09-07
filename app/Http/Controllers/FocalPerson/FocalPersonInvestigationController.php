<?php

namespace App\Http\Controllers\FocalPerson;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClassifyComplaintRequest;
use App\Models\Complaint;
use App\Models\ComplaintClub;
use App\Models\ComplaintExternalForward;
use App\Models\ComplaintInvestigation;
use App\Models\ComplaintSimilarityMatch;
use App\Models\ComplaintStatusHistory;
use App\Models\ForwardDestination;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FocalPersonInvestigationController extends Controller
{
    /**
     * Display the First Investigation and Triage screen for a department complaint.
     */
    public function show(Request $request, int $id): Response
    {
        $user = $request->user();

        if (! $user || (! $user->isFocalPerson() && ! $user->isDirector())) {
            abort(403, 'Unauthorized access to Focal Person Investigation. (ERR_FORBIDDEN_ROLE)');
        }

        // 1. Departmental Scoped Access Check (Strict anti-IDOR check)
        $complaint = Complaint::accessibleBy($user)
            ->with([
                'citizen',
                'district',
                'tehsil',
                'department',
                'subDepartment',
                'category',
                'channel',
                'attachments',
                'assignedFp',
                'clubbedEntry.primaryComplaint',
            ])
            ->where('id', $id)
            ->first();

        if (! $complaint) {
            if (Complaint::where('id', $id)->exists()) {
                abort(403, 'You are not authorized to investigate complaints outside your departmental scope. (ERR_FORBIDDEN_ROLE)');
            }
            abort(404, 'Complaint not found.');
        }

        // 2. Query AI Similarity Matches for this complaint
        $similarityMatches = ComplaintSimilarityMatch::where('complaint_id', $complaint->id)
            ->with([
                'matchedComplaint.citizen:id,name,cnic,mobile_number',
                'matchedComplaint.district:id,name',
                'matchedComplaint.tehsil:id,name',
                'matchedComplaint.category:id,name',
                'reviewedBy:id,name',
            ])
            ->orderByDesc('similarity_score')
            ->take(5)
            ->get();

        // 3. Subordinate Field Officers (supervised by this user)
        $fieldOfficers = User::where('supervisor_id', $user->id)
            ->where('role', 'field_officer')
            ->where('is_active', true)
            ->select(['id', 'name', 'email'])
            ->get();

        // 4. Forward Destinations
        $forwardDestinations = ForwardDestination::where('is_active', true)
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        // Check if there is an already confirmed duplicate
        $hasConfirmedDuplicate = $complaint->clubbedEntry()->exists()
            || $similarityMatches->where('status', 'confirmed')->isNotEmpty();

        return Inertia::render('FocalPerson/Investigate', [
            'complaint' => $complaint,
            'similarityMatches' => $similarityMatches,
            'fieldOfficers' => $fieldOfficers,
            'forwardDestinations' => $forwardDestinations,
            'hasConfirmedDuplicate' => $hasConfirmedDuplicate,
            'currentFp' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Explicitly confirm an AI similarity candidate as a duplicate grievance.
     * Human-in-the-loop: Creates an auditable record in complaint_clubs.
     */
    public function confirmDuplicate(Request $request, int $id, int $matchId): RedirectResponse
    {
        $user = $request->user();

        $complaint = Complaint::accessibleBy($user)->where('id', $id)->firstOrFail();

        $match = ComplaintSimilarityMatch::where('id', $matchId)
            ->where('complaint_id', $complaint->id)
            ->firstOrFail();

        DB::transaction(function () use ($complaint, $match, $user) {
            // Create club relationship: current complaint clubbed under matched primary complaint
            ComplaintClub::firstOrCreate(
                [
                    'primary_complaint_id' => $match->matched_complaint_id,
                    'clubbed_complaint_id' => $complaint->id,
                ],
                [
                    'clubbed_by' => $user->id,
                    'notes' => "Confirmed as duplicate via AI similarity match #{$match->id} (Score: {$match->similarity_score})",
                ]
            );

            $match->update([
                'status' => 'confirmed',
                'reviewed_by' => $user->id,
                'reviewed_at' => now(),
            ]);
        });

        return back()->with('success', 'Duplicate confirmed successfully. You may now classify this grievance under "Club with Existing".');
    }

    /**
     * Dismiss an AI similarity candidate as not a duplicate.
     */
    public function dismissDuplicate(Request $request, int $id, int $matchId): RedirectResponse
    {
        $user = $request->user();

        $complaint = Complaint::accessibleBy($user)->where('id', $id)->firstOrFail();

        $match = ComplaintSimilarityMatch::where('id', $matchId)
            ->where('complaint_id', $complaint->id)
            ->firstOrFail();

        $match->update([
            'status' => 'dismissed',
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);

        return back()->with('info', 'AI duplicate suggestion dismissed.');
    }

    /**
     * Submit the 4-path classification decision for the complaint.
     */
    public function classify(ClassifyComplaintRequest $request, int $id): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $complaint = Complaint::accessibleBy($user)->where('id', $id)->firstOrFail();

        DB::transaction(function () use ($complaint, $validated, $user) {
            $path = $validated['path'];

            switch ($path) {
                case 'handle_directly':
                    ComplaintInvestigation::create([
                        'complaint_id' => $complaint->id,
                        'fp_id' => $user->id,
                        'investigation_type' => 'handle_directly',
                        'notes' => $validated['notes'] ?? 'Assigned for direct departmental investigation and resolution.',
                    ]);

                    $complaint->stage = 'investigation_by_department';
                    $complaint->status = 'under_investigation';
                    break;

                case 'club_with_existing':
                    // Verify that a confirmed duplicate exists
                    $hasConfirmedClub = $complaint->clubbedEntry()->exists()
                        || ComplaintSimilarityMatch::where('complaint_id', $complaint->id)->where('status', 'confirmed')->exists();

                    if (! $hasConfirmedClub) {
                        abort(422, 'Cannot club complaint without first confirming a duplicate match.');
                    }

                    ComplaintInvestigation::create([
                        'complaint_id' => $complaint->id,
                        'fp_id' => $user->id,
                        'investigation_type' => 'club_with_existing',
                        'notes' => $validated['notes'] ?? 'Classified as duplicate and clubbed with master grievance.',
                    ]);

                    $complaint->stage = 'investigation_by_department';
                    $complaint->status = 'clubbed';
                    break;

                case 'forward_externally':
                    ComplaintExternalForward::create([
                        'complaint_id' => $complaint->id,
                        'destination_id' => $validated['destination_id'],
                        'forwarded_by' => $user->id,
                        'remarks' => $validated['remarks'],
                        'forwarded_at' => now(),
                    ]);

                    ComplaintInvestigation::create([
                        'complaint_id' => $complaint->id,
                        'fp_id' => $user->id,
                        'investigation_type' => 'forward_externally',
                        'notes' => $validated['remarks'],
                    ]);

                    $complaint->stage = 'investigation_by_department';
                    $complaint->status = 'forwarded_external';
                    break;

                case 'schedule_field_visit':
                    ComplaintInvestigation::create([
                        'complaint_id' => $complaint->id,
                        'fp_id' => $user->id,
                        'assigned_officer_id' => $validated['assigned_officer_id'],
                        'investigation_type' => 'schedule_field_visit',
                        'visit_datetime' => $validated['visit_datetime'],
                        'location' => $validated['location'] ?? "{$complaint->district?->name} - {$complaint->tehsil?->name}",
                        'notes' => $validated['notes'] ?? 'Field inspection scheduled.',
                    ]);

                    $complaint->stage = 'investigation_by_department';
                    $complaint->status = 'pending_field_visit';
                    break;
            }

            $complaint->save();

            ComplaintStatusHistory::create([
                'complaint_id' => $complaint->id,
                'stage' => $complaint->stage,
                'status_detail' => "Status: {$complaint->status}. Classification decision: {$path}",
                'changed_by' => $user->id,
                'changed_at' => now(),
            ]);
        });

        return redirect()->route('fp.dashboard')->with('success', "Complaint {$complaint->complaint_number} classified successfully.");
    }
}
