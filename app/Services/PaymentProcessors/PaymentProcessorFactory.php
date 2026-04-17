<?php

namespace App\Services\PaymentProcessors;

use InvalidArgumentException;

class PaymentProcessorFactory
{
    /**
     * Create a payment processor instance
     */
    public static function make(string $method): PaymentProcessor
    {
        return match ($method) {
            'paypal' => new PayPalProcessor,
            'stripe' => new StripeProcessor,
            'card' => new CardProcessor,
            default => throw new InvalidArgumentException("Unknown payment method: {$method}"),
        };
    }

    /**
     * Get configured payment processor
     */
    public static function fromConfig(): PaymentProcessor
    {
        $provider = config('services.payment.provider', 'paypal');

        return self::make($provider);
    }
}
