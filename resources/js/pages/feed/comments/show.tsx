import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import messageWallRoutes from '@/routes/message-wall';
import LeftSidebar from '../components/LeftSidebar';
import PostCard from '../components/PostCard';
import RightSidebar from '../components/RightSidebar';
import type {
    CommentCreatedEventPayload,
    FeedComment,
    FeedPost,
    PostInteractionEventPayload,
} from '../types';

interface ShowProps {
    post: FeedPost;
}

export default function Show({ post: initialPost }: ShowProps) {
    const [post, setPost] = useState<FeedPost>(initialPost);
    const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
    const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
    const [activeReplyCommentId, setActiveReplyCommentId] = useState<number | null>(null);

    const appendCommentToPost = useCallback((post: FeedPost, incomingComment: FeedComment, nextCommentsCount: number): FeedPost => {
        if (incomingComment.parent_comment_id === null) {
            const exists = post.comments.some((comment) => comment.id === incomingComment.id);

            if (exists) {
                return {
                    ...post,
                    comments_count: nextCommentsCount,
                };
            }

            return {
                ...post,
                comments_count: nextCommentsCount,
                comments: [...post.comments, incomingComment],
            };
        }

        return {
            ...post,
            comments_count: nextCommentsCount,
            comments: post.comments.map((comment) => {
                if (comment.id !== incomingComment.parent_comment_id) {
                    return comment;
                }

                const replyExists = comment.replies.some((reply) => reply.id === incomingComment.id);

                if (replyExists) {
                    return comment;
                }

                return {
                    ...comment,
                    replies: [...comment.replies, incomingComment],
                };
            }),
        };
    }, []);

    useEffect(() => {
        if (!window.Echo) {
            return;
        }

        const channel = window.Echo.private('message-wall.feed');
        channel.listen('.message-wall.post.interaction-updated', (event: PostInteractionEventPayload) => {
            if (post.id !== event.post_id) {
                return;
            }

            setPost((prev) => ({
                ...prev,
                likes_count: event.likes_count,
                comments_count: event.comments_count,
                shares_count: event.shares_count,
            }));
        });
        channel.listen('.message-wall.comment.created', (event: CommentCreatedEventPayload) => {
            if (post.id !== event.post_id) {
                return;
            }

            setPost((prev) => appendCommentToPost(prev, event.comment, event.comments_count));
        });

        return () => {
            channel.stopListening('.message-wall.post.interaction-updated');
            channel.stopListening('.message-wall.comment.created');
            window.Echo?.leave('message-wall.feed');
        };
    }, [post.id, appendCommentToPost]);

    const updatePost = (updater: (post: FeedPost) => FeedPost) => {
        setPost((prev) => updater(prev));
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

    return (
        <>
            <Head title={`Post by ${post.user_name}`} />

            <div className="min-h-screen bg-linear-to-br from-orange-50/40 via-white to-pink-50/20 px-4 py-6 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 md:px-6">
                <div className="mx-auto flex max-w-7xl gap-6">
                    {/* Left Sidebar */}
                    <LeftSidebar />

                    {/* Main Content */}
                    <main className="flex-1 space-y-6">
                        <div className="rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/90">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Post Details</h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                View and engage with this post
                            </p>
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
                        />
                    </main>

                    {/* Right Sidebar */}
                    <RightSidebar />
                </div>
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
        {
            title: 'Post',
            href: '/feed/comments/show',
        },
    ],
};