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
        Schema::create('citizens', function (Blueprint $table) {
            $table->id();
            $table->string('cnic', 13)->unique();
            $table->string('name');
            $table->string('mobile_number');
            $table->foreignId('district_id')->constrained('districts')->onDelete('restrict');
            $table->foreignId('tehsil_id')->constrained('tehsils')->onDelete('restrict');
            $table->timestamps();

            $table->index('cnic');
            $table->index('district_id');
            $table->index('tehsil_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citizens');
    }
};
