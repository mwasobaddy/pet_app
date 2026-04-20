<?php

namespace App\Services;

use App\Models\MatchingPreference;
use App\Models\PetInteraction;
use App\Models\PetMatch;
use App\Models\PetPersonalityTag;
use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class MatchingService
{
    /**
     * Get recommended pet profiles for a user based on filters.
     */
    public function getRecommendations(
        User $user,
        int $limit = 10,
        ?string $petType = null,
        ?int $ageMin = null,
        ?int $ageMax = null,
        ?string $gender = null,
        ?string $breed = null,
        ?array $personalityTags = null,
        ?int $distanceMin = null,
        ?int $distanceMax = null,
        ?MatchingPreference $preferences = null,
    ): Collection {
        $userPets = $user->petProfiles()->pluck('id')->toArray();
        $interactedPets = $this->getInteractedPets($user);
        $advancedFiltersAllowed = $this->canUseAdvancedFilters($user);

        $query = $this->buildRecommendationQuery($userPets, $interactedPets);

        if ($petType) {
            $query->where('pet_type_id', $petType);
        } elseif ($preferences?->preferredPetTypes()->exists()) {
            $query->whereIn('pet_type_id', $preferences->preferredPetTypes->pluck('id')->toArray());
        }

        if ($advancedFiltersAllowed) {
            $this->applyAdvancedFilters(
                $query,
                $ageMin ?? $preferences?->pet_age_min,
                $ageMax ?? $preferences?->pet_age_max,
                $gender ?? $preferences?->pet_gender,
                $breed,
                $personalityTags
            );
        }

        return $query
            ->orderByRaw(
                'CASE WHEN pet_profiles.is_featured_manual = true OR (pet_profiles.featured_until IS NOT NULL AND pet_profiles.featured_until > CURRENT_TIMESTAMP) THEN 1 ELSE 0 END DESC'
            )
            ->orderByDesc('pet_profiles.featured_weight')
            ->orderByDesc(DB::raw('COALESCE(t.priority, 0)'))
            ->orderByRaw('RANDOM()')
            ->limit($limit)
            ->get()
            ->map(fn ($pet) => $this->formatPetForRecommendation($pet));
    }

    /**
     * Get filter options for search and preference setup.
     */
    public function getPreferenceOptions(User $user): array
    {
        $tier = $user->currentTier();

        return [
            'pet_types' => PetType::query()->get(['id', 'name', 'icon']),
            'personality_tags' => PetPersonalityTag::query()->get(['id', 'name']),
            'pet_gender_options' => ['Male', 'Female', 'Unknown'],
            'pet_age_presets' => [
                ['label' => '0-1', 'min' => 0, 'max' => 1],
                ['label' => '2-4', 'min' => 2, 'max' => 4],
                ['label' => '5-8', 'min' => 5, 'max' => 8],
                ['label' => '9-12', 'min' => 9, 'max' => 12],
                ['label' => '13-20', 'min' => 13, 'max' => 20],
                ['label' => '21+', 'min' => 21, 'max' => 100],
            ],
            'distance_limits' => [
                'min' => 1,
                'max' => $tier?->slug !== 'free' ? 500 : 100,
            ],
            'advanced_filters_allowed' => $tier?->slug !== 'free',
        ];
    }

    /**
     * Get user's matches with formatting.
     */
    public function getUserMatches(User $user): Collection
    {
        $userPets = $user->petProfiles()->pluck('id')->toArray();

        return PetMatch::query()
            ->where(function ($query) use ($userPets) {
                $query->whereIn('pet_profile_1_id', $userPets)
                    ->orWhereIn('pet_profile_2_id', $userPets);
            })
            ->with(['petProfile1', 'petProfile2.user'])
            ->orderByDesc('matched_at')
            ->get()
            ->map(fn ($match) => $this->formatMatch($match));
    }

    /**
     * Get pets the user has already interacted with.
     */
    private function getInteractedPets(User $user): array
    {
        return PetInteraction::where('from_user_id', $user->id)
            ->pluck('to_pet_profile_id')
            ->toArray();
    }

    /**
     * Check if user tier allows advanced filters.
     */
    private function canUseAdvancedFilters(User $user): bool
    {
        $tier = $user->currentTier();

        return $tier?->slug !== 'free';
    }

    /**
     * Build base query for recommendations excluding user's own pets.
     */
    private function buildRecommendationQuery(array $userPets, array $interactedPets): Builder
    {
        return PetProfile::query()
            ->select('pet_profiles.*')
            ->whereNotIn('pet_profiles.id', $userPets)
            ->whereNotIn('pet_profiles.id', $interactedPets)
            ->leftJoin('users', 'users.id', '=', 'pet_profiles.user_id')
            ->leftJoin('model_has_roles as mhr', function ($join) {
                $join->on('users.id', '=', 'mhr.model_id')
                    ->where('mhr.model_type', User::class);
            })
            ->leftJoin('roles as r', 'r.id', '=', 'mhr.role_id')
            ->leftJoin('tiers as t', 't.role_name', '=', 'r.name')
            ->with(['petType:id,name,icon', 'images' => fn ($q) => $q->orderBy('order')]);
    }

    /**
     * Apply advanced filters to query.
     */
    private function applyAdvancedFilters(
        Builder $query,
        ?int $ageMin,
        ?int $ageMax,
        ?string $gender,
        ?string $breed,
        ?array $personalityTags,
    ): void {
        if ($ageMin !== null && is_numeric($ageMin)) {
            $query->where('age', '>=', (int) $ageMin);
        }

        if ($ageMax !== null && is_numeric($ageMax)) {
            $query->where('age', '<=', (int) $ageMax);
        }

        if (in_array($gender, ['Male', 'Female', 'Unknown'], true)) {
            $query->where('gender', $gender);
        }

        if (filled($breed)) {
            $query->where('breed', 'like', '%'.$breed.'%');
        }

        if ($personalityTags !== null && count($personalityTags) > 0) {
            $query->whereHas('personalityTags', function ($tagQuery) use ($personalityTags) {
                $tagQuery->whereIn('pet_personality_tags.id', $personalityTags);
            });
        }
    }

    /**
     * Format pet profile for recommendation response.
     */
    private function formatPetForRecommendation(PetProfile $pet): array
    {
        return [
            'id' => $pet->id,
            'name' => $pet->name,
            'breed' => $pet->breed,
            'age' => $pet->age,
            'gender' => $pet->gender,
            'description' => $pet->description,
            'pet_type' => $pet->petType ? [
                'id' => $pet->petType->id,
                'name' => $pet->petType->name,
                'icon' => $pet->petType->icon,
            ] : null,
            'images' => $pet->images->map(fn ($img) => [
                'id' => $img->id,
                'url' => asset("storage/{$img->path}"),
            ]),
            'owner' => [
                'id' => $pet->user_id,
                'name' => $pet->user->first_name,
            ],
        ];
    }

    /**
     * Format match for response.
     */
    private function formatMatch(PetMatch $match): array
    {
        return [
            'id' => $match->id,
            'matched_at' => $match->matched_at,
            'pet_profile_1' => [
                'id' => $match->petProfile1->id,
                'name' => $match->petProfile1->name,
                'images' => $match->petProfile1->images->map(fn ($img) => [
                    'url' => asset("storage/{$img->path}"),
                ])->first(),
            ],
            'pet_profile_2' => [
                'id' => $match->petProfile2->id,
                'name' => $match->petProfile2->name,
                'images' => $match->petProfile2->images->map(fn ($img) => [
                    'url' => asset("storage/{$img->path}"),
                ])->first(),
                'user' => [
                    'id' => $match->petProfile2->user_id,
                    'name' => $match->petProfile2->user->first_name,
                ],
            ],
        ];
    }
}
