<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileCompletionRequest;
use App\Traits\CompletesUserProfile;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ProfileCompletionController extends Controller
{
    use CompletesUserProfile;

    /**
     * Complete the profile for Google-authenticated users.
     */
    public function update(ProfileCompletionRequest $request): RedirectResponse
    {
        $user = $request->user();

        $this->completeUserProfile($user, $request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Profile completed.'),
        ]);

        return redirect()->route('discover');
    }
}
