<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'message_wall_post_id',
    'user_id',
    'parent_comment_id',
    'body',
])]
class MessageWallComment extends Model
{
    use HasFactory;

    public function post(): BelongsTo
    {
        return $this->belongsTo(MessageWallPost::class, 'message_wall_post_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parentComment(): BelongsTo
    {
        return $this->belongsTo(MessageWallComment::class, 'parent_comment_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(MessageWallComment::class, 'parent_comment_id');
    }
}
