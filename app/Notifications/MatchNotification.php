<?php

namespace App\Notifications;

use App\Models\PetMatch;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class MatchNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public PetMatch $match, public int $recipientId)
    {
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $this->match->loadMissing(['petProfile1.user', 'petProfile2.user']);

        $petProfile1 = $this->match->petProfile1;
        $petProfile2 = $this->match->petProfile2;

        $otherPet = $petProfile1->user_id === $this->recipientId
            ? $petProfile2
            : $petProfile1;

        return [
            'match_id' => $this->match->id,
            'matched_at' => $this->match->matched_at?->toISOString(),
            'other_pet' => [
                'id' => $otherPet->id,
                'name' => $otherPet->name,
                'owner_id' => $otherPet->user_id,
                'owner_name' => $otherPet->user?->first_name,
            ],
        ];
    }
}
