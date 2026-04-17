<?php

namespace Database\Seeders;

use App\Models\PetImage;
use App\Models\PetPersonalityTag;
use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\User;
use Illuminate\Database\Seeder;

class PetProfileSeeder extends Seeder
{
    public function run(): void
    {
        $petTypes = PetType::pluck('id', 'name');

        // Get all users for pet assignment
        $users = User::all();

        // Define pet data with images
        $petsData = [
            // Alice's pets
            [
                'user_id' => $users->firstWhere('email', 'kelvinramsiel@gmail.com')->id,
                'name' => 'Max',
                'breed' => 'Golden Retriever',
                'pet_type_id' => $petTypes['Dog'] ?? 1,
                'age' => 3,
                'gender' => 'Male',
                'description' => 'Friendly and energetic golden retriever who loves to play fetch and swim. Perfect companion for outdoor adventures!',
                'is_featured_manual' => true,
                'featured_weight' => 95,
                'personality_tags' => ['Friendly', 'Energetic', 'Protective'],
                'images' => [
                    'https://images.unsplash.com/photo-1633722715463-d30628519b83?w=400',
                    'https://images.unsplash.com/photo-1582037921212-a580519f0043?w=400',
                ],
            ],
            // Bob's pets
            [
                'user_id' => $users->firstWhere('email', 'kelvinramsiel01@gmail.com')->id,
                'name' => 'Luna',
                'breed' => 'Siamese',
                'pet_type_id' => $petTypes['Cat'] ?? 2,
                'age' => 2,
                'gender' => 'Female',
                'description' => 'Beautiful Siamese cat with striking blue eyes. Very affectionate and loves attention.',
                'personality_tags' => ['Affectionate', 'Intelligent', 'Playful'],
                'images' => [
                    'https://images.unsplash.com/photo-1513360371669-4a028dc8c038?w=400',
                    'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
                ],
            ],
            // Bob's second pet
            [
                'user_id' => $users->firstWhere('email', 'kelvinramsiel01@gmail.com')->id,
                'name' => 'Charlie',
                'breed' => 'Beagle',
                'pet_type_id' => $petTypes['Dog'] ?? 1,
                'age' => 4,
                'gender' => 'Male',
                'description' => 'Cute Beagle with a nose for adventure. Always ready for a walk and sniff around the neighborhood.',
                'personality_tags' => ['Curious', 'Friendly', 'Energetic'],
                'images' => [
                    'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400',
                    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
                ],
            ],
            // Charlie's pets
            [
                'user_id' => $users->firstWhere('email', 'charlie@example.com')->id,
                'name' => 'Whiskers',
                'breed' => 'Tabby',
                'pet_type_id' => $petTypes['Cat'] ?? 2,
                'age' => 5,
                'gender' => 'Male',
                'description' => 'Laid-back tabby cat who enjoys napping in sunny spots. Purrs constantly!',
                'personality_tags' => ['Calm', 'Affectionate', 'Independent'],
                'images' => [
                    'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=400',
                    'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400',
                ],
            ],
            // Diana's pets
            [
                'user_id' => $users->firstWhere('email', 'diana@example.com')->id,
                'name' => 'Bella',
                'breed' => 'Labrador Retriever',
                'pet_type_id' => $petTypes['Dog'] ?? 1,
                'age' => 2,
                'gender' => 'Female',
                'description' => 'Sweet and gentle lab who loves everyone. Great with kids and other pets.',
                'featured_until' => now()->addDays(14),
                'featured_weight' => 80,
                'personality_tags' => ['Friendly', 'Gentle', 'Intelligent'],
                'images' => [
                    'https://images.unsplash.com/photo-1633722407697-85381c30e900?w=400',
                    'https://images.unsplash.com/photo-1558261534-e4db928a5d4e?w=400',
                ],
            ],
            // Diana's second pet
            [
                'user_id' => $users->firstWhere('email', 'diana@example.com')->id,
                'name' => 'Oscar',
                'breed' => 'French Bulldog',
                'pet_type_id' => $petTypes['Dog'] ?? 1,
                'age' => 3,
                'gender' => 'Male',
                'description' => 'Cute French bulldog with a big personality. Loves short walks and lots of cuddles.',
                'personality_tags' => ['Playful', 'Affectionate', 'Social'],
                'images' => [
                    'https://images.unsplash.com/photo-1583511655857-d19db992cb74?w=400',
                    'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?w=400',
                ],
            ],
            // Eve's pets
            [
                'user_id' => $users->firstWhere('email', 'eve@example.com')->id,
                'name' => 'Shadow',
                'breed' => 'Mixed Breed',
                'pet_type_id' => $petTypes['Cat'] ?? 2,
                'age' => 6,
                'gender' => 'Male',
                'description' => 'Mysterious black cat with golden eyes. Loves hunting and exploring.',
                'personality_tags' => ['Independent', 'Curious', 'Intelligent'],
                'images' => [
                    'https://images.unsplash.com/photo-1529148482759-b8ac9f63a931?w=400',
                    'https://images.unsplash.com/photo-1624705002569-016da288ffc3?w=400',
                ],
            ],
            // Frank's pets
            [
                'user_id' => $users->firstWhere('email', 'frank@example.com')->id,
                'name' => 'Gatsby',
                'breed' => 'German Shepherd',
                'pet_type_id' => $petTypes['Dog'] ?? 1,
                'age' => 4,
                'gender' => 'Male',
                'description' => 'Intelligent and loyal German Shepherd. Trained and well-behaved. Loves outdoor activities.',
                'personality_tags' => ['Intelligent', 'Protective', 'Friendly'],
                'images' => [
                    'https://images.unsplash.com/photo-1568572933382-74d440641117?w=400',
                    'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400',
                ],
            ],
        ];

        foreach ($petsData as $petData) {
            $images = $petData['images'];
            $personalityTags = $petData['personality_tags'];
            unset($petData['images'], $petData['personality_tags']);

            $pet = PetProfile::create($petData);

            // Attach images
            foreach ($images as $index => $imageUrl) {
                PetImage::create([
                    'pet_profile_id' => $pet->id,
                    'path' => $imageUrl,
                    'order' => $index,
                ]);
            }

            // Attach personality tags
            $tagIds = PetPersonalityTag::whereIn('name', $personalityTags)->pluck('id');
            $pet->personalityTags()->attach($tagIds);
        }
    }
}
