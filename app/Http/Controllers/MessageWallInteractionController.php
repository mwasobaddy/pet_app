<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMessageWallCommentRequest;
use App\Models\MessageWallPost;
use App\Models\User;
use App\Services\MessageWallInteractionService;
use Illuminate\Http\JsonResponse;

class MessageWallInteractionController extends Controller
{
    public function __construct(private MessageWallInteractionService $interactionService) {}

    public function like(MessageWallPost $messageWallPost): JsonResponse
    {
        $user = auth()->user();
        $result = $this->interactionService->toggleLike($messageWallPost, $user);

        return response()->json($result);
    }

    public function comment(StoreMessageWallCommentRequest $request, MessageWallPost $messageWallPost): JsonResponse
    {
        $validated = $request->validated();
        $result = $this->interactionService->createComment(
            $messageWallPost,
            $request->user(),
            $validated['body'],
            $validated['parent_comment_id'] ?? null,
        );

        return response()->json($result, 201);
    }

    public function save(MessageWallPost $messageWallPost): JsonResponse
    {
        $user = auth()->user();
        $result = $this->interactionService->toggleSave($messageWallPost, $user);

        return response()->json($result);
    }

    public function share(MessageWallPost $messageWallPost): JsonResponse
    {
        $user = auth()->user();
        $result = $this->interactionService->share($messageWallPost, $user);

        return response()->json($result);
    }

    public function follow(User $user): JsonResponse
    {
        $authUser = auth()->user();

        try {
            $result = $this->interactionService->toggleFollow($user, $authUser);
            return response()->json($result);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}

