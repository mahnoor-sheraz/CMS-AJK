<?php

namespace Tests\Feature;

use App\Models\Complaint;
use App\Models\Department;
use App\Models\District;
use App\Models\Tehsil;
use App\Models\User;
use App\Policies\ComplaintPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationAndRoleAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_registration_route_is_removed(): void
    {
        $response = $this->get('/register');
        $response->assertStatus(404);

        $postResponse = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);
        $postResponse->assertStatus(404);
    }

    public function test_forgot_password_flow_hides_user_existence(): void
    {
        $existingResponse = $this->post('/forgot-password', [
            'email' => 'admin@cmcc.ajk.gov.pk',
        ]);
        $existingResponse->assertSessionHas('status', 'If an account with that email exists, we have sent a password reset link.');

        $nonExistingResponse = $this->post('/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);
        $nonExistingResponse->assertSessionHas('status', 'If an account with that email exists, we have sent a password reset link.');
    }

    public function test_active_admin_can_login_and_is_redirected_to_admin_dashboard(): void
    {
        $response = $this->post('/login', [
            'email' => 'admin@cmcc.ajk.gov.pk',
            'password' => 'Cmcc#Admin2026!Pass',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/admin/dashboard');
    }

    public function test_deactivated_user_login_is_rejected(): void
    {
        $user = User::factory()->create([
            'email' => 'deactivated@example.com',
            'password' => bcrypt('password123'),
            'is_active' => false,
            'role' => 'focal_person',
        ]);

        $response = $this->post('/login', [
            'email' => 'deactivated@example.com',
            'password' => 'password123',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors([
            'email' => 'This account has been deactivated. Contact your administrator.',
        ]);
    }

    public function test_guest_is_redirected_from_protected_routes(): void
    {
        $this->get('/admin/dashboard')->assertRedirect('/login');
        $this->get('/fp/dashboard')->assertRedirect('/login');
    }

    public function test_admin_can_access_admin_dashboard_but_forbidden_from_fp_dashboard(): void
    {
        $admin = User::where('role', 'admin')->first();

        $this->actingAs($admin)->get('/admin/dashboard')->assertStatus(200);
        $this->actingAs($admin)->get('/fp/dashboard')->assertStatus(403);
    }

    public function test_focal_person_can_access_fp_dashboard_but_forbidden_from_admin_dashboard(): void
    {
        $fp = User::factory()->create([
            'role' => 'focal_person',
            'is_active' => true,
        ]);

        $this->actingAs($fp)->get('/fp/dashboard')->assertStatus(200);
        $this->actingAs($fp)->get('/admin/dashboard')->assertStatus(403);
    }

    public function test_complaint_policy_department_matching(): void
    {
        $dept1 = Department::create(['name' => 'Health', 'code' => 'HLT']);
        $dept2 = Department::create(['name' => 'Education', 'code' => 'EDU']);

        $district = District::first();
        $tehsil = Tehsil::first();
        $citizen = \App\Models\Citizen::create([
            'cnic' => '9999999999999',
            'name' => 'Jane Doe',
            'mobile_number' => '03009999999',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
        ]);
        $channel = \App\Models\Channel::first();

        $complaintInHealth = Complaint::create([
            'citizen_id' => $citizen->id,
            'channel_id' => $channel->id,
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'department_id' => $dept1->id,
            'subject' => 'Hospital Complaint',
            'details' => 'Details about hospital',
        ]);

        $admin = User::where('role', 'admin')->first();
        $healthFp = User::factory()->create(['role' => 'focal_person', 'department_id' => $dept1->id]);
        $eduFp = User::factory()->create(['role' => 'focal_person', 'department_id' => $dept2->id]);

        $policy = new ComplaintPolicy();

        $this->assertTrue($policy->view($admin, $complaintInHealth));
        $this->assertTrue($policy->view($healthFp, $complaintInHealth));
        $this->assertFalse($policy->view($eduFp, $complaintInHealth));
    }
}
