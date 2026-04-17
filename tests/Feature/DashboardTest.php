<?php

use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\Tier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
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

    $user = User::factory()->create();
    $user->assignRole('free_user');

    $petType = PetType::create(['name' => 'Dog', 'icon' => '🐕']);

    PetProfile::create([
        'user_id' => $user->id,
        'pet_type_id' => $petType->id,
        'name' => 'Buddy',
        'age' => 3,
        'gender' => 'Male',
        'description' => 'Friendly dog',
    ]);

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});
