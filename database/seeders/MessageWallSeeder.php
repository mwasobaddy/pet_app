<?php

namespace Database\Seeders;

use App\Models\MessageWallComment;
use App\Models\MessageWallLike;
use App\Models\MessageWallPost;
use App\Models\MessageWallSave;
use App\Models\MessageWallShare;
use App\Models\MessageWallTag;
use App\Models\User;
use App\Models\UserFollow;
use Illuminate\Database\Seeder;

class MessageWallSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding message wall tags...');
        $this->seedTags();

        $this->command->info('Seeding message wall posts...');
        $this->seedPosts();

        $this->command->info('Seeding message wall comments...');
        $this->seedComments();

        $this->command->info('Seeding user interactions (likes, saves, shares)...');
        $this->seedInteractions();

        $this->command->info('Seeding user follows...');
        $this->seedFollows();

        $this->command->info('Message wall seeding complete!');
    }

    /**
     * Seed message wall tags.
     */
    private function seedTags(): void
    {
        $tags = [
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
        ];

        foreach ($tags as $tagName) {
            MessageWallTag::firstOrCreate(
                ['name' => $tagName],
                ['slug' => str()->slug($tagName)]
            );
        }

        $this->command->line('  ✓ Created '.\count($tags).' tags');
    }

    /**
     * Seed message wall posts from existing users.
     */
    private function seedPosts(): void
    {
        $users = User::all();
        $posts = 0;

        foreach ($users as $user) {
            // Each user creates 2-4 posts
            $postCount = rand(2, 4);

            for ($i = 0; $i < $postCount; $i++) {
                $post = MessageWallPost::factory()
                    ->for($user)
                    ->create();

                // Attach random tags to the post
                $tags = MessageWallTag::inRandomOrder()
                    ->limit(rand(1, 3))
                    ->get();
                $post->tags()->attach($tags->pluck('id'));

                $posts++;
            }
        }

        $this->command->line("  ✓ Created {$posts} posts");
    }

    /**
     * Seed message wall comments and replies on existing posts.
     */
    private function seedComments(): void
    {
        $users = User::all();
        $posts = MessageWallPost::all();
        $comments = 0;

        foreach ($posts as $post) {
            // Each post gets 3-8 comments
            $commentCount = rand(3, 8);

            for ($i = 0; $i < $commentCount; $i++) {
                $commenter = $users->random();

                // Create top-level comment
                $comment = MessageWallComment::create([
                    'message_wall_post_id' => $post->id,
                    'user_id' => $commenter->id,
                    'body' => $this->getRandomComment(),
                    'parent_comment_id' => null,
                ]);

                $comments++;

                // 30% chance this comment has 1-2 replies
                if (rand(1, 100) <= 30) {
                    $replyCount = rand(1, 2);

                    for ($j = 0; $j < $replyCount; $j++) {
                        $replier = $users->random();

                        MessageWallComment::create([
                            'message_wall_post_id' => $post->id,
                            'user_id' => $replier->id,
                            'body' => $this->getRandomReply(),
                            'parent_comment_id' => $comment->id,
                        ]);

                        $comments++;
                    }
                }
            }

            // Update post comment count
            $post->update(['comments_count' => $post->comments()->count()]);
        }

        $this->command->line("  ✓ Created {$comments} comments (including replies)");
    }

    /**
     * Seed user interactions (likes, saves, shares).
     */
    private function seedInteractions(): void
    {
        $users = User::all();
        $posts = MessageWallPost::all();
        $likes = 0;
        $saves = 0;
        $shares = 0;

        foreach ($posts as $post) {
            // 50-80% of users like the post
            $likerCount = rand(ceil($users->count() * 0.5), ceil($users->count() * 0.8));
            $likers = $users->random($likerCount);

            foreach ($likers as $liker) {
                MessageWallLike::firstOrCreate([
                    'message_wall_post_id' => $post->id,
                    'user_id' => $liker->id,
                ]);
                $likes++;
            }

            // 20-40% of users save the post
            $saverCount = rand(ceil($users->count() * 0.2), ceil($users->count() * 0.4));
            $savers = $users->random($saverCount);

            foreach ($savers as $saver) {
                MessageWallSave::firstOrCreate([
                    'message_wall_post_id' => $post->id,
                    'user_id' => $saver->id,
                ]);
                $saves++;
            }

            // 5-15% of users share the post (can share multiple times)
            $shareCount = rand(ceil($users->count() * 0.05), ceil($users->count() * 0.15));

            for ($i = 0; $i < $shareCount; $i++) {
                $sharer = $users->random();

                MessageWallShare::create([
                    'message_wall_post_id' => $post->id,
                    'user_id' => $sharer->id,
                ]);
                $shares++;
            }

            // Update post interaction counts
            $post->update([
                'likes_count' => $post->likes()->count(),
                'shares_count' => $post->shares()->count(),
            ]);
        }

        $this->command->line("  ✓ Created {$likes} likes");
        $this->command->line("  ✓ Created {$saves} saves");
        $this->command->line("  ✓ Created {$shares} shares");
    }

    /**
     * Seed user follows.
     */
    private function seedFollows(): void
    {
        $users = User::all();
        $follows = 0;

        foreach ($users as $user) {
            // Each user follows 5-15 other random users
            $followCount = rand(5, min(15, $users->count() - 1));
            $followees = $users->where('id', '!=', $user->id)->random($followCount);

            foreach ($followees as $followee) {
                UserFollow::firstOrCreate([
                    'follower_id' => $user->id,
                    'following_id' => $followee->id,
                ]);
                $follows++;
            }
        }

        $this->command->line("  ✓ Created {$follows} follow relationships");
    }

    /**
     * Get a random comment text.
     */
    private function getRandomComment(): string
    {
        $comments = [
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

        return $comments[array_rand($comments)];
    }

    /**
     * Get a random reply text.
     */
    private function getRandomReply(): string
    {
        $replies = [
            'Haha yes!',
            'Totally agree! 🙌',
            'Thanks so much!',
            'Right?! 😄',
            'So true!',
            'You\'re awesome!',
            'Let\'s set up a playdate! 🐾',
            'Can\'t wait to see more!',
            'This made my day too!',
            'Sending love! ❤️',
            'Absolutely! 💯',
            'I\'m obsessed! 😻',
            'So talented! 👏',
            'Best pet parent ever!',
            'More photos please! 📷',
        ];

        return $replies[array_rand($replies)];
    }
}
