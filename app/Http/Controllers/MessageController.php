<?php

namespace App\Http\Controllers;

use App\Events\MessageRead;
use App\Events\MessageSent;
use App\Http\Requests\StoreMessageRequest;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    public function store(StoreMessageRequest $request, Conversation $conversation): JsonResponse
    {
        $user = auth()->user();

        if (! $conversation->hasUser($user->id)) {
            abort(403);
        }

        $mediaPath = null;
        $mediaType = null;
        $mediaSize = null;

        if ($request->hasFile('media')) {
            $file = $request->file('media');
            $mediaType = $file->getMimeType();
            $mediaSize = $file->getSize();
            $mediaPath = $file->store("chat/{$conversation->id}", 'public');
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'body' => $request->input('body'),
            'media_path' => $mediaPath,
            'media_type' => $mediaType,
            'media_size' => $mediaSize,
        ]);

        $conversation->forceFill([
            'last_message_at' => $message->created_at,
        ])->save();

        broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'message' => [
                'id' => $message->id,
                'body' => $message->body,
                'media_type' => $message->media_type,
                'media_url' => $message->media_path ? Storage::disk('public')->url($message->media_path) : null,
                'sender_id' => $message->sender_id,
                'created_at' => $message->created_at,
            ],
        ]);
    }

    public function markRead(Conversation $conversation): JsonResponse
    {
        $user = auth()->user();

        if (! $conversation->hasUser($user->id)) {
            abort(403);
        }

        $unreadMessageIds = $conversation->messages()
            ->whereNull('read_at')
            ->where('sender_id', '!=', $user->id)
            ->pluck('id');

        if ($unreadMessageIds->isEmpty()) {
            return response()->json(['read' => []]);
        }

        $now = now();

        Message::whereIn('id', $unreadMessageIds)->update([
            'read_at' => $now,
            'read_by_user_id' => $user->id,
        ]);

        broadcast(new MessageRead($conversation->id, $unreadMessageIds->all(), $user->id, $now->toISOString()))->toOthers();

        return response()->json(['read' => $unreadMessageIds]);
    }
}
