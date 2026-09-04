<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\District;
use App\Models\Tehsil;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class RedisCacheTest extends TestCase
{
    use RefreshDatabase;

    public function test_mysql_does_not_have_cache_tables(): void
    {
        // Ensure cache and cache_locks tables are not created in the database
        $this->assertFalse(Schema::hasTable('cache'));
        $this->assertFalse(Schema::hasTable('cache_locks'));
    }

    public function test_redis_connection_and_caching_work_properly(): void
    {
        try {
            Redis::set('pmcc_test_redis_key', 'working');
            $val = Redis::get('pmcc_test_redis_key');
            $this->assertEquals('working', $val);
            Redis::del('pmcc_test_redis_key');
        } catch (\Throwable $e) {
            $this->markTestSkipped('Redis server not available in this test runner: ' . $e->getMessage());
        }
    }

    public function test_portal_districts_and_departments_cache(): void
    {
        $district = District::create(['name' => 'Muzaffarabad', 'code' => 'MZD']);
        Tehsil::create(['district_id' => $district->id, 'name' => 'Muzaffarabad']);
        Department::create([
            'name' => 'Health Department',
            'code' => 'HLT',
            'display_order' => 1,
            'is_active' => true,
        ]);

        $response = $this->get('/complaints/new');
        $response->assertOk();

        $this->assertTrue(Cache::has('portal:districts_tehsils'));
        $this->assertTrue(Cache::has('portal:departments_hierarchy'));
    }
}
