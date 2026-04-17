<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tier_id')->constrained()->cascadeOnDelete();
            $table->enum('payment_method', ['none', 'paypal', 'stripe', 'card'])->default('paypal');
            $table->enum('subscription_cycle', ['weekly', 'monthly', 'quarterly', 'yearly'])->default('monthly');
            $table->decimal('price', 8, 2);
            $table->enum('payment_status', ['pending', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->string('transaction_id')->nullable()->unique();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('auto_renew')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'payment_status']);
            $table->index(['tier_id', 'subscription_cycle']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
