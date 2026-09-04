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
        Schema::table('complaint_investigations', function (Blueprint $table) {
            $table->foreignId('assigned_officer_id')
                ->nullable()
                ->after('fp_id')
                ->constrained('users')
                ->onDelete('restrict');

            $table->index('assigned_officer_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('complaint_investigations', function (Blueprint $table) {
            $table->dropForeign(['assigned_officer_id']);
            $table->dropIndex(['assigned_officer_id']);
            $table->dropColumn('assigned_officer_id');
        });
    }
};
