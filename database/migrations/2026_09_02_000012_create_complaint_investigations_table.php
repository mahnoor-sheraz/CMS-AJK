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
        Schema::create('complaint_investigations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained('complaints')->onDelete('restrict');
            $table->foreignId('fp_id')->constrained('users')->onDelete('restrict');
            $table->enum('investigation_type', [
                'known_duplicate',
                'not_resolvable_legislation',
                'not_resolvable_social',
                'federal_jurisdiction',
                'private_business',
                'govt_service',
                'field_visit',
                'complainant_interaction',
                'other_tribunal'
            ]);
            $table->text('notes')->nullable();
            $table->string('location')->nullable();
            $table->timestamp('visit_datetime')->nullable();
            $table->timestamps();

            $table->index('complaint_id');
            $table->index('fp_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaint_investigations');
    }
};
