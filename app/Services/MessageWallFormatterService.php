<?php

namespace App\Services;

use App\Models\MessageWallComment;
use App\Models\MessageWallLike;
use App\Models\MessageWallPost;
use App\Models\MessageWallSave;

class MessageWallFormatterService
{
    /**
     * Format a post for API response.
     *
     * @return array
     */
    public function formatPost(MessageWallPost $post, int $currentUserId, ?array $comments = null): array
    {
        $userHasLiked = MessageWallLike::query()
            ->where('user_id', $currentUserId)
            ->where('message_wall_post_id', $post->id)
            ->exists();

        $userHasSaved = MessageWallSave::query()
            ->where('user_id', $currentUserId)
            ->where('message_wall_post_id', $post->id)
            ->exists();

        return [
            'id' => $post->id,
            'user_id' => $post->user_id,
            'pet_name' => $post->petProfile?->name,
            'user_name' => $post->user?->name,
            'timestamp' => $post->created_at?->toIso8601String(),
            'location' => $post->location,
            'content' => $post->body,
            'hashtags' => $post->tags->pluck('name')->values(),
            'media' => $post->media_path ? [
                'type' => $post->media_type,
                'url' => asset('storage/'.$post->media_path),
            ] : null,
            'likes_count' => $post->likes_count,
            'comments_count' => $post->comments_count,
            'shares_count' => $post->shares_count,
            'user_has_liked' => $userHasLiked,
            'user_has_saved' => $userHasSaved,
            'comments' => $comments ?? $this->formatComments($post->comments),
        ];
    }

    /**
     * Format comments collection.
     *
     * @param  \Illuminate\Database\Eloquent\Collection  $comments
     * @return array
     */
    public function formatComments($comments): array
    {
        return $comments
            ->map(function (MessageWallComment $comment) {
                return $this->formatComment($comment);
            })
            ->values()
            ->all();
    }

    /**
     * Format a single comment.
     *
     * @return array
     */
    public function formatComment(MessageWallComment $comment): array
    {
        return [
            'id' => $comment->id,
            'user_id' => $comment->user_id,
            'user_name' => $comment->user?->name,
            'body' => $comment->body,
            'parent_comment_id' => $comment->parent_comment_id,
            'created_at' => $comment->created_at?->toIso8601String(),
            'replies' => $comment->replies
                ->map(fn (MessageWallComment $reply) => $this->formatComment($reply))
                ->values()
                ->all(),
        ];
    }

    /**
     * Build a comment tree from flat array.
     *
     * @return array
     */
    public function buildCommentTree(array $comments): array
    {
        $children = [];

        foreach ($comments as $comment) {
            $children[$comment['parent_comment_id']][] = $comment;
        }

        $build = function (?int $parentId) use (&$build, $children): array {
            $tree = [];

            foreach ($children[$parentId] ?? [] as $comment) {
                $comment['replies'] = $build($comment['id']);
                $tree[] = $comment;
            }

            return $tree;
        };

        return $build(null);
    }
}
