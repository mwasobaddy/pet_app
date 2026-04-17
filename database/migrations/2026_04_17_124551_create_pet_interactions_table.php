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
        Schema::create('pet_interactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('to_pet_profile_id')->constrained('pet_profiles')->cascadeOnDelete();
            $table->enum('interaction_type', ['pass', 'like', 'super_like']);
            $table->timestamps();
            $table->unique(['from_user_id', 'to_pet_profile_id', 'interaction_type']);
            $table->index('from_user_id');
            $table->index('to_pet_profile_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pet_interactions');
    }
};
