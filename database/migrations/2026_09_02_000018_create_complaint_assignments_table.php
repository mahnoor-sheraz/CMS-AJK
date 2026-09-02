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
        Schema::create('complaint_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained('complaints')->onDelete('restrict');
            $table->foreignId('fp_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('assigned_by')->nullable()->constrained('users')->onDelete('restrict');
            $table->timestamp('assigned_at');
            $table->timestamp('unassigned_at')->nullable();

            $table->index('complaint_id');
            $table->index('fp_id');
            $table->index('assigned_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaint_assignments');
    }
};
