<?php

namespace App\Http\Controllers;

use App\Models\SwipeEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function summary(Request $request)
    {
        $user = $request->user();

        $swipeCounts = SwipeEvent::query()
            ->where('user_id', $user->id)
            ->whereIn('interaction_type', ['pass', 'like', 'super_like'])
            ->select('interaction_type', DB::raw('count(*) as total'))
            ->groupBy('interaction_type')
            ->pluck('total', 'interaction_type');

        $matchCount = SwipeEvent::query()
            ->where('user_id', $user->id)
            ->where('interaction_type', 'match')
            ->count();

        $likes = (int) ($swipeCounts['like'] ?? 0);
        $superLikes = (int) ($swipeCounts['super_like'] ?? 0);
        $passes = (int) ($swipeCounts['pass'] ?? 0);
        $engaged = max(1, $likes + $superLikes);

        return response()->json([
            'swipes' => [
                'pass' => $passes,
                'like' => $likes,
                'super_like' => $superLikes,
                'total' => $passes + $likes + $superLikes,
            ],
            'matches' => $matchCount,
            'match_rate' => round($matchCount / $engaged, 4),
        ]);
    }
}
