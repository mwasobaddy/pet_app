<?php

use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\SwipeEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('analytics summary returns swipe counts and match rate', function () {
    $petType = PetType::create(['name' => 'Dog', 'icon' => '🐕']);

    $user = User::factory()->create([
        'email_verified_at' => now(),
        'first_name' => 'Taylor',
        'other_names' => 'Otwell',
        'mobile_number' => '5550001234',
    ]);
    $otherUser = User::factory()->create(['email_verified_at' => now()]);

    PetProfile::create([
        'user_id' => $user->id,
        'pet_type_id' => $petType->id,
        'name' => 'Rex',
        'age' => 4,
        'gender' => 'Male',
        'description' => 'User pet',
    ]);

    $pet = PetProfile::create([
        'user_id' => $otherUser->id,
        'pet_type_id' => $petType->id,
        'name' => 'Buddy',
        'age' => 3,
        'gender' => 'Male',
        'description' => 'Friendly dog',
    ]);

    SwipeEvent::create([
        'user_id' => $user->id,
        'pet_profile_id' => $pet->id,
        'interaction_type' => 'pass',
        'source' => 'swipe',
    ]);

    SwipeEvent::create([
        'user_id' => $user->id,
        'pet_profile_id' => $pet->id,
        'interaction_type' => 'like',
        'source' => 'swipe',
    ]);

    SwipeEvent::create([
        'user_id' => $user->id,
        'pet_profile_id' => $pet->id,
        'interaction_type' => 'super_like',
        'source' => 'swipe',
    ]);

    SwipeEvent::create([
        'user_id' => $user->id,
        'pet_profile_id' => $pet->id,
        'interaction_type' => 'match',
        'source' => 'match',
    ]);

    $response = $this->actingAs($user)->getJson(route('analytics.summary'));

    $response->assertSuccessful();
    expect($response->json('swipes.pass'))->toBe(1);
    expect($response->json('swipes.like'))->toBe(1);
    expect($response->json('swipes.super_like'))->toBe(1);
    expect($response->json('swipes.total'))->toBe(3);
    expect($response->json('matches'))->toBe(1);
    expect($response->json('match_rate'))->toBe(0.5);
});
