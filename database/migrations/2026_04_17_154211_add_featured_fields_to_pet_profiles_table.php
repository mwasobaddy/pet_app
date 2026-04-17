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
        Schema::table('pet_profiles', function (Blueprint $table) {
            $table->boolean('is_featured_manual')->default(false)->after('description');
            $table->unsignedInteger('featured_weight')->default(0)->after('is_featured_manual');
            $table->timestamp('featured_until')->nullable()->after('featured_weight');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pet_profiles', function (Blueprint $table) {
            $table->dropColumn(['is_featured_manual', 'featured_weight', 'featured_until']);
        });
    }
};
