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
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->string('complaint_number')->unique()->nullable();
            $table->foreignId('citizen_id')->constrained('citizens')->onDelete('restrict');
            $table->foreignId('channel_id')->constrained('channels')->onDelete('restrict');
            $table->foreignId('district_id')->constrained('districts')->onDelete('restrict');
            $table->foreignId('tehsil_id')->constrained('tehsils')->onDelete('restrict');
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('restrict');
            $table->foreignId('sub_department_id')->nullable()->constrained('sub_departments')->onDelete('restrict');
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('restrict');
            $table->boolean('is_uncategorized')->default(false);
            $table->string('subject', 100);
            $table->text('details');
            $table->json('embedding')->nullable();
            $table->foreignId('assigned_fp_id')->nullable()->constrained('users')->onDelete('restrict');
            $table->enum('status', [
                'submitted',
                'under_investigation',
                'pending_field_visit',
                'clubbed',
                'forwarded_external',
                'not_resolvable',
                'resolved',
                'rejected'
            ])->default('submitted');
            $table->enum('stage', [
                'application_submission',
                'investigation_by_department',
                'updated_info'
            ])->default('application_submission');
            $table->foreignId('admin_assigned_by')->nullable()->constrained('users')->onDelete('restrict');
            $table->text('admin_remarks')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();

            $table->index('complaint_number');
            $table->index('citizen_id');
            $table->index('channel_id');
            $table->index('district_id');
            $table->index('tehsil_id');
            $table->index('department_id');
            $table->index('sub_department_id');
            $table->index('category_id');
            $table->index('assigned_fp_id');
            $table->index('admin_assigned_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
