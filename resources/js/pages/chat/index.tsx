import { useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import type { Auth } from '@/types/auth';

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

export default function ChatIndex({ conversations: initialConversations }: { conversations: ConversationSummary[] }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [conversations, setConversations] = useState<ConversationSummary[]>(initialConversations);

    useEffect(() => {
        if (!window.Echo) return;

        // Subscribe to all conversation channels
        initialConversations.forEach((conversation) => {
            const channel = window.Echo.private(`chat.${conversation.id}`);

            // Listen for new messages
            channel.listen('.message.sent', (event: { message: { id: number; sender_id: number; body: string | null; media_type: string | null; created_at: string } }) => {
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv.id === conversation.id
                            ? {
                                  ...conv,
                                  latest_message: event.message,
                                  last_message_at: event.message.created_at,
                                  unread_count: event.message.sender_id === auth.user.id ? conv.unread_count : conv.unread_count + 1,
                              }
                            : conv
                    )
                );
            });

            // Listen for read status updates
            channel.listen('.message.read', (event: { message_ids: number[]; reader_id: number }) => {
                if (event.reader_id !== auth.user.id) {
                    setConversations((prev) =>
                        prev.map((conv) =>
                            conv.id === conversation.id
                                ? {
                                      ...conv,
                                      unread_count: 0,
                                  }
                                : conv
                        )
                    );
                }
            });
        });

        return () => {
            initialConversations.forEach((conversation) => {
                window.Echo?.leave(`chat.${conversation.id}`);
            });
        };
    }, [initialConversations, auth.user.id]);

    return (
        <>
            <Head title="Chat" />

            <div className="min-h-screen w-full bg-gradient-to-b from-orange-50/50 via-white to-pink-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
                <div className="max-w-4xl mx-auto p-6 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 shadow-xl mb-4">
                            <span className="text-3xl">💬</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Your Conversations
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Keep the conversation going with your matches.
                        </p>
                    </div>

                    {conversations.length === 0 ? (
                        <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-12 text-center shadow-sm">
                            <div className="text-5xl mb-4">🐾</div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">No conversations yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                Start chatting once you match with another pet owner.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {conversations.map((conversation) => (
                                <Link
                                    key={conversation.id}
                                    href={`/chat/${conversation.id}`}
                                    className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.01] hover:border-orange-300 dark:hover:border-orange-500"
                                >
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <p className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                            {conversation.other_user?.name ?? 'Pet Owner'}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {conversation.latest_message?.body ?? (conversation.latest_message?.media_type ? '📎 Media message' : 'Say hello! 👋')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        {conversation.unread_count > 0 && (
                                            <span className="rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                                                {conversation.unread_count}
                                            </span>
                                        )}
                                        {conversation.last_message_at && (
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {new Date(conversation.last_message_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
