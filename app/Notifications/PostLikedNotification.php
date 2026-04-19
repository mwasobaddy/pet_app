<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PostLikedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private int $postId,
        private string $likerName,
        private ?string $petName = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'post_liked',
            'post_id' => $this->postId,
            'liker_name' => $this->likerName,
            'pet_name' => $this->petName,
            'message' => "{$this->likerName} liked your post" . ($this->petName ? " about {$this->petName}" : ''),
        ];
    }
}
