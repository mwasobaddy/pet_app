<?php

namespace App\Http\Controllers;

use App\Models\Tier;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
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
     * Handle tier selection and assign role to user.
     */
    public function store(Tier $tier): RedirectResponse
    {
        $user = auth()->user();

        // Verify tier is active
        if (!$tier->is_active) {
            return back()->withErrors(['error' => 'This tier is no longer available.']);
        }

        // Assign the role associated with the tier
        if ($tier->role_name) {
            $user->syncRoles($tier->role_name);
        }

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
