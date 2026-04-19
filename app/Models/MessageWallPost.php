<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'pet_profile_id',
    'body',
    'media_path',
    'media_type',
    'location',
    'likes_count',
    'comments_count',
    'shares_count',
])]
class MessageWallPost extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function petProfile(): BelongsTo
    {
        return $this->belongsTo(PetProfile::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(
            MessageWallTag::class,
            'message_wall_post_tag',
            'message_wall_post_id',
            'message_wall_tag_id'
        );
    }

    public function comments(): HasMany
    {
        return $this->hasMany(MessageWallComment::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(MessageWallLike::class);
    }

    public function saves(): HasMany
    {
        return $this->hasMany(MessageWallSave::class);
    }

    public function shares(): HasMany
    {
        return $this->hasMany(MessageWallShare::class);
    }
}
