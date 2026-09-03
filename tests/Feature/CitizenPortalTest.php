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

    public function test_complaint_submission_with_large_attachment_and_sub_category(): void
    {
        Storage::fake('public');

        $district = District::first();
        $tehsil = Tehsil::where('district_id', $district->id)->first();
        $department = Department::where('code', 'HLT')->first();
        $category = $department->categories()->whereNull('parent_category_id')->first();
        $subCategory = $category->subCategories()->first();

        // 7MB file attachment (well above previous 2MB limit)
        $file = UploadedFile::fake()->create('large_screenshot.png', 7168, 'image/png');

        $response = $this->post('/complaints', [
            'name' => 'Tariq Mehmood',
            'cnic' => '8110199887766',
            'mobile_number' => '03009988776',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'department_id' => (string) $department->id,
            'category_id' => (string) $category->id,
            'sub_category_id' => $subCategory ? (string) $subCategory->id : null,
            'subject' => 'Medicine Shortage for Emergency Patients',
            'details' => 'Life saving drugs are severely unavailable at the district hospital for emergency patients.',
            'attachments' => [$file],
        ]);

        $complaint = Complaint::whereHas('citizen', fn ($q) => $q->where('cnic', '8110199887766'))->first();
        $this->assertNotNull($complaint);
        $this->assertCount(1, $complaint->attachments);
        if ($subCategory) {
            $this->assertEquals($subCategory->id, $complaint->category_id);
        }
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

        // Simulate that the first complaint was lodged 25 hours ago (outside rate limit window)
        $citizen = Citizen::where('cnic', '8110155555555')->first();
        Complaint::where('citizen_id', $citizen->id)->update(['submitted_at' => now()->subHours(25)]);

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

    public function test_rate_limit_blocks_second_complaint_within_24_hours(): void
    {
        $district = District::first();
        $tehsil = Tehsil::where('district_id', $district->id)->first();
        $department = Department::first();

        // 1. First complaint submitted successfully
        $firstResponse = $this->post('/complaints', [
            'name' => 'Kashif Hussain',
            'cnic' => '8110144444444',
            'mobile_number' => '03004444444',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'subject' => 'Road repair complaint',
            'details' => 'The main road in our sector is severely damaged and causing severe accidents.',
            'department_id' => (string) $department->id,
        ]);

        $firstComplaint = Complaint::whereHas('citizen', fn ($q) => $q->where('cnic', '8110144444444'))->first();
        $this->assertNotNull($firstComplaint);
        $firstResponse->assertRedirect(route('complaints.confirmation', $firstComplaint->complaint_number));

        // 2. Attempt second complaint within 24 hours with same CNIC
        $secondResponse = $this->post('/complaints', [
            'name' => 'Kashif Hussain',
            'cnic' => '8110144444444',
            'mobile_number' => '03004444444',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'subject' => 'Second attempt road repair complaint',
            'details' => 'Trying to submit another complaint with the same CNIC within twenty-four hours.',
            'department_id' => (string) $department->id,
        ]);

        // Assert blocked with rate_limit validation error containing exact next eligible time
        $expectedNextTime = $firstComplaint->submitted_at->copy()->addHours(24)->format('d M Y, h:i A');
        $secondResponse->assertSessionHasErrors(['rate_limit' => $expectedNextTime]);

        // Assert database still has only 1 complaint for this citizen
        $this->assertEquals(1, Complaint::whereHas('citizen', fn ($q) => $q->where('cnic', '8110144444444'))->count());

        // 3. Fast-forward past 24 hours: submission must now succeed
        $firstComplaint->update(['submitted_at' => now()->subHours(25)]);

        $thirdResponse = $this->post('/complaints', [
            'name' => 'Kashif Hussain',
            'cnic' => '8110144444444',
            'mobile_number' => '03004444444',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'subject' => 'Third complaint after 24 hours',
            'details' => 'This complaint is submitted after twenty-four hours have passed and must succeed.',
            'department_id' => (string) $department->id,
        ]);

        $this->assertEquals(2, Complaint::whereHas('citizen', fn ($q) => $q->where('cnic', '8110144444444'))->count());
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
