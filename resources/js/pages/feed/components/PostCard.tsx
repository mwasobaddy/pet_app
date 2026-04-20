import { Bookmark, MessageCircle, MoreHorizontal, Send, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import type { FeedComment, FeedPost } from '../types';

interface PostCardProps {
    post: FeedPost;
    commentDrafts: Record<number, string>;
    replyDrafts: Record<number, string>;
    activeReplyCommentId: number | null;
    onToggleLike: (postId: number) => void;
    onSharePost: (postId: number) => void;
    onToggleSave: (postId: number) => void;
    onSubmitComment: (postId: number, parentCommentId?: number | null) => void;
    onUpdateCommentDraft: (postId: number, value: string) => void;
    onUpdateReplyDraft: (commentId: number, value: string) => void;
    onSetActiveReply: (commentId: number | null) => void;
    onCommentIconClick?: (postId: number) => void;
    formatTime: (value: string | null) => string;
    hideHeader?: boolean;
    hideMedia?: boolean;
    hideComments?: boolean;
    hideCommentInput?: boolean;
    showCommentsInitially?: boolean;
}

export default function PostCard({
    post,
    commentDrafts,
    replyDrafts,
    activeReplyCommentId,
    onToggleLike,
    onSharePost,
    onToggleSave,
    onSubmitComment,
    onUpdateCommentDraft,
    onUpdateReplyDraft,
    onSetActiveReply,
    onCommentIconClick,
    formatTime,
    hideHeader = false,
    hideMedia = false,
    hideComments = false,
    hideCommentInput = false,
    showCommentsInitially = false,
}: PostCardProps) {
    void replyDrafts;
    void activeReplyCommentId;
    void onUpdateReplyDraft;
    void onSetActiveReply;

    const [showComments, setShowComments] = useState(showCommentsInitially);
    const [showAllComments, setShowAllComments] = useState(false);
    const [openedReplies, setOpenedReplies] = useState<Record<number, boolean>>({});
    const [showFullContent, setShowFullContent] = useState(false);

    const visibleComments = showAllComments ? post.comments ?? [] : (post.comments ?? []).slice(0, 2);

    const toggleReplies = (commentId: number) => {
        setOpenedReplies((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
    };

    const renderReplies = (replies: FeedComment[], depth = 0) => (
        <div className="space-y-3">
            {replies.map((reply) => (
                <div key={reply.id} className={`flex items-start gap-2 border-l border-gray-200 pl-4 dark:border-gray-800 ${depth > 0 ? 'ml-4' : 'ml-6'}`}>
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                        {reply.user_name?.charAt(0).toUpperCase() ?? 'U'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {reply.user_name || 'Pet Owner'}
                            </span>{' '}
                            {reply.body}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                            <span>{formatTime(reply.created_at)}</span>
                            <button
                                type="button"
                                onClick={() => onSetActiveReply?.(reply.id)}
                                className="font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-white"
                            >
                                Reply
                            </button>
                        </div>
                        {reply.replies?.length ? (
                            <div className="mt-3">
                                {renderReplies(reply.replies, depth + 1)}
                            </div>
                        ) : null}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <article className="border-b border-gray-200 bg-white pb-4 dark:border-gray-800 dark:bg-gray-900 md:rounded-xl md:border">
            {/* Header */}
            {!hideHeader && (
                <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-orange-400 to-pink-500">
                            <span className="text-sm">
                                {post.pet_name?.toLowerCase().includes('dog') || post.pet_name === 'Buddy' ? '🐕' :
                                 post.pet_name?.toLowerCase().includes('cat') || post.pet_name === 'Luna' ? '🐱' :
                                 post.pet_name?.toLowerCase().includes('bird') || post.pet_name === 'Charlie' ? '🐦' :
                                 post.pet_name?.toLowerCase().includes('fish') || post.pet_name === 'Nemo' ? '🐠' :
                                 post.pet_name?.toLowerCase().includes('bunny') || post.pet_name === 'Snowball' ? '🐰' :
                                 post.pet_name?.toLowerCase().includes('hamster') || post.pet_name === 'Peanut' ? '🐹' : '🐾'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {post.pet_name || post.user_name || 'Pet Owner'}
                            </p>
                            {post.location && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{post.location}</p>
                            )}
                        </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreHorizontal className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* Media - Full Width */}
            {!hideMedia && post.media && post.media.type?.startsWith('image') && (
                <div className="aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img src={post.media.url} alt="Post" className="h-full w-full object-cover" />
                </div>
            )}

            {!hideMedia && post.media && post.media.type?.startsWith('video') && (
                <div className="aspect-square w-full bg-black">
                    <video controls className="h-full w-full object-cover">
                        <source src={post.media.url} type={post.media.type ?? undefined} />
                    </video>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between px-3 pt-3">
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onToggleLike(post.id)}
                        className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <ThumbsUp
                            className={`h-6 w-6 ${
                                post.user_has_liked
                                    ? 'fill-orange-500 text-orange-500'
                                    : 'text-gray-700 dark:text-gray-300'
                            }`}
                        />
                    </button>
                    <button
                        type="button"
                        onClick={() => {

                            if (onCommentIconClick) {
                                onCommentIconClick(post.id);

                                return;
                            }

                            setShowComments(!showComments);
                        }}
                        className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <MessageCircle className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onSharePost(post.id)}
                        className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <Send className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                    </button>
                </div>
                <button
                    type="button"
                    onClick={() => onToggleSave(post.id)}
                    className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <Bookmark
                        className={`h-6 w-6 ${
                            post.user_has_saved
                                ? 'fill-emerald-500 text-emerald-500'
                                : 'text-gray-700 dark:text-gray-300'
                        }`}
                    />
                </button>
            </div>

            {/* Likes Count */}
            <div className="px-3 pt-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {post.likes_count.toLocaleString()} likes
                </p>
            </div>

            {/* Content */}
            {post.content && (
                <div className="px-3 pt-2">
                    <button
                        type="button"
                        onClick={() => setShowFullContent(true)}
                        className="w-full text-left text-sm text-gray-700 dark:text-gray-300 focus:outline-none"
                        style={!showFullContent ? {
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        } : undefined}
                    >
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {post.pet_name || post.user_name || 'Pet Owner'}
                        </span>{' '}
                        {post.content}
                    </button>
                </div>
            )}

            {/* Hashtags */}
            {post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-x-2 px-3 pt-1">
                    {post.hashtags.map((hashtag) => (
                        <span key={`${post.id}-${hashtag}`} className="text-sm font-medium text-blue-500 hover:underline">
                            #{hashtag}
                        </span>
                    ))}
                </div>
            )}

            {/* View Comments */}
            {!hideComments && post.comments.length > 0 && (
                <div className="px-3 pt-2">
                    {!showComments ? (
                        <button
                            type="button"
                            onClick={() => setShowComments(true)}
                            className="text-sm text-gray-500 dark:text-gray-400"
                        >
                            View all {post.comments_count} comments
                        </button>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {visibleComments.filter(Boolean).map((comment, index) => (
                                    <div key={comment?.id ?? index} className="space-y-2">
                                        <div className="flex gap-2">
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {comment?.user_name || 'Pet Owner'}
                                                </span>{' '}
                                                {comment?.body}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span>{formatTime(comment?.created_at ?? null)}</span>
                                            <button
                                                type="button"
                                                onClick={() => onSetActiveReply?.(comment?.id ?? 0)}
                                                className="font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-white"
                                            >
                                                Reply
                                            </button>
                                            {comment?.replies?.length ? (
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    View {comment.replies.length} repl{comment.replies.length === 1 ? 'y' : 'ies'}
                                                </span>
                                            ) : null}
                                        </div>

                                        {comment?.replies?.length ? (
                                            <div className="mt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleReplies(comment.id)}
                                                    className="text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                                                >
                                                    {openedReplies[comment.id]
                                                        ? `Hide ${comment.replies.length} repl${comment.replies.length === 1 ? 'y' : 'ies'}`
                                                        : `View all ${comment.replies.length} repl${comment.replies.length === 1 ? 'y' : 'ies'}`}
                                                </button>
                                            </div>
                                        ) : null}

                                        {comment?.replies?.length && openedReplies[comment.id] ? (
                                            <div className="mt-3">
                                                {renderReplies(comment.replies)}
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                            {post.comments.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => setShowAllComments(!showAllComments)}
                                    className="mt-1 text-sm text-gray-500 dark:text-gray-400"
                                >
                                    {showAllComments ? 'Show less' : `View ${post.comments.length - 2} more comments`}
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}

            {!hideCommentInput && (
                <div className="flex items-center gap-2 border-t border-gray-100 px-3 pt-3 dark:border-gray-800">
                    <input
                        value={commentDrafts[post.id] ?? ''}
                        onChange={(event) => onUpdateCommentDraft(post.id, event.target.value)}
                        onKeyPress={(event) => {
                            if (event.key === 'Enter') {
                                onSubmitComment(post.id);
                            }
                        }}
                        className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none dark:text-gray-300"
                        placeholder="Add a comment..."
                    />
                    {(commentDrafts[post.id] ?? '').trim() && (
                        <button
                            type="button"
                            onClick={() => onSubmitComment(post.id)}
                            className="text-sm font-semibold text-blue-500 hover:text-blue-600"
                        >
                            Post
                        </button>
                    )}
                </div>
            )}

            {/* Timestamp */}
            <div className="px-3 pt-2">
                <p className="text-xs uppercase text-gray-400">{formatTime(post.timestamp)}</p>
            </div>
        </article>
    );
}
