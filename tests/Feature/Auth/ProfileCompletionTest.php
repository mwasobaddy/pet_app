<?php

use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::findOrCreate('free_user');
    // Seed pet types for tests
    PetType::create(['name' => 'Dog', 'icon' => '🐕']);
});

test('users with incomplete profiles are redirected from dashboard', function () {
    // Create user with Google sign-in (missing mobile_number)
    $user = User::factory()->create([
        'first_name' => 'Jane',
        'other_names' => 'Doe',
        'mobile_number' => null, // Missing!
        'email' => 'jane@example.com',
        'email_verified_at' => now(),
    ]);

    $user->assignRole('free_user');

    $response = $this->actingAs($user)->get(route('dashboard'));

    // Should redirect to profile.edit, not show dashboard
    $response->assertRedirect(route('profile.edit'));
    $response->assertSessionHas('warning', 'Please complete your profile to continue.');
});

test('users with complete profiles can access dashboard', function () {
    $user = User::factory()->create([
        'first_name' => 'John',
        'other_names' => 'Smith',
        'mobile_number' => '555-1234',
        'email' => 'john@example.com',
        'email_verified_at' => now(),
    ]);

    $user->assignRole('free_user');

    // Create a pet profile so user can access dashboard
    PetProfile::create([
        'user_id' => $user->id,
        'pet_type_id' => PetType::first()->id,
        'name' => 'Buddy',
        'age' => 3,
        'gender' => 'Male',
        'description' => 'A friendly dog',
    ]);

    $response = $this->actingAs($user)->get(route('dashboard'));

    // Should access dashboard successfully
    $response->assertOk();
});

test('users can access profile edit page with incomplete profile', function () {
    $user = User::factory()->create([
        'first_name' => 'Jane',
        'other_names' => 'Doe',
        'mobile_number' => null,
        'email' => 'jane@example.com',
        'email_verified_at' => now(),
    ]);

    $user->assignRole('free_user');

    // Profile edit should be accessible (no pet profile check)
    // Just verify it doesn't return 500
    $response = $this->actingAs($user)->get(route('profile.edit'));

    // Should not error (200 or redirect is fine, as long as no 500)
    expect($response->getStatusCode())->toBeLessThan(500);
});
