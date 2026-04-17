<?php

namespace Tests\Helpers;

use App\Models\Tier;
use App\Models\User;

trait WithTier
{
    protected function createUserWithTier(): User
    {
        $tier = Tier::firstOrCreate(
            ['slug' => 'free'],
            [
                'name' => 'Free',
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
            ]
        );

        $user = User::factory()->create();
        $user->assignRole('free_user');

        return $user;
    }
}
