<?php

namespace Tests\Feature;

use App\Models\Feature;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class RbacSystemTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_rbac_database_tables_and_columns_exist(): void
    {
        $this->assertTrue(Schema::hasTable('roles'));
        $this->assertTrue(Schema::hasTable('features'));
        $this->assertTrue(Schema::hasTable('permissions'));
        $this->assertTrue(Schema::hasTable('role_permissions'));
        $this->assertTrue(Schema::hasColumn('users', 'role_id'));
    }

    public function test_rbac_seeders_populate_roles_features_and_permissions(): void
    {
        $this->assertEquals(4, Role::count());
        $this->assertEquals(7, Feature::count());
        $this->assertEquals(21, Permission::count());

        $adminRole = Role::where('slug', 'admin')->first();
        $directorRole = Role::where('slug', 'director')->first();
        $fpRole = Role::where('slug', 'focal_person')->first();
        $fieldOfficerRole = Role::where('slug', 'field_officer')->first();

        $this->assertEquals(20, $adminRole->permissions()->count());
        $this->assertEquals(7, $directorRole->permissions()->count());
        $this->assertEquals(12, $fpRole->permissions()->count());
        $this->assertEquals(3, $fieldOfficerRole->permissions()->count());
    }

    public function test_admin_role_permissions_and_gate_checks(): void
    {
        $admin = User::where('role', 'admin')->first();

        // Direct permission methods
        $this->assertTrue($admin->hasPermission('complaints.view_all'));
        $this->assertTrue($admin->hasPermission('users.create'));
        $this->assertTrue($admin->hasPermission('users.toggle_active'));
        $this->assertTrue($admin->hasPermission('reassignments.approve'));
        $this->assertTrue($admin->hasPermission('master_data.manage'));
        $this->assertTrue($admin->hasPermission('audit_logs.view'));

        // Gate / can checks
        $this->assertTrue($admin->can('complaints.view_all'));
        $this->assertTrue($admin->can('users.create'));
        $this->assertTrue(Gate::forUser($admin)->allows('reassignments.approve'));
    }

    public function test_director_role_permissions_and_restrictions(): void
    {
        $director = User::factory()->create([
            'role' => 'director',
            'is_active' => true,
        ]);

        // Director can approve reassignments and view department complaints
        $this->assertTrue($director->hasPermission('reassignments.approve'));
        $this->assertTrue($director->hasPermission('complaints.view_department'));
        $this->assertTrue($director->hasPermission('reports.view_department'));
        $this->assertTrue($director->can('reassignments.approve'));

        // Director CANNOT resolve complaints, create users, or manage master data
        $this->assertFalse($director->hasPermission('complaints.resolve'));
        $this->assertFalse($director->hasPermission('users.create'));
        $this->assertFalse($director->hasPermission('master_data.manage'));
        $this->assertFalse($director->can('complaints.resolve'));
    }

    public function test_focal_person_role_permissions_and_restrictions(): void
    {
        $focalPerson = User::factory()->create([
            'role' => 'focal_person',
            'is_active' => true,
        ]);

        // Focal Person can request reassignment, assign officer, and resolve complaints
        $this->assertTrue($focalPerson->hasPermission('reassignments.request'));
        $this->assertTrue($focalPerson->hasPermission('investigations.assign_officer'));
        $this->assertTrue($focalPerson->hasPermission('complaints.resolve'));
        $this->assertTrue($focalPerson->hasPermission('complaints.club_duplicates'));
        $this->assertTrue($focalPerson->can('reassignments.request'));

        // Focal Person CANNOT approve reassignments or create users
        $this->assertFalse($focalPerson->hasPermission('reassignments.approve'));
        $this->assertFalse($focalPerson->hasPermission('users.create'));
        $this->assertFalse($focalPerson->can('reassignments.approve'));
    }

    public function test_field_officer_role_permissions_and_restrictions(): void
    {
        $fieldOfficer = User::factory()->create([
            'role' => 'field_officer',
            'is_active' => true,
        ]);

        // Field officer can view assigned and submit inspection reports
        $this->assertTrue($fieldOfficer->hasPermission('complaints.view_assigned'));
        $this->assertTrue($fieldOfficer->hasPermission('investigations.view'));
        $this->assertTrue($fieldOfficer->hasPermission('investigations.submit_report'));
        $this->assertTrue($fieldOfficer->can('investigations.submit_report'));

        // Field officer CANNOT initiate investigations, update complaint status, or request transfer
        $this->assertFalse($fieldOfficer->hasPermission('investigations.create'));
        $this->assertFalse($fieldOfficer->hasPermission('complaints.update_status'));
        $this->assertFalse($fieldOfficer->hasPermission('reassignments.request'));
        $this->assertFalse($fieldOfficer->can('complaints.update_status'));
    }

    public function test_deactivated_user_has_no_permissions(): void
    {
        $inactiveAdmin = User::factory()->create([
            'role' => 'admin',
            'is_active' => false,
        ]);

        $this->assertFalse($inactiveAdmin->hasPermission('complaints.view_all'));
        $this->assertFalse($inactiveAdmin->hasPermission('users.create'));
        $this->assertFalse($inactiveAdmin->can('complaints.view_all'));
    }

    public function test_user_get_permissions_matrix(): void
    {
        $focalPerson = User::factory()->create([
            'role' => 'focal_person',
            'is_active' => true,
        ]);

        $matrix = $focalPerson->getPermissionsMatrix();

        $this->assertIsArray($matrix);
        $this->assertArrayHasKey('Complaints Management', $matrix);
        $this->assertArrayHasKey('Field & Office Investigations', $matrix);
        $this->assertArrayHasKey('Department Reassignments', $matrix);
    }
}
