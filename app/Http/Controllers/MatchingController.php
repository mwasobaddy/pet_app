<?php

namespace App\Http\Controllers;

use App\Models\PetProfile;
use App\Services\MatchingService;
use App\Services\PetInteractionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MatchingController extends Controller
{
    public function __construct(
        private MatchingService $matchingService,
        private PetInteractionService $petInteractionService,
    ) {}

    /**
     * Get recommended pet profiles for swiping.
     */
    public function recommendations(Request $request): JsonResponse
    {
        $user = auth()->user();

        // Get filter parameters
        $limit = (int) $request->query('limit', 10);
        $petType = $request->query('pet_type');
        $ageMin = $request->query('age_min');
        $ageMax = $request->query('age_max');
        $gender = $request->query('gender');
        $breed = $request->query('breed');
        $personalityTags = $request->query('personality_tags');
        $distanceMin = $request->query('distance_min');
        $distanceMax = $request->query('distance') ?? $request->query('distance_max');

        // Convert personality tags to array if needed
        $tagIds = null;
        if ($personalityTags !== null) {
            $tagIds = is_array($personalityTags)
                ? $personalityTags
                : array_filter(explode(',', (string) $personalityTags));
            $tagIds = count($tagIds) > 0 ? $tagIds : null;
        }

        $recommendations = $this->matchingService->getRecommendations(
            $user,
            limit: $limit,
            petType: $petType,
            ageMin: $ageMin ? (int) $ageMin : null,
            ageMax: $ageMax ? (int) $ageMax : null,
            gender: $gender,
            breed: $breed,
            personalityTags: $tagIds,
            distanceMin: $distanceMin ? (int) $distanceMin : null,
            distanceMax: $distanceMax ? (int) $distanceMax : null,
            preferences: $user->matchingPreference,
        );

        $filterOptions = $this->matchingService->getPreferenceOptions($user);
        $tier = $user->currentTier();
        $advancedAllowed = $tier?->slug !== 'free';

        return response()->json([
            'recommendations' => $recommendations,
            'distance' => $distanceMax ? (int) $distanceMax : ($user->matchingPreference?->distance_max ?? 100),
            'total' => $recommendations->count(),
            'filters' => [
                'advanced_allowed' => $advancedAllowed,
                'pet_types' => $filterOptions['pet_types'],
                'personality_tags' => $filterOptions['personality_tags'],
            ],
        ]);
    }

    /**
     * Record a swipe interaction.
     */
    public function recordInteraction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'to_pet_profile_id' => 'required|exists:pet_profiles,id',
            'interaction_type' => 'required|in:pass,like,super_like',
        ]);

        try {
            $user = auth()->user();
            $toPetProfile = PetProfile::find($validated['to_pet_profile_id']);

            $result = $this->petInteractionService->recordInteraction(
                $user,
                $toPetProfile,
                $validated['interaction_type']
            );

            return response()->json([
                'success' => true,
                'interaction' => $result['interaction'],
                'match' => $result['match'],
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            Log::error('Error recording pet interaction', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json(['error' => 'Failed to record interaction'], 500);
        }
    }

    /**
     * Get user's matches.
     */
    public function getMatches(): JsonResponse
    {
        $user = auth()->user();
        $matches = $this->matchingService->getUserMatches($user);

        return response()->json([
            'matches' => $matches,
            'total' => $matches->count(),
        ]);
    }
}
