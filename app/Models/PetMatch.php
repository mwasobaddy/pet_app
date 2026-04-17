<?php

namespace App\Models;

use App\Models\Conversation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PetMatch extends Model
{
    use HasFactory;

    protected $fillable = ['pet_profile_1_id', 'pet_profile_2_id', 'matched_at'];

    protected $casts = ['matched_at' => 'datetime'];

    public function petProfile1(): BelongsTo
    {
        return $this->belongsTo(PetProfile::class, 'pet_profile_1_id');
    }

    public function petProfile2(): BelongsTo
    {
        return $this->belongsTo(PetProfile::class, 'pet_profile_2_id');
    }

    public function conversation(): HasOne
    {
        return $this->hasOne(Conversation::class, 'match_id');
    }
}
