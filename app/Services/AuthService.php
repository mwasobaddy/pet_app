<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Validate user credentials and retrieve user.
     *
     * @throws ValidationException
     */
    public function validateCredentials(string $email, string $password): User
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->email_verified_at) {
            throw ValidationException::withMessages([
                'email' => ['Please verify your email address before logging in.'],
            ]);
        }

        return $user;
    }

    /**
     * Register a new user.
     *
     * @throws ValidationException
     */
    public function registerUser(array $data): User
    {
        return User::create([
            'first_name' => $data['first_name'],
            'other_names' => $data['other_names'] ?? null,
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'email_verified_at' => now(),
            'password_set_at' => now(),
        ]);
    }

    /**
     * Create API token for user on device.
     *
     * @return string The plain text token
     */
    public function createToken(User $user, string $deviceName): string
    {
        return $user->createToken($deviceName)->plainTextToken;
    }

    /**
     * Revoke current token.
     *
     * @return void
     */
    public function revokeToken(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }

    /**
     * Revoke all user tokens.
     *
     * @return void
     */
    public function revokeAllTokens(User $user): void
    {
        $user->tokens()->delete();
    }
}
