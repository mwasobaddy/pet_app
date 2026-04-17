<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\PetMatch;
use App\Services\ChatQueryService;
use Illuminate\Http\RedirectResponse;
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
    public function index(): Response
    {
        $conversations = $this->chatQueryService->getConversations(auth()->user());

        return Inertia::render('chat/index', [
            'conversations' => $conversations,
        ]);
    }

    /**
     * Show a specific conversation with all messages.
     */
    public function show(Conversation $conversation): Response
    {
        $user = auth()->user();

        if (! $conversation->hasUser($user->id)) {
            abort(403);
        }

        $conversation->load([
            'userOne:id,first_name,other_names',
            'userTwo:id,first_name,other_names',
        ]);

        $other = $conversation->otherParticipant($user->id);
        $messages = $this->chatQueryService->getConversationMessages($conversation);

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
