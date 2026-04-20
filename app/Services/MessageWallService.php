<?php

namespace App\Services;

use App\Models\MessageWallPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\CursorPaginator;

class MessageWallService
{
    /**
     * @param  array{sort?: string|null, pet_category?: int|string|null, tags?: array<int>|null}  $filters
     */
    public function getFeed(User $user, array $filters): CursorPaginator
    {
        $sort = (string) ($filters['sort'] ?? config('message_wall.default_sort_mode', 'latest'));
        $perPage = (int) config('message_wall.per_page', 10);

        $query = MessageWallPost::query()
            ->with([
                'user:id,first_name,other_names',
                'petProfile:id,name,pet_type_id,user_id',
                'petProfile.petType:id,name,icon',
                'tags:id,name,slug',
                'comments' => function ($commentQuery) {
                    $commentQuery
                        ->whereNull('parent_comment_id')
                        ->with([
                            'user:id,first_name,other_names',
                            'replies.user:id,first_name,other_names',
                        ])
                        ->orderBy('created_at');
                },
            ])
            ->withCount('comments')
            ->select('message_wall_posts.*');

        $this->applyFiltering($query, $filters);
        $this->applySorting($query, $user, $sort);

        return $query->cursorPaginate($perPage)->withQueryString();
    }

    /**
     * @param  array{pet_category?: int|string|null, tags?: array<int>|null}  $filters
     */
    private function applyFiltering(Builder $query, array $filters): void
    {
        if (! config('message_wall.filtering_enabled', true)) {
            return;
        }

        $petCategory = $filters['pet_category'] ?? null;
        $tags = array_values(array_filter($filters['tags'] ?? [], static fn ($tagId) => is_numeric($tagId)));

        if ($petCategory !== null && $petCategory !== '') {
            $query->whereHas('petProfile', function (Builder $petQuery) use ($petCategory) {
                $petQuery->where('pet_type_id', (int) $petCategory);
            });
        }

        if ($tags !== []) {
            $query->whereHas('tags', function (Builder $tagQuery) use ($tags) {
                $tagQuery->whereIn('message_wall_tags.id', $tags);
            });
        }
    }

    private function applySorting(Builder $query, User $user, string $sort): void
    {
        if ($sort === 'popular') {
            $query
                ->orderByDesc('likes_count')
                ->orderByDesc('comments_count')
                ->orderByDesc('shares_count')
                ->orderByDesc('created_at')
                ->orderByDesc('id');

            return;
        }

        if ($sort === 'following') {
            $followingIds = $user->followingUsers()->pluck('users.id');

            $query
                ->where(function (Builder $followingQuery) use ($followingIds, $user) {
                    $followingQuery
                        ->whereIn('user_id', $followingIds)
                        ->orWhere('user_id', $user->id);
                })
                ->orderByDesc('created_at')
                ->orderByDesc('id');

            return;
        }

        $query
            ->orderByDesc('created_at')
            ->orderByDesc('id');
    }
}
