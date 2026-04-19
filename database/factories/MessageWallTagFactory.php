<?php

namespace Database\Factories;

use App\Models\MessageWallTag;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<MessageWallTag>
 */
class MessageWallTagFactory extends Factory
{
    protected $model = MessageWallTag::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tagNames = [
            'puppy',
            'kitten',
            'cute',
            'funny',
            'adorable',
            'playful',
            'sleepy',
            'family',
            'adventure',
            'beach',
            'park',
            'training',
            'adoption',
            'rescued',
            'certified-cuteness',
            'photobomb',
            'snuggle-buddies',
            'pet-parents',
            'furry-friends',
            'paw-some',
            'tail-wags',
            'whisker-love',
            'pet-goals',
            'outdoor-fun',
            'indoor-lounge',
        ];

        $name = $this->faker->unique()->randomElement($tagNames);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
        ];
    }
}
