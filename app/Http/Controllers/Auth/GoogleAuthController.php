<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Obtain the user information from Google.
     */
    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            $googleId = $googleUser->getId();
            $email = $googleUser->getEmail();

            $user = User::query()
                ->where('google_id', $googleId)
                ->orWhere('email', $email)
                ->first();

            if ($user === null) {
                [$firstName, $otherNames] = $this->splitName($googleUser->getName());

                $user = User::create([
                    'first_name' => $firstName,
                    'other_names' => $otherNames,
                    'mobile_number' => null,
                    'google_id' => $googleId,
                    'email' => $email,
                    'email_verified_at' => now(),
                    'password' => Hash::make(Str::random(32)),
                ]);

                $user->assignRole('free_user');
            } else {
                $updates = [];

                if (blank($user->google_id) && filled($googleId)) {
                    $updates['google_id'] = $googleId;
                }

                if ($user->email_verified_at === null) {
                    $updates['email_verified_at'] = now();
                }

                if ($updates !== []) {
                    $user->forceFill($updates)->save();
                }
            }

            Auth::login($user, remember: true);

            return redirect()->intended('/dashboard');
        } catch (\Exception $e) {
            return redirect('/login')->with('error', 'Google authentication failed: '.$e->getMessage());
        }
    }

    /**
     * Split a full name into first name and remaining names.
     *
     * @return array{0: string, 1: string|null}
     */
    private function splitName(?string $name): array
    {
        $safeName = trim((string) $name);

        if ($safeName === '') {
            return ['Google User', null];
        }

        $segments = preg_split('/\s+/', $safeName) ?: [];
        $firstName = array_shift($segments) ?: 'Google User';
        $otherNames = trim(implode(' ', $segments));

        return [$firstName, $otherNames !== '' ? $otherNames : null];
    }
}
