export interface FeedComment {
    id: number;
    user_id: number;
    user_name: string | null;
    body: string;
    parent_comment_id: number | null;
    created_at: string | null;
    replies: FeedComment[];
}

export interface FeedPost {
    id: number;
    user_id: number;
    pet_name: string | null;
    user_name: string | null;
    timestamp: string | null;
    location: string | null;
    content: string | null;
    hashtags: string[];
    media: {
        type: string | null;
        url: string;
    } | null;
    likes_count: number;
    comments_count: number;
    shares_count: number;
    user_has_liked: boolean;
    user_has_saved: boolean;
    comments: FeedComment[];
}

export interface FeedResponse {
    posts: FeedPost[];
    meta: {
        next_cursor: string | null;
        has_more: boolean;
        per_page: number;
    };
    config: {
        filtering_enabled: boolean;
        allowed_sort_modes: string[];
        default_sort_mode: 'latest' | 'popular' | 'following';
    };
    options: {
        pet_categories: { id: number; name: string; icon: string | null }[];
        tags: { id: number; name: string }[];
    };
}

export interface PostInteractionEventPayload {
    post_id: number;
    likes_count: number;
    comments_count: number;
    shares_count: number;
}

export interface CommentCreatedEventPayload {
    post_id: number;
    comment: FeedComment;
    comments_count: number;
}
