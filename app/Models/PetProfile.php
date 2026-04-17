<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable([
    'user_id',
    'pet_type_id',
    'name',
    'breed',
    'age',
    'gender',
    'description',
    'is_featured_manual',
    'featured_weight',
    'featured_until',
])]
class PetProfile extends Model
{
    /** @use HasFactory */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'featured_until' => 'datetime',
            'is_featured_manual' => 'boolean',
            'featured_weight' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function petType(): BelongsTo
    {
        return $this->belongsTo(PetType::class, 'pet_type_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(PetImage::class)->orderBy('order', 'asc');
    }

    public function personalityTags(): BelongsToMany
    {
        return $this->belongsToMany(
            PetPersonalityTag::class,
            'pet_profile_personality_tag',
            'pet_profile_id',
            'pet_personality_tag_id'
        );
    }
}
