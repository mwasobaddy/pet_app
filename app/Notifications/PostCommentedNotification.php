<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PostCommentedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private int $postId,
        private int $commentId,
        private string $commenterName,
        private string $commentBody,
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
            'type' => 'post_commented',
            'post_id' => $this->postId,
            'comment_id' => $this->commentId,
            'commenter_name' => $this->commenterName,
            'comment_body' => $this->commentBody,
            'pet_name' => $this->petName,
            'message' => "{$this->commenterName} commented on your post" . ($this->petName ? " about {$this->petName}" : ''),
        ];
    }
}
