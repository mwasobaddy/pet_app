<?php

namespace App\Http\Controllers;

use App\Events\MessageWallCommentCreated;
use App\Events\MessageWallPostInteractionUpdated;
use App\Http\Requests\StoreMessageWallCommentRequest;
use App\Models\MessageWallComment;
use App\Models\MessageWallLike;
use App\Models\MessageWallPost;
use App\Models\MessageWallSave;
use App\Models\MessageWallShare;
use App\Models\User;
use App\Models\UserFollow;
use App\Notifications\MessageWallCommentReplyNotification;
use App\Notifications\PostCommentedNotification;
use App\Notifications\PostLikedNotification;
use Illuminate\Http\JsonResponse;

class MessageWallInteractionController extends Controller
{
    public function like(MessageWallPost $messageWallPost): JsonResponse
    {
        $user = auth()->user();

        $like = MessageWallLike::where('message_wall_post_id', $messageWallPost->id)
            ->where('user_id', $user->id)
            ->first();

        if ($like) {
            $like->delete();
            $messageWallPost->decrement('likes_count');
            $liked = false;
        } else {
            MessageWallLike::create([
                'message_wall_post_id' => $messageWallPost->id,
                'user_id' => $user->id,
            ]);
            $messageWallPost->increment('likes_count');
            $liked = true;

            // Notify post author (if not liking their own post)
            if ($messageWallPost->user_id !== $user->id) {
                $messageWallPost->user->notify(new PostLikedNotification(
                    postId: $messageWallPost->id,
                    likerName: $user->name,
                    petName: $messageWallPost->petProfile?->name,
                ));
            }
        }

        $updatedPost = $messageWallPost->fresh();

        event(new MessageWallPostInteractionUpdated(
            postId: $updatedPost->id,
            likesCount: (int) $updatedPost->likes_count,
            commentsCount: (int) $updatedPost->comments_count,
            sharesCount: (int) $updatedPost->shares_count,
            actorId: $user->id,
            action: $liked ? 'liked' : 'unliked',
        ));

        return response()->json([
            'liked' => $liked,
            'likes_count' => $updatedPost->likes_count,
        ]);
    }

    public function comment(StoreMessageWallCommentRequest $request, MessageWallPost $messageWallPost): JsonResponse
    {
        $validated = $request->validated();

        $comment = MessageWallComment::create([
            'message_wall_post_id' => $messageWallPost->id,
            'user_id' => $request->user()->id,
            'parent_comment_id' => $validated['parent_comment_id'] ?? null,
            'body' => $validated['body'],
        ]);

        $messageWallPost->increment('comments_count');
        $updatedPost = $messageWallPost->fresh();

        // Notify post author (if not commenting on their own post)
        if ($messageWallPost->user_id !== $request->user()->id) {
            $messageWallPost->user->notify(new PostCommentedNotification(
                postId: $messageWallPost->id,
                commentId: $comment->id,
                commenterName: $request->user()->name,
                commentBody: $validated['body'],
                petName: $messageWallPost->petProfile?->name,
            ));
        }

        $commentPayload = [
            'id' => $comment->id,
            'body' => $comment->body,
            'parent_comment_id' => $comment->parent_comment_id,
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'created_at' => $comment->created_at?->toIso8601String(),
            'replies' => [],
        ];

        event(new MessageWallCommentCreated(
            postId: $messageWallPost->id,
            comment: $commentPayload,
            commentsCount: (int) $updatedPost->comments_count,
        ));

        event(new MessageWallPostInteractionUpdated(
            postId: $updatedPost->id,
            likesCount: (int) $updatedPost->likes_count,
            commentsCount: (int) $updatedPost->comments_count,
            sharesCount: (int) $updatedPost->shares_count,
            actorId: $request->user()->id,
            action: 'commented',
        ));

        if ($comment->parent_comment_id !== null) {
            $parentComment = MessageWallComment::query()->with('user')->find($comment->parent_comment_id);

            if ($parentComment && $parentComment->user_id !== $request->user()->id) {
                $parentComment->user->notify(new MessageWallCommentReplyNotification(
                    postId: $messageWallPost->id,
                    commentId: $comment->id,
                    replierName: $request->user()->name,
                ));
            }
        }

        return response()->json([
            'success' => true,
            'comment' => $commentPayload,
            'comments_count' => $updatedPost->comments_count,
        ], 201);
    }

    public function save(MessageWallPost $messageWallPost): JsonResponse
    {
        $user = auth()->user();

        $save = MessageWallSave::where('message_wall_post_id', $messageWallPost->id)
            ->where('user_id', $user->id)
            ->first();

        if ($save) {
            $save->delete();
            $saved = false;
        } else {
            MessageWallSave::create([
                'message_wall_post_id' => $messageWallPost->id,
                'user_id' => $user->id,
            ]);
            $saved = true;
        }

        return response()->json(['saved' => $saved]);
    }

    public function share(MessageWallPost $messageWallPost): JsonResponse
    {
        MessageWallShare::create([
            'message_wall_post_id' => $messageWallPost->id,
            'user_id' => auth()->id(),
        ]);

        $messageWallPost->increment('shares_count');
        $updatedPost = $messageWallPost->fresh();

        event(new MessageWallPostInteractionUpdated(
            postId: $updatedPost->id,
            likesCount: (int) $updatedPost->likes_count,
            commentsCount: (int) $updatedPost->comments_count,
            sharesCount: (int) $updatedPost->shares_count,
            actorId: auth()->id(),
            action: 'shared',
        ));

        return response()->json([
            'shared' => true,
            'shares_count' => $updatedPost->shares_count,
        ]);
    }

    public function follow(User $user): JsonResponse
    {
        $authUser = auth()->user();

        if ($authUser->id === $user->id) {
            return response()->json(['message' => 'You cannot follow yourself.'], 422);
        }

        $follow = UserFollow::where('follower_id', $authUser->id)
            ->where('following_id', $user->id)
            ->first();

        if ($follow) {
            $follow->delete();
            $following = false;
        } else {
            UserFollow::create([
                'follower_id' => $authUser->id,
                'following_id' => $user->id,
            ]);
            $following = true;
        }

        return response()->json(['following' => $following]);
    }
}
