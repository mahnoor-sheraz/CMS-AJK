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
        Schema::create('complaint_clubs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('primary_complaint_id')->constrained('complaints')->onDelete('restrict');
            $table->foreignId('clubbed_complaint_id')->unique()->constrained('complaints')->onDelete('restrict');
            $table->foreignId('clubbed_by')->constrained('users')->onDelete('restrict');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('primary_complaint_id');
            $table->index('clubbed_complaint_id');
            $table->index('clubbed_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaint_clubs');
    }
};
