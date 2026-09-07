<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('complaint_investigations', function (Blueprint $table) {
            $table->enum('investigation_type', [
                'known_duplicate',
                'not_resolvable_legislation',
                'not_resolvable_social',
                'federal_jurisdiction',
                'private_business',
                'govt_service',
                'field_visit',
                'complainant_interaction',
                'other_tribunal',
                'handle_directly',
                'club_with_existing',
                'forward_externally',
                'schedule_field_visit',
                'progress_note',
            ])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('complaint_investigations', function (Blueprint $table) {
            $table->enum('investigation_type', [
                'known_duplicate',
                'not_resolvable_legislation',
                'not_resolvable_social',
                'federal_jurisdiction',
                'private_business',
                'govt_service',
                'field_visit',
                'complainant_interaction',
                'other_tribunal',
            ])->change();
        });
    }
};
