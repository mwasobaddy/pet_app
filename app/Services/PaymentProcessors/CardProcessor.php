<?php

namespace App\Services\PaymentProcessors;

use App\Models\Subscription;

class CardProcessor implements PaymentProcessor
{
    public function initiatePayment(Subscription $subscription): array
    {
        // Return card payment form data
        return [
            'type' => 'form',
            'fields' => [
                'card_number',
                'expiry',
                'cvc',
                'cardholder_name',
            ],
            'method' => 'POST',
        ];
    }

    public function handleCallback(array $data): bool
    {
        // Process card payment
        // TODO: Implement card processing (potentially through Stripe, 2Checkout, etc.)
        return isset($data['card_number']) && $this->verifyPayment($data['transaction_id']);
    }

    public function verifyPayment(string $transactionId): bool
    {
        // Verify card payment
        // TODO: Implement card payment verification
        return true;
    }

    public function refund(Subscription $subscription): bool
    {
        // TODO: Implement card refund
        return true;
    }
}
