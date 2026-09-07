<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE complaints MODIFY status ENUM('submitted', 'under_investigation', 'pending_field_visit', 'clubbed', 'forwarded_external', 'not_resolvable', 'resolved', 'rejected', 'escalated_to_admin') DEFAULT 'submitted'");
        DB::statement("ALTER TABLE complaint_actions MODIFY resolution_status ENUM('resolved', 'clubbed', 'forwarded_externally', 'rejected', 'escalated') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE complaints MODIFY status ENUM('submitted', 'under_investigation', 'pending_field_visit', 'clubbed', 'forwarded_external', 'not_resolvable', 'resolved', 'rejected') DEFAULT 'submitted'");
        DB::statement("ALTER TABLE complaint_actions MODIFY resolution_status ENUM('resolved', 'clubbed', 'forwarded_externally', 'rejected') NOT NULL");
    }
};
