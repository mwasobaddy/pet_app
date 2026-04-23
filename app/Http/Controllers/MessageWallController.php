<?php

namespace App\Http\Controllers;

use App\Events\MessageWallPostCreated;
use App\Http\Requests\MessageWallIndexRequest;
use App\Http\Requests\StoreMessageWallPostRequest;
use App\Models\MessageWallComment;
use App\Models\MessageWallLike;
use App\Models\MessageWallPost;
use App\Models\MessageWallSave;
use App\Models\MessageWallTag;
use App\Models\PetType;
use App\Services\MessageWallFormatterService;
use App\Services\MessageWallService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MessageWallController extends Controller
{
    public function __construct(
        private MessageWallService $messageWallService,
        private MessageWallFormatterService $formatterService,
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
            return $this->formatPostForFeed($post, $likedPostIds, $savedPostIds);
        });

        return response()->json([
            'posts' => $posts,
            'meta' => [
                'next_cursor' => optional($feed->nextCursor())->encode(),
                'has_more' => $feed->hasMorePages(),
                'per_page' => $feed->perPage(),
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

    public function show(Request $request, MessageWallPost $messageWallPost): Response
    {
        $messageWallPost->load([
            'user:id,first_name,other_names',
            'petProfile:id,name,pet_type_id,user_id',
            'petProfile.petType:id,name,icon',
            'tags:id,name,slug',
        ]);

        $comments = MessageWallComment::query()
            ->with('user:id,first_name,other_names')
            ->where('message_wall_post_id', $messageWallPost->id)
            ->orderBy('created_at')
            ->get()
            ->map(fn (MessageWallComment $comment) => $this->formatterService->formatComment($comment))
            ->all();

        $commentTree = $this->formatterService->buildCommentTree($comments);
        $post = $this->formatterService->formatPost($messageWallPost, $request->user()->id, $commentTree);

        return Inertia::render('feed/comments/show', [
            'post' => $post,
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

        $this->syncTags($post, $validated['tags'] ?? []);

        event(new MessageWallPostCreated($post->id));

        return response()->json([
            'success' => true,
            'post_id' => $post->id,
        ], 201);
    }

    /**
     * Format a post for feed view.
     *
     * @return array
     */
    private function formatPostForFeed(MessageWallPost $post, $likedPostIds, $savedPostIds): array
    {
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
                ->map(fn ($comment) => $this->formatterService->formatComment($comment))
                ->values(),
        ];
    }

    /**
     * Sync tags for a post.
     *
     * @param  array  $tagNames
     */
    private function syncTags(MessageWallPost $post, array $tagNames): void
    {
        $tags = collect($tagNames)
            ->map(fn (string $tag) => trim(Str::lower($tag)))
            ->filter()
            ->unique()
            ->take(8)
            ->values();

        if ($tags->isNotEmpty()) {
            $tagIds = $tags->map(function (string $tagName) {
                return MessageWallTag::firstOrCreate(
                    ['slug' => Str::slug($tagName)],
                    ['name' => $tagName]
                )->id;
            });

            $post->tags()->sync($tagIds->all());
        }
    }
}

