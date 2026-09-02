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
        Schema::create('complaint_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('complaint_id')->constrained('complaints')->onDelete('restrict');
            $table->string('file_path');
            $table->string('file_type');
            $table->enum('uploaded_by_type', ['citizen', 'focal_person']);
            $table->foreignId('uploaded_by_user_id')->nullable()->constrained('users')->onDelete('restrict');
            $table->timestamps();

            $table->index('complaint_id');
            $table->index('uploaded_by_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaint_attachments');
    }
};
