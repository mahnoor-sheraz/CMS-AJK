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
        Schema::create('complaint_similarity_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained('complaints')->onDelete('restrict');
            $table->foreignId('matched_complaint_id')->constrained('complaints')->onDelete('restrict');
            $table->decimal('similarity_score', 5, 4);
            $table->enum('status', ['pending', 'confirmed', 'dismissed'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('restrict');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index('complaint_id');
            $table->index('matched_complaint_id');
            $table->index('similarity_score');
            $table->index('reviewed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaint_similarity_matches');
    }
};
