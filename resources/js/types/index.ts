export type * from './auth';
export type * from './navigation';
export type * from './ui';

export interface Notification {
    id: string;
    type: string;
    read_at: string | null;
    created_at: string;
    data: {
        type: 'post_liked' | 'post_commented' | 'message_wall_comment_reply' | 'match';
        post_id?: number;
        comment_id?: number;
        message: string;
        liker_name?: string;
        commenter_name?: string;
        replier_name?: string;
        pet_name?: string;
    };
}
