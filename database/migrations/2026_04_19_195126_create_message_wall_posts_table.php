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
        Schema::create('message_wall_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('pet_profile_id')->nullable()->constrained('pet_profiles')->nullOnDelete();
            $table->text('body')->nullable();
            $table->string('media_path')->nullable();
            $table->string('media_type')->nullable();
            $table->string('location')->nullable();
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->unsignedInteger('shares_count')->default(0);
            $table->timestamps();

            $table->index(['created_at', 'id']);
            $table->index(['likes_count', 'comments_count', 'shares_count']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('message_wall_posts');
    }
};
