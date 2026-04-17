export interface SubscriptionCycle {
    value: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    label: string;
    description: string;
}

export interface PaymentMethod {
    id: 'paypal' | 'stripe' | 'card';
    label: string;
    icon: string;
    description: string;
}

export const SUBSCRIPTION_CYCLES: SubscriptionCycle[] = [
    {
        value: 'weekly',
        label: 'Weekly',
        description: 'Renews every week'
    },
    {
        value: 'monthly',
        label: 'Monthly',
        description: 'Renews every month'
    },
    {
        value: 'quarterly',
        label: 'Quarterly',
        description: '3 months - Save 10%'
    },
    {
        value: 'yearly',
        label: 'Yearly',
        description: '12 months - Save 20%'
    }
];

export const PAYMENT_METHODS: PaymentMethod[] = [
    {
        id: 'paypal',
        label: 'PayPal',
        icon: 'paypal',
        description: 'Fast and secure payment with PayPal'
    },
    {
        id: 'stripe',
        label: 'Stripe',
        icon: 'stripe',
        description: 'Credit/Debit card via Stripe'
    },
    {
        id: 'card',
        label: 'Card',
        icon: 'card',
        description: 'Direct card payment'
    }
];
