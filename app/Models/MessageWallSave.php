<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['message_wall_post_id', 'user_id'])]
class MessageWallSave extends Model
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
}
