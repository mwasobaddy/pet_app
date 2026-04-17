<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function __construct(
        private AnalyticsService $analyticsService
    ) {}

    /**
     * Get analytics summary for the authenticated user.
     */
    public function summary(): JsonResponse
    {
        $summary = $this->analyticsService->getSummary(auth()->user());

        return response()->json($summary);
    }
}
