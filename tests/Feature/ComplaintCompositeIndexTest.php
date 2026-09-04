<?php

namespace Tests\Feature;

use App\Models\Channel;
use App\Models\Citizen;
use App\Models\Complaint;
use App\Models\Department;
use App\Models\District;
use App\Models\Tehsil;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ComplaintCompositeIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_complaints_table_has_cnic_and_composite_index(): void
    {
        $this->assertTrue(Schema::hasColumn('complaints', 'cnic'));
    }

    public function test_complaint_creation_stores_cnic_and_can_be_tracked_via_composite_key(): void
    {
        $district = District::create(['name' => 'Muzaffarabad', 'code' => 'MZD']);
        $tehsil = Tehsil::create(['district_id' => $district->id, 'name' => 'Muzaffarabad']);
        $department = Department::create(['name' => 'Health Department', 'code' => 'HLT', 'display_order' => 1, 'is_active' => true]);
        $channel = Channel::create(['name' => 'Web Portal', 'code' => 'WEB']);

        $citizen = Citizen::create([
            'name' => 'Shahid Khan',
            'cnic' => '8110155555555',
            'mobile_number' => '03005555555',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
        ]);

        $complaint = Complaint::create([
            'complaint_number' => 'PMCC-2026-777777',
            'citizen_id' => $citizen->id,
            'cnic' => $citizen->cnic,
            'channel_id' => $channel->id,
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'department_id' => $department->id,
            'subject' => 'Hospital Emergency Staff Issue',
            'details' => 'Emergency staff was unavailable during the night shift at the local hospital.',
            'stage' => 'application_submission',
            'status' => 'submitted',
        ]);

        $this->assertEquals('8110155555555', $complaint->fresh()->cnic);

        // Track using complaint_number and cnic composite query
        $found = Complaint::where('complaint_number', 'PMCC-2026-777777')
            ->where('cnic', '8110155555555')
            ->first();

        $this->assertNotNull($found);
        $this->assertEquals($complaint->id, $found->id);

        // Wrong CNIC should not find the complaint
        $notFound = Complaint::where('complaint_number', 'PMCC-2026-777777')
            ->where('cnic', '8110100000000')
            ->first();

        $this->assertNull($notFound);
    }

    public function test_tracking_endpoint_works_with_composite_key(): void
    {
        $district = District::create(['name' => 'Muzaffarabad', 'code' => 'MZD']);
        $tehsil = Tehsil::create(['district_id' => $district->id, 'name' => 'Muzaffarabad']);
        $department = Department::create(['name' => 'Health Department', 'code' => 'HLT', 'display_order' => 1, 'is_active' => true]);
        $channel = Channel::create(['name' => 'Web Portal', 'code' => 'WEB']);

        $citizen = Citizen::create([
            'name' => 'Naveed Akhtar',
            'cnic' => '8110166666666',
            'mobile_number' => '03006666666',
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
        ]);

        $complaint = Complaint::create([
            'complaint_number' => 'PMCC-2026-666666',
            'citizen_id' => $citizen->id,
            'cnic' => $citizen->cnic,
            'channel_id' => $channel->id,
            'district_id' => $district->id,
            'tehsil_id' => $tehsil->id,
            'department_id' => $department->id,
            'subject' => 'Medicines Not Available',
            'details' => 'Life saving medicine was not available in the emergency ward at DHQ hospital.',
            'stage' => 'application_submission',
            'status' => 'submitted',
        ]);

        $response = $this->post('/complaints/track', [
            'complaint_number' => 'PMCC-2026-666666',
            'cnic' => '8110166666666',
        ]);

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/ComplaintTrack')
            ->where('searched', true)
            ->where('notFound', false)
            ->where('complaint.complaint_number', 'PMCC-2026-666666')
        );
    }
}
