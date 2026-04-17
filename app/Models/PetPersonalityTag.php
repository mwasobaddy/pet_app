<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'description'])]
class PetPersonalityTag extends Model
{
    /** @use HasFactory */
    use HasFactory;

    public function petProfiles(): BelongsToMany
    {
        return $this->belongsToMany(
            PetProfile::class,
            'pet_profile_personality_tag',
            'pet_personality_tag_id',
            'pet_profile_id'
        );
    }
}
