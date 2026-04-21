import { Head, Link, router } from '@inertiajs/react';
import { Filter } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import feedComments from '@/routes/feed/comments';
import messageWallRoutes from '@/routes/message-wall';
import FeedFilters from './components/FeedFilters';
import PostCard from './components/PostCard';
import type {
    CommentCreatedEventPayload,
    FeedComment,
    FeedPost,
    FeedResponse,
    PostInteractionEventPayload,
} from './types';

export default function Show() {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [sortMode, setSortMode] = useState<'latest' | 'popular' | 'following'>('latest');
    const [selectedPetCategory, setSelectedPetCategory] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [filteringEnabled, setFilteringEnabled] = useState(true);
    const [allowedSortModes, setAllowedSortModes] = useState<string[]>(['latest', 'popular', 'following']);
    const [petCategories, setPetCategories] = useState<{ id: number; name: string; icon: string | null }[]>([]);
    const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
    const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
    const [activeReplyCommentId, setActiveReplyCommentId] = useState<number | null>(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const observerRef = useRef<HTMLDivElement | null>(null);

    const activeSort = useMemo(() => {
        if (allowedSortModes.includes(sortMode)) {
            return sortMode;
        }

        return (allowedSortModes[0] ?? 'latest') as 'latest' | 'popular' | 'following';
    }, [allowedSortModes, sortMode]);

    const feedQuery = useMemo(() => {
        return {
            sort: activeSort,
            pet_category: selectedPetCategory || undefined,
            tags: selectedTags.length > 0 ? selectedTags : undefined,
        };
    }, [activeSort, selectedPetCategory, selectedTags]);

    const appendCommentToPost = useCallback((post: FeedPost, incomingComment: FeedComment, nextCommentsCount: number): FeedPost => {
        const comments = post.comments ?? [];

        if (incomingComment.parent_comment_id === null) {
            const exists = comments.some((comment) => comment?.id === incomingComment.id);

            if (exists) {
                return {
                    ...post,
                    comments_count: nextCommentsCount,
                };
            }

            return {
                ...post,
                comments_count: nextCommentsCount,
                comments: [...comments, { ...incomingComment, replies: incomingComment.replies ?? [] }],
            };
        }

        return {
            ...post,
            comments_count: nextCommentsCount,
            comments: comments.map((comment) => {
                if (!comment || comment.id !== incomingComment.parent_comment_id) {
                    return comment;
                }

                const replies = comment.replies ?? [];
                const replyExists = replies.some((reply) => reply?.id === incomingComment.id);

                if (replyExists) {
                    return comment;
                }

                return {
                    ...comment,
                    replies: [...replies, incomingComment],
                };
            }),
        };
    }, []);

    const loadFeed = useCallback(async (targetCursor: string | null = null, replace = false) => {
        if (replace) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const query = {
                ...feedQuery,
                ...(targetCursor ? { cursor: targetCursor } : {}),
            };
            const response = await fetch(messageWallRoutes.index.url({ query }));
            const data: FeedResponse = await response.json();
            setFilteringEnabled(data.config.filtering_enabled);
            setAllowedSortModes(data.config.allowed_sort_modes);
            setPetCategories(data.options.pet_categories ?? []);
            setTags(data.options.tags ?? []);
            setPosts((prev) => {
                if (replace) {
                    return data.posts;
                }

                const existing = new Map(prev.map((post) => [post.id, post]));
                data.posts.forEach((post) => existing.set(post.id, post));

                return Array.from(existing.values());
            });
            setCursor(data.meta.next_cursor ?? null);
            setHasMore(data.meta.has_more);
        } catch (error) {
            console.error('Failed to load message wall feed:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [feedQuery]);

    useEffect(() => {
        loadFeed(null, true);
    }, [loadFeed]);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            loadFeed(null, true);
        }, 15000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [loadFeed]);

    useEffect(() => {
        if (!window.Echo) {
            return;
        }

        const channel = window.Echo.private('message-wall.feed');
        channel.listen('.message-wall.post.created', () => {
            loadFeed(1, true);
        });
        channel.listen('.message-wall.post.interaction-updated', (event: PostInteractionEventPayload) => {
            setPosts((prev) => prev.map((post) => {
                if (post.id !== event.post_id) {
                    return post;
                }

                return {
                    ...post,
                    likes_count: event.likes_count,
                    comments_count: event.comments_count,
                    shares_count: event.shares_count,
                };
            }));
        });
        channel.listen('.message-wall.comment.created', (event: CommentCreatedEventPayload) => {
            setPosts((prev) => prev.map((post) => {
                if (post.id !== event.post_id) {
                    return post;
                }

                return appendCommentToPost(post, event.comment, event.comments_count);
            }));
        });

        return () => {
            channel.stopListening('.message-wall.post.created');
            channel.stopListening('.message-wall.post.interaction-updated');
            channel.stopListening('.message-wall.comment.created');
            window.Echo?.leave('message-wall.feed');
        };
    }, [appendCommentToPost, loadFeed]);

    useEffect(() => {
        const target = observerRef.current;

        if (!target || !hasMore || loadingMore || loading) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            const first = entries[0];

            if (first?.isIntersecting && hasMore && !loadingMore) {
                loadFeed(cursor, false);
            }
        }, {
            threshold: 0.4,
        });
        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, [hasMore, loadFeed, loading, loadingMore, cursor]);

    const updatePost = (postId: number, updater: (post: FeedPost) => FeedPost) => {
        setPosts((prev) => prev.map((post) => (post.id === postId ? updater(post) : post)));
    };

    const toggleLike = async (postId: number) => {
        try {
            const response = await fetch(messageWallRoutes.posts.like.url(postId), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const data: { liked: boolean; likes_count: number } = await response.json();
            updatePost(postId, (post) => ({
                ...post,
                user_has_liked: data.liked,
                likes_count: data.likes_count,
            }));
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const toggleSave = async (postId: number) => {
        try {
            const response = await fetch(messageWallRoutes.posts.save.url(postId), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const data: { saved: boolean } = await response.json();
            updatePost(postId, (post) => ({
                ...post,
                user_has_saved: data.saved,
            }));
        } catch (error) {
            console.error('Failed to toggle save:', error);
        }
    };

    const sharePost = async (postId: number) => {
        try {
            const response = await fetch(messageWallRoutes.posts.share.url(postId), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const data: { shares_count: number } = await response.json();
            updatePost(postId, (post) => ({
                ...post,
                shares_count: data.shares_count,
            }));
        } catch (error) {
            console.error('Failed to share post:', error);
        }
    };

    const submitComment = async (postId: number, parentCommentId: number | null = null) => {
        const body = parentCommentId === null
            ? (commentDrafts[postId] ?? '').trim()
            : (replyDrafts[parentCommentId] ?? '').trim();

        if (!body) {
            return;
        }

        try {
            const response = await fetch(messageWallRoutes.posts.comment.url(postId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    body,
                    parent_comment_id: parentCommentId,
                }),
            });
            const data: { comments_count: number; comment: FeedComment } = await response.json();
            updatePost(postId, (post) => appendCommentToPost(post, data.comment, data.comments_count));

            if (parentCommentId === null) {
                setCommentDrafts((prev) => ({
                    ...prev,
                    [postId]: '',
                }));
            } else {
                setReplyDrafts((prev) => ({
                    ...prev,
                    [parentCommentId]: '',
                }));
                setActiveReplyCommentId(null);
            }
        } catch (error) {
            console.error('Failed to comment:', error);
        }
    };

    const formatTime = (value: string | null) => {
        if (!value) {
            return 'Just now';
        }

        return new Date(value).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Head title="Message Wall" />

            <div className="min-h-screen bg-gray-50 dark:bg-black">
                {/* Desktop Header */}
                <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-black/95">
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                            PetFeed
                        </h1>
                        <div className="hidden items-center gap-4 md:flex">
                            <FeedFilters
                                sortMode={activeSort}
                                selectedPetCategory={selectedPetCategory}
                                selectedTags={selectedTags}
                                filteringEnabled={filteringEnabled}
                                allowedSortModes={allowedSortModes}
                                petCategories={petCategories}
                                tags={tags}
                                onSortChange={setSortMode}
                                onPetCategoryChange={setSelectedPetCategory}
                                onTagAdd={(tagId) => setSelectedTags((prev) => (prev.includes(tagId) ? prev : [...prev, tagId]))}
                                onTagRemove={(tagId) => setSelectedTags((prev) => prev.filter((id) => id !== tagId))}
                            />
                            <Link
                                href="/feed/create"
                                className="rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-1.5 text-sm font-semibold text-white hover:shadow-lg transition-shadow"
                            >
                                Create Post
                            </Link>
                        </div>
                        <div className="flex items-center gap-2 md:hidden">
                            <Link
                                href="/feed/create"
                                className="rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-1.5 text-sm font-semibold text-white"
                            >
                                Create
                            </Link>
                            <button
                                type="button"
                                onClick={() => setShowMobileFilters(!showMobileFilters)}
                                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                            </button>
                        </div>
                    </div>
                </header>

                {/* Mobile Filters Drawer */}
                {showMobileFilters && (
                    <div className="sticky top-[53px] z-10 border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-black md:hidden">
                        <FeedFilters
                            sortMode={activeSort}
                            selectedPetCategory={selectedPetCategory}
                            selectedTags={selectedTags}
                            filteringEnabled={filteringEnabled}
                            allowedSortModes={allowedSortModes}
                            petCategories={petCategories}
                            tags={tags}
                            onSortChange={setSortMode}
                            onPetCategoryChange={setSelectedPetCategory}
                            onTagAdd={(tagId) => setSelectedTags((prev) => (prev.includes(tagId) ? prev : [...prev, tagId]))}
                            onTagRemove={(tagId) => setSelectedTags((prev) => prev.filter((id) => id !== tagId))}
                        />
                    </div>
                )}

                {/* Main Content - Centered Instagram Style */}
                <main className="mx-auto max-w-2xl px-0 md:px-4">
                    {/* Posts Feed */}
                    <div className="space-y-0 md:space-y-4">
                        {loading && posts.length === 0 ? (
                            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                Loading feed...
                            </div>
                        ) : (
                            <>
                                {posts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        commentDrafts={commentDrafts}
                                        replyDrafts={replyDrafts}
                                        activeReplyCommentId={activeReplyCommentId}
                                        onToggleLike={toggleLike}
                                        onSharePost={sharePost}
                                        onToggleSave={toggleSave}
                                        onSubmitComment={submitComment}
                                        onUpdateCommentDraft={(postId, value) => setCommentDrafts((prev) => ({ ...prev, [postId]: value }))}
                                        onUpdateReplyDraft={(commentId, value) => setReplyDrafts((prev) => ({ ...prev, [commentId]: value }))}
                                        onSetActiveReply={setActiveReplyCommentId}
                                        onCommentIconClick={(postId) => router.visit(feedComments.show.url(postId))}
                                        hideComments
                                        hideCommentInput
                                        formatTime={formatTime}
                                    />
                                ))}

                                <div ref={observerRef} className="h-1" />

                                {loadingMore && (
                                    <div className="py-4 text-center text-xs text-gray-500 dark:text-gray-400">
                                        <div className="inline-flex items-center gap-2">
                                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-black md:hidden">
                    <div className="flex items-center justify-around py-2">
                        <a href="/feed" className="flex flex-col items-center gap-1 p-2 text-gray-900 dark:text-white">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                            <span className="text-[10px]">Home</span>
                        </a>
                        <a href="/feed/create" className="flex flex-col items-center gap-1 p-2 text-gray-500 dark:text-gray-400">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-[10px]">Create</span>
                        </a>
                        <a href="/profile" className="flex flex-col items-center gap-1 p-2 text-gray-500 dark:text-gray-400">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-[10px]">Profile</span>
                        </a>
                    </div>
                </nav>

                {/* Spacer for mobile bottom nav */}
                <div className="h-20 md:hidden" />
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        {
            title: 'Feed',
            href: '/feed',
        },
    ],
};