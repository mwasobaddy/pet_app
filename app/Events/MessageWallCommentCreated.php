<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageWallCommentCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    /**
     * @param  array<string, mixed>  $comment
     */
    public function __construct(
        public int $postId,
        public array $comment,
        public int $commentsCount,
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
        return 'message-wall.comment.created';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'post_id' => $this->postId,
            'comment' => $this->comment,
            'comments_count' => $this->commentsCount,
        ];
    }
}
