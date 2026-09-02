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
        Schema::create('complaint_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained('complaints')->onDelete('restrict');
            $table->foreignId('fp_id')->constrained('users')->onDelete('restrict');
            $table->text('action_summary');
            $table->enum('resolution_status', ['resolved', 'clubbed', 'forwarded_externally', 'rejected']);
            $table->text('complainant_feedback')->nullable();
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
        Schema::dropIfExists('complaint_actions');
    }
};
