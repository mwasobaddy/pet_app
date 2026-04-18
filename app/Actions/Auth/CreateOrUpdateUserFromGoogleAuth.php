<?php

namespace App\Actions\Auth;

use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Socialite\Two\User as GoogleUser;

class CreateOrUpdateUserFromGoogleAuth
{
    /**
     * Create or update a user from Google OAuth credentials.
     */
    public function execute(GoogleUser $googleUser): User
    {
        $googleId = $googleUser->getId();
        $email = $googleUser->getEmail();

        $user = User::query()
            ->where('google_id', $googleId)
            ->orWhere('email', $email)
            ->first();

        if ($user === null) {
            return $this->createNewUser($googleUser, $googleId, $email);
        }

        $this->updateExistingUser($user, $googleId);

        return $user;
    }

    /**
     * Create a new user from Google authentication.
     */
    private function createNewUser(GoogleUser $googleUser, string $googleId, string $email): User
    {
        [$firstName, $otherNames] = $this->splitName($googleUser->getName());

        $user = User::create([
            'first_name' => $firstName,
            'other_names' => $otherNames,
            'mobile_number' => null,
            'google_id' => $googleId,
            'email' => $email,
            'email_verified_at' => now(),
            'password' => bcrypt(Str::random(32)),
            'password_set_at' => null,
        ]);

        return $user;
    }

    /**
     * Update an existing user with OAuth information.
     */
    private function updateExistingUser(User $user, string $googleId): void
    {
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
