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
        Schema::create('message_wall_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_wall_post_id')->constrained('message_wall_posts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('parent_comment_id')->nullable()->constrained('message_wall_comments')->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();

            $table->index(['message_wall_post_id', 'created_at']);
            $table->index(['parent_comment_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('message_wall_comments');
    }
};
