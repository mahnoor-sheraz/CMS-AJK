<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->string('cnic', 13)->nullable()->after('citizen_id');
            $table->index(['complaint_number', 'cnic'], 'complaints_number_cnic_index');
            $table->index(['cnic', 'complaint_number'], 'complaints_cnic_number_index');
        });

        // Backfill cnic on existing complaints from citizens table
        $complaints = DB::table('complaints')->whereNull('cnic')->get(['id', 'citizen_id']);
        foreach ($complaints as $complaint) {
            $citizenCnic = DB::table('citizens')->where('id', $complaint->citizen_id)->value('cnic');
            if ($citizenCnic) {
                DB::table('complaints')->where('id', $complaint->id)->update(['cnic' => $citizenCnic]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropIndex('complaints_number_cnic_index');
            $table->dropIndex('complaints_cnic_number_index');
            $table->dropColumn('cnic');
        });
    }
};
