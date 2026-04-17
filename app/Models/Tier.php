<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name',
    'slug',
    'role_name',
    'description',
    'daily_swipe_limit',
    'daily_super_like_limit',
    'boost_limit',
    'rewind_enabled',
    'full_profile_visibility',
    'who_likes_you',
    'read_receipts',
    'media_upload_limit_videos',
    'badge_label',
    'badge_color',
    'priority',
    'is_active',
])]
class Tier extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'daily_swipe_limit' => 'integer',
            'daily_super_like_limit' => 'integer',
            'boost_limit' => 'integer',
            'rewind_enabled' => 'boolean',
            'full_profile_visibility' => 'boolean',
            'who_likes_you' => 'boolean',
            'read_receipts' => 'boolean',
            'media_upload_limit_videos' => 'integer',
            'priority' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
