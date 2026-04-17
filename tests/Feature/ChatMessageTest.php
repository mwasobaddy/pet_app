<?php

use App\Models\Conversation;
use App\Models\PetMatch;
use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('creates a conversation from a match and sends messages', function () {
    $petType = PetType::create(['name' => 'Dog', 'icon' => '🐕']);

    $userA = User::factory()->create(['email_verified_at' => now()]);
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

    $match = PetMatch::create([
        'pet_profile_1_id' => min($petA->id, $petB->id),
        'pet_profile_2_id' => max($petA->id, $petB->id),
        'matched_at' => now(),
    ]);

    $response = $this->actingAs($userA)->get(route('chat.match', $match));
    $response->assertRedirect();

    $conversation = Conversation::query()->where('match_id', $match->id)->first();
    expect($conversation)->not->toBeNull();

    $messageResponse = $this->actingAs($userA)->postJson(route('chat.messages.store', $conversation), [
        'body' => 'Hello there!',
    ]);

    $messageResponse->assertSuccessful();

    $conversation->refresh();
    expect($conversation->last_message_at)->not->toBeNull();
});
