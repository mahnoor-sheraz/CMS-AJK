<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Channel;
use App\Models\Citizen;
use App\Models\Complaint;
use App\Models\ComplaintInvestigation;
use App\Models\ComplaintSimilarityMatch;
use App\Models\Department;
use App\Models\District;
use App\Models\ForwardDestination;
use App\Models\Tehsil;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FocalPersonInvestigationTest extends TestCase
{
    use RefreshDatabase;

    protected Department $deptHealth;
    protected Department $deptEducation;
    protected District $district;
    protected Tehsil $tehsil;
    protected Channel $channel;
    protected Category $category;
    protected ForwardDestination $destination;
    protected Citizen $citizen;
    protected User $healthFp;
    protected User $supervisedFieldOfficer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $this->deptHealth = Department::firstOrCreate(
            ['code' => 'HLT'],
            ['name' => 'Health Department', 'display_order' => 1, 'is_active' => true]
        );

        $this->deptEducation = Department::firstOrCreate(
            ['code' => 'EDU'],
            ['name' => 'Education Department', 'display_order' => 2, 'is_active' => true]
        );

        $this->district = District::first();
        $this->tehsil = Tehsil::first();
        $this->channel = Channel::first();
        $this->category = Category::first();
        $this->destination = ForwardDestination::firstOrCreate(['name' => 'Federal Tribunal', 'is_active' => true]);

        $this->citizen = Citizen::create([
            'cnic' => '8110188887777',
            'name' => 'Citizen Patient',
            'mobile_number' => '03008887777',
            'district_id' => $this->district->id,
            'tehsil_id' => $this->tehsil->id,
        ]);

        $this->healthFp = User::factory()->create([
            'name' => 'Dr. Health FP',
            'email' => 'fp.health@ajk.gov.pk',
            'role' => 'focal_person',
            'department_id' => $this->deptHealth->id,
            'is_active' => true,
        ]);

        $this->supervisedFieldOfficer = User::factory()->create([
            'name' => 'Inspector Ali FO',
            'email' => 'inspector.ali@ajk.gov.pk',
            'role' => 'field_officer',
            'department_id' => $this->deptHealth->id,
            'supervisor_id' => $this->healthFp->id,
            'is_active' => true,
        ]);
    }

    protected function createComplaint(Department $dept, string $subject = 'Hospital Grievance', int $daysOld = 0): Complaint
    {
        $submittedAt = now()->subDays($daysOld);

        return Complaint::create([
            'citizen_id' => $this->citizen->id,
            'channel_id' => $this->channel->id,
            'district_id' => $this->district->id,
            'tehsil_id' => $this->tehsil->id,
            'department_id' => $dept->id,
            'category_id' => $this->category->id,
            'subject' => $subject,
            'details' => 'Detailed grievance regarding hospital medicine stock shortage and doctor schedule.',
            'status' => 'submitted',
            'stage' => 'application_submission',
            'submitted_at' => $submittedAt,
            'created_at' => $submittedAt,
        ]);
    }

    // ==========================================
    // 1. Authorization & Department Scoping
    // ==========================================

    public function test_focal_person_can_view_first_investigation_screen_for_own_department(): void
    {
        $complaint = $this->createComplaint($this->deptHealth, 'Medicine Shortage');

        $response = $this->actingAs($this->healthFp)->get("/fp/complaints/{$complaint->id}/investigate");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('FocalPerson/Investigate')
            ->where('complaint.id', $complaint->id)
            ->where('complaint.citizen.name', $this->citizen->name)
            ->where('complaint.citizen.cnic', $this->citizen->cnic)
            ->has('similarityMatches')
            ->has('fieldOfficers')
            ->has('forwardDestinations')
        );
    }

    public function test_focal_person_cannot_view_investigation_for_other_department(): void
    {
        $eduComplaint = $this->createComplaint($this->deptEducation, 'School Teacher Issue');

        $response = $this->actingAs($this->healthFp)->get("/fp/complaints/{$eduComplaint->id}/investigate");

        $response->assertStatus(403);
    }

    // ==========================================
    // 2. AI Duplicate Suggestion Review
    // ==========================================

    public function test_focal_person_can_confirm_duplicate_match(): void
    {
        $primary = $this->createComplaint($this->deptHealth, 'Primary Grievance');
        $duplicate = $this->createComplaint($this->deptHealth, 'Duplicate Grievance');

        $match = ComplaintSimilarityMatch::create([
            'complaint_id' => $duplicate->id,
            'matched_complaint_id' => $primary->id,
            'similarity_score' => 0.8950,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->healthFp)
            ->post("/fp/complaints/{$duplicate->id}/duplicates/{$match->id}/confirm");

        $response->assertRedirect();
        $this->assertEquals('confirmed', $match->fresh()->status);
        $this->assertEquals($this->healthFp->id, $match->fresh()->reviewed_by);

        // Assert complaint_clubs row was created
        $this->assertDatabaseHas('complaint_clubs', [
            'primary_complaint_id' => $primary->id,
            'clubbed_complaint_id' => $duplicate->id,
            'clubbed_by' => $this->healthFp->id,
        ]);
    }

    public function test_focal_person_can_dismiss_duplicate_match(): void
    {
        $primary = $this->createComplaint($this->deptHealth, 'Primary Grievance 2');
        $candidate = $this->createComplaint($this->deptHealth, 'Candidate Grievance 2');

        $match = ComplaintSimilarityMatch::create([
            'complaint_id' => $candidate->id,
            'matched_complaint_id' => $primary->id,
            'similarity_score' => 0.7200,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->healthFp)
            ->post("/fp/complaints/{$candidate->id}/duplicates/{$match->id}/dismiss");

        $response->assertRedirect();
        $this->assertEquals('dismissed', $match->fresh()->status);
        $this->assertEquals($this->healthFp->id, $match->fresh()->reviewed_by);
    }

    // ==========================================
    // 3. Four-Path Classification Decisions
    // ==========================================

    public function test_classification_path_1_handle_directly(): void
    {
        $complaint = $this->createComplaint($this->deptHealth, 'Handle Directly Case');

        $response = $this->actingAs($this->healthFp)->post("/fp/complaints/{$complaint->id}/classify", [
            'path' => 'handle_directly',
            'notes' => 'Allocating to hospital superintendent for immediate remedy.',
        ]);

        $response->assertRedirect(route('fp.dashboard'));
        $fresh = $complaint->fresh();

        $this->assertEquals('investigation_by_department', $fresh->stage);
        $this->assertEquals('under_investigation', $fresh->status);

        $this->assertDatabaseHas('complaint_investigations', [
            'complaint_id' => $complaint->id,
            'fp_id' => $this->healthFp->id,
            'investigation_type' => 'handle_directly',
            'notes' => 'Allocating to hospital superintendent for immediate remedy.',
        ]);

        $this->assertDatabaseHas('complaint_status_history', [
            'complaint_id' => $complaint->id,
            'stage' => 'investigation_by_department',
            'changed_by' => $this->healthFp->id,
        ]);
    }

    public function test_classification_path_2_club_with_existing(): void
    {
        $primary = $this->createComplaint($this->deptHealth, 'Master Complaint');
        $duplicate = $this->createComplaint($this->deptHealth, 'Duplicate to Club');

        // Confirm duplicate first
        $match = ComplaintSimilarityMatch::create([
            'complaint_id' => $duplicate->id,
            'matched_complaint_id' => $primary->id,
            'similarity_score' => 0.9200,
            'status' => 'confirmed',
            'reviewed_by' => $this->healthFp->id,
        ]);

        \App\Models\ComplaintClub::create([
            'primary_complaint_id' => $primary->id,
            'clubbed_complaint_id' => $duplicate->id,
            'clubbed_by' => $this->healthFp->id,
            'notes' => 'Pre-confirmed duplicate',
        ]);

        $response = $this->actingAs($this->healthFp)->post("/fp/complaints/{$duplicate->id}/classify", [
            'path' => 'club_with_existing',
            'notes' => 'Subsuming under master case PMCC.',
        ]);

        $response->assertRedirect(route('fp.dashboard'));
        $fresh = $duplicate->fresh();

        $this->assertEquals('investigation_by_department', $fresh->stage);
        $this->assertEquals('clubbed', $fresh->status);

        $this->assertDatabaseHas('complaint_investigations', [
            'complaint_id' => $duplicate->id,
            'fp_id' => $this->healthFp->id,
            'investigation_type' => 'club_with_existing',
        ]);
    }

    public function test_classification_path_3_forward_externally(): void
    {
        $complaint = $this->createComplaint($this->deptHealth, 'Federal Jurisdiction Issue');

        $response = $this->actingAs($this->healthFp)->post("/fp/complaints/{$complaint->id}/classify", [
            'path' => 'forward_externally',
            'destination_id' => $this->destination->id,
            'remarks' => 'This facility is regulated under Federal regulatory commission.',
        ]);

        $response->assertRedirect(route('fp.dashboard'));
        $fresh = $complaint->fresh();

        $this->assertEquals('investigation_by_department', $fresh->stage);
        $this->assertEquals('forwarded_external', $fresh->status);

        $this->assertDatabaseHas('complaint_external_forwards', [
            'complaint_id' => $complaint->id,
            'destination_id' => $this->destination->id,
            'forwarded_by' => $this->healthFp->id,
            'remarks' => 'This facility is regulated under Federal regulatory commission.',
        ]);
    }

    public function test_classification_path_4_schedule_field_visit(): void
    {
        $complaint = $this->createComplaint($this->deptHealth, 'Field Verification Needed');

        $visitTime = now()->addDays(2)->format('Y-m-d H:i');

        $response = $this->actingAs($this->healthFp)->post("/fp/complaints/{$complaint->id}/classify", [
            'path' => 'schedule_field_visit',
            'visit_datetime' => $visitTime,
            'assigned_officer_id' => $this->supervisedFieldOfficer->id,
            'location' => 'DHQ Hospital Ward 3',
            'notes' => 'Inspect inventory registers on-site.',
        ]);

        $response->assertRedirect(route('fp.dashboard'));
        $fresh = $complaint->fresh();

        $this->assertEquals('investigation_by_department', $fresh->stage);
        $this->assertEquals('pending_field_visit', $fresh->status);

        $this->assertDatabaseHas('complaint_investigations', [
            'complaint_id' => $complaint->id,
            'fp_id' => $this->healthFp->id,
            'assigned_officer_id' => $this->supervisedFieldOfficer->id,
            'investigation_type' => 'schedule_field_visit',
            'location' => 'DHQ Hospital Ward 3',
        ]);
    }

    public function test_classification_path_4_rejects_unsupervised_field_officer(): void
    {
        $complaint = $this->createComplaint($this->deptHealth, 'Rogue Officer Test');

        $otherFp = User::factory()->create([
            'role' => 'focal_person',
            'department_id' => $this->deptHealth->id,
        ]);

        $unsupervisedFo = User::factory()->create([
            'role' => 'field_officer',
            'department_id' => $this->deptHealth->id,
            'supervisor_id' => $otherFp->id, // Supervised by someone else!
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->healthFp)->post("/fp/complaints/{$complaint->id}/classify", [
            'path' => 'schedule_field_visit',
            'visit_datetime' => now()->addDays(2)->format('Y-m-d H:i'),
            'assigned_officer_id' => $unsupervisedFo->id,
            'notes' => 'Should be rejected',
        ]);

        $response->assertSessionHasErrors(['assigned_officer_id']);
    }

    // ==========================================
    // 4. Dashboard Queue Enhancements & Days Open
    // ==========================================

    public function test_dashboard_computes_days_open_and_flags_sla_overdue(): void
    {
        // 1 normal complaint (2 days old)
        $normal = $this->createComplaint($this->deptHealth, 'Fresh Complaint', 2);

        // 1 overdue complaint (18 days old > 15 days)
        $overdue = $this->createComplaint($this->deptHealth, 'Stale Complaint', 18);

        $response = $this->actingAs($this->healthFp)->get('/fp/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('FocalPerson/Dashboard')
            ->where('complaints', function ($complaints) use ($normal, $overdue) {
                $normalRow = collect($complaints)->firstWhere('id', $normal->id);
                $overdueRow = collect($complaints)->firstWhere('id', $overdue->id);

                return $normalRow['days_open'] >= 2
                    && $normalRow['is_overdue'] === false
                    && $overdueRow['days_open'] >= 18
                    && $overdueRow['is_overdue'] === true;
            })
        );
    }
}
