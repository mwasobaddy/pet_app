<?php

use App\Models\PetMatch;
use App\Models\MessageWallPost;
use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\Tier;
use App\Models\User;
use App\Notifications\MatchNotification;
use App\Notifications\PostCommentedNotification;
use App\Notifications\PostLikedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Helpers\WithTier;

uses(RefreshDatabase::class);
uses(WithTier::class);

test('notifications api returns matches and marks them read', function () {
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
        'first_name' => 'Taylor',
        'other_names' => 'Otwell',
        'mobile_number' => '5550001234',
    ]);
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

test('liking another users post creates a post liked notification', function () {
    $petType = PetType::create(['name' => 'Dog', 'icon' => '🐕']);

    Tier::firstOrCreate(
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

    PetProfile::create([
        'user_id' => $userB->id,
        'pet_type_id' => $petType->id,
        'name' => 'Luna',
        'age' => 2,
        'gender' => 'Female',
        'description' => 'Playful dog',
    ]);

    $post = MessageWallPost::create([
        'user_id' => $userA->id,
        'pet_profile_id' => $petA->id,
        'body' => 'A post from user A',
        'location' => 'Kampala',
        'likes_count' => 0,
        'comments_count' => 0,
        'shares_count' => 0,
    ]);

    $this->actingAs($userB)
        ->postJson(route('message-wall.posts.like', $post))
        ->assertSuccessful();

    expect($userA->refresh()->notifications()->where('type', PostLikedNotification::class)->count())
        ->toBe(1);

    $response = $this->actingAs($userA)->getJson(route('notifications.index'));

    $response->assertSuccessful();
    expect($response->json('unread_count'))->toBe(1);
    expect(collect($response->json('notifications'))->pluck('data.type')->all())
        ->toContain('post_liked');
});

test('commenting on another users post creates a post commented notification', function () {
    $petType = PetType::create(['name' => 'Dog', 'icon' => '🐕']);

    Tier::firstOrCreate(
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

    PetProfile::create([
        'user_id' => $userB->id,
        'pet_type_id' => $petType->id,
        'name' => 'Luna',
        'age' => 2,
        'gender' => 'Female',
        'description' => 'Playful dog',
    ]);

    $post = MessageWallPost::create([
        'user_id' => $userA->id,
        'pet_profile_id' => $petA->id,
        'body' => 'A post from user A',
        'location' => 'Kampala',
        'likes_count' => 0,
        'comments_count' => 0,
        'shares_count' => 0,
    ]);

    $this->actingAs($userB)
        ->postJson(route('message-wall.posts.comment', $post), [
            'body' => 'Awesome post!',
        ])
        ->assertCreated();

    expect($userA->refresh()->notifications()->where('type', PostCommentedNotification::class)->count())
        ->toBe(1);

    $response = $this->actingAs($userA)->getJson(route('notifications.index'));

    $response->assertSuccessful();
    expect($response->json('unread_count'))->toBe(1);
    expect(collect($response->json('notifications'))->pluck('data.type')->all())
        ->toContain('post_commented');
});
