<?php

namespace Tests\Feature;

use App\Models\Complaint;
use App\Models\ComplaintInvestigation;
use App\Models\ComplaintReassignmentRequest;
use App\Models\Department;
use App\Models\District;
use App\Models\Tehsil;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class FocalPersonSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_role_supports_director_and_field_officer(): void
    {
        $department = Department::create([
            'name' => 'Health Department',
            'code' => 'HLT',
            'display_order' => 1,
            'is_active' => true,
        ]);

        $director = User::create([
            'name' => 'Director Health',
            'email' => 'director.health@ajk.gov.pk',
            'password' => bcrypt('password123'),
            'role' => 'director',
            'department_id' => $department->id,
            'is_active' => true,
        ]);

        $fieldOfficer = User::create([
            'name' => 'Field Officer Muzaffarabad',
            'email' => 'fo.mzd@ajk.gov.pk',
            'password' => bcrypt('password123'),
            'role' => 'field_officer',
            'department_id' => $department->id,
            'is_active' => true,
        ]);

        $this->assertEquals('director', $director->fresh()->role);
        $this->assertTrue($director->isDirector());
        $this->assertFalse($director->isFieldOfficer());

        $this->assertEquals('field_officer', $fieldOfficer->fresh()->role);
        $this->assertTrue($fieldOfficer->isFieldOfficer());
        $this->assertFalse($fieldOfficer->isDirector());
    }

    public function test_users_supervisor_id_self_referencing_and_restrict_on_delete(): void
    {
        $this->assertTrue(Schema::hasColumn('users', 'supervisor_id'));

        $director = User::create([
            'name' => 'Director Admin',
            'email' => 'director.admin@ajk.gov.pk',
            'password' => bcrypt('password123'),
            'role' => 'director',
            'is_active' => true,
        ]);

        $fieldOfficer = User::create([
            'name' => 'Field Officer 1',
            'email' => 'fo1@ajk.gov.pk',
            'password' => bcrypt('password123'),
            'role' => 'field_officer',
            'supervisor_id' => $director->id,
            'is_active' => true,
        ]);

        // Verify relationships
        $this->assertEquals($director->id, $fieldOfficer->supervisor->id);
        $this->assertTrue($director->subordinates->contains($fieldOfficer));

        // Verify restrict on delete
        $this->expectException(QueryException::class);
        $director->delete();
    }

    public function test_complaint_investigations_assigned_officer_id_and_restrict_on_delete(): void
    {
        $this->assertTrue(Schema::hasColumn('complaint_investigations', 'assigned_officer_id'));

        $department = Department::create([
            'name' => 'Health Department',
            'code' => 'HLT',
            'display_order' => 1,
            'is_active' => true,
        ]);

        $fp = User::create([
            'name' => 'Focal Person',
            'email' => 'fp.test@ajk.gov.pk',
            'password' => bcrypt('password123'),
            'role' => 'focal_person',
            'department_id' => $department->id,
            'is_active' => true,
        ]);

        $fieldOfficer = User::create([
            'name' => 'Assigned Officer',
            'email' => 'officer.assigned@ajk.gov.pk',
            'password' => bcrypt('password123'),
            'role' => 'field_officer',
            'department_id' => $department->id,
            'supervisor_id' => $fp->id,
            'is_active' => true,
        ]);

        $district = District::create(['name' => 'Muzaffarabad', 'code' => 'MZD']);
        $tehsil = Tehsil::create(['district_id' => $district->id, 'name' => 'Muzaffarabad']);
        $channel = \App\Models\Channel::create(['name' => 'Web Portal', 'code' => 'WEB']);

        $citizen = \App\Models\Citizen::create([
            'name' => 'Citizen Test',
            'cnic' => '8110111223344',
            'mobile_number' => '03001122334',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
        ]);

        $complaint = Complaint::create([
            'complaint_number' => 'PMCC-2026-999999',
            'citizen_id' => $citizen->id,
            'channel_id' => $channel->id,
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'department_id' => $department->id,
            'subject' => 'Field Inspection Required',
            'details' => 'Detailed complaint description for field inspection testing purposes here.',
            'stage' => 'investigation_by_department',
            'status' => 'under_investigation',
        ]);

        $investigation = ComplaintInvestigation::create([
            'complaint_id' => $complaint->id,
            'fp_id' => $fp->id,
            'assigned_officer_id' => $fieldOfficer->id,
            'investigation_type' => 'field_visit',
            'notes' => 'Site visit assigned to field officer',
            'location' => 'Ward 5',
        ]);

        // Verify relationships
        $this->assertEquals($fieldOfficer->id, $investigation->assignedOfficer->id);
        $this->assertTrue($fieldOfficer->assignedInvestigations->contains($investigation));

        // Verify restrict on delete
        $this->expectException(QueryException::class);
        $fieldOfficer->delete();
    }

    public function test_complaint_reassignment_requests_schema_and_relationships(): void
    {
        $this->assertTrue(Schema::hasTable('complaint_reassignment_requests'));
        $this->assertTrue(Schema::hasColumns('complaint_reassignment_requests', [
            'id',
            'complaint_id',
            'requested_by',
            'from_department_id',
            'to_department_id',
            'reason',
            'status',
            'reviewed_by',
            'reviewed_at',
            'review_notes',
            'created_at',
            'updated_at',
        ]));

        $deptHealth = Department::create([
            'name' => 'Health Department',
            'code' => 'HLT',
            'display_order' => 1,
            'is_active' => true,
        ]);

        $deptEducation = Department::create([
            'name' => 'Education Department',
            'code' => 'EDU',
            'display_order' => 2,
            'is_active' => true,
        ]);

        $fp = User::create([
            'name' => 'Focal Person Health',
            'email' => 'fp.hlt@ajk.gov.pk',
            'password' => bcrypt('password123'),
            'role' => 'focal_person',
            'department_id' => $deptHealth->id,
            'is_active' => true,
        ]);

        $admin = User::create([
            'name' => 'System Admin',
            'email' => 'admin.test@ajk.gov.pk',
            'password' => bcrypt('password123'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $district = District::create(['name' => 'Muzaffarabad', 'code' => 'MZD']);
        $tehsil = Tehsil::create(['district_id' => $district->id, 'name' => 'Muzaffarabad']);
        $channel = \App\Models\Channel::create(['name' => 'Web Portal 2', 'code' => 'WEB2']);

        $citizen2 = \App\Models\Citizen::create([
            'name' => 'Citizen Test 2',
            'cnic' => '8110199887711',
            'mobile_number' => '03009988771',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
        ]);

        $complaint = Complaint::create([
            'complaint_number' => 'PMCC-2026-888888',
            'citizen_id' => $citizen2->id,
            'channel_id' => $channel->id,
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'department_id' => $deptHealth->id,
            'subject' => 'School Dispensary Issue',
            'details' => 'This issue pertains to the Education department school premises rather than Health.',
            'stage' => 'application_submission',
            'status' => 'submitted',
        ]);

        $request = ComplaintReassignmentRequest::create([
            'complaint_id' => $complaint->id,
            'requested_by' => $fp->id,
            'from_department_id' => $deptHealth->id,
            'to_department_id' => $deptEducation->id,
            'reason' => 'This issue pertains to school building maintenance managed by Education Department.',
            'status' => 'pending',
        ]);

        $this->assertEquals('pending', $request->status);
        $this->assertEquals($complaint->id, $request->complaint->id);
        $this->assertEquals($fp->id, $request->requester->id);
        $this->assertEquals($deptHealth->id, $request->fromDepartment->id);
        $this->assertEquals($deptEducation->id, $request->toDepartment->id);
        $this->assertNull($request->reviewer);

        // Verify reverse relationships
        $this->assertTrue($complaint->reassignmentRequests->contains($request));
        $this->assertTrue($fp->requestedReassignments->contains($request));
        $this->assertTrue($deptHealth->outgoingReassignments->contains($request));
        $this->assertTrue($deptEducation->incomingReassignments->contains($request));

        // Review the request
        $request->update([
            'status' => 'approved',
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
            'review_notes' => 'Transfer verified and approved to Education Department.',
        ]);

        $this->assertEquals('approved', $request->fresh()->status);
        $this->assertEquals($admin->id, $request->fresh()->reviewer->id);
        $this->assertTrue($admin->reviewedReassignments->contains($request));

        // Verify foreign key restrict on delete
        $this->expectException(QueryException::class);
        $deptHealth->delete();
    }
}
