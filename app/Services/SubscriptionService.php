<?php

namespace App\Services;

use App\Models\Tier;
use App\Models\User;
use App\Traits\CompletesUserProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;

class SubscriptionService
{
    use CompletesUserProfile;

    public function __construct(private PaymentService $paymentService) {}

    /**
     * Process subscription selection and assign tier to user.
     *
     * @return void
     */
    public function processSubscription(User $user, Tier $tier, string $paymentMethod = 'none', string $cycle = 'monthly'): void
    {
        DB::transaction(function () use ($user, $tier, $paymentMethod, $cycle) {
            // Initiate payment (or record free tier selection)
            $this->paymentService->initiatePayment($user, $tier, $paymentMethod, $cycle);

            // Assign role associated with tier
            if ($tier->role_name) {
                $user->syncRoles($tier->role_name);
            }
        });
    }

    /**
     * Determine the next step after subscription is complete.
     *
     * @return RedirectResponse
     */
    public function getNextStepRedirect(User $user): RedirectResponse
    {
        // If profile is incomplete (OAuth users), redirect to complete
        if ($this->isProfileIncomplete($user)) {
            return Redirect::route('profile.incomplete');
        }

        // If no pet profiles exist, prompt to create one
        if ($user->petProfiles()->doesntExist()) {
            return Redirect::route('pets.create');
        }

        // Otherwise go to discover page
        return Redirect::intended(route('discover'));
    }

    /**
     * Complete user profile from subscription flow.
     * Used when users need to fill missing required fields.
     *
     * @param  array<string, mixed>  $data
     * @return void
     */
    public function completeProfileFromSubscription(User $user, array $data): void
    {
        $this->completeUserProfile($user, $data);
    }
}
