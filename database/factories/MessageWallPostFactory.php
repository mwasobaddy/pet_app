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

        $faker = $this->faker ?? $this->withFaker();

        $postContents = [
            'Just adopted a new puppy!',
            'My cat learned a new trick today.',
            'Does anyone have tips for training parrots?',
            'Took my dog to the park and he loved it!',
            'Looking for a good vet in my area.',
            'My rabbit is so fluffy!',
            'Check out my new aquarium setup.',
            'Does anyone want to join a pet meetup?',
            'My hamster escaped again!',
            'Best treats for senior dogs?',
        ];

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
        ];

        $petProfileId = null;
        if (! empty($petProfiles)) {
            $petProfileId = $faker->randomElement($petProfiles);
        } elseif ($faker->boolean(50)) {
            // 50% chance to create a new pet profile if none exist
            $petProfileId = PetProfile::factory()->create()->id;
        }

        return [
            'user_id' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'pet_profile_id' => $petProfileId,
            'body' => $faker->randomElement($postContents),
            'location' => $faker->randomElement($locations),
            'likes_count' => $faker->numberBetween(0, 150),
            'comments_count' => $faker->numberBetween(0, 25),
            'shares_count' => $faker->numberBetween(0, 10),
            'created_at' => $faker->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
