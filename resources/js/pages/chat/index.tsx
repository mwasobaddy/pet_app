import { Head, Link, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import chatRoutes from '@/routes/chat';
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

export default function ChatIndex({
    conversations: initialConversations,
    conversations_cursor: initialCursor = null,
    conversations_has_more: initialHasMore = false,
}: {
    conversations: ConversationSummary[];
    conversations_cursor?: string | null;
    conversations_has_more?: boolean;
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [conversations, setConversations] = useState<ConversationSummary[]>(initialConversations);
    const [cursor, setCursor] = useState<string | null>(initialCursor);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loadingMore, setLoadingMore] = useState(false);
    const observerRef = useRef<HTMLDivElement | null>(null);

    const loadConversations = useCallback(async (targetCursor: string | null) => {
        if (!targetCursor) {
            return;
        }

        setLoadingMore(true);

        try {
            const response = await fetch(chatRoutes.index.get({ query: { cursor: targetCursor } }).url, {
                cache: 'no-store',
                headers: {
                    Accept: 'application/json',
                },
            });
            const data = await response.json();

            setConversations((prev) => {
                const existing = new Map(prev.map((conversation) => [conversation.id, conversation]));

                (data.conversations ?? []).filter(Boolean).forEach((conversation: ConversationSummary) => {
                    existing.set(conversation.id, conversation);
                });

                return Array.from(existing.values());
            });
            setCursor(data.meta.next_cursor ?? null);
            setHasMore(data.meta.has_more);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        if (!window.Echo) {
            return;
        }

        const channels = conversations.map((conversation) => window.Echo.private(`chat.${conversation.id}`));

        channels.forEach((channel, index) => {
            const conversation = conversations[index];

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
            conversations.forEach((conversation) => {
                window.Echo?.leave(`chat.${conversation.id}`);
            });
        };
    }, [conversations, auth.user.id]);

    useEffect(() => {
        const target = observerRef.current;

        if (!target || !hasMore || loadingMore) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            const first = entries[0];

            if (first?.isIntersecting && hasMore && !loadingMore && cursor) {
                loadConversations(cursor);
            }
        }, {
            threshold: 0.4,
        });

        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, [cursor, hasMore, loadingMore, loadConversations]);

    return (
        <>
            <Head title="Chat" />

            <div className="min-h-screen w-full bg-gradient-to-b from-orange-50/50 via-white to-pink-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
                <div className="mx-auto flex min-h-screen max-w-4xl flex-col">
                    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
                        <div className="px-6 py-6 md:px-12">
                            <div className="text-center mb-2">
                                <p className="text-gray-500 dark:text-gray-400">
                                    Keep the conversation going with your matches.
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 overflow-hidden">
                        <main className="flex-1 overflow-y-auto p-6 md:p-12 pb-24 md:pb-12 lg:pb-16">
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
                            <div ref={observerRef} className="h-1" />
                        </main>

                        <aside className="hidden lg:flex flex-col border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                            <div className="sticky top-0 z-10 rounded-t-3xl border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 p-8 backdrop-blur">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Messages</p>
                                <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Your conversations</h2>
                                <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                    Select a conversation from the list to open it in a wider chat view.
                                </p>
                            </div>

                            <div className="flex flex-1 items-center justify-center px-8 py-10 text-center">
                                <div className="max-w-xs rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/80 p-8 shadow-sm">
                                    <div className="mb-6 text-5xl">💬</div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Pick a chat to continue</h3>
                                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                        Your message history will appear here once you open a conversation.
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>

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
                    <div className="h-20 md:hidden" />
                </div>
            </div>
        </>
    );
}
