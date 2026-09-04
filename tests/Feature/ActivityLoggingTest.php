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
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

class ActivityLoggingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_complaint_creation_automatically_logs_activity(): void
    {
        $district = District::first();
        $tehsil = Tehsil::where('district_id', $district->id)->first();
        $department = Department::first();

        $citizen = Citizen::create([
            'cnic' => '8210111111111',
            'name' => 'Khurram Shehzad',
            'mobile_number' => '03001111111',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
        ]);

        $complaint = Complaint::create([
            'citizen_id' => $citizen->id,
            'channel_id' => Channel::first()->id,
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'department_id' => $department->id,
            'subject' => 'Electricity transformer spark test',
            'details' => 'Transformer sparks continuously during rain, poses threat to pedestrians.',
            'stage' => 'application_submission',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $activity = Activity::forSubject($complaint)->where('event', 'created')->first();

        $this->assertNotNull($activity);
        $this->assertEquals('complaints', $activity->log_name);
        $this->assertEquals('Complaint has been created', $activity->description);
        $this->assertEquals($complaint->id, $activity->subject_id);
    }

    public function test_complaint_update_logs_dirty_changes_only(): void
    {
        $district = District::first();
        $tehsil = Tehsil::where('district_id', $district->id)->first();
        $department = Department::first();

        $citizen = Citizen::create([
            'cnic' => '8210122222222',
            'name' => 'Waqas Akram',
            'mobile_number' => '03002222222',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
        ]);

        $complaint = Complaint::create([
            'citizen_id' => $citizen->id,
            'channel_id' => Channel::first()->id,
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'department_id' => $department->id,
            'subject' => 'Water shortage test',
            'details' => 'Water supply interrupted for four days in sector C.',
            'stage' => 'application_submission',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        // Transition status to under_investigation
        $complaint->update([
            'status' => 'under_investigation',
            'stage' => 'investigation_by_department',
        ]);

        $updateActivity = Activity::forSubject($complaint)->where('event', 'updated')->latest()->first();

        $this->assertNotNull($updateActivity);
        $this->assertEquals('complaints', $updateActivity->log_name);
        $this->assertEquals('Complaint has been updated', $updateActivity->description);

        $changes = $updateActivity->attribute_changes;
        $this->assertEquals('under_investigation', $changes['attributes']['status']);
        $this->assertEquals('submitted', $changes['old']['status']);
        $this->assertEquals('investigation_by_department', $changes['attributes']['stage']);
        $this->assertEquals('application_submission', $changes['old']['stage']);
    }

    public function test_public_portal_submission_records_contextual_activity(): void
    {
        $district = District::first();
        $tehsil = Tehsil::where('district_id', $district->id)->first();
        $department = Department::first();

        $response = $this->post('/complaints', [
            'name' => 'Babar Azam',
            'cnic' => '8210133333333',
            'mobile_number' => '03003333333',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'subject' => 'Sanitation issue in ward 5',
            'details' => 'Garbage collection has been pending for two weeks and creates health hazard.',
            'department_id' => (string) $department->id,
        ]);

        $response->assertSessionHasNoErrors();

        $complaint = Complaint::whereHas('citizen', fn ($q) => $q->where('cnic', '8210133333333'))->first();
        $this->assertNotNull($complaint);

        // Verify contextual public_portal activity log
        $portalActivity = Activity::where('log_name', 'public_portal')
            ->where('subject_id', $complaint->id)
            ->first();

        $this->assertNotNull($portalActivity);
        $this->assertEquals('Citizen lodged grievance via Web Portal', $portalActivity->description);
        $this->assertEquals('8210133333333', $portalActivity->properties['citizen_cnic']);
        $this->assertEquals($complaint->complaint_number, $portalActivity->properties['complaint_number']);
    }

    public function test_complaint_investigation_logs_activity(): void
    {
        $admin = User::where('role', 'admin')->first();
        $fp = User::factory()->create([
            'role' => 'focal_person',
            'is_active' => true,
        ]);
        $fieldOfficer = User::factory()->create([
            'role' => 'field_officer',
            'is_active' => true,
            'supervisor_id' => $fp->id,
        ]);

        $district = District::first();
        $tehsil = Tehsil::first();
        $citizen = Citizen::create([
            'cnic' => '8210144444444',
            'name' => 'Amjad Ali',
            'mobile_number' => '03004444444',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
        ]);

        $complaint = Complaint::create([
            'citizen_id' => $citizen->id,
            'channel_id' => Channel::first()->id,
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'department_id' => Department::first()->id,
            'subject' => 'Investigation Log Test',
            'details' => 'Details for investigation activity logging test case.',
        ]);

        $investigation = ComplaintInvestigation::create([
            'complaint_id' => $complaint->id,
            'fp_id' => $fp->id,
            'assigned_officer_id' => $fieldOfficer->id,
            'investigation_type' => 'field_visit',
            'notes' => 'Assigned field officer for physical site inspection.',
            'location' => 'Sector F-2 Muzaffarabad',
            'visit_datetime' => now()->addDays(2),
        ]);

        $activity = Activity::forSubject($investigation)->where('event', 'created')->first();

        $this->assertNotNull($activity);
        $this->assertEquals('investigations', $activity->log_name);
        $this->assertEquals('Complaint investigation has been created', $activity->description);
        $this->assertEquals($fieldOfficer->id, $activity->attribute_changes['attributes']['assigned_officer_id']);
    }

    public function test_complaint_reassignment_request_logs_activity(): void
    {
        $dept1 = Department::first();
        $dept2 = Department::skip(1)->first() ?? Department::create(['name' => 'Works Department', 'code' => 'WKS']);

        $fp = User::factory()->create([
            'role' => 'focal_person',
            'department_id' => $dept1->id,
        ]);

        $district = District::first();
        $tehsil = Tehsil::first();
        $citizen = Citizen::create([
            'cnic' => '8210155555555',
            'name' => 'Naveed Khan',
            'mobile_number' => '03005555555',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
        ]);

        $complaint = Complaint::create([
            'citizen_id' => $citizen->id,
            'channel_id' => Channel::first()->id,
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'department_id' => $dept1->id,
            'subject' => 'Reassignment request test',
            'details' => 'Complaint pertains to roads and buildings instead of electricity.',
        ]);

        $reassignment = ComplaintReassignmentRequest::create([
            'complaint_id' => $complaint->id,
            'requested_by' => $fp->id,
            'from_department_id' => $dept1->id,
            'to_department_id' => $dept2->id,
            'reason' => 'Matter pertains to Works department jurisdiction.',
            'status' => 'pending',
        ]);

        $activity = Activity::forSubject($reassignment)->where('event', 'created')->first();

        $this->assertNotNull($activity);
        $this->assertEquals('reassignments', $activity->log_name);
        $this->assertEquals('Complaint reassignment request has been created', $activity->description);
        $this->assertEquals('pending', $activity->attribute_changes['attributes']['status']);
    }

    public function test_user_model_activity_and_auth_session_logging(): void
    {
        // 1. User model update logging (without sensitive fields like password)
        $user = User::factory()->create([
            'email' => 'officer@cmcc.ajk.gov.pk',
            'role' => 'field_officer',
            'is_active' => true,
        ]);

        $user->update([
            'role' => 'director',
            'is_active' => false,
        ]);

        $userActivity = Activity::forSubject($user)->where('event', 'updated')->latest()->first();

        $this->assertNotNull($userActivity);
        $this->assertEquals('users', $userActivity->log_name);
        $this->assertEquals('director', $userActivity->attribute_changes['attributes']['role']);
        $this->assertEquals('field_officer', $userActivity->attribute_changes['old']['role']);
        $this->assertFalse($userActivity->attribute_changes['attributes']['is_active']);
        $this->assertArrayNotHasKey('password', $userActivity->attribute_changes['attributes']);

        // 2. Auth login activity logging
        $admin = User::where('role', 'admin')->first();
        $this->post('/login', [
            'email' => 'admin@cmcc.ajk.gov.pk',
            'password' => 'Cmcc#Admin2026!Pass',
        ]);

        $loginActivity = Activity::where('log_name', 'auth')
            ->where('description', 'User logged in successfully')
            ->where('causer_id', $admin->id)
            ->first();

        $this->assertNotNull($loginActivity);
        $this->assertEquals('admin', $loginActivity->properties['role']);

        // 3. Auth logout activity logging
        $this->post('/logout');

        $logoutActivity = Activity::where('log_name', 'auth')
            ->where('description', 'User logged out')
            ->where('causer_id', $admin->id)
            ->first();

        $this->assertNotNull($logoutActivity);
    }
}
