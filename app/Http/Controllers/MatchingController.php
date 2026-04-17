<?php

namespace App\Http\Controllers;

use App\Events\MatchCreated;
use App\Models\Conversation;
use App\Models\PetInteraction;
use App\Models\PetMatch;
use App\Models\PetPersonalityTag;
use App\Models\PetProfile;
use App\Models\PetType;
use App\Models\SwipeEvent;
use App\Notifications\MatchNotification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MatchingController extends Controller
{
    /**
     * Get recommended pet profiles for swiping.
     */
    public function recommendations(Request $request)
    {
        $user = auth()->user();
        $userPets = $user->petProfiles()->pluck('id');
        $tier = $user->currentTier();
        $advancedFiltersAllowed = $tier?->slug !== 'free';

        // Get filter parameters
        $distance = $request->query('distance', 100); // Default 100 km
        $petType = $request->query('pet_type'); // Optional filter
        $ageMin = $request->query('age_min');
        $ageMax = $request->query('age_max');
        $gender = $request->query('gender');
        $breed = $request->query('breed');
        $personalityTags = $request->query('personality_tags');
        $limit = $request->query('limit', 10);

        // Get pets the user has already interacted with
        $interactedPets = PetInteraction::where('from_user_id', $user->id)
            ->pluck('to_pet_profile_id')
            ->toArray();

        // Build query for recommended pets
        $query = PetProfile::query()
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

        // Apply pet type filter if specified
        if ($petType) {
            $query->where('pet_type_id', $petType);
        }

        if ($advancedFiltersAllowed) {
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

            if ($personalityTags !== null) {
                $tagIds = is_array($personalityTags)
                    ? $personalityTags
                    : array_filter(explode(',', (string) $personalityTags));

                if ($tagIds !== []) {
                    $query->whereHas('personalityTags', function ($tagQuery) use ($tagIds) {
                        $tagQuery->whereIn('pet_personality_tags.id', $tagIds);
                    });
                }
            }
        }

        $query->orderByRaw(
            "CASE WHEN pet_profiles.is_featured_manual = 1 OR (pet_profiles.featured_until IS NOT NULL AND pet_profiles.featured_until > CURRENT_TIMESTAMP) THEN 1 ELSE 0 END DESC"
        )
            ->orderByDesc('pet_profiles.featured_weight')
            ->orderByDesc(DB::raw('COALESCE(t.priority, 0)'))
            ->orderByRaw('RANDOM()');

        $recommendations = $query->limit($limit)->get()->map(fn ($pet) => [
            'id' => $pet->id,
            'name' => $pet->name,
            'breed' => $pet->breed,
            'age' => $pet->age,
            'gender' => $pet->gender,
            'description' => $pet->description,
            'pet_type' => $pet->petType ? ['id' => $pet->petType->id, 'name' => $pet->petType->name, 'icon' => $pet->petType->icon] : null,
            'images' => $pet->images->map(fn ($img) => ['id' => $img->id, 'url' => asset("storage/{$img->path}")]),
            'owner' => ['id' => $pet->user_id, 'name' => $pet->user->first_name],
        ]);

        $petTypes = PetType::query()->get(['id', 'name', 'icon']);
        $tagOptions = PetPersonalityTag::query()->get(['id', 'name']);

        return response()->json([
            'recommendations' => $recommendations,
            'distance' => $distance,
            'total' => $recommendations->count(),
            'filters' => [
                'advanced_allowed' => $advancedFiltersAllowed,
                'pet_types' => $petTypes,
                'personality_tags' => $tagOptions,
            ],
        ]);
    }

    /**
     * Record a swipe interaction.
     */
    public function recordInteraction(Request $request)
    {
        $validated = $request->validate([
            'to_pet_profile_id' => 'required|exists:pet_profiles,id',
            'interaction_type' => 'required|in:pass,like,super_like',
        ]);

        $user = auth()->user();
        $toPetProfile = PetProfile::find($validated['to_pet_profile_id']);
        $userPrimaryPet = $user->petProfiles()->first();

        if ($userPrimaryPet === null) {
            return response()->json(['error' => 'Please create a pet profile first'], 422);
        }

        if ($user->id === $toPetProfile->user_id) {
            return response()->json(['error' => 'Cannot interact with own pet'], 422);
        }

        // Record the interaction
        $interaction = PetInteraction::create([
            'from_user_id' => $user->id,
            'to_pet_profile_id' => $validated['to_pet_profile_id'],
            'interaction_type' => $validated['interaction_type'],
        ]);

        SwipeEvent::create([
            'user_id' => $user->id,
            'pet_profile_id' => $toPetProfile->id,
            'interaction_type' => $validated['interaction_type'],
            'source' => 'swipe',
            'meta' => [
                'pet_owner_id' => $toPetProfile->user_id,
            ],
        ]);

        $match = null;
        if (in_array($validated['interaction_type'], ['like', 'super_like'])) {
            $userPets = $user->petProfiles()->pluck('id')->toArray();
            
            $mutualLike = PetInteraction::where('from_user_id', $toPetProfile->user_id)
                ->whereIn('to_pet_profile_id', $userPets)
                ->whereIn('interaction_type', ['like', 'super_like'])
                ->exists();

            if ($mutualLike) {
                $match = PetMatch::firstOrCreate(
                    [
                        'pet_profile_1_id' => min($userPrimaryPet->id, $toPetProfile->id),
                        'pet_profile_2_id' => max($userPrimaryPet->id, $toPetProfile->id),
                    ],
                    ['matched_at' => now()]
                );

                if ($match->wasRecentlyCreated) {
                    $userIds = collect([$user->id, $toPetProfile->user_id])->sort()->values();

                    Conversation::firstOrCreate(
                        ['match_id' => $match->id],
                        [
                            'user_one_id' => $userIds[0],
                            'user_two_id' => $userIds[1],
                        ]
                    );

                    SwipeEvent::create([
                        'user_id' => $user->id,
                        'pet_profile_id' => $toPetProfile->id,
                        'interaction_type' => 'match',
                        'match_id' => $match->id,
                        'source' => 'match',
                        'meta' => [
                            'pet_owner_id' => $toPetProfile->user_id,
                        ],
                    ]);

                    SwipeEvent::create([
                        'user_id' => $toPetProfile->user_id,
                        'pet_profile_id' => $userPrimaryPet->id,
                        'interaction_type' => 'match',
                        'match_id' => $match->id,
                        'source' => 'match',
                        'meta' => [
                            'pet_owner_id' => $user->id,
                        ],
                    ]);

                    $user->notify(new MatchNotification($match, $user->id));
                    $toPetProfile->user->notify(new MatchNotification($match, $toPetProfile->user_id));

                    event(new MatchCreated($match, $user->id, $toPetProfile->user_id));
                }
            }
        }

        return response()->json(['success' => true, 'interaction' => ['id' => $interaction->id, 'type' => $interaction->interaction_type, 'pet_id' => $interaction->to_pet_profile_id], 'match' => $match ? ['id' => $match->id, 'matched_at' => $match->matched_at, 'pet_profile_2' => ['id' => $toPetProfile->id, 'name' => $toPetProfile->name, 'images' => $toPetProfile->images->map(fn ($img) => ['id' => $img->id, 'url' => asset("storage/{$img->path}")]), 'user' => ['id' => $toPetProfile->user_id, 'name' => $toPetProfile->user->first_name]]] : null]);
    }

    /**
     * Get user's matches.
     */
    public function getMatches()
    {
        $user = auth()->user();
        $userPets = $user->petProfiles()->pluck('id')->toArray();

        $matches = PetMatch::where(function ($query) use ($userPets) {
            $query->whereIn('pet_profile_1_id', $userPets)->orWhereIn('pet_profile_2_id', $userPets);
        })
            ->with(['petProfile1', 'petProfile2.user'])
            ->orderByDesc('matched_at')
            ->get()
            ->map(fn ($match) => ['id' => $match->id, 'matched_at' => $match->matched_at, 'pet_profile_1' => ['id' => $match->petProfile1->id, 'name' => $match->petProfile1->name, 'images' => $match->petProfile1->images->map(fn ($img) => ['url' => asset("storage/{$img->path}")])->first()], 'pet_profile_2' => ['id' => $match->petProfile2->id, 'name' => $match->petProfile2->name, 'images' => $match->petProfile2->images->map(fn ($img) => ['url' => asset("storage/{$img->path}")])->first(), 'user' => ['id' => $match->petProfile2->user_id, 'name' => $match->petProfile2->user->first_name]]]);

        return response()->json(['matches' => $matches, 'total' => $matches->count()]);
    }
}
