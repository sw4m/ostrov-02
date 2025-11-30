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
        Schema::table('reports', function (Blueprint $table) {
            $table->decimal('distance_to_road', 8, 2)->nullable()->after('longitude');
            $table->boolean('road_manually_selected')->default(false)->after('distance_to_road');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn(['distance_to_road', 'road_manually_selected']);
        });
    }
};
