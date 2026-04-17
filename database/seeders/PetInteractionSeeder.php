<?php

namespace Database\Seeders;

use App\Models\PetInteraction;
use App\Models\PetMatch;
use App\Models\PetProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class PetInteractionSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $petProfiles = PetProfile::all();

        // Get specific users for interaction examples
        $alice = $users->firstWhere('email', 'kelvinramsiel@gmail.com');
        $bob = $users->firstWhere('email', 'kelvinramsiel01@gmail.com');
        $charlie = $users->firstWhere('email', 'charlie@example.com');
        $diana = $users->firstWhere('email', 'diana@example.com');
        $eve = $users->firstWhere('email', 'eve@example.com');
        $frank = $users->firstWhere('email', 'frank@example.com');

        // Get pets grouped by owner
        $alicePets = $petProfiles->where('user_id', $alice->id);
        $bobPets = $petProfiles->where('user_id', $bob->id);
        $charliePets = $petProfiles->where('user_id', $charlie->id);
        $dianaPets = $petProfiles->where('user_id', $diana->id);
        $evePets = $petProfiles->where('user_id', $eve->id);
        $frankPets = $petProfiles->where('user_id', $frank->id);

        // Create sample interactions (swipes)
        // Alice likes Bob's Luna
        if ($alicePets->isNotEmpty() && $bobPets->isNotEmpty()) {
            PetInteraction::firstOrCreate(
                [
                    'from_user_id' => $alice->id,
                    'to_pet_profile_id' => $bobPets->first()->id,
                    'interaction_type' => 'like',
                ]
            );
        }

        // Bob likes Alice's Max
        if ($bobPets->isNotEmpty() && $alicePets->isNotEmpty()) {
            PetInteraction::firstOrCreate(
                [
                    'from_user_id' => $bob->id,
                    'to_pet_profile_id' => $alicePets->first()->id,
                    'interaction_type' => 'like',
                ]
            );

            // Create a match between Alice's Max and Bob's Luna
            PetMatch::firstOrCreate(
                [
                    'pet_profile_1_id' => $alicePets->first()->id,
                    'pet_profile_2_id' => $bobPets->first()->id,
                ],
                [
                    'pet_profile_1_id' => $alicePets->first()->id,
                    'pet_profile_2_id' => $bobPets->first()->id,
                    'matched_at' => now()->subHours(2),
                ]
            );
        }

        // Bob super_likes Diana's Bella
        if ($bobPets->count() > 1 && $dianaPets->isNotEmpty()) {
            PetInteraction::firstOrCreate(
                [
                    'from_user_id' => $bob->id,
                    'to_pet_profile_id' => $dianaPets->first()->id,
                    'interaction_type' => 'super_like',
                ]
            );
        }

        // Diana likes Bob's Charlie
        if ($dianaPets->isNotEmpty() && $bobPets->count() > 1) {
            PetInteraction::firstOrCreate(
                [
                    'from_user_id' => $diana->id,
                    'to_pet_profile_id' => $bobPets->last()->id,
                    'interaction_type' => 'like',
                ]
            );

            // Create a match
            PetMatch::firstOrCreate(
                [
                    'pet_profile_1_id' => $dianaPets->first()->id,
                    'pet_profile_2_id' => $bobPets->last()->id,
                ],
                [
                    'pet_profile_1_id' => $dianaPets->first()->id,
                    'pet_profile_2_id' => $bobPets->last()->id,
                    'matched_at' => now()->subHour(),
                ]
            );
        }

        // Charlie passes on Diana's Oscar
        if ($charliePets->isNotEmpty() && $dianaPets->count() > 1) {
            PetInteraction::firstOrCreate(
                [
                    'from_user_id' => $charlie->id,
                    'to_pet_profile_id' => $dianaPets->last()->id,
                    'interaction_type' => 'pass',
                ]
            );
        }

        // Eve likes Frank's Gatsby
        if ($evePets->isNotEmpty() && $frankPets->isNotEmpty()) {
            PetInteraction::firstOrCreate(
                [
                    'from_user_id' => $eve->id,
                    'to_pet_profile_id' => $frankPets->first()->id,
                    'interaction_type' => 'like',
                ]
            );
        }

        // Frank likes Eve's Shadow
        if ($frankPets->isNotEmpty() && $evePets->isNotEmpty()) {
            PetInteraction::firstOrCreate(
                [
                    'from_user_id' => $frank->id,
                    'to_pet_profile_id' => $evePets->first()->id,
                    'interaction_type' => 'like',
                ]
            );

            // Create a match
            PetMatch::firstOrCreate(
                [
                    'pet_profile_1_id' => $frankPets->first()->id,
                    'pet_profile_2_id' => $evePets->first()->id,
                ],
                [
                    'pet_profile_1_id' => $frankPets->first()->id,
                    'pet_profile_2_id' => $evePets->first()->id,
                    'matched_at' => now()->subMinutes(30),
                ]
            );
        }

        // Add some additional passes for testing
        $allPets = $petProfiles->all();

        // Random passes for more realistic test data
        $testInteractions = [
            [$alice->id, $charliePets->first()?->id, 'pass'],
            [$bob->id, $evePets->first()?->id, 'pass'],
            [$charlie->id, $frankPets->first()?->id, 'like'],
            [$diana->id, $evePets->first()?->id, 'super_like'],
        ];

        foreach ($testInteractions as [$userId, $petId, $type]) {
            if ($petId && PetProfile::find($petId)?->user_id !== $userId) {
                PetInteraction::firstOrCreate(
                    [
                        'from_user_id' => $userId,
                        'to_pet_profile_id' => $petId,
                        'interaction_type' => $type,
                    ],
                    [
                        'from_user_id' => $userId,
                        'to_pet_profile_id' => $petId,
                        'interaction_type' => $type,
                    ]
                );
            }
        }
    }
}
