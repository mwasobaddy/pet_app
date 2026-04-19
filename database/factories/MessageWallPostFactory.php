<?php

namespace Database\Factories;

use App\Models\MessageWallPost;
use App\Models\PetProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MessageWallPost>
 */
class MessageWallPostFactory extends Factory
{
    protected $model = MessageWallPost::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $petProfiles = PetProfile::pluck('id')->toArray();

        $locations = [
            'New York, NY',
            'Los Angeles, CA',
            'Chicago, IL',
            'Houston, TX',
            'Phoenix, AZ',
            'Philadelphia, PA',
            'San Antonio, TX',
            'San Diego, CA',
            'Dallas, TX',
            'San Jose, CA',
            'London, UK',
            'Paris, France',
            'Tokyo, Japan',
            'Sydney, Australia',
        ];

        $postContents = [
            'My beautiful pup just learned a new trick! So proud! 🐕',
            'Lazy Sunday with my furry friend ❤️',
            'Just adopted this cutie from the shelter! Already feels like home 🏠',
            'Beach day with my best friend! 🏖️',
            'First day at the dog park and we made friends already! 🐾',
            'Nothing beats cuddles on a rainy day 🛋️',
            'My cat knocked over my plant again... classic! 😅',
            'Just took the perfect photo! What do you think? 📸',
            'Morning walk was amazing today. The sunrise was incredible! 🌅',
            'My pet got the zoomies! This is hilarious 😂',
            'Grooming day! My pup looks so handsome now 💇',
            'Just discovered this amazing dog park. Highly recommend! 🌳',
            'Movie night with my furry companion 🍿',
            'Training progress! We nailed the sit command today 👏',
            'Someone\'s ready for dinner 🍽️',
        ];

        $petProfileId = null;
        if (! empty($petProfiles)) {
            $petProfileId = fake()->randomElement($petProfiles);
        } elseif (fake()->boolean(50)) {
            // 50% chance to create a new pet profile if none exist
            $petProfileId = PetProfile::factory()->create()->id;
        }

        return [
            'user_id' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'pet_profile_id' => $petProfileId,
            'body' => fake()->randomElement($postContents),
            'location' => fake()->randomElement($locations),
            'likes_count' => fake()->numberBetween(0, 150),
            'comments_count' => fake()->numberBetween(0, 25),
            'shares_count' => fake()->numberBetween(0, 10),
            'created_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
