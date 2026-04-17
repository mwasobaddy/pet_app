<?php

namespace App\Services;

use App\Models\SwipeEvent;
use App\Models\User;

class AnalyticsService
{
    /**
     * Get analytics summary for a user.
     */
    public function getSummary(User $user): array
    {
        $swipeCounts = $this->getSwipeCounts($user);
        $matchCount = $this->getMatchCount($user);

        $likes = (int) ($swipeCounts['like'] ?? 0);
        $superLikes = (int) ($swipeCounts['super_like'] ?? 0);
        $passes = (int) ($swipeCounts['pass'] ?? 0);
        $engaged = max(1, $likes + $superLikes);

        return [
            'swipes' => [
                'pass' => $passes,
                'like' => $likes,
                'super_like' => $superLikes,
                'total' => $passes + $likes + $superLikes,
            ],
            'matches' => $matchCount,
            'match_rate' => round($matchCount / $engaged, 4),
        ];
    }

    /**
     * Get swipe counts by interaction type for a user.
     */
    private function getSwipeCounts(User $user): array
    {
        return SwipeEvent::query()
            ->where('user_id', $user->id)
            ->whereIn('interaction_type', ['pass', 'like', 'super_like'])
            ->selectRaw('interaction_type, count(*) as total')
            ->groupBy('interaction_type')
            ->pluck('total', 'interaction_type')
            ->toArray();
    }

    /**
     * Get total match count for a user.
     */
    private function getMatchCount(User $user): int
    {
        return SwipeEvent::query()
            ->where('user_id', $user->id)
            ->where('interaction_type', 'match')
            ->count();
    }
}
