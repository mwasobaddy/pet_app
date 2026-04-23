<?php

namespace App\Traits;

use Illuminate\Support\Facades\Hash;

trait CompletesUserProfile
{
    /**
     * Complete user profile with required fields.
     * Used when profile is required (e.g., after OAuth or subscription signup).
     *
     * @param  array<string, mixed>  $data
     * @return void
     */
    protected function completeUserProfile($user, array $data): void
    {
        $user->fill([
            'first_name' => $data['first_name'],
            'other_names' => $data['other_names'] ?? $user->other_names,
            'mobile_number' => $data['mobile_number'] ?? $user->mobile_number,
            'password' => isset($data['password']) ? Hash::make($data['password']) : $user->password,
            'password_set_at' => isset($data['password']) ? now() : $user->password_set_at,
        ])->save();
    }

    /**
     * Check if user profile is incomplete.
     * Profile is incomplete if authenticated via OAuth and missing required fields.
     *
     * @return bool
     */
    protected function isProfileIncomplete($user): bool
    {
        if (blank($user->google_id)) {
            return false;
        }

        return blank($user->first_name)
            || blank($user->other_names)
            || blank($user->mobile_number)
            || $user->password_set_at === null;
    }
}
