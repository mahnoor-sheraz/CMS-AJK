<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE complaint_investigations MODIFY investigation_type ENUM('known_duplicate', 'not_resolvable_legislation', 'not_resolvable_social', 'federal_jurisdiction', 'private_business', 'govt_service', 'field_visit', 'complainant_interaction', 'other_tribunal', 'progress_note', 'handle_directly', 'club_with_existing', 'forward_externally', 'schedule_field_visit') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE complaint_investigations MODIFY investigation_type ENUM('known_duplicate', 'not_resolvable_legislation', 'not_resolvable_social', 'federal_jurisdiction', 'private_business', 'govt_service', 'field_visit', 'complainant_interaction', 'other_tribunal') NOT NULL");
    }
};
