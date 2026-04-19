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
        Schema::create('message_wall_post_tag', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_wall_post_id')->constrained('message_wall_posts')->cascadeOnDelete();
            $table->foreignId('message_wall_tag_id')->constrained('message_wall_tags')->cascadeOnDelete();

            $table->unique(['message_wall_post_id', 'message_wall_tag_id'], 'mw_post_tag_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('message_wall_post_tag');
    }
};
