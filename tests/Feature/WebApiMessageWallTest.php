<?php

use App\Models\User;
use App\Models\PetType;
use App\Models\PetProfile;
use App\Models\Tier;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can access web-api message wall endpoint', function () {
    // Create tier
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

    // Create user
    $user = User::factory()->create(['email_verified_at' => now()]);
    $user->assignRole('free_user');

    // Create pet profile
    $petType = PetType::create(['name' => 'Dog', 'icon' => '🐕']);
    PetProfile::create([
        'user_id' => $user->id,
        'pet_type_id' => $petType->id,
        'name' => 'Buddy',
        'age' => 3,
        'gender' => 'Male',
        'description' => 'Friendly dog',
    ]);

    // Test the web-api endpoint
    $response = $this->actingAs($user)->getJson('/web-api/message-wall');
    
    dd("Status: " . $response->status(), $response->json());
});
