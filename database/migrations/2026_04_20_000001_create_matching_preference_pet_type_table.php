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
        Schema::create('matching_preference_pet_type', function (Blueprint $table) {
            $table->id();
            $table->foreignId('matching_preference_id')
                ->constrained('matching_preferences')
                ->cascadeOnDelete();
            $table->foreignId('pet_type_id')
                ->constrained('pet_types')
                ->cascadeOnDelete();
            $table->unique(['matching_preference_id', 'pet_type_id'], 'matching_preference_pet_type_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matching_preference_pet_type');
    }
};
