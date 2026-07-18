<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cooperatives', function (Blueprint $table) {
            $table->renameColumn('nik_cooperative', 'nib_cooperative');
            $table->renameColumn('legal_entity_type', 'legal_approval_document');
            $table->renameColumn('legal_entity_number', 'legal_approval_number');
        });

        DB::statement('ALTER INDEX cooperatives_nik_cooperative_unique RENAME TO cooperatives_nib_cooperative_unique');
    }

    public function down(): void
    {
        DB::statement('ALTER INDEX cooperatives_nib_cooperative_unique RENAME TO cooperatives_nik_cooperative_unique');

        Schema::table('cooperatives', function (Blueprint $table) {
            $table->renameColumn('nib_cooperative', 'nik_cooperative');
            $table->renameColumn('legal_approval_document', 'legal_entity_type');
            $table->renameColumn('legal_approval_number', 'legal_entity_number');
        });
    }
};