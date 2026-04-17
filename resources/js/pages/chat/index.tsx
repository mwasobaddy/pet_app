import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';

interface ConversationSummary {
    id: number;
    match_id: number | null;
    last_message_at: string | null;
    unread_count: number;
    other_user: {
        id: number;
        name: string;
    } | null;
    latest_message: {
        id: number;
        sender_id: number;
        body: string | null;
        media_type: string | null;
        created_at: string;
    } | null;
}

export default function ChatIndex({ conversations }: { conversations: ConversationSummary[] }) {
    return (
        <>
            <Head title="Chat" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Chats"
                    description="Keep the conversation going with your matches."
                />

                {conversations.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
                        <div className="text-4xl mb-4">💬</div>
                        <h3 className="font-semibold text-lg">No conversations yet</h3>
                        <p className="text-muted-foreground mt-2">
                            Start chatting once you match with another pet owner.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y rounded-lg border border-border bg-card">
                        {conversations.map((conversation) => (
                            <Link
                                key={conversation.id}
                                href={`/chat/${conversation.id}`}
                                className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-muted/40"
                            >
                                <div className="space-y-1">
                                    <p className="font-semibold">
                                        {conversation.other_user?.name ?? 'Pet Owner'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {conversation.latest_message?.body ?? (conversation.latest_message?.media_type ? 'Media message' : 'Say hello!')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {conversation.unread_count > 0 && (
                                        <span className="rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                                            {conversation.unread_count}
                                        </span>
                                    )}
                                    {conversation.last_message_at && (
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(conversation.last_message_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
