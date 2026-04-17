<?php

namespace App\Services\PaymentProcessors;

use App\Models\Subscription;

interface PaymentProcessor
{
    /**
     * Initiate payment and return redirect URL or payment token
     */
    public function initiatePayment(Subscription $subscription): array;

    /**
     * Handle payment callback/webhook
     */
    public function handleCallback(array $data): bool;

    /**
     * Verify payment status
     */
    public function verifyPayment(string $transactionId): bool;

    /**
     * Refund a payment
     */
    public function refund(Subscription $subscription): bool;
}
