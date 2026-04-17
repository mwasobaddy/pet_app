<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\PetMatch;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        $conversations = Conversation::query()
            ->where('user_one_id', $user->id)
            ->orWhere('user_two_id', $user->id)
            ->with([
                'userOne:id,first_name,other_names',
                'userTwo:id,first_name,other_names',
                'latestMessage:id,conversation_id,sender_id,body,media_type,created_at',
            ])
            ->withCount([
                'messages as unread_count' => function ($query) use ($user) {
                    $query->whereNull('read_at')
                        ->where('sender_id', '!=', $user->id);
                },
            ])
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function (Conversation $conversation) use ($user) {
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
                    'latest_message' => $conversation->latestMessage ? [
                        'id' => $conversation->latestMessage->id,
                        'sender_id' => $conversation->latestMessage->sender_id,
                        'body' => $conversation->latestMessage->body,
                        'media_type' => $conversation->latestMessage->media_type,
                        'created_at' => $conversation->latestMessage->created_at,
                    ] : null,
                ];
            });

        return Inertia::render('chat/index', [
            'conversations' => $conversations,
        ]);
    }

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

        $messages = $conversation->messages()
            ->with('sender:id,first_name,other_names')
            ->orderBy('created_at')
            ->get()
            ->map(fn ($message) => [
                'id' => $message->id,
                'body' => $message->body,
                'media_type' => $message->media_type,
                'media_url' => $message->media_path ? asset("storage/{$message->media_path}") : null,
                'sender_id' => $message->sender_id,
                'sender_name' => $message->sender?->name,
                'read_at' => $message->read_at,
                'read_by_user_id' => $message->read_by_user_id,
                'created_at' => $message->created_at,
            ]);

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

        [$userOneId, $userTwoId] = $userIds->sort()->values()->all();

        $conversation = Conversation::firstOrCreate(
            ['match_id' => $match->id],
            [
                'user_one_id' => $userOneId,
                'user_two_id' => $userTwoId,
            ]
        );

        return redirect()->route('chat.show', $conversation);
    }
}
