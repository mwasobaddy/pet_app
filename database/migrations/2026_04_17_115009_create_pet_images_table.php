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
        Schema::create('pet_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_profile_id')->constrained('pet_profiles')->cascadeOnDelete();
            $table->string('path');
            $table->integer('order')->default(0);
            $table->timestamps();
            $table->index('pet_profile_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pet_images');
    }
};
