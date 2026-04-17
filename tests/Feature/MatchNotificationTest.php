<?php

use App\Models\PetInteraction;
use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\SwipeEvent;
use App\Models\User;
use App\Notifications\MatchNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('mutual like creates match notifications and analytics', function () {
    $petType = PetType::create(['name' => 'Dog', 'icon' => '🐕']);

    $userA = User::factory()->create([
        'email_verified_at' => now(),
        'first_name' => 'Taylor',
        'other_names' => 'Otwell',
        'mobile_number' => '5550001234',
    ]);
    $userB = User::factory()->create(['email_verified_at' => now()]);

    $petA = PetProfile::create([
        'user_id' => $userA->id,
        'pet_type_id' => $petType->id,
        'name' => 'Buddy',
        'age' => 3,
        'gender' => 'Male',
        'description' => 'Friendly dog',
    ]);

    $petB = PetProfile::create([
        'user_id' => $userB->id,
        'pet_type_id' => $petType->id,
        'name' => 'Luna',
        'age' => 2,
        'gender' => 'Female',
        'description' => 'Playful dog',
    ]);

    PetInteraction::create([
        'from_user_id' => $userB->id,
        'to_pet_profile_id' => $petA->id,
        'interaction_type' => 'like',
    ]);

    $response = $this->actingAs($userA)->postJson(route('matching.recordInteraction'), [
        'to_pet_profile_id' => $petB->id,
        'interaction_type' => 'like',
    ]);

    $response->assertSuccessful();

    expect($userA->refresh()->notifications()->where('type', MatchNotification::class)->count())
        ->toBe(1);
    expect($userB->refresh()->notifications()->where('type', MatchNotification::class)->count())
        ->toBe(1);

    expect(SwipeEvent::where('user_id', $userA->id)->where('interaction_type', 'match')->count())
        ->toBe(1);
    expect(SwipeEvent::where('user_id', $userB->id)->where('interaction_type', 'match')->count())
        ->toBe(1);
});
