<?php

namespace App\Events;

use App\Models\PetMatch;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MatchCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public PetMatch $match,
        public int $userIdA,
        public int $userIdB,
    ) {
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('users.'.$this->userIdA),
            new PrivateChannel('users.'.$this->userIdB),
        ];
    }

    public function broadcastAs(): string
    {
        return 'match.created';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        $this->match->loadMissing([
            'petProfile1.images',
            'petProfile1.user',
            'petProfile2.images',
            'petProfile2.user',
        ]);

        $petProfile1 = $this->match->petProfile1;
        $petProfile2 = $this->match->petProfile2;

        return [
            'match' => [
                'id' => $this->match->id,
                'matched_at' => $this->match->matched_at?->toISOString(),
                'pet_profile_1' => [
                    'id' => $petProfile1->id,
                    'name' => $petProfile1->name,
                    'owner_id' => $petProfile1->user_id,
                    'owner_name' => $petProfile1->user?->first_name,
                    'images' => $petProfile1->images->map(fn ($image) => [
                        'id' => $image->id,
                        'url' => asset("storage/{$image->path}"),
                    ]),
                ],
                'pet_profile_2' => [
                    'id' => $petProfile2->id,
                    'name' => $petProfile2->name,
                    'owner_id' => $petProfile2->user_id,
                    'owner_name' => $petProfile2->user?->first_name,
                    'images' => $petProfile2->images->map(fn ($image) => [
                        'id' => $image->id,
                        'url' => asset("storage/{$image->path}"),
                    ]),
                ],
            ],
        ];
    }
}
