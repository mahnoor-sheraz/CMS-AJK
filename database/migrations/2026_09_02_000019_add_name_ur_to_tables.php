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
        Schema::table('districts', function (Blueprint $table) {
            $table->string('name_ur')->nullable()->after('name');
        });

        Schema::table('tehsils', function (Blueprint $table) {
            $table->string('name_ur')->nullable()->after('name');
        });

        Schema::table('departments', function (Blueprint $table) {
            $table->string('name_ur')->nullable()->after('name');
        });

        Schema::table('sub_departments', function (Blueprint $table) {
            $table->string('name_ur')->nullable()->after('name');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->string('name_ur')->nullable()->after('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('districts', function (Blueprint $table) {
            $table->dropColumn('name_ur');
        });

        Schema::table('tehsils', function (Blueprint $table) {
            $table->dropColumn('name_ur');
        });

        Schema::table('departments', function (Blueprint $table) {
            $table->dropColumn('name_ur');
        });

        Schema::table('sub_departments', function (Blueprint $table) {
            $table->dropColumn('name_ur');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('name_ur');
        });
    }
};
