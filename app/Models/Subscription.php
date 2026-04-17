<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'tier_id',
    'payment_method',
    'subscription_cycle',
    'price',
    'payment_status',
    'transaction_id',
    'started_at',
    'expires_at',
    'auto_renew',
])]
class Subscription extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'expires_at' => 'datetime',
            'auto_renew' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tier(): BelongsTo
    {
        return $this->belongsTo(Tier::class);
    }

    public function isActive(): bool
    {
        return $this->payment_status === 'completed' &&
               $this->expires_at->isFuture();
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
}
