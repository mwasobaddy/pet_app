<?php

use App\Models\MatchingPreference;
use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::findOrCreate('free_user');
    PetType::create(['name' => 'Dog', 'icon' => '🐕']);
});

test('users without matching preferences are redirected from discover', function () {
    $user = User::factory()->create([
        'first_name' => 'John',
        'other_names' => 'Smith',
        'mobile_number' => '555-1234',
        'google_id' => 'google-456',
        'email_verified_at' => now(),
        'password_set_at' => now(),
    ]);

    $user->assignRole('free_user');

    PetProfile::create([
        'user_id' => $user->id,
        'pet_type_id' => PetType::first()->id,
        'name' => 'Buddy',
        'age' => 3,
        'gender' => 'Male',
        'description' => 'A friendly dog',
    ]);

    $response = $this->actingAs($user)->get(route('discover'));

    $response->assertRedirect(route('matching.preferences'));
    $response->assertSessionHas('warning', 'Please set your matching preferences before accessing Discover.');
});

test('users can view matching preferences page', function () {
    $user = User::factory()->create([
        'first_name' => 'John',
        'other_names' => 'Smith',
        'mobile_number' => '555-1234',
        'google_id' => 'google-456',
        'email_verified_at' => now(),
        'password_set_at' => now(),
    ]);

    $user->assignRole('free_user');

    PetProfile::create([
        'user_id' => $user->id,
        'pet_type_id' => PetType::first()->id,
        'name' => 'Buddy',
        'age' => 3,
        'gender' => 'Male',
        'description' => 'A friendly dog',
    ]);

    $response = $this->actingAs($user)->get(route('matching.preferences'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('matching/preferences')
            ->where('sidebarOpen', false)
            ->has('options.pet_types')
            ->where('preference', null)
        );
});

test('saving matching preferences allows access to discover', function () {
    $user = User::factory()->create([
        'first_name' => 'Jane',
        'other_names' => 'Doe',
        'mobile_number' => '555-1234',
        'google_id' => 'google-456',
        'email_verified_at' => now(),
        'password_set_at' => now(),
    ]);

    $user->assignRole('free_user');

    PetProfile::create([
        'user_id' => $user->id,
        'pet_type_id' => PetType::first()->id,
        'name' => 'Buddy',
        'age' => 3,
        'gender' => 'Male',
        'description' => 'A friendly dog',
    ]);

    $response = $this->actingAs($user)->post(route('matching.preferences.store'), [
        'distance_min' => 5,
        'distance_max' => 50,
        'pet_gender' => 'Female',
        'pet_age_min' => 25,
        'pet_age_max' => 40,
        'pet_type_ids' => [PetType::first()->id],
    ]);

    $response->assertRedirect(route('discover'));
    $this->assertDatabaseHas('matching_preferences', [
        'user_id' => $user->id,
        'distance_min' => 5,
        'distance_max' => 50,
        'pet_gender' => 'Female',
        'pet_age_min' => 25,
        'pet_age_max' => 40,
    ]);

    $preference = MatchingPreference::where('user_id', $user->id)->first();
    expect($preference)->not->toBeNull();
    expect($preference->preferredPetTypes()->pluck('pet_types.id')->toArray())->toEqual([PetType::first()->id]);

    $discoverResponse = $this->actingAs($user)->get(route('discover'));
    $discoverResponse->assertOk();
});
