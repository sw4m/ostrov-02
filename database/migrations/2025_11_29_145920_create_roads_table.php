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
        Schema::create('roads', function (Blueprint $table) {
            $table->id();
            $table->string('osm_id')->unique();

            $table->string('name');
            $table->decimal('condition', 3, 2)->default(1)->nullable();
            $table->string('highway_type');
            $table->json('geometry');

            $table->decimal('bbox_min_lat', 10, 7);
            $table->decimal('bbox_max_lat', 10, 7);
            $table->decimal('bbox_min_lng', 10, 7);
            $table->decimal('bbox_max_lng', 10, 7);
            $table->index(['bbox_min_lat', 'bbox_max_lat', 'bbox_min_lng', 'bbox_max_lng']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roads');
    }
};
