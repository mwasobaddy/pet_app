<?php

namespace App\Services;

use App\Events\MessageRead;
use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class MessageService
{
    /**
     * Store a new message in a conversation.
     *
     * @return array
     */
    public function storeMessage(Conversation $conversation, User $user, string $body, ?UploadedFile $media = null): array
    {
        $mediaPath = null;
        $mediaType = null;
        $mediaSize = null;

        if ($media) {
            $mediaType = $media->getMimeType();
            $mediaSize = $media->getSize();
            $mediaPath = $media->store("chat/{$conversation->id}", 'public');
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'body' => $body,
            'media_path' => $mediaPath,
            'media_type' => $mediaType,
            'media_size' => $mediaSize,
        ]);

        $conversation->forceFill([
            'last_message_at' => $message->created_at,
        ])->save();

        // Broadcast event for real-time delivery
        broadcast(new MessageSent($message))->toOthers();

        return $this->formatMessage($message);
    }

    /**
     * Mark messages as read in a conversation.
     *
     * @return array
     */
    public function markConversationAsRead(Conversation $conversation, User $user): array
    {
        $unreadMessageIds = $conversation->messages()
            ->whereNull('read_at')
            ->where('sender_id', '!=', $user->id)
            ->pluck('id');

        if ($unreadMessageIds->isEmpty()) {
            return [];
        }

        $now = now();

        Message::whereIn('id', $unreadMessageIds)->update([
            'read_at' => $now,
            'read_by_user_id' => $user->id,
        ]);

        // Broadcast event for real-time updates
        broadcast(new MessageRead(
            $conversation->id,
            $unreadMessageIds->all(),
            $user->id,
            $now->toISOString()
        ))->toOthers();

        return $unreadMessageIds->all();
    }

    /**
     * Format a message for API response.
     *
     * @return array
     */
    private function formatMessage(Message $message): array
    {
        return [
            'id' => $message->id,
            'body' => $message->body,
            'media_type' => $message->media_type,
            'media_url' => $message->media_path ? Storage::disk('public')->url($message->media_path) : null,
            'sender_id' => $message->sender_id,
            'created_at' => $message->created_at,
        ];
    }
}
