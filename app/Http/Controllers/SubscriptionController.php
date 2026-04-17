<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\Tier;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}

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

        // Verify tier is active
        if (! $tier->is_active) {
            return back()->withErrors(['error' => 'This tier is no longer available.']);
        }

        // If free tier, complete subscription immediately
        if ($tier->slug === 'free') {
            $this->paymentService->initiatePayment(
                $user,
                $tier,
                'none',
                'monthly'
            );

            $this->assignRoleAndRedirect($user, $tier);

            return $this->redirectToNextStep($user);
        }

        // For paid tiers, redirect to payment selection
        return redirect()->route('subscription.payment', $tier);
    }

    /**
     * Complete subscription after payment.
     */
    public function complete(Tier $tier): RedirectResponse
    {
        $user = auth()->user();

        // Verify tier is active
        if (! $tier->is_active) {
            return back()->withErrors(['error' => 'This tier is no longer available.']);
        }

        $this->assignRoleAndRedirect($user, $tier);

        return $this->redirectToNextStep($user);
    }

    /**
     * Assign role to user and update subscription.
     */
    private function assignRoleAndRedirect(
        User $user,
        Tier $tier
    ): void {
        // Assign the role associated with the tier
        if ($tier->role_name) {
            $user->syncRoles($tier->role_name);
        }
    }

    /**
     * Redirect to next step after subscription.
     */
    private function redirectToNextStep(User $user): RedirectResponse
    {
        // Redirect to profile completion or dashboard
        if (! $user->first_name || ! $user->other_names) {
            return redirect()->route('profile.incomplete');
        }

        if ($user->petProfiles()->doesntExist()) {
            return redirect()->route('pets.create');
        }

        return redirect()->route('dashboard');
    }
}
