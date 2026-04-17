<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\PetMatch;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class ChatQueryService
{
    /**
     * Get paginated conversations for a user.
     */
    public function getConversations(User $user): Collection
    {
        return Conversation::query()
            ->where('user_one_id', $user->id)
            ->orWhere('user_two_id', $user->id)
            ->with([
                'userOne:id,first_name,other_names',
                'userTwo:id,first_name,other_names',
                'latestMessage',
            ])
            ->withCount([
                'messages as unread_count' => function ($query) use ($user) {
                    $query->whereNull('read_at')
                        ->where('sender_id', '!=', $user->id);
                },
            ])
            ->orderByDesc('last_message_at')
            ->get()
            ->map(fn (Conversation $conversation) => $this->formatConversation($conversation, $user));
    }

    /**
     * Get messages for a conversation with proper formatting.
     */
    public function getConversationMessages(Conversation $conversation): Collection
    {
        return $conversation->messages()
            ->with('sender:id,first_name,other_names')
            ->orderBy('created_at')
            ->get()
            ->map(fn ($message) => $this->formatMessage($message));
    }

    /**
     * Find or create conversation for a pet match.
     */
    public function findOrCreateForMatch(PetMatch $match): Conversation
    {
        $match->loadMissing(['petProfile1.user', 'petProfile2.user']);

        $userIds = collect([
            $match->petProfile1->user_id,
            $match->petProfile2->user_id,
        ]);

        [$userOneId, $userTwoId] = $userIds->sort()->values()->all();

        return Conversation::firstOrCreate(
            [
                'match_id' => $match->id,
            ],
            [
                'user_one_id' => $userOneId,
                'user_two_id' => $userTwoId,
                'last_message_at' => now(),
            ]
        );
    }

    /**
     * Format conversation for API response.
     */
    private function formatConversation(Conversation $conversation, User $user): array
    {
        $other = $conversation->otherParticipant($user->id);

        return [
            'id' => $conversation->id,
            'match_id' => $conversation->match_id,
            'last_message_at' => $conversation->last_message_at,
            'unread_count' => $conversation->unread_count,
            'other_user' => $other ? [
                'id' => $other->id,
                'name' => $other->name,
            ] : null,
            'latest_message' => $conversation->latestMessage ? $this->formatMessage($conversation->latestMessage) : null,
        ];
    }

    /**
     * Format message for API response.
     */
    private function formatMessage($message): array
    {
        return [
            'id' => $message->id,
            'body' => $message->body,
            'media_type' => $message->media_type,
            'media_url' => $message->media_path ? asset("storage/{$message->media_path}") : null,
            'sender_id' => $message->sender_id,
            'sender_name' => $message->sender?->name,
            'read_at' => $message->read_at,
            'read_by_user_id' => $message->read_by_user_id,
            'created_at' => $message->created_at,
        ];
    }
}
