<?php

namespace App\Services;

use App\Events\MessageWallCommentCreated;
use App\Events\MessageWallPostInteractionUpdated;
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

class MessageWallInteractionService
{
    /**
     * Toggle like on a post.
     *
     * @return array{liked: bool, likes_count: int}
     */
    public function toggleLike(MessageWallPost $post, User $user): array
    {
        $like = MessageWallLike::query()
            ->where('message_wall_post_id', $post->id)
            ->where('user_id', $user->id)
            ->first();

        if ($like) {
            $like->delete();
            $post->decrement('likes_count');
            $liked = false;
        } else {
            MessageWallLike::create([
                'message_wall_post_id' => $post->id,
                'user_id' => $user->id,
            ]);
            $post->increment('likes_count');
            $liked = true;

            // Queue notification to post author (if not liking their own post)
            if ($post->user_id !== $user->id) {
                $post->user->notify(new PostLikedNotification(
                    postId: $post->id,
                    likerName: $user->name,
                    petName: $post->petProfile?->name,
                ));
            }
        }

        $updatedPost = $post->fresh();
        $this->broadcastInteractionUpdate($updatedPost, $user->id, $liked ? 'liked' : 'unliked');

        return [
            'liked' => $liked,
            'likes_count' => $updatedPost->likes_count,
        ];
    }

    /**
     * Create a comment on a post.
     *
     * @return array{success: bool, comment: array, comments_count: int}
     */
    public function createComment(MessageWallPost $post, User $user, string $body, ?int $parentCommentId = null): array
    {
        $comment = MessageWallComment::create([
            'message_wall_post_id' => $post->id,
            'user_id' => $user->id,
            'parent_comment_id' => $parentCommentId,
            'body' => $body,
        ]);

        $post->increment('comments_count');
        $updatedPost = $post->fresh();

        // Queue notification to post author (if not commenting on their own post)
        if ($post->user_id !== $user->id) {
            $post->user->notify(new PostCommentedNotification(
                postId: $post->id,
                commentId: $comment->id,
                commenterName: $user->name,
                commentBody: $body,
                petName: $post->petProfile?->name,
            ));
        }

        $commentPayload = $this->formatComment($comment, $user);

        event(new MessageWallCommentCreated(
            postId: $post->id,
            comment: $commentPayload,
            commentsCount: (int) $updatedPost->comments_count,
        ));

        $this->broadcastInteractionUpdate($updatedPost, $user->id, 'commented');

        // Notify parent comment author if this is a reply
        if ($parentCommentId !== null) {
            $parentComment = MessageWallComment::query()->with('user')->find($parentCommentId);

            if ($parentComment && $parentComment->user_id !== $user->id) {
                $parentComment->user->notify(new MessageWallCommentReplyNotification(
                    postId: $post->id,
                    commentId: $comment->id,
                    replierName: $user->name,
                ));
            }
        }

        return [
            'success' => true,
            'comment' => $commentPayload,
            'comments_count' => $updatedPost->comments_count,
        ];
    }

    /**
     * Toggle save on a post.
     *
     * @return array{saved: bool}
     */
    public function toggleSave(MessageWallPost $post, User $user): array
    {
        $save = MessageWallSave::query()
            ->where('message_wall_post_id', $post->id)
            ->where('user_id', $user->id)
            ->first();

        if ($save) {
            $save->delete();
            $saved = false;
        } else {
            MessageWallSave::create([
                'message_wall_post_id' => $post->id,
                'user_id' => $user->id,
            ]);
            $saved = true;
        }

        return ['saved' => $saved];
    }

    /**
     * Share a post.
     *
     * @return array{shared: bool, shares_count: int}
     */
    public function share(MessageWallPost $post, User $user): array
    {
        MessageWallShare::create([
            'message_wall_post_id' => $post->id,
            'user_id' => $user->id,
        ]);

        $post->increment('shares_count');
        $updatedPost = $post->fresh();

        $this->broadcastInteractionUpdate($updatedPost, $user->id, 'shared');

        return [
            'shared' => true,
            'shares_count' => $updatedPost->shares_count,
        ];
    }

    /**
     * Toggle follow on a user.
     *
     * @return array{following: bool}
     */
    public function toggleFollow(User $targetUser, User $follower): array
    {
        if ($follower->id === $targetUser->id) {
            throw new \InvalidArgumentException('You cannot follow yourself.');
        }

        $follow = UserFollow::query()
            ->where('follower_id', $follower->id)
            ->where('following_id', $targetUser->id)
            ->first();

        if ($follow) {
            $follow->delete();
            $following = false;
        } else {
            UserFollow::create([
                'follower_id' => $follower->id,
                'following_id' => $targetUser->id,
            ]);
            $following = true;
        }

        return ['following' => $following];
    }

    /**
     * Format a comment for response.
     *
     * @return array
     */
    private function formatComment(MessageWallComment $comment, User $user): array
    {
        return [
            'id' => $comment->id,
            'body' => $comment->body,
            'parent_comment_id' => $comment->parent_comment_id,
            'user_id' => $user->id,
            'user_name' => $user->name,
            'created_at' => $comment->created_at?->toIso8601String(),
            'replies' => [],
        ];
    }

    /**
     * Broadcast interaction update event.
     */
    private function broadcastInteractionUpdate(MessageWallPost $post, int $actorId, string $action): void
    {
        event(new MessageWallPostInteractionUpdated(
            postId: $post->id,
            likesCount: (int) $post->likes_count,
            commentsCount: (int) $post->comments_count,
            sharesCount: (int) $post->shares_count,
            actorId: $actorId,
            action: $action,
        ));
    }
}
