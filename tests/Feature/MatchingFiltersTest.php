<?php

use App\Models\PetPersonalityTag;
use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\TierSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->seed(TierSeeder::class);
});

test('free users do not get advanced filters', function () {
    $petType = PetType::create(['name' => 'Dog', 'icon' => '🐕']);

    $viewer = User::factory()->create(['email_verified_at' => now()]);
    $viewer->assignRole('free_user');

    PetProfile::create([
        'user_id' => $viewer->id,
        'pet_type_id' => $petType->id,
        'name' => 'Viewer Dog',
        'breed' => 'Beagle',
        'age' => 3,
        'gender' => 'Male',
        'description' => 'Viewer pet',
    ]);

    $petA = PetProfile::create([
        'user_id' => User::factory()->create()->id,
        'pet_type_id' => $petType->id,
        'name' => 'Buddy',
        'breed' => 'Golden Retriever',
        'age' => 2,
        'gender' => 'Male',
        'description' => 'Friendly',
    ]);

    $petB = PetProfile::create([
        'user_id' => User::factory()->create()->id,
        'pet_type_id' => $petType->id,
        'name' => 'Luna',
        'breed' => 'Beagle',
        'age' => 8,
        'gender' => 'Female',
        'description' => 'Playful',
    ]);

    $response = $this->actingAs($viewer)->getJson(route('matching.recommendations', [
        'age_min' => 10,
        'breed' => 'Beagle',
        'limit' => 10,
    ]));

    $response->assertSuccessful();
    expect($response->json('filters.advanced_allowed'))->toBeFalse();
    expect($response->json('recommendations'))->toHaveCount(2);
    expect(collect($response->json('recommendations'))->pluck('id'))
        ->toContain($petA->id)
        ->toContain($petB->id);
});

test('vip users can filter by advanced fields', function () {
    $petType = PetType::create(['name' => 'Dog', 'icon' => '🐕']);
    $tag = PetPersonalityTag::create(['name' => 'Friendly', 'description' => 'Friendly']);

    $viewer = User::factory()->create(['email_verified_at' => now()]);
    $viewer->assignRole('vip_user');

    PetProfile::create([
        'user_id' => $viewer->id,
        'pet_type_id' => $petType->id,
        'name' => 'Viewer Dog',
        'breed' => 'Beagle',
        'age' => 3,
        'gender' => 'Male',
        'description' => 'Viewer pet',
    ]);

    $matchingPet = PetProfile::create([
        'user_id' => User::factory()->create()->id,
        'pet_type_id' => $petType->id,
        'name' => 'Bobby',
        'breed' => 'Beagle',
        'age' => 4,
        'gender' => 'Male',
        'description' => 'Friendly beagle',
    ]);
    $matchingPet->personalityTags()->attach($tag->id);

    PetProfile::create([
        'user_id' => User::factory()->create()->id,
        'pet_type_id' => $petType->id,
        'name' => 'Nala',
        'breed' => 'Labrador',
        'age' => 6,
        'gender' => 'Female',
        'description' => 'Calm',
    ]);

    $response = $this->actingAs($viewer)->getJson(route('matching.recommendations', [
        'breed' => 'Beagle',
        'gender' => 'Male',
        'personality_tags' => [$tag->id],
        'limit' => 10,
    ]));

    $response->assertSuccessful();
    expect($response->json('filters.advanced_allowed'))->toBeTrue();
    expect($response->json('recommendations'))->toHaveCount(1);
    expect($response->json('recommendations.0.id'))->toBe($matchingPet->id);
});
