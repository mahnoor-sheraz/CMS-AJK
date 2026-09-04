<?php

namespace Tests\Feature;

use App\Models\Channel;
use App\Models\Citizen;
use App\Models\Complaint;
use App\Models\Department;
use App\Models\District;
use App\Models\Tehsil;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErrorCodeAndGracefulHandlingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_rate_limit_exceeded_returns_structured_error_code(): void
    {
        $district = District::first();
        $tehsil = Tehsil::where('district_id', $district->id)->first();
        $department = Department::first();

        // First complaint submission succeeds
        $firstResponse = $this->post('/complaints', [
            'name' => 'Farhan Qadir',
            'cnic' => '8220199999999',
            'mobile_number' => '03001239999',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'subject' => 'Road repair needed urgently',
            'details' => 'The main link road has severe potholes and urgently needs immediate repair works.',
            'department_id' => (string) $department->id,
        ]);
        $firstResponse->assertSessionHasNoErrors();

        // Second complaint submission within 24h must return ERR_RATE_LIMIT_EXCEEDED
        $secondResponse = $this->post('/complaints', [
            'name' => 'Farhan Qadir',
            'cnic' => '8220199999999',
            'mobile_number' => '03001239999',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'subject' => 'Second attempt should be rate limited',
            'details' => 'Attempting to lodge another complaint immediately within the twenty-four hour window.',
            'department_id' => (string) $department->id,
        ]);

        $secondResponse->assertSessionHasErrors(['rate_limit', 'error_code']);
        $this->assertEquals('ERR_RATE_LIMIT_EXCEEDED', session('errors')->first('error_code'));
    }

    public function test_tracking_with_invalid_cnic_returns_err_invalid_cnic_format(): void
    {
        $response = $this->post('/complaints/track', [
            'complaint_number' => 'PMCC-2026-000001',
            'cnic' => '82201-1234', // Invalid length
        ]);

        $response->assertSessionHasErrors(['cnic', 'error_code']);
        $this->assertEquals('ERR_INVALID_CNIC_FORMAT', session('errors')->first('error_code'));
    }

    public function test_tracking_nonexistent_complaint_returns_err_complaint_not_found(): void
    {
        $response = $this->post('/complaints/track', [
            'complaint_number' => 'PMCC-9999-999999',
            'cnic' => '8220199999999',
        ]);

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/ComplaintTrack')
            ->where('searched', true)
            ->where('notFound', true)
            ->where('errorCode', 'ERR_COMPLAINT_NOT_FOUND')
        );
    }

    public function test_confirmation_screen_for_missing_complaint_gracefully_redirects_with_error_code(): void
    {
        $response = $this->get('/complaints/confirmation/NONEXISTENT-9999');

        $response->assertRedirect('/complaints/track');
        $response->assertSessionHasErrors(['complaint_number', 'error_code']);
        $this->assertEquals('ERR_COMPLAINT_NOT_FOUND', session('errors')->first('error_code'));
    }

    public function test_unauthorized_role_access_returns_err_forbidden_role(): void
    {
        $focalPerson = User::factory()->create([
            'role' => 'focal_person',
            'is_active' => true,
        ]);

        // Web request aborts with 403
        $webResponse = $this->actingAs($focalPerson)->get('/admin/dashboard');
        $webResponse->assertStatus(403);

        // JSON / API request returns structured JSON with ERR_FORBIDDEN_ROLE
        $jsonResponse = $this->actingAs($focalPerson)->getJson('/admin/dashboard');
        $jsonResponse->assertStatus(403);
        $jsonResponse->assertJson([
            'error_code' => 'ERR_FORBIDDEN_ROLE',
        ]);
    }

    public function test_complaint_model_automatically_populates_cnic_on_creation(): void
    {
        $district = District::first();
        $tehsil = Tehsil::where('district_id', $district->id)->first();
        $department = Department::first();

        $citizen = Citizen::create([
            'cnic' => '8220177777777',
            'name' => 'Auto CNIC Citizen',
            'mobile_number' => '03007777777',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
        ]);

        $complaint = Complaint::create([
            'citizen_id' => $citizen->id,
            'channel_id' => Channel::first()->id,
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'department_id' => $department->id,
            'subject' => 'Model Event CNIC Auto-fill Test',
            'details' => 'Testing that Complaint model booted hook fills cnic from citizen_id automatically.',
        ]);

        $this->assertEquals('8220177777777', $complaint->cnic);
    }
}
