<?php

namespace Tests\Feature;

use App\Models\Citizen;
use App\Models\Complaint;
use App\Models\Department;
use App\Models\District;
use App\Models\Tehsil;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CitizenPortalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_public_complaint_form_renders_without_login(): void
    {
        $response = $this->get('/complaints/new');
        $response->assertStatus(200);
    }

    public function test_citizen_can_submit_complaint_successfully(): void
    {
        Storage::fake('public');

        $district = District::first();
        $tehsil = Tehsil::where('district_id', $district->id)->first();
        $department = Department::first();

        $file = UploadedFile::fake()->create('evidence.pdf', 500, 'application/pdf');

        $response = $this->post('/complaints', [
            'name' => 'Ali Khan',
            'cnic' => '8110112345671',
            'mobile_number' => '03001234567',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'subject' => 'Water Supply Interruption in Ward 4',
            'details' => 'The water supply has been completely cut off for the last 5 days. Kindly resolve this issue urgently.',
            'department_id' => (string) $department->id,
            'attachments' => [$file],
        ]);

        $this->assertDatabaseHas('citizens', [
            'cnic' => '8110112345671',
            'name' => 'Ali Khan',
            'mobile_number' => '03001234567',
        ]);

        $citizen = Citizen::where('cnic', '8110112345671')->first();

        $this->assertDatabaseHas('complaints', [
            'citizen_id' => $citizen->id,
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'department_id' => $department->id,
            'subject' => 'Water Supply Interruption in Ward 4',
            'stage' => 'application_submission',
            'status' => 'submitted',
            'is_uncategorized' => false,
        ]);

        $complaint = Complaint::where('citizen_id', $citizen->id)->first();
        $this->assertStringStartsWith('PMCC-', $complaint->complaint_number);
        $this->assertCount(1, $complaint->attachments);

        $response->assertRedirect(route('complaints.confirmation', $complaint->complaint_number));
    }

    public function test_submitting_other_department_sets_is_uncategorized_true(): void
    {
        $district = District::first();
        $tehsil = Tehsil::where('district_id', $district->id)->first();

        $response = $this->post('/complaints', [
            'name' => 'Fatima Bibi',
            'cnic' => '8110198765432',
            'mobile_number' => '03129876543',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'subject' => 'Uncategorized Issue Request',
            'details' => 'This is a general grievance regarding public service delay. Please inspect and categorize.',
            'department_id' => 'other',
        ]);

        $citizen = Citizen::where('cnic', '8110198765432')->first();

        $this->assertDatabaseHas('complaints', [
            'citizen_id' => $citizen->id,
            'is_uncategorized' => true,
            'department_id' => null,
            'category_id' => null,
        ]);
    }

    public function test_repeat_submission_reuses_existing_citizen_record(): void
    {
        $district = District::first();
        $tehsil = Tehsil::where('district_id', $district->id)->first();
        $department = Department::first();

        // First complaint
        $this->post('/complaints', [
            'name' => 'Original Name',
            'cnic' => '8110155555555',
            'mobile_number' => '03331112223',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'subject' => 'First Complaint Subject Here',
            'details' => 'First complaint details text with more than fifty characters here.',
            'department_id' => (string) $department->id,
        ]);

        $this->assertEquals(1, Citizen::where('cnic', '8110155555555')->count());

        // Second complaint with updated name & mobile
        $this->post('/complaints', [
            'name' => 'Updated Name',
            'cnic' => '8110155555555',
            'mobile_number' => '03339998887',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'subject' => 'Second Complaint Subject Here',
            'details' => 'Second complaint details text with more than fifty characters here.',
            'department_id' => (string) $department->id,
        ]);

        // Still exactly one citizen record with updated details
        $this->assertEquals(1, Citizen::where('cnic', '8110155555555')->count());
        $this->assertDatabaseHas('citizens', [
            'cnic' => '8110155555555',
            'name' => 'Updated Name',
            'mobile_number' => '03339998887',
        ]);
    }

    public function test_tracking_complaint_with_valid_details_returns_complaint_and_stages(): void
    {
        $district = District::first();
        $tehsil = Tehsil::where('district_id', $district->id)->first();
        $department = Department::first();

        $citizen = Citizen::create([
            'cnic' => '8110177777777',
            'name' => 'Tariq Mehmood',
            'mobile_number' => '03451234567',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
        ]);

        $complaint = Complaint::create([
            'citizen_id' => $citizen->id,
            'channel_id' => \App\Models\Channel::first()->id,
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'department_id' => $department->id,
            'subject' => 'Trackable Complaint Test',
            'details' => 'Detailed complaint description text for tracking verification test.',
            'stage' => 'investigation_by_department',
            'status' => 'under_investigation',
            'submitted_at' => now(),
        ]);

        $response = $this->post('/complaints/track', [
            'complaint_number' => $complaint->complaint_number,
            'cnic' => '8110177777777',
        ]);

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/ComplaintTrack')
            ->where('searched', true)
            ->where('notFound', false)
            ->where('complaint.complaint_number', $complaint->complaint_number)
            ->where('complaint.stage', 'investigation_by_department')
        );
    }

    public function test_tracking_complaint_with_mismatched_cnic_returns_not_found(): void
    {
        $district = District::first();
        $tehsil = Tehsil::where('district_id', $district->id)->first();

        $citizen = Citizen::create([
            'cnic' => '8110188888888',
            'name' => 'Sajid Ahmed',
            'mobile_number' => '03008888888',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
        ]);

        $complaint = Complaint::create([
            'citizen_id' => $citizen->id,
            'channel_id' => \App\Models\Channel::first()->id,
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'subject' => 'Mismatched CNIC Test',
            'details' => 'Detailed complaint description text for testing mismatched CNIC lookup.',
            'stage' => 'application_submission',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $response = $this->post('/complaints/track', [
            'complaint_number' => $complaint->complaint_number,
            'cnic' => '9999999999999', // Wrong CNIC
        ]);

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/ComplaintTrack')
            ->where('searched', true)
            ->where('notFound', true)
        );
    }
}
