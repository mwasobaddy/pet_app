<?php

use App\Events\MatchCreated;
use App\Models\PetInteraction;
use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\Tier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\Helpers\WithTier;

uses(RefreshDatabase::class);
uses(WithTier::class);

test('match creation broadcasts event', function () {
    Event::fake([MatchCreated::class]);

    $petType = PetType::create(['name' => 'Dog', 'icon' => '🐕']);

    $tier = Tier::firstOrCreate(
        ['slug' => 'free'],
        [
            'name' => 'Free',
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
        ]
    );

    $userA = User::factory()->create([
        'email_verified_at' => now(),
    ]);
    $userA->assignRole('free_user');

    $userB = User::factory()->create([
        'email_verified_at' => now(),
    ]);
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
