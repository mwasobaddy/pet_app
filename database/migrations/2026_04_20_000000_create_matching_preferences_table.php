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
        Schema::create('matching_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('distance_min')->default(1);
            $table->integer('distance_max')->default(100);
            $table->enum('pet_gender', ['Male', 'Female', 'Unknown'])->default('Unknown');
            $table->integer('pet_age_min')->nullable();
            $table->integer('pet_age_max')->nullable();
            $table->timestamps();
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matching_preferences');
    }
};
