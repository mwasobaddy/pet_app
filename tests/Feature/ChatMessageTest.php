<?php

use App\Models\Conversation;
use App\Models\PetMatch;
use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\Tier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('creates a conversation from a match and sends messages', function () {
    $petType = PetType::create(['name' => 'Dog', 'icon' => '🐕']);

    $tier = Tier::create([
        'name' => 'Free',
        'slug' => 'free',
        'description' => 'Free tier',
        'daily_swipe_limit' => 10,
        'daily_super_like_limit' => 0,
        'boost_limit' => 0,
        'rewind_enabled' => false,
        'full_profile_visibility' => false,
        'who_likes_you' => false,
        'read_receipts' => false,
        'media_upload_limit_videos' => 0,
        'badge_label' => null,
        'badge_color' => null,
        'role_name' => 'free_user',
        'priority' => 1,
        'is_active' => true,
    ]);

    $userA = User::factory()->create(['email_verified_at' => now()]);
    $userA->assignRole('free_user');

    $userB = User::factory()->create(['email_verified_at' => now()]);
    $userB->assignRole('free_user');

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
