<?php

namespace Tests\Feature;

use App\Models\Channel;
use App\Models\Citizen;
use App\Models\Complaint;
use App\Models\ComplaintInvestigation;
use App\Models\ComplaintReassignmentRequest;
use App\Models\Department;
use App\Models\District;
use App\Models\Tehsil;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleRestrictedQueryEnforcementTest extends TestCase
{
    use RefreshDatabase;

    protected Department $deptHealth;
    protected Department $deptEducation;
    protected District $district;
    protected Tehsil $tehsil;
    protected Channel $channel;
    protected Citizen $citizen;

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

        $this->citizen = Citizen::create([
            'cnic' => '8110199998888',
            'name' => 'Test Citizen',
            'mobile_number' => '03001239888',
            'district_id' => $this->district->id,
            'tehsil_id' => $this->tehsil->id,
        ]);
    }

    protected function createComplaint(Department $dept, string $subject = 'Sample Grievance'): Complaint
    {
        return Complaint::create([
            'citizen_id' => $this->citizen->id,
            'channel_id' => $this->channel->id,
            'district_id' => $this->district->id,
            'tehsil_id' => $this->tehsil->id,
            'department_id' => $dept->id,
            'subject' => $subject,
            'details' => 'Detailed grievance narrative with more than fifty characters for testing purposes.',
            'status' => 'submitted',
            'stage' => 'application_submission',
        ]);
    }

    // ==========================================
    // 1. Admin Dashboard UI & Query Enforcement
    // ==========================================

    public function test_admin_dashboard_query_returns_global_system_metrics(): void
    {
        $admin = User::where('role', 'admin')->first();

        // Create complaints across both departments
        $this->createComplaint($this->deptHealth, 'Health grievance 1');
        $this->createComplaint($this->deptEducation, 'Education grievance 1');

        $response = $this->actingAs($admin)->get('/admin/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->has('metrics')
            ->has('departmentBreakdown')
            ->has('recentComplaints')
            ->has('recentActivities')
        );
    }

    public function test_non_admin_roles_are_blocked_from_admin_dashboard_query(): void
    {
        $fp = User::factory()->create([
            'role' => 'focal_person',
            'department_id' => $this->deptHealth->id,
            'is_active' => true,
        ]);

        $fo = User::factory()->create([
            'role' => 'field_officer',
            'department_id' => $this->deptHealth->id,
            'is_active' => true,
        ]);

        $this->actingAs($fp)->get('/admin/dashboard')->assertStatus(403);
        $this->actingAs($fo)->get('/admin/dashboard')->assertStatus(403);
    }

    // ==========================================
    // 2. Focal Person Dashboard Departmental Query Enforcements
    // ==========================================

    public function test_focal_person_dashboard_query_strictly_isolates_department_complaints(): void
    {
        $healthFp = User::factory()->create([
            'name' => 'Dr. Akram FP',
            'role' => 'focal_person',
            'department_id' => $this->deptHealth->id,
            'is_active' => true,
        ]);

        // Create 2 Health complaints and 1 Education complaint
        $healthComplaint1 = $this->createComplaint($this->deptHealth, 'Hospital Medical Equipment Failure');
        $healthComplaint2 = $this->createComplaint($this->deptHealth, 'Doctor Absenteeism at DHQ');
        $eduComplaint = $this->createComplaint($this->deptEducation, 'School Teacher Absence');

        $response = $this->actingAs($healthFp)->get('/fp/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('FocalPerson/Dashboard')
            ->where('department.id', $this->deptHealth->id)
            ->where('metrics.total_complaints', 2)
            // Assert Health complaints are present
            ->where('complaints.0.department_id', $this->deptHealth->id)
            // Assert Education complaint is completely absent from the query result
            ->where('complaints', fn ($complaints) =>
                collect($complaints)->every(fn ($c) => $c['department_id'] === $this->deptHealth->id)
                && collect($complaints)->pluck('id')->doesntContain($eduComplaint->id)
            )
        );
    }

    public function test_education_focal_person_query_cannot_see_health_complaints(): void
    {
        $eduFp = User::factory()->create([
            'name' => 'Prof. Tariq FP',
            'role' => 'focal_person',
            'department_id' => $this->deptEducation->id,
            'is_active' => true,
        ]);

        $healthComplaint = $this->createComplaint($this->deptHealth, 'Health Secret Grievance');
        $eduComplaint = $this->createComplaint($this->deptEducation, 'College Library Books');

        $response = $this->actingAs($eduFp)->get('/fp/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('FocalPerson/Dashboard')
            ->where('department.id', $this->deptEducation->id)
            ->where('metrics.total_complaints', 1)
            ->where('complaints', fn ($complaints) =>
                collect($complaints)->pluck('id')->contains($eduComplaint->id)
                && collect($complaints)->pluck('id')->doesntContain($healthComplaint->id)
            )
        );
    }

    // ==========================================
    // 3. Eloquent Model Query Scoping (Complaint::accessibleBy)
    // ==========================================

    public function test_complaint_query_scope_for_admin_returns_all_departments(): void
    {
        $admin = User::where('role', 'admin')->first();
        $this->createComplaint($this->deptHealth, 'H1');
        $this->createComplaint($this->deptEducation, 'E1');

        $accessible = Complaint::accessibleBy($admin)->get();
        $this->assertGreaterThanOrEqual(2, $accessible->count());
    }

    public function test_complaint_query_scope_for_director_and_focal_person_enforces_department(): void
    {
        $director = User::factory()->create([
            'role' => 'director',
            'department_id' => $this->deptHealth->id,
            'is_active' => true,
        ]);

        $h1 = $this->createComplaint($this->deptHealth, 'Health Only');
        $e1 = $this->createComplaint($this->deptEducation, 'Edu Only');

        $results = Complaint::accessibleBy($director)->get();
        $this->assertTrue($results->contains('id', $h1->id));
        $this->assertFalse($results->contains('id', $e1->id));
    }

    public function test_complaint_query_scope_for_field_officer_enforces_direct_assignment(): void
    {
        $foA = User::factory()->create([
            'role' => 'field_officer',
            'department_id' => $this->deptHealth->id,
            'is_active' => true,
        ]);

        $foB = User::factory()->create([
            'role' => 'field_officer',
            'department_id' => $this->deptHealth->id,
            'is_active' => true,
        ]);

        // Complaint assigned to FO A
        $assignedToA = $this->createComplaint($this->deptHealth, 'Assigned to FO A');
        $assignedToA->update(['assigned_fp_id' => $foA->id]);

        // Complaint with investigation assigned to FO A
        $fp = User::factory()->create(['role' => 'focal_person', 'department_id' => $this->deptHealth->id]);
        $investigationComplaint = $this->createComplaint($this->deptHealth, 'Investigation for FO A');
        ComplaintInvestigation::create([
            'complaint_id' => $investigationComplaint->id,
            'fp_id' => $fp->id,
            'assigned_officer_id' => $foA->id,
            'investigation_type' => 'field_visit',
            'notes' => 'Assigned to FO A',
        ]);

        // Unassigned complaint in same health department
        $unassigned = $this->createComplaint($this->deptHealth, 'Unassigned Health');

        // Complaint assigned to FO B
        $assignedToB = $this->createComplaint($this->deptHealth, 'Assigned to FO B');
        $assignedToB->update(['assigned_fp_id' => $foB->id]);

        // Query execution for FO A
        $foAResults = Complaint::accessibleBy($foA)->get();

        $this->assertTrue($foAResults->contains('id', $assignedToA->id));
        $this->assertTrue($foAResults->contains('id', $investigationComplaint->id));
        $this->assertFalse($foAResults->contains('id', $unassigned->id), 'Unassigned complaint must be excluded at DB query level');
        $this->assertFalse($foAResults->contains('id', $assignedToB->id), 'Complaint assigned to FO B must be excluded at DB query level');
    }

    public function test_deactivated_user_query_scope_returns_zero_records(): void
    {
        $deactivatedFp = User::factory()->create([
            'role' => 'focal_person',
            'department_id' => $this->deptHealth->id,
            'is_active' => false, // Deactivated
        ]);

        $this->createComplaint($this->deptHealth, 'Health grievance');

        $results = Complaint::accessibleBy($deactivatedFp)->get();
        $this->assertCount(0, $results);
    }

    // ==========================================
    // 4. Single-Record IDOR Protection & Query Check (/fp/complaints/{id})
    // ==========================================

    public function test_focal_person_can_inspect_complaint_within_their_department(): void
    {
        $healthFp = User::factory()->create([
            'role' => 'focal_person',
            'department_id' => $this->deptHealth->id,
            'is_active' => true,
        ]);

        $healthComplaint = $this->createComplaint($this->deptHealth, 'Hospital Oxygen Plants');

        $response = $this->actingAs($healthFp)->get("/fp/complaints/{$healthComplaint->id}");
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Complaints/Show')
            ->where('complaint.id', $healthComplaint->id)
        );
    }

    public function test_focal_person_query_for_cross_department_complaint_aborts_403(): void
    {
        $healthFp = User::factory()->create([
            'role' => 'focal_person',
            'department_id' => $this->deptHealth->id,
            'is_active' => true,
        ]);

        // Complaint belongs to Education Department
        $eduComplaint = $this->createComplaint($this->deptEducation, 'School Roof Leakage');

        $response = $this->actingAs($healthFp)->get("/fp/complaints/{$eduComplaint->id}");
        $response->assertStatus(403);
    }

    // ==========================================
    // 5. Reassignment Requests Query Scope (ComplaintReassignmentRequest::accessibleBy)
    // ==========================================

    public function test_reassignment_request_query_scope_enforces_department_boundaries(): void
    {
        $deptPolice = Department::create(['name' => 'Police Department', 'code' => 'POL', 'is_active' => true]);

        $healthFp = User::factory()->create(['role' => 'focal_person', 'department_id' => $this->deptHealth->id]);

        $c1 = $this->createComplaint($this->deptHealth, 'Misrouted from Health to Education');
        $c2 = $this->createComplaint($this->deptEducation, 'Misrouted from Education to Health');
        $c3 = $this->createComplaint($this->deptEducation, 'Misrouted from Education to Police');

        // Request 1: Health -> Education (Health is source)
        $req1 = ComplaintReassignmentRequest::create([
            'complaint_id' => $c1->id,
            'requested_by' => $healthFp->id,
            'from_department_id' => $this->deptHealth->id,
            'to_department_id' => $this->deptEducation->id,
            'reason' => 'Belongs to Education',
        ]);

        // Request 2: Education -> Health (Health is destination)
        $eduFp = User::factory()->create(['role' => 'focal_person', 'department_id' => $this->deptEducation->id]);
        $req2 = ComplaintReassignmentRequest::create([
            'complaint_id' => $c2->id,
            'requested_by' => $eduFp->id,
            'from_department_id' => $this->deptEducation->id,
            'to_department_id' => $this->deptHealth->id,
            'reason' => 'Belongs to Health clinic',
        ]);

        // Request 3: Education -> Police (Neither source nor destination is Health)
        $req3 = ComplaintReassignmentRequest::create([
            'complaint_id' => $c3->id,
            'requested_by' => $eduFp->id,
            'from_department_id' => $this->deptEducation->id,
            'to_department_id' => $deptPolice->id,
            'reason' => 'Police matter',
        ]);

        $scopedRequests = ComplaintReassignmentRequest::accessibleBy($healthFp)->get();

        $this->assertTrue($scopedRequests->contains('id', $req1->id));
        $this->assertTrue($scopedRequests->contains('id', $req2->id));
        $this->assertFalse($scopedRequests->contains('id', $req3->id), 'Cross-department request must be excluded by DB query scope');
    }

    // ==========================================
    // 6. User Management Query Scope (User::accessibleBy)
    // ==========================================

    public function test_user_query_scope_enforces_department_and_role_boundaries(): void
    {
        $admin = User::where('role', 'admin')->first();

        $healthFp = User::factory()->create([
            'role' => 'focal_person',
            'department_id' => $this->deptHealth->id,
        ]);

        $healthFo = User::factory()->create([
            'role' => 'field_officer',
            'department_id' => $this->deptHealth->id,
        ]);

        $eduFo = User::factory()->create([
            'role' => 'field_officer',
            'department_id' => $this->deptEducation->id,
        ]);

        // 1. Admin can query all users
        $adminUsers = User::accessibleBy($admin)->get();
        $this->assertTrue($adminUsers->contains('id', $healthFo->id));
        $this->assertTrue($adminUsers->contains('id', $eduFo->id));

        // 2. Health Focal Person can only query Health officers
        $healthFpUsers = User::accessibleBy($healthFp)->get();
        $this->assertTrue($healthFpUsers->contains('id', $healthFo->id));
        $this->assertFalse($healthFpUsers->contains('id', $eduFo->id), 'Education field officer must be excluded from Health FP user query');

        // 3. Field Officer can only query self
        $foUsers = User::accessibleBy($healthFo)->get();
        $this->assertTrue($foUsers->contains('id', $healthFo->id));
        $this->assertFalse($foUsers->contains('id', $healthFp->id));
        $this->assertFalse($foUsers->contains('id', $eduFo->id));
    }
}
