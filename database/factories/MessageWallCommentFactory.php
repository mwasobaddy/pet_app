<?php

namespace Database\Factories;

use App\Models\MessageWallComment;
use App\Models\MessageWallPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MessageWallComment>
 */
class MessageWallCommentFactory extends Factory
{
    protected $model = MessageWallComment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $commentTexts = [
            'This is adorable! 😍',
            'So cute! Love this! ❤️',
            'Aww, what a beautiful pet! 🐾',
            'Haha, that\'s so funny! 😂',
            'Your pet is amazing!',
            'I wish my pet could do that!',
            'So precious! 🥰',
            'Love the energy!',
            'This made my day! Thank you for sharing',
            'Absolutely stunning! 📸',
            'I\'d love to meet your pup!',
            'Goals! 💯',
            'This is why I love this community!',
            'Your pet is blessed with a wonderful owner 💕',
            'Can I borrow your pet for a day? 😄',
        ];

        return [
            'message_wall_post_id' => MessageWallPost::inRandomOrder()->first()?->id ?? MessageWallPost::factory(),
            'user_id' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'body' => $this->faker->randomElement($commentTexts),
            'parent_comment_id' => null, // Top-level comment by default
            'created_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
