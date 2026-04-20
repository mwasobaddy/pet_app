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

    return (
        <>
            <Head title={`Post by ${post.user_name}`} />

            <div className="min-h-screen bg-gray-50 py-4 dark:bg-black md:py-6">
                <div className="mx-auto max-w-2xl px-4">
                    {/* Back Button / Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <Link
                            href="/feed"
                            className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Feed
                        </Link>
                        <h1 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                            Post Details
                        </h1>
                    </div>

                    {/* Post Card - Facebook Style */}
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
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
                        />
                    </div>

                    {/* Spacing at bottom for mobile */}
                    <div className="mt-6" />
                </div>
            </div>
        </>
    );
}