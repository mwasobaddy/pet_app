import { Head, useForm } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SUBSCRIPTION_CYCLES, PAYMENT_METHODS } from '@/lib/payment';
import subscription from '@/routes/subscription';

interface Tier {
    id: number;
    name: string;
    slug: string;
    price: number;
}

export default function PaymentPage({ tier, paymentMethods, cycles }: { tier: Tier; paymentMethods: string[]; cycles: string[] }) {
    const [selectedCycle, setSelectedCycle] = useState<string>('monthly');
    const [selectedMethod, setSelectedMethod] = useState<string>(paymentMethods[0] || 'paypal');
    const { post, processing, setData } = useForm({
        payment_method: paymentMethods[0] || 'paypal',
        subscription_cycle: 'monthly',
    });

    const handlePayment = () => {
        post(subscription.complete.url({ tier: tier.id }));
    };

    const calculatePrice = (cycle: string): number => {
        const basePrice = tier.price || 9.99;

        switch (cycle) {
            case 'weekly':
                return basePrice / 4;
            case 'monthly':
                return basePrice;
            case 'quarterly':
                return basePrice * 3 * 0.9; // 10% discount
            case 'yearly':
                return basePrice * 12 * 0.2; // 20% discount
            default:
                return basePrice;
        }
    };

    const currentPrice = calculatePrice(selectedCycle);

    return (
        <>
            <Head title={`Payment - ${tier.name}`} />

            <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                            Complete Your {tier.name} Subscription
                        </h1>
                        <p className="text-muted-foreground">
                            Choose your billing cycle and payment method
                        </p>
                    </div>

                    <div className="grid gap-8">
                        {/* Subscription Cycles */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Billing Cycle</CardTitle>
                                <CardDescription>
                                    Select how often you want to be charged
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {SUBSCRIPTION_CYCLES.map((cycle) => (
                                        cycles.includes(cycle.value) ? (
                                            <div key={cycle.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted cursor-pointer"
                                                 onClick={() => {
                                                setSelectedCycle(cycle.value);
                                                setData('subscription_cycle', cycle.value);
                                            }}>
                                                <input
                                                    type="radio"
                                                    name="subscription_cycle"
                                                    checked={selectedCycle === cycle.value}
                                                    onChange={() => {
                                                    setSelectedCycle(cycle.value);
                                                    setData('subscription_cycle', cycle.value);
                                                }}
                                                    className="h-4 w-4"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium">{cycle.label}</div>
                                                    <div className="text-sm text-muted-foreground">{cycle.description}</div>
                                                </div>
                                                <div className="text-lg font-semibold">
                                                    ${calculatePrice(cycle.value).toFixed(2)}
                                                </div>
                                            </div>
                                        ) : null
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Methods */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Payment Method</CardTitle>
                                <CardDescription>
                                    Choose how you want to pay
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {PAYMENT_METHODS.map((method) => (
                                        paymentMethods.includes(method.id) ? (
                                            <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted cursor-pointer"
                                                 onClick={() => {
                                                     setSelectedMethod(method.id);
                                                     setData('payment_method', method.id);
                                                 }}>
                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    checked={selectedMethod === method.id}
                                                    onChange={() => {
                                                    setSelectedMethod(method.id);
                                                    setData('payment_method', method.id);
                                                }}
                                                    className="h-4 w-4"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium">{method.label}</div>
                                                    <div className="text-sm text-muted-foreground">{method.description}</div>
                                                </div>
                                            </div>
                                        ) : null
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{tier.name} Plan</span>
                                        <span>${currentPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Cycle</span>
                                        <span className="capitalize">{selectedCycle}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Payment Method</span>
                                        <span className="capitalize">{selectedMethod}</span>
                                    </div>
                                    <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                                        <span>Total</span>
                                        <span>${currentPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col gap-4">
                                <div className="flex items-start gap-2 w-full text-sm text-muted-foreground">
                                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <p>
                                        Your subscription will auto-renew on the same schedule. You can cancel anytime in your account settings.
                                    </p>
                                </div>
                                <Button
                                    onClick={handlePayment}
                                    disabled={processing}
                                    className="w-full"
                                    size="lg"
                                >
                                    {processing ? 'Processing...' : `Pay $${currentPrice.toFixed(2)}`}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
