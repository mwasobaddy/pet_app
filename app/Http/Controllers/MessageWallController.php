<?php

namespace App\Http\Controllers;

use App\Events\MessageWallPostCreated;
use App\Http\Requests\MessageWallIndexRequest;
use App\Http\Requests\StoreMessageWallPostRequest;
use App\Models\MessageWallLike;
use App\Models\MessageWallPost;
use App\Models\MessageWallSave;
use App\Models\MessageWallTag;
use App\Models\PetType;
use App\Services\MessageWallService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class MessageWallController extends Controller
{
    public function __construct(
        private MessageWallService $messageWallService,
    ) {}

    public function index(MessageWallIndexRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $feed = $this->messageWallService->getFeed($request->user(), $filters);
        $postItems = collect($feed->items());
        $postIds = $postItems->pluck('id')->all();

        $likedPostIds = MessageWallLike::query()
            ->where('user_id', $request->user()->id)
            ->whereIn('message_wall_post_id', $postIds)
            ->pluck('message_wall_post_id');

        $savedPostIds = MessageWallSave::query()
            ->where('user_id', $request->user()->id)
            ->whereIn('message_wall_post_id', $postIds)
            ->pluck('message_wall_post_id');

        $posts = $postItems->map(function (MessageWallPost $post) use ($likedPostIds, $savedPostIds) {
            $userHasLiked = $likedPostIds->contains($post->id);
            $userHasSaved = $savedPostIds->contains($post->id);

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
                'comments' => $post->comments
                    ->map(function ($comment) {
                        return [
                            'id' => $comment->id,
                            'user_id' => $comment->user_id,
                            'user_name' => $comment->user?->name,
                            'body' => $comment->body,
                            'parent_comment_id' => $comment->parent_comment_id,
                            'created_at' => $comment->created_at?->toIso8601String(),
                            'replies' => $comment->replies
                                ->map(function ($reply) {
                                    return [
                                        'id' => $reply->id,
                                        'user_id' => $reply->user_id,
                                        'user_name' => $reply->user?->name,
                                        'body' => $reply->body,
                                        'parent_comment_id' => $reply->parent_comment_id,
                                        'created_at' => $reply->created_at?->toIso8601String(),
                                        'replies' => [],
                                    ];
                                })
                                ->values(),
                        ];
                    })
                    ->values(),
            ];
        });

        return response()->json([
            'posts' => $posts,
            'meta' => [
                'current_page' => $feed->currentPage(),
                'last_page' => $feed->lastPage(),
                'has_more' => $feed->hasMorePages(),
                'per_page' => $feed->perPage(),
                'total' => $feed->total(),
            ],
            'config' => [
                'filtering_enabled' => config('message_wall.filtering_enabled', true),
                'allowed_sort_modes' => config('message_wall.allowed_sort_modes', ['latest', 'popular', 'following']),
                'default_sort_mode' => config('message_wall.default_sort_mode', 'latest'),
            ],
            'options' => [
                'pet_categories' => PetType::query()->select('id', 'name', 'icon')->orderBy('name')->get(),
                'tags' => MessageWallTag::query()->select('id', 'name')->orderBy('name')->limit(50)->get(),
            ],
        ]);
    }

    public function store(StoreMessageWallPostRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $mediaPath = null;
        $mediaType = null;

        if ($request->hasFile('media')) {
            $file = $request->file('media');
            $mediaPath = $file->store('message-wall', 'public');
            $mediaType = $file->getMimeType();
        }

        $post = MessageWallPost::create([
            'user_id' => $request->user()->id,
            'pet_profile_id' => $validated['pet_profile_id'] ?? null,
            'body' => $validated['body'] ?? null,
            'location' => $validated['location'] ?? null,
            'media_path' => $mediaPath,
            'media_type' => $mediaType,
        ]);

        $tagNames = collect($validated['tags'] ?? [])
            ->map(fn (string $tag) => trim(Str::lower($tag)))
            ->filter()
            ->unique()
            ->take(8)
            ->values();

        if ($tagNames->isNotEmpty()) {
            $tagIds = $tagNames->map(function (string $tagName) {
                return MessageWallTag::firstOrCreate(
                    ['slug' => Str::slug($tagName)],
                    ['name' => $tagName]
                )->id;
            });

            $post->tags()->sync($tagIds->all());
        }

        event(new MessageWallPostCreated($post->id));

        return response()->json([
            'success' => true,
            'post_id' => $post->id,
        ], 201);
    }
}
