<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['user_id', 'distance_min', 'distance_max', 'pet_gender', 'pet_age_min', 'pet_age_max'])]
class MatchingPreference extends Model
{
    use HasFactory;

    protected $casts = [
        'distance_min' => 'integer',
        'distance_max' => 'integer',
        'pet_age_min' => 'integer',
        'pet_age_max' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function preferredPetTypes(): BelongsToMany
    {
        return $this->belongsToMany(PetType::class, 'matching_preference_pet_type');
    }

    public function getPetTypeIdsAttribute(): array
    {
        return $this->preferredPetTypes()->pluck('pet_types.id')->toArray();
    }

    public function hasPetTypeFilter(): bool
    {
        return $this->preferredPetTypes()->exists();
    }
}
