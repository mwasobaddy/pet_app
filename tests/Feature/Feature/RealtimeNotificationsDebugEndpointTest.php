<?php

use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\Tier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('realtime notifications debug endpoint requires authentication', function () {
    $response = $this->getJson(route('debug.realtime-notifications'));

    $response->assertUnauthorized();
});

test('realtime notifications debug endpoint returns diagnostics for authenticated user', function () {
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

    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('free_user');

    PetProfile::create([
        'user_id' => $user->id,
        'pet_type_id' => $petType->id,
        'name' => 'Buddy',
        'age' => 3,
        'gender' => 'Male',
        'description' => 'Friendly dog',
    ]);

    $response = $this->actingAs($user)->getJson(route('debug.realtime-notifications'));

    $response->assertSuccessful();
    $response->assertJsonStructure([
        'user' => ['id', 'broadcast_channel'],
        'runtime' => ['app_env', 'broadcast_connection', 'queue_connection'],
        'reverb' => ['configured', 'host', 'port', 'scheme', 'app_key_present', 'app_secret_present'],
        'notifications' => ['total', 'unread', 'tracked_total', 'recent'],
    ]);
    $response->assertJsonPath('user.id', $user->id);
});
