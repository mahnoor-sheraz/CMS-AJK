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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'focal_person'])->default('focal_person')->after('email');
            $table->foreignId('department_id')->nullable()->after('role')->constrained('departments')->onDelete('restrict');
            $table->foreignId('sub_department_id')->nullable()->after('department_id')->constrained('sub_departments')->onDelete('restrict');
            $table->boolean('is_active')->default(true)->after('sub_department_id');

            $table->index('department_id');
            $table->index('sub_department_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropForeign(['sub_department_id']);
            $table->dropColumn(['role', 'department_id', 'sub_department_id', 'is_active']);
        });
    }
};
