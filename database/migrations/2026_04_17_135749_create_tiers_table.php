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
        Schema::create('tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('role_name')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('daily_swipe_limit')->nullable();
            $table->unsignedInteger('daily_super_like_limit')->default(0);
            $table->unsignedInteger('boost_limit')->default(0);
            $table->boolean('rewind_enabled')->default(false);
            $table->boolean('full_profile_visibility')->default(false);
            $table->boolean('who_likes_you')->default(false);
            $table->boolean('read_receipts')->default(false);
            $table->unsignedInteger('media_upload_limit_videos')->nullable();
            $table->string('badge_label')->nullable();
            $table->string('badge_color')->nullable();
            $table->unsignedInteger('priority')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tiers');
    }
};
