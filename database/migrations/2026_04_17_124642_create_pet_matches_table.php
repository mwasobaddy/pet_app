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
        Schema::create('pet_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_profile_1_id')->constrained('pet_profiles')->cascadeOnDelete();
            $table->foreignId('pet_profile_2_id')->constrained('pet_profiles')->cascadeOnDelete();
            $table->timestamp('matched_at');
            $table->timestamps();
            $table->unique(['pet_profile_1_id', 'pet_profile_2_id']);
            $table->index('pet_profile_1_id');
            $table->index('pet_profile_2_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pet_matches');
    }
};
