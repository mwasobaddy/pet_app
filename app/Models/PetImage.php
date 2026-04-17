<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['pet_profile_id', 'path', 'order'])]
class PetImage extends Model
{
    /** @use HasFactory */
    use HasFactory;

    public function petProfile(): BelongsTo
    {
        return $this->belongsTo(PetProfile::class);
    }
}
