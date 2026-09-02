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
        Schema::create('complaint_external_forwards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained('complaints')->onDelete('restrict');
            $table->foreignId('destination_id')->constrained('forward_destinations')->onDelete('restrict');
            $table->foreignId('forwarded_by')->constrained('users')->onDelete('restrict');
            $table->text('remarks')->nullable();
            $table->timestamp('forwarded_at');
            $table->timestamp('response_received_at')->nullable();
            $table->text('response_notes')->nullable();
            $table->timestamps();

            $table->index('complaint_id');
            $table->index('destination_id');
            $table->index('forwarded_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaint_external_forwards');
    }
};
