<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\PetMatch;
use App\Services\ChatQueryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function __construct(
        private ChatQueryService $chatQueryService
    ) {}

    /**
     * Get all conversations for the authenticated user.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $user = auth()->user();
        $cursor = $request->validate([ 'cursor' => ['nullable', 'string'] ])['cursor'] ?? null;

        $pagination = $this->chatQueryService->getConversations($user, $cursor);
        $conversations = collect($pagination->items())
            ->map(fn (Conversation $conversation) => $this->chatQueryService->formatConversation($conversation, $user))
            ->values();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'conversations' => $conversations,
                'meta' => [
                    'next_cursor' => optional($pagination->nextCursor())->encode(),
                    'has_more' => $pagination->hasMorePages(),
                    'per_page' => $pagination->perPage(),
                ],
            ]);
        }

        return Inertia::render('chat/index', [
            'conversations' => $conversations,
            'conversations_cursor' => optional($pagination->nextCursor())->encode(),
            'conversations_has_more' => $pagination->hasMorePages(),
        ]);
    }

    /**
     * Show a specific conversation with all messages.
     */
    public function show(Request $request, Conversation $conversation): Response|JsonResponse
    {
        $user = auth()->user();

        if (! $conversation->hasUser($user->id)) {
            abort(403);
        }

        $conversation->load([
            'userOne:id,first_name,other_names',
            'userTwo:id,first_name,other_names',
        ]);

        $cursor = $request->validate([ 'cursor' => ['nullable', 'string'] ])['cursor'] ?? null;
        $pagination = $this->chatQueryService->getConversationMessages($conversation, $cursor);
        $messages = collect($pagination->items())
            ->map(fn ($message) => $this->chatQueryService->formatMessage($message))
            ->values();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'messages' => $messages,
                'meta' => [
                    'next_cursor' => optional($pagination->nextCursor())->encode(),
                    'has_more' => $pagination->hasMorePages(),
                    'per_page' => $pagination->perPage(),
                ],
            ]);
        }

        $other = $conversation->otherParticipant($user->id);

        return Inertia::render('chat/show', [
            'conversation' => [
                'id' => $conversation->id,
                'match_id' => $conversation->match_id,
                'other_user' => $other ? [
                    'id' => $other->id,
                    'name' => $other->name,
                ] : null,
            ],
            'messages' => $messages,
            'messages_cursor' => optional($pagination->nextCursor())->encode(),
            'messages_has_more' => $pagination->hasMorePages(),
        ]);
    }

    /**
     * Find or create a conversation for a pet match and redirect.
     */
    public function showByMatch(PetMatch $match): RedirectResponse
    {
        $user = auth()->user();
        $match->loadMissing(['petProfile1.user', 'petProfile2.user']);

        $userIds = collect([
            $match->petProfile1->user_id,
            $match->petProfile2->user_id,
        ]);

        if (! $userIds->contains($user->id)) {
            abort(403);
        }

        $conversation = $this->chatQueryService->findOrCreateForMatch($match);

        return redirect()->route('chat.show', $conversation);
    }
}
