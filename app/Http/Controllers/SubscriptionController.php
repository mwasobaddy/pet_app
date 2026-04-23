<?php

namespace App\Http\Controllers;

use App\Models\Tier;
use App\Services\SubscriptionService;
use App\Traits\CompletesUserProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    use CompletesUserProfile;

    public function __construct(private SubscriptionService $subscriptionService) {}

    /**
     * Show the subscription/tier selection page.
     */
    public function select(): Response
    {
        $tiers = Tier::where('is_active', true)
            ->orderBy('priority')
            ->get();

        return Inertia::render('subscription/select', [
            'tiers' => $tiers,
        ]);
    }

    /**
     * Show payment method selection for paid tiers.
     */
    public function payment(Tier $tier): Response|RedirectResponse
    {
        if ($tier->slug === 'free') {
            return redirect()->route('subscription.select');
        }

        return Inertia::render('subscription/payment', [
            'tier' => $tier,
            'paymentMethods' => ['paypal', 'stripe', 'card'],
            'cycles' => ['weekly', 'monthly', 'quarterly', 'yearly'],
        ]);
    }

    /**
     * Handle tier selection - free or process payment.
     */
    public function store(Request $request, Tier $tier): RedirectResponse
    {
        $user = auth()->user();

        if (! $tier->is_active) {
            return back()->withErrors(['error' => 'This tier is no longer available.']);
        }

        $paymentMethod = $tier->slug === 'free' ? 'none' : $request->string('payment_method', 'card')->toString();
        $cycle = $request->string('cycle', 'monthly')->toString();

        $this->subscriptionService->processSubscription($user, $tier, $paymentMethod, $cycle);

        if ($tier->slug === 'free') {
            return $this->subscriptionService->getNextStepRedirect($user);
        }

        return redirect()->route('subscription.payment', $tier);
    }

    /**
     * Complete subscription after payment.
     */
    public function complete(Tier $tier): RedirectResponse
    {
        $user = auth()->user();

        if (! $tier->is_active) {
            return back()->withErrors(['error' => 'This tier is no longer available.']);
        }

        return $this->subscriptionService->getNextStepRedirect($user);
    }
}
