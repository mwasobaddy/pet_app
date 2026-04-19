<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageWallPostInteractionUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public int $postId,
        public int $likesCount,
        public int $commentsCount,
        public int $sharesCount,
        public ?int $actorId = null,
        public ?string $action = null,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('message-wall.feed'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message-wall.post.interaction-updated';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'post_id' => $this->postId,
            'likes_count' => $this->likesCount,
            'comments_count' => $this->commentsCount,
            'shares_count' => $this->sharesCount,
            'actor_id' => $this->actorId,
            'action' => $this->action,
        ];
    }
}
