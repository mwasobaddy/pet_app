<?php

use App\Events\MatchCreated;
use App\Models\PetInteraction;
use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

test('match creation broadcasts event', function () {
    Event::fake([MatchCreated::class]);

    $petType = PetType::create(['name' => 'Dog', 'icon' => '🐕']);

    $userA = User::factory()->create([
        'email_verified_at' => now(),
    ]);

    $userB = User::factory()->create([
        'email_verified_at' => now(),
    ]);

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

    Event::assertDispatched(MatchCreated::class, function (MatchCreated $event) use ($userA, $userB) {
        return in_array($userA->id, [$event->userIdA, $event->userIdB], true)
            && in_array($userB->id, [$event->userIdA, $event->userIdB], true);
    });
});
