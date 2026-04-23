<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileCompletionRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ProfileCompletionController extends Controller
{
    /**
     * Complete the profile for Google-authenticated users.
     */
    public function update(ProfileCompletionRequest $request): RedirectResponse
    {
        $user = $request->user();

        $user->fill([
            'first_name' => $request->string('first_name')->toString(),
            'other_names' => $request->string('other_names')->toString(),
            'mobile_number' => $request->string('mobile_number')->toString(),
            'password' => Hash::make($request->string('password')->toString()),
            'password_set_at' => now(),
        ]);

        $user->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Profile completed.'),
        ]);

        return redirect()->route('discover');
    }
}
