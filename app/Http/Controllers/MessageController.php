<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMessageRequest;
use App\Models\Conversation;
use App\Services\MessageService;
use Illuminate\Http\JsonResponse;

class MessageController extends Controller
{
    public function __construct(private MessageService $messageService) {}

    public function store(StoreMessageRequest $request, Conversation $conversation): JsonResponse
    {
        $user = auth()->user();

        if (! $conversation->hasUser($user->id)) {
            abort(403);
        }

        $message = $this->messageService->storeMessage(
            $conversation,
            $user,
            $request->input('body'),
            $request->file('media'),
        );

        return response()->json(['message' => $message]);
    }

    public function markRead(Conversation $conversation): JsonResponse
    {
        $user = auth()->user();

        if (! $conversation->hasUser($user->id)) {
            abort(403);
        }

        $readIds = $this->messageService->markConversationAsRead($conversation, $user);

        return response()->json(['read' => $readIds]);
    }
}
