<?php

use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
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

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});