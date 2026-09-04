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
            $table->enum('role', ['admin', 'focal_person', 'director', 'field_officer'])
                ->default('focal_person')
                ->change();

            $table->foreignId('supervisor_id')
                ->nullable()
                ->after('sub_department_id')
                ->constrained('users')
                ->onDelete('restrict');

            $table->index('supervisor_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['supervisor_id']);
            $table->dropIndex(['supervisor_id']);
            $table->dropColumn('supervisor_id');

            $table->enum('role', ['admin', 'focal_person'])
                ->default('focal_person')
                ->change();
        });
    }
};
