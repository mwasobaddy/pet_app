<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'slug'])]
class MessageWallTag extends Model
{
    use HasFactory;

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(
            MessageWallPost::class,
            'message_wall_post_tag',
            'message_wall_tag_id',
            'message_wall_post_id'
        );
    }
}
