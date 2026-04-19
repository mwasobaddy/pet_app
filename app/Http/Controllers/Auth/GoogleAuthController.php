<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\CreateOrUpdateUserFromGoogleAuth;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function __construct(
        private CreateOrUpdateUserFromGoogleAuth $createOrUpdateUser
    ) {}

    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle the OAuth callback and authenticate the user.
     */
    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            $user = ($this->createOrUpdateUser)->execute($googleUser);

            Auth::login($user, remember: true);

            if ($this->requiresProfileCompletion($user)) {
                return redirect()->route('profile.incomplete');
            }

            return redirect()->intended('/discover');
        } catch (\Exception $e) {
            Log::error('Google authentication failed', [
                'error' => $e->getMessage(),
            ]);

            return redirect('/login')
                ->with('error', 'Google authentication failed. Please try again.');
        }
    }

    private function requiresProfileCompletion($user): bool
    {
        return blank($user->first_name)
            || blank($user->other_names)
            || blank($user->mobile_number)
            || $user->password_set_at === null;
    }
}
