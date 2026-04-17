<?php

namespace Database\Seeders;

use App\Models\Tier;
use Illuminate\Database\Seeder;

class TierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Tier::updateOrCreate(
            ['slug' => 'free'],
            [
                'name' => 'Free',
                'role_name' => 'free_user',
                'description' => 'Basic access with daily limits.',
                'daily_swipe_limit' => 50,
                'daily_super_like_limit' => 1,
                'boost_limit' => 0,
                'rewind_enabled' => false,
                'full_profile_visibility' => false,
                'who_likes_you' => false,
                'read_receipts' => false,
                'media_upload_limit_videos' => 10,
                'badge_label' => null,
                'badge_color' => null,
                'priority' => 0,
                'is_active' => true,
            ]
        );

        Tier::updateOrCreate(
            ['slug' => 'vip'],
            [
                'name' => 'VIP',
                'role_name' => 'vip_user',
                'description' => 'Unlimited swipes, boosts, and read receipts.',
                'daily_swipe_limit' => null,
                'daily_super_like_limit' => 3,
                'boost_limit' => 3,
                'rewind_enabled' => true,
                'full_profile_visibility' => true,
                'who_likes_you' => true,
                'read_receipts' => true,
                'media_upload_limit_videos' => 30,
                'badge_label' => 'Silver',
                'badge_color' => 'silver',
                'priority' => 10,
                'is_active' => true,
            ]
        );

        Tier::updateOrCreate(
            ['slug' => 'svip'],
            [
                'name' => 'SVIP',
                'role_name' => 'svip_user',
                'description' => 'All VIP features with higher limits and gold badge.',
                'daily_swipe_limit' => null,
                'daily_super_like_limit' => 5,
                'boost_limit' => 5,
                'rewind_enabled' => true,
                'full_profile_visibility' => true,
                'who_likes_you' => true,
                'read_receipts' => true,
                'media_upload_limit_videos' => 100,
                'badge_label' => 'Gold',
                'badge_color' => 'gold',
                'priority' => 20,
                'is_active' => true,
            ]
        );
    }
}
