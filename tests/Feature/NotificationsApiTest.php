<?php

use App\Models\PetMatch;
use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\User;
use App\Notifications\MatchNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('notifications api returns matches and marks them read', function () {
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

    $match = PetMatch::create([
        'pet_profile_1_id' => min($petA->id, $petB->id),
        'pet_profile_2_id' => max($petA->id, $petB->id),
        'matched_at' => now(),
    ]);

    $userA->notify(new MatchNotification($match, $userA->id));

    $response = $this->actingAs($userA)->getJson(route('notifications.index'));

    $response->assertSuccessful();
    expect($response->json('notifications'))->toHaveCount(1);
    expect($response->json('unread_count'))->toBe(1);
    expect($response->json('notifications.0.data.match_id'))->toBe($match->id);

    $notificationId = $response->json('notifications.0.id');

    $this->actingAs($userA)->postJson(route('notifications.read', $notificationId))
        ->assertSuccessful();

    expect($userA->refresh()->unreadNotifications()->count())->toBe(0);
});
