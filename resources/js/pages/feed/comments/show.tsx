import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import messageWallRoutes from '@/routes/message-wall';
import PostCard from '../components/PostCard';
import type {
    CommentCreatedEventPayload,
    FeedComment,
    FeedPost,
    PostInteractionEventPayload,
} from '../types';

interface ShowProps {
    post?: FeedPost | null;
}

export default function Show({ post: initialPost }: ShowProps) {
    const [post, setPost] = useState<FeedPost | null>(initialPost ?? null);
    const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
    const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
    const [activeReplyCommentId, setActiveReplyCommentId] = useState<number | null>(null);

    const appendCommentToPost = useCallback((post: FeedPost, incomingComment: FeedComment | null | undefined, nextCommentsCount: number): FeedPost => {
        if (!incomingComment) {
            return post;
        }

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

    useEffect(() => {
        if (!window.Echo || !post?.id) {
            return;
        }

        const channel = window.Echo.private('message-wall.feed');
        channel.listen('.message-wall.post.interaction-updated', (event: PostInteractionEventPayload) => {
            if (post?.id !== event.post_id) {
                return;
            }

            setPost((prev) => {
                if (!prev) {
                    return prev;
                }

                return {
                    ...prev,
                    likes_count: event.likes_count,
                    comments_count: event.comments_count,
                    shares_count: event.shares_count,
                };
            });
        });
        channel.listen('.message-wall.comment.created', (event: CommentCreatedEventPayload) => {
            if (post?.id !== event.post_id) {
                return;
            }

            setPost((prev) => {
                if (!prev) {
                    return prev;
                }

                return appendCommentToPost(prev, event.comment, event.comments_count);
            });
        });

        return () => {
            channel.stopListening('.message-wall.post.interaction-updated');
            channel.stopListening('.message-wall.comment.created');
            window.Echo?.leave('message-wall.feed');
        };
    }, [post?.id, appendCommentToPost]);

    const updatePost = (updater: (post: FeedPost) => FeedPost) => {
        setPost((prev) => {
            if (!prev) {
                return prev;
            }

            return updater(prev);
        });
    };

    const toggleLike = async (postId: number) => {
        if (!post?.id) {
            return;
        }

        try {
            const response = await fetch(messageWallRoutes.posts.like.url(postId), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const data: { liked: boolean; likes_count: number } = await response.json();
            updatePost((post) => ({
                ...post,
                user_has_liked: data.liked,
                likes_count: data.likes_count,
            }));
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const toggleSave = async (postId: number) => {
        if (!post?.id) {
            return;
        }

        try {
            const response = await fetch(messageWallRoutes.posts.save.url(postId), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const data: { saved: boolean } = await response.json();
            updatePost((post) => ({
                ...post,
                user_has_saved: data.saved,
            }));
        } catch (error) {
            console.error('Failed to toggle save:', error);
        }
    };

    const sharePost = async (postId: number) => {
        if (!post?.id) {
            return;
        }

        try {
            const response = await fetch(messageWallRoutes.posts.share.url(postId), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const data: { shares_count: number } = await response.json();
            updatePost((post) => ({
                ...post,
                shares_count: data.shares_count,
            }));
        } catch (error) {
            console.error('Failed to share post:', error);
        }
    };

    const submitComment = async (postId: number, parentCommentId: number | null = null) => {
        if (!post?.id) {
            return;
        }

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
            updatePost((post) => appendCommentToPost(post, data.comment, data.comments_count));

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

    const findCommentById = (commentId: number, comments: FeedComment[] = []): FeedComment | null => {
        for (const comment of comments) {
            if (comment.id === commentId) {
                return comment;
            }

            if (comment.replies?.length) {
                const nested = findCommentById(commentId, comment.replies);

                if (nested) {
                    return nested;
                }
            }
        }

        return null;
    };

    const activeReplyComment = activeReplyCommentId !== null
        ? findCommentById(activeReplyCommentId, post.comments ?? [])
        : null;

    const replyInputValue = activeReplyCommentId !== null
        ? replyDrafts[activeReplyCommentId] ?? ''
        : commentDrafts[post.id] ?? '';

    const replyPlaceholder = activeReplyComment
        ? `Replying to ${activeReplyComment.user_name}`
        : 'Add a comment...';

    if (!post) {
        return (
            <>
                <Head title="Post details" />
                <div className="min-h-screen bg-gray-50 py-4 dark:bg-black md:py-6">
                    <div className="mx-auto max-w-2xl px-4">
                        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                            Loading post details...
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const authorName = post.user_name || post.pet_name || 'Pet Owner';
    const authorInitial = authorName.charAt(0).toUpperCase();

    return (
        <>
            <Head title={`Post by ${authorName}`} />

            <div className="min-h-screen bg-black text-white">
                <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="mb-4 flex items-center justify-between">
                        <Link
                            href="/feed"
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <h1 className="text-sm font-semibold text-white">Comments</h1>
                        <div className="h-8 w-8" />
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
                        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white">
                                {authorInitial}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">{authorName}</p>
                                {post.location && (
                                    <p className="truncate text-xs text-gray-400">{post.location}</p>
                                )}
                            </div>
                        </div>

                        {post.media && post.media.type?.startsWith('image') && (
                            <div className="bg-black">
                                <img
                                    src={post.media.url}
                                    alt={post.content ?? 'Post image'}
                                    className="block w-full object-contain"
                                />
                            </div>
                        )}

                        {post.media && post.media.type?.startsWith('video') && (
                            <div className="bg-black">
                                <video controls className="block w-full object-contain">
                                    <source src={post.media.url} type={post.media.type ?? undefined} />
                                </video>
                            </div>
                        )}

                        <div className="bg-slate-950 px-4 py-4 sm:px-5">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        {post.likes_count.toLocaleString()} likes
                                    </p>
                                    <p className="mt-1 text-sm text-gray-400">
                                        {post.comments_count.toLocaleString()} comments
                                    </p>
                                </div>
                            </div>

                            <PostCard
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
                                formatTime={formatTime}
                                hideHeader
                                hideMedia
                                hideCommentInput
                                showCommentsInitially
                            />

                            <div className="mt-4 border-t border-white/10 pt-4">
                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        submitComment(post.id, activeReplyCommentId);
                                    }}
                                    className="space-y-3"
                                >
                                    {activeReplyComment && (
                                        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                                            <div>
                                                Replying to{' '}
                                                <span className="font-semibold text-white">
                                                    @{activeReplyComment.user_name}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setActiveReplyCommentId(null)}
                                                className="text-sm font-semibold text-gray-300 transition hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <input
                                            value={replyInputValue}
                                            onChange={(event) => {
                                                const value = event.target.value;

                                                if (activeReplyCommentId !== null) {
                                                    setReplyDrafts((prev) => ({ ...prev, [activeReplyCommentId]: value }));
                                                } else {
                                                    setCommentDrafts((prev) => ({ ...prev, [post.id]: value }));
                                                }
                                            }}
                                            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
                                            placeholder={replyPlaceholder}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!replyInputValue.trim()}
                                            className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Post
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}