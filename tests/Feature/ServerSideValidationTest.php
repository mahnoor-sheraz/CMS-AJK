<?php

namespace Tests\Feature;

use App\Models\Citizen;
use App\Models\Complaint;
use App\Models\Department;
use App\Models\District;
use App\Models\Tehsil;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ServerSideValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * Helper to retrieve base valid complaint submission payload.
     */
    protected function getValidComplaintPayload(): array
    {
        $district = District::first();
        $tehsil = Tehsil::where('district_id', $district->id)->first();
        $department = Department::first();

        return [
            'name' => 'Muhammad Ahmed',
            'cnic' => '8110111122223',
            'mobile_number' => '03001234567',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'department_id' => (string) $department->id,
            'subject' => 'Electricity Transformer Failure in Sector B',
            'details' => 'The public electricity transformer in Sector B has blown out and there has been no electricity supply for 48 hours.',
        ];
    }

    // ==========================================
    // 1. Citizen Name Validation (Type, Length, Pattern)
    // ==========================================

    public function test_rejects_name_that_is_too_short(): void
    {
        $payload = $this->getValidComplaintPayload();
        $payload['name'] = 'A'; // Under min 2

        $response = $this->post('/complaints', $payload);
        $response->assertSessionHasErrors('name');
    }

    public function test_rejects_name_that_is_too_long(): void
    {
        $payload = $this->getValidComplaintPayload();
        $payload['name'] = str_repeat('A', 101); // Exceeds max 100

        $response = $this->post('/complaints', $payload);
        $response->assertSessionHasErrors('name');
    }

    public function test_rejects_name_with_numbers_or_special_scripts(): void
    {
        $payload = $this->getValidComplaintPayload();
        $payload['name'] = 'User123 <script>alert(1)</script>';

        $response = $this->post('/complaints', $payload);
        $response->assertSessionHasErrors('name');
    }

    public function test_accepts_valid_unicode_urdu_name(): void
    {
        $payload = $this->getValidComplaintPayload();
        $payload['name'] = 'محمد احمد خان';

        $response = $this->post('/complaints', $payload);
        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('citizens', [
            'name' => 'محمد احمد خان',
        ]);
    }

    // ==========================================
    // 2. Citizen CNIC Validation (Type, Length, Pattern, Normalization)
    // ==========================================

    public function test_rejects_cnic_with_invalid_length(): void
    {
        $payload = $this->getValidComplaintPayload();
        $payload['cnic'] = '12345'; // Not 13 digits

        $response = $this->post('/complaints', $payload);
        $response->assertSessionHasErrors('cnic');
    }

    public function test_rejects_cnic_with_alphabetic_characters(): void
    {
        $payload = $this->getValidComplaintPayload();
        $payload['cnic'] = '811011112222A';

        $response = $this->post('/complaints', $payload);
        $response->assertSessionHasErrors('cnic');
    }

    public function test_normalizes_and_accepts_hyphenated_cnic(): void
    {
        $payload = $this->getValidComplaintPayload();
        $payload['cnic'] = '81101-1234567-9';

        $response = $this->post('/complaints', $payload);
        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('citizens', [
            'cnic' => '8110112345679',
        ]);
    }

    // ==========================================
    // 3. Mobile Number Validation (Pattern, Prefix)
    // ==========================================

    public function test_rejects_invalid_mobile_number_prefix(): void
    {
        $payload = $this->getValidComplaintPayload();
        $payload['mobile_number'] = '04231234567'; // Landline prefix, not mobile

        $response = $this->post('/complaints', $payload);
        $response->assertSessionHasErrors('mobile_number');
    }

    public function test_rejects_mobile_number_with_letters(): void
    {
        $payload = $this->getValidComplaintPayload();
        $payload['mobile_number'] = '0300ABC4567';

        $response = $this->post('/complaints', $payload);
        $response->assertSessionHasErrors('mobile_number');
    }

    public function test_accepts_international_format_mobile_number(): void
    {
        $payload = $this->getValidComplaintPayload();
        $payload['cnic'] = '8110199998888';
        $payload['mobile_number'] = '+923001234567';

        $response = $this->post('/complaints', $payload);
        $response->assertSessionHasNoErrors();
    }

    // ==========================================
    // 4. District and Tehsil Relational Integrity Validation
    // ==========================================

    public function test_rejects_tehsil_not_belonging_to_selected_district(): void
    {
        $districts = District::take(2)->get();
        if ($districts->count() < 2) {
            $this->markTestSkipped('Need at least 2 districts to test cross-district tehsil mismatch.');
        }

        $districtA = $districts[0];
        $districtB = $districts[1];
        $tehsilOfDistrictB = Tehsil::where('district_id', $districtB->id)->first();

        $payload = $this->getValidComplaintPayload();
        $payload['district_id'] = $districtA->id;
        $payload['tehsil_id'] = $tehsilOfDistrictB->id; // Mismatched!

        $response = $this->post('/complaints', $payload);
        $response->assertSessionHasErrors('tehsil_id');
    }

    // ==========================================
    // 5. Subject & Details Validation (Lengths, Tags)
    // ==========================================

    public function test_rejects_subject_shorter_than_5_characters(): void
    {
        $payload = $this->getValidComplaintPayload();
        $payload['subject'] = 'Help'; // 4 chars

        $response = $this->post('/complaints', $payload);
        $response->assertSessionHasErrors('subject');
    }

    public function test_rejects_subject_exceeding_100_characters(): void
    {
        $payload = $this->getValidComplaintPayload();
        $payload['subject'] = str_repeat('Complaint Subject Text ', 5); // > 100 chars

        $response = $this->post('/complaints', $payload);
        $response->assertSessionHasErrors('subject');
    }

    public function test_rejects_details_shorter_than_50_characters(): void
    {
        $payload = $this->getValidComplaintPayload();
        $payload['details'] = 'This is too brief for a formal public grievance.';

        $response = $this->post('/complaints', $payload);
        $response->assertSessionHasErrors('details');
    }

    // ==========================================
    // 6. Attachment Validation (Type, Size, Quantity)
    // ==========================================

    public function test_rejects_disallowed_file_types(): void
    {
        Storage::fake('public');
        $payload = $this->getValidComplaintPayload();
        $file = UploadedFile::fake()->create('malicious.exe', 500, 'application/x-msdownload');
        $payload['attachments'] = [$file];

        $response = $this->post('/complaints', $payload);
        $response->assertSessionHasErrors('attachments.0');
    }

    public function test_rejects_more_than_five_attachments(): void
    {
        Storage::fake('public');
        $payload = $this->getValidComplaintPayload();
        $files = [];
        for ($i = 0; $i < 6; $i++) {
            $files[] = UploadedFile::fake()->create("doc_{$i}.pdf", 100, 'application/pdf');
        }
        $payload['attachments'] = $files;

        $response = $this->post('/complaints', $payload);
        $response->assertSessionHasErrors('attachments');
    }

    // ==========================================
    // 7. Complaint Tracking Form Validation
    // ==========================================

    public function test_tracking_rejects_invalid_complaint_number_pattern(): void
    {
        $response = $this->post('/complaints/track', [
            'complaint_number' => 'PMCC!@#$%^', // Disallowed characters
            'cnic' => '8110112345671',
        ]);

        $response->assertSessionHasErrors('complaint_number');
    }

    public function test_tracking_rejects_invalid_cnic_length_and_pattern(): void
    {
        $response = $this->post('/complaints/track', [
            'complaint_number' => 'PMCC-2026-0001',
            'cnic' => '81101-1234', // Invalid length
        ]);

        $response->assertSessionHasErrors(['cnic', 'error_code']);
    }

    // ==========================================
    // 8. Profile & Password Form Validation
    // ==========================================

    public function test_profile_update_rejects_invalid_name_and_malformed_email(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->patch('/profile', [
            'name' => '123 <script>',
            'email' => 'not-an-email',
        ]);

        $response->assertSessionHasErrors(['name', 'email']);
    }

    public function test_password_update_rejects_short_password_and_unconfirmed_password(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->put('/password', [
            'current_password' => 'password',
            'password' => 'short', // Under 8 chars
            'password_confirmation' => 'mismatch',
        ]);

        $response->assertSessionHasErrors('password');
    }
}
