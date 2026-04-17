<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PetInteraction extends Model
{
    use HasFactory;

    protected $fillable = ['from_user_id', 'to_pet_profile_id', 'interaction_type'];

    public function fromUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toPetProfile(): BelongsTo
    {
        return $this->belongsTo(PetProfile::class, 'to_pet_profile_id');
    }
}
