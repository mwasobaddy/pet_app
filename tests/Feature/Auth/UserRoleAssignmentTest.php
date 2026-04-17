<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Ensure the 'free_user' role exists (idempotent using findOrCreate)
    Role::findOrCreate('free_user');
});

test('new user is assigned free user role on registration', function () {
    $response = $this->post(route('register.store'), [
        'first_name' => 'John',
        'other_names' => 'Doe',
        'mobile_number' => '555-1234',
        'email' => 'john@example.com',
        'password' => 'Password@123',
        'password_confirmation' => 'Password@123',
    ]);

    $user = User::where('email', 'john@example.com')->first();

    expect($user)->not->toBeNull();
    expect($user->hasRole('free_user'))->toBeTrue();
});

test('user cannot have duplicate free user roles', function () {
    $user = User::factory()->create();

    // Assign role twice
    $user->assignRole('free_user');
    $user->assignRole('free_user');

    // Should still have exactly one 'free_user' role
    expect($user->roles()->where('name', 'free_user')->count())->toBe(1);
});

test('registered user has free user role and can be authenticated', function () {
    $response = $this->post(route('register.store'), [
        'first_name' => 'Jane',
        'other_names' => 'Smith',
        'mobile_number' => '555-5678',
        'email' => 'jane@example.com',
        'password' => 'Password@123',
        'password_confirmation' => 'Password@123',
    ]);

    $user = User::where('email', 'jane@example.com')->first();

    // Verify user role is assigned
    expect($user->hasRole('free_user'))->toBeTrue();

    // Verify user is authenticated after registration
    expect($this->isAuthenticated())->toBeTrue();
});
