<?php

namespace Database\Seeders;

use App\Models\Feature;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RbacSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Roles
        $roles = [
            'admin' => [
                'name' => 'Administrator',
                'description' => 'System administrator with global oversight across all departments, user management, and system configurations.',
            ],
            'director' => [
                'name' => 'Department Director',
                'description' => 'Department head with authority to approve/reject inter-departmental transfers and review department-level reports.',
            ],
            'focal_person' => [
                'name' => 'Focal Person',
                'description' => 'Department case handler responsible for investigations, duplicate resolution, field assignments, and resolving grievances.',
            ],
            'field_officer' => [
                'name' => 'Field Officer',
                'description' => 'Subordinate officer carrying out physical site visits and recording investigation findings.',
            ],
        ];

        $roleModels = [];
        foreach ($roles as $slug => $data) {
            $roleModels[$slug] = Role::firstOrCreate(
                ['slug' => $slug],
                ['name' => $data['name'], 'description' => $data['description']]
            );
        }

        // 2. Features and Permissions
        $features = [
            [
                'name' => 'Complaints Management',
                'slug' => 'complaints',
                'description' => 'Grievance intake, tracking, status transitions, and resolution.',
                'icon' => 'folder-alert',
                'display_order' => 1,
                'permissions' => [
                    ['slug' => 'complaints.view_all', 'name' => 'View All Department Complaints', 'description' => 'View complaints across all provincial departments.'],
                    ['slug' => 'complaints.view_department', 'name' => 'View Own Department Complaints', 'description' => 'View complaints scoped to user assigned department.'],
                    ['slug' => 'complaints.view_assigned', 'name' => 'View Assigned Complaints', 'description' => 'View complaints specifically assigned to user.'],
                    ['slug' => 'complaints.update_status', 'name' => 'Update Complaint Status & Stage', 'description' => 'Change complaint workflow status and investigation stage.'],
                    ['slug' => 'complaints.resolve', 'name' => 'Mark Complaint Resolved or Unresolvable', 'description' => 'Finalize complaints with resolution or rejection outcomes.'],
                    ['slug' => 'complaints.club_duplicates', 'name' => 'Club Duplicate Complaints', 'description' => 'Identify, confirm, and club duplicate complaint submissions.'],
                ],
            ],
            [
                'name' => 'Field & Office Investigations',
                'slug' => 'investigations',
                'description' => 'Initiation, assignment, and completion of complaint investigations.',
                'icon' => 'clipboard-check',
                'display_order' => 2,
                'permissions' => [
                    ['slug' => 'investigations.view', 'name' => 'View Investigation Details', 'description' => 'Inspect investigation schedules, locations, and findings.'],
                    ['slug' => 'investigations.create', 'name' => 'Initiate Department Investigation', 'description' => 'Create investigation records for active complaints.'],
                    ['slug' => 'investigations.assign_officer', 'name' => 'Assign Subordinate Field Officer', 'description' => 'Assign field visits to supervised field officers.'],
                    ['slug' => 'investigations.submit_report', 'name' => 'Submit Site Inspection Report', 'description' => 'Upload field findings and conclude site inspections.'],
                ],
            ],
            [
                'name' => 'Department Reassignments',
                'slug' => 'reassignments',
                'description' => 'Cross-department transfer requests and review approvals.',
                'icon' => 'switch-horizontal',
                'display_order' => 3,
                'permissions' => [
                    ['slug' => 'reassignments.request', 'name' => 'Request Department Transfer', 'description' => 'Initiate transfer request to route complaint to another department.'],
                    ['slug' => 'reassignments.view', 'name' => 'View Reassignment Requests', 'description' => 'View queue of department reassignment requests.'],
                    ['slug' => 'reassignments.approve', 'name' => 'Approve or Reject Reassignment', 'description' => 'Authorize or deny incoming department reassignment requests.'],
                ],
            ],
            [
                'name' => 'User & Account Administration',
                'slug' => 'users',
                'description' => 'Internal staff account creation, activation, and role assignments.',
                'icon' => 'users',
                'display_order' => 4,
                'permissions' => [
                    ['slug' => 'users.view', 'name' => 'View Staff Directory', 'description' => 'View departmental staff directory and account details.'],
                    ['slug' => 'users.create', 'name' => 'Create Staff Account', 'description' => 'Provision new user accounts with designated role.'],
                    ['slug' => 'users.edit', 'name' => 'Update Staff Profiles & Roles', 'description' => 'Modify user profile, department, and role assignments.'],
                    ['slug' => 'users.toggle_active', 'name' => 'Activate / Deactivate Accounts', 'description' => 'Suspend or reinstate user login access.'],
                ],
            ],
            [
                'name' => 'Master Data & Taxonomy',
                'slug' => 'master_data',
                'description' => 'Configuration of departments, categories, and administrative units.',
                'icon' => 'cog',
                'display_order' => 5,
                'permissions' => [
                    ['slug' => 'master_data.manage', 'name' => 'Manage System Master Data', 'description' => 'Configure departments, categories, districts, and tehsils.'],
                ],
            ],
            [
                'name' => 'Analytics & SLA Reports',
                'slug' => 'reports',
                'description' => 'Performance monitoring, resolution times, and SLA compliance metrics.',
                'icon' => 'chart-bar',
                'display_order' => 6,
                'permissions' => [
                    ['slug' => 'reports.view_global', 'name' => 'View Province-Wide SLA Reports', 'description' => 'Inspect macro-level performance across all departments.'],
                    ['slug' => 'reports.view_department', 'name' => 'View Department-Scoped Analytics', 'description' => 'Inspect department-level performance metrics.'],
                ],
            ],
            [
                'name' => 'Audit Trails & Security',
                'slug' => 'audit_logs',
                'description' => 'Activity logs and compliance audit trails.',
                'icon' => 'shield-check',
                'display_order' => 7,
                'permissions' => [
                    ['slug' => 'audit_logs.view', 'name' => 'Inspect Activity & Security Logs', 'description' => 'View system-wide activity logs and change records.'],
                ],
            ],
        ];

        $permissionModels = [];
        foreach ($features as $fData) {
            $feature = Feature::firstOrCreate(
                ['slug' => $fData['slug']],
                [
                    'name' => $fData['name'],
                    'description' => $fData['description'],
                    'icon' => $fData['icon'],
                    'display_order' => $fData['display_order'],
                ]
            );

            foreach ($fData['permissions'] as $pData) {
                $permissionModels[$pData['slug']] = Permission::firstOrCreate(
                    ['slug' => $pData['slug']],
                    [
                        'feature_id' => $feature->id,
                        'name' => $pData['name'],
                        'description' => $pData['description'],
                    ]
                );
            }
        }

        // 3. Permissions Matrix Definition
        $matrix = [
            'admin' => [
                'complaints.view_all',
                'complaints.view_department',
                'complaints.view_assigned',
                'complaints.update_status',
                'complaints.resolve',
                'complaints.club_duplicates',
                'investigations.view',
                'investigations.create',
                'investigations.assign_officer',
                'investigations.submit_report',
                'reassignments.view',
                'reassignments.approve',
                'users.view',
                'users.create',
                'users.edit',
                'users.toggle_active',
                'master_data.manage',
                'reports.view_global',
                'reports.view_department',
                'audit_logs.view',
            ],
            'director' => [
                'complaints.view_department',
                'complaints.view_assigned',
                'investigations.view',
                'reassignments.view',
                'reassignments.approve',
                'users.view',
                'reports.view_department',
            ],
            'focal_person' => [
                'complaints.view_department',
                'complaints.view_assigned',
                'complaints.update_status',
                'complaints.resolve',
                'complaints.club_duplicates',
                'investigations.view',
                'investigations.create',
                'investigations.assign_officer',
                'investigations.submit_report',
                'reassignments.request',
                'reassignments.view',
                'reports.view_department',
            ],
            'field_officer' => [
                'complaints.view_assigned',
                'investigations.view',
                'investigations.submit_report',
            ],
        ];

        // Attach permissions to roles
        foreach ($matrix as $roleSlug => $permSlugs) {
            $role = $roleModels[$roleSlug];
            $permIds = [];
            foreach ($permSlugs as $slug) {
                if (isset($permissionModels[$slug])) {
                    $permIds[] = $permissionModels[$slug]->id;
                }
            }
            $role->permissions()->sync($permIds);
        }

        // 4. Sync existing users with their role_id
        foreach ($roleModels as $slug => $role) {
            User::where('role', $slug)->update(['role_id' => $role->id]);
        }
    }
}
