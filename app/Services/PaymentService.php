<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\Tier;
use App\Models\User;

class PaymentService
{
    /**
     * Determine which payment provider to use based on configuration
     */
    public function getPaymentProvider(): string
    {
        return config('services.payment.provider', 'paypal');
    }

    /**
     * Initialize payment for a tier subscription
     */
    public function initiatePayment(
        User $user,
        Tier $tier,
        string $paymentMethod,
        string $cycle = 'monthly'
    ): Subscription {
        if ($tier->slug === 'free') {
            return $this->completeFreeSubscription($user, $tier, $cycle);
        }

        $price = $this->calculatePrice($tier, $cycle);

        $subscription = Subscription::create([
            'user_id' => $user->id,
            'tier_id' => $tier->id,
            'payment_method' => $paymentMethod,
            'subscription_cycle' => $cycle,
            'price' => $price,
            'payment_status' => 'pending',
        ]);

        return $subscription;
    }

    /**
     * Complete free tier subscription immediately
     */
    private function completeFreeSubscription(User $user, Tier $tier, string $cycle): Subscription
    {
        return Subscription::create([
            'user_id' => $user->id,
            'tier_id' => $tier->id,
            'payment_method' => 'free',
            'subscription_cycle' => $cycle,
            'price' => 0,
            'payment_status' => 'completed',
            'transaction_id' => 'free-'.$user->id.'-'.time(),
            'started_at' => now(),
            'expires_at' => $this->calculateExpiryDate($cycle),
            'auto_renew' => true,
        ]);
    }

    /**
     * Calculate price based on tier and subscription cycle
     */
    private function calculatePrice(Tier $tier, string $cycle): float
    {
        $basePrice = $tier->price ?? 9.99;

        return match ($cycle) {
            'weekly' => $basePrice / 4,
            'monthly' => $basePrice,
            'quarterly' => $basePrice * 3 * 0.9, // 10% discount
            'yearly' => $basePrice * 12 * 0.2, // 20% discount
            default => $basePrice,
        };
    }

    /**
     * Calculate expiry date based on subscription cycle
     */
    private function calculateExpiryDate(string $cycle): \DateTime
    {
        return match ($cycle) {
            'weekly' => now()->addWeek(),
            'monthly' => now()->addMonth(),
            'quarterly' => now()->addMonths(3),
            'yearly' => now()->addYear(),
            default => now()->addMonth(),
        };
    }

    /**
     * Mark subscription as paid
     */
    public function markAsPaid(Subscription $subscription, string $transactionId): void
    {
        $subscription->update([
            'payment_status' => 'completed',
            'transaction_id' => $transactionId,
            'started_at' => now(),
            'expires_at' => $this->calculateExpiryDate($subscription->subscription_cycle),
        ]);
    }

    /**
     * Mark subscription as failed
     */
    public function markAsFailed(Subscription $subscription, ?string $reason = null): void
    {
        $subscription->update([
            'payment_status' => 'failed',
            'notes' => $reason,
        ]);
    }

    /**
     * Cancel subscription
     */
    public function cancelSubscription(Subscription $subscription): void
    {
        $subscription->update([
            'payment_status' => 'cancelled',
            'auto_renew' => false,
        ]);
    }
}
