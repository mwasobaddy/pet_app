<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::findOrCreate('free_user');
});

test('new users can sign in with google', function () {
    Socialite::fake('google', (new SocialiteUser)->map([
        'id' => 'google-123',
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
    ]));

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('profile.incomplete', absolute: false));
    $this->assertAuthenticated();

    $this->assertDatabaseHas('users', [
        'first_name' => 'Jane',
        'other_names' => 'Doe',
        'email' => 'jane@example.com',
        'google_id' => 'google-123',
    ]);

    $user = User::query()->where('email', 'jane@example.com')->firstOrFail();

    expect($user->email_verified_at)->not->toBeNull();
    expect($user->hasAnyRole('free_user', 'vip_user', 'svip_user'))->toBeFalse();
    expect($user->password_set_at)->toBeNull();
});

test('existing users keep their profile data when they sign in with google', function () {
    $existingUser = User::factory()->create([
        'first_name' => 'Existing',
        'other_names' => 'Person',
        'mobile_number' => '+254700000004',
        'google_id' => null,
        'email' => 'existing@example.com',
        'email_verified_at' => null,
    ]);

    Socialite::fake('google', (new SocialiteUser)->map([
        'id' => 'google-999',
        'name' => 'Google Changed Name',
        'email' => 'existing@example.com',
    ]));

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('discover', absolute: false));
    $this->assertAuthenticatedAs($existingUser);

    $existingUser->refresh();

    expect($existingUser->first_name)->toBe('Existing');
    expect($existingUser->other_names)->toBe('Person');
    expect($existingUser->mobile_number)->toBe('+254700000004');
    expect($existingUser->google_id)->toBe('google-999');
    expect($existingUser->email_verified_at)->not->toBeNull();
});

test('repeat google logins do not modify existing user profile fields', function () {
    $existingUser = User::factory()->create([
        'first_name' => 'Stable',
        'other_names' => 'Profile',
        'mobile_number' => '+254700000005',
        'google_id' => 'google-777',
        'email' => 'stable@example.com',
    ]);

    $originalVerifiedAt = $existingUser->email_verified_at;

    Socialite::fake('google', (new SocialiteUser)->map([
        'id' => 'google-777',
        'name' => 'Different Google Name',
        'email' => 'stable@example.com',
    ]));

    $response = $this->get(route('auth.google.callback'));

    $response->assertRedirect(route('discover', absolute: false));
    $this->assertAuthenticatedAs($existingUser);

    $existingUser->refresh();

    expect($existingUser->first_name)->toBe('Stable');
    expect($existingUser->other_names)->toBe('Profile');
    expect($existingUser->mobile_number)->toBe('+254700000005');
    expect($existingUser->email_verified_at?->toDateTimeString())
        ->toBe($originalVerifiedAt?->toDateTimeString());
});
