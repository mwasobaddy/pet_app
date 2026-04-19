<?php

use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\Subscription;
use App\Models\Tier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

function createFreeTier(): Tier
{
    Role::firstOrCreate(['name' => 'free_user', 'guard_name' => 'web']);

    return Tier::create([
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
}

test('free tier store completes without payment route redirect', function () {
    $tier = createFreeTier();
    $user = User::factory()->create();

    $petType = PetType::create(['name' => 'Dog', 'icon' => '🐕']);

    PetProfile::create([
        'user_id' => $user->id,
        'pet_type_id' => $petType->id,
        'name' => 'Buddy',
        'age' => 3,
        'gender' => 'Male',
        'description' => 'Friendly dog',
    ]);

    $response = $this->actingAs($user)
        ->post(route('subscription.store', $tier));

    $response->assertRedirect(route('discover'));

    $subscription = Subscription::where('user_id', $user->id)
        ->where('tier_id', $tier->id)
        ->latest('id')
        ->first();

    expect($subscription)->not->toBeNull();
    expect($subscription->payment_method)->toBe('none');
    expect($subscription->payment_status)->toBe('completed');
});

test('payment page for free tier redirects to subscription select', function () {
    $tier = createFreeTier();
    $user = User::factory()->create();

    $petType = PetType::create(['name' => 'Dog', 'icon' => '🐕']);

    PetProfile::create([
        'user_id' => $user->id,
        'pet_type_id' => $petType->id,
        'name' => 'Buddy',
        'age' => 3,
        'gender' => 'Male',
        'description' => 'Friendly dog',
    ]);

    $response = $this->actingAs($user)
        ->get(route('subscription.payment', $tier));

    $response->assertRedirect(route('subscription.select'));
});
