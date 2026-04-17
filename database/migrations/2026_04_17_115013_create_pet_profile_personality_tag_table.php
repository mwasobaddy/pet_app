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
        Schema::create('pet_profile_personality_tag', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_profile_id')->constrained('pet_profiles')->cascadeOnDelete();
            $table->foreignId('pet_personality_tag_id')->constrained('pet_personality_tags')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['pet_profile_id', 'pet_personality_tag_id']);
            $table->index('pet_profile_id');
            $table->index('pet_personality_tag_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pet_profile_personality_tag');
    }
};
