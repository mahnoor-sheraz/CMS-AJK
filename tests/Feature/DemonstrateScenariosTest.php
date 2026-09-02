<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemonstrateScenariosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_unauthenticated_guest_visiting_admin_dashboard(): void
    {
        $response = $this->get('/admin/dashboard');

        $response->assertStatus(302);
        $response->assertRedirect('/login');
    }

    public function test_focal_person_visiting_admin_dashboard(): void
    {
        $focalPerson = User::factory()->create([
            'name' => 'Department Focal Person',
            'email' => 'fp@health.ajk.gov.pk',
            'role' => 'focal_person',
            'is_active' => true,
        ]);

        $response = $this->actingAs($focalPerson)->get('/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_inactive_user_login_with_correct_password(): void
    {
        $inactiveUser = User::factory()->create([
            'name' => 'Deactivated Officer',
            'email' => 'disabled.officer@ajk.gov.pk',
            'password' => bcrypt('CorrectPassword123!'),
            'is_active' => false,
            'role' => 'focal_person',
        ]);

        $response = $this->post('/login', [
            'email' => 'disabled.officer@ajk.gov.pk',
            'password' => 'CorrectPassword123!',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors([
            'email' => 'This account has been deactivated. Contact your administrator.',
        ]);
    }
}
