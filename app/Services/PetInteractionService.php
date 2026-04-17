<?php

namespace App\Services;

use App\Events\MatchCreated;
use App\Models\Conversation;
use App\Models\PetInteraction;
use App\Models\PetMatch;
use App\Models\PetProfile;
use App\Models\SwipeEvent;
use App\Models\User;
use App\Notifications\MatchNotification;
use Illuminate\Support\Facades\DB;

class PetInteractionService
{
    /**
     * Record a pet interaction (pass, like, super_like).
     */
    public function recordInteraction(
        User $user,
        PetProfile $toPetProfile,
        string $interactionType,
    ): array {
        // Validation
        if ($user->id === $toPetProfile->user_id) {
            throw new \InvalidArgumentException('Cannot interact with own pet');
        }

        $userPrimaryPet = $user->petProfiles()->first();
        if ($userPrimaryPet === null) {
            throw new \InvalidArgumentException('Please create a pet profile first');
        }

        return DB::transaction(function () use ($user, $toPetProfile, $interactionType, $userPrimaryPet) {
            // Record the interaction
            $interaction = PetInteraction::create([
                'from_user_id' => $user->id,
                'to_pet_profile_id' => $toPetProfile->id,
                'interaction_type' => $interactionType,
            ]);

            // Record swipe event
            SwipeEvent::create([
                'user_id' => $user->id,
                'pet_profile_id' => $toPetProfile->id,
                'interaction_type' => $interactionType,
                'source' => 'swipe',
                'meta' => [
                    'pet_owner_id' => $toPetProfile->user_id,
                ],
            ]);

            $match = null;

            // Check for mutual like/super_like
            if (in_array($interactionType, ['like', 'super_like'])) {
                $match = $this->checkAndCreateMatch($user, $toPetProfile, $userPrimaryPet);
            }

            return [
                'interaction' => $this->formatInteraction($interaction),
                'match' => $match,
            ];
        });
    }

    /**
     * Check for mutual like and create match if exists.
     */
    private function checkAndCreateMatch(User $user, PetProfile $toPetProfile, PetProfile $userPrimaryPet): ?array
    {
        $userPets = $user->petProfiles()->pluck('id')->toArray();

        $mutualLike = PetInteraction::where('from_user_id', $toPetProfile->user_id)
            ->whereIn('to_pet_profile_id', $userPets)
            ->whereIn('interaction_type', ['like', 'super_like'])
            ->exists();

        if (! $mutualLike) {
            return null;
        }

        // Create match
        $match = PetMatch::firstOrCreate(
            [
                'pet_profile_1_id' => min($userPrimaryPet->id, $toPetProfile->id),
                'pet_profile_2_id' => max($userPrimaryPet->id, $toPetProfile->id),
            ],
            ['matched_at' => now()]
        );

        if ($match->wasRecentlyCreated) {
            $this->handleNewMatch($match, $user, $toPetProfile, $userPrimaryPet);
        }

        return $this->formatMatch($match, $toPetProfile);
    }

    /**
     * Handle newly created match - create conversation, send notifications, broadcast event.
     */
    private function handleNewMatch(
        PetMatch $match,
        User $user,
        PetProfile $toPetProfile,
        PetProfile $userPrimaryPet,
    ): void {
        // Create conversation
        $userIds = collect([$user->id, $toPetProfile->user_id])->sort()->values();

        Conversation::firstOrCreate(
            ['match_id' => $match->id],
            [
                'user_one_id' => $userIds[0],
                'user_two_id' => $userIds[1],
            ]
        );

        // Record match events for both users
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

        // Send notifications to both users
        $user->notify(new MatchNotification($match, $user->id));
        $toPetProfile->user->notify(new MatchNotification($match, $toPetProfile->user_id));

        // Broadcast event
        event(new MatchCreated($match, $user->id, $toPetProfile->user_id));
    }

    /**
     * Format interaction for response.
     */
    private function formatInteraction(PetInteraction $interaction): array
    {
        return [
            'id' => $interaction->id,
            'type' => $interaction->interaction_type,
            'pet_id' => $interaction->to_pet_profile_id,
        ];
    }

    /**
     * Format match for response.
     */
    private function formatMatch(PetMatch $match, PetProfile $toPetProfile): array
    {
        return [
            'id' => $match->id,
            'matched_at' => $match->matched_at,
            'pet_profile_2' => [
                'id' => $toPetProfile->id,
                'name' => $toPetProfile->name,
                'images' => $toPetProfile->images->map(fn ($img) => [
                    'id' => $img->id,
                    'url' => asset("storage/{$img->path}"),
                ]),
                'user' => [
                    'id' => $toPetProfile->user_id,
                    'name' => $toPetProfile->user->first_name,
                ],
            ],
        ];
    }
}
