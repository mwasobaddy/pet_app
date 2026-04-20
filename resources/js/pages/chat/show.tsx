import { Head, usePage } from '@inertiajs/react';
import { Paperclip, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import chatRoutes from '@/routes/chat';
import type { Auth } from '@/types/auth';

interface ConversationDetails {
    id: number;
    match_id: number | null;
    other_user: {
        id: number;
        name: string;
    } | null;
}

interface ChatMessage {
    id: number;
    body: string | null;
    media_type: string | null;
    media_url: string | null;
    sender_id: number;
    sender_name: string | null;
    read_at: string | null;
    read_by_user_id: number | null;
    created_at: string;
}

export default function ChatShow({
    conversation,
    messages,
    messages_cursor: initialCursor = null,
    messages_has_more: initialHasMore = false,
}: {
    conversation: ConversationDetails;
    messages: ChatMessage[];
    messages_cursor?: string | null;
    messages_has_more?: boolean;
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [items, setItems] = useState<ChatMessage[]>(messages);
    const [messageBody, setMessageBody] = useState('');
    const [media, setMedia] = useState<File | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [messagesCursor, setMessagesCursor] = useState<string | null>(initialCursor);
    const [hasMoreMessages, setHasMoreMessages] = useState(initialHasMore);
    const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
    const typingTimeout = useRef<number | null>(null);
    const listRef = useRef<HTMLDivElement | null>(null);
    const topRef = useRef<HTMLDivElement | null>(null);

    const currentUserId = auth.user.id;

    const loadOlderMessages = useCallback(async () => {
        if (!messagesCursor) {
            return;
        }

        setLoadingOlderMessages(true);

        try {
            const response = await fetch(chatRoutes.show.get({
                args: conversation.id,
                query: { cursor: messagesCursor },
            }).url, {
                cache: 'no-store',
                headers: {
                    Accept: 'application/json',
                },
            });
            const data = await response.json();

            setItems((prev) => {
                const existing = new Map(prev.map((message) => [message.id, message]));
                (data.messages ?? []).filter(Boolean).forEach((message: ChatMessage) => {
                    existing.set(message.id, message);
                });

                return Array.from(existing.values());
            });
            setMessagesCursor(data.meta.next_cursor ?? null);
            setHasMoreMessages(data.meta.has_more);
        } catch (error) {
            console.error('Failed to load older messages:', error);
        } finally {
            setLoadingOlderMessages(false);
        }
    }, [conversation.id, messagesCursor]);

    useEffect(() => {
        const root = listRef.current;
        const target = topRef.current;

        if (!root || !target || !hasMoreMessages || loadingOlderMessages) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];

                if (first?.isIntersecting) {
                    loadOlderMessages();
                }
            },
            {
                root,
                threshold: 0.1,
            }
        );

        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, [hasMoreMessages, loadingOlderMessages, loadOlderMessages]);

    const sortedItems = useMemo(
        () => [...items].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        [items]
    );

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    }, [sortedItems.length]);

    const markRead = useCallback(async () => {
        await fetch(`/chat/${conversation.id}/read`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });
    }, [conversation.id]);

    useEffect(() => {
        markRead();
    }, [markRead]);

    useEffect(() => {
        if (!window.Echo) {
            return;
        }

        const channel = window.Echo.private(`chat.${conversation.id}`);

        channel.listen('.message.sent', (event: { message: ChatMessage }) => {
            setItems((prev) => [...prev, event.message]);
            markRead();
        });

        channel.listen('.message.read', (event: { message_ids: number[]; read_at: string; reader_id: number }) => {
            setItems((prev) =>
                prev.map((message) =>
                    event.message_ids.includes(message.id)
                        ? { ...message, read_at: event.read_at, read_by_user_id: event.reader_id }
                        : message
                )
            );
        });

        channel.listenForWhisper('typing', (payload: { user_id: number }) => {
            if (payload.user_id !== currentUserId) {
                setIsTyping(true);

                if (typingTimeout.current) {
                    window.clearTimeout(typingTimeout.current);
                }

                typingTimeout.current = window.setTimeout(() => {
                    setIsTyping(false);
                }, 2000);
            }
        });

        return () => {
            channel.stopListening('.message.sent');
            channel.stopListening('.message.read');
            window.Echo?.leave(`chat.${conversation.id}`);
        };
    }, [conversation.id, currentUserId, markRead]);

    const handleSend = async () => {
        if (!messageBody.trim() && !media) {
            return;
        }

        setIsSending(true);

        const formData = new FormData();
        formData.append('body', messageBody);

        if (media) {
            formData.append('media', media);
        }

        try {
            await fetch(`/chat/${conversation.id}/messages`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            setMessageBody('');
            setMedia(null);
        } catch (error) {
            console.error('Failed to send message', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleTyping = () => {
        if (!window.Echo) {
            return;
        }

        const channel = window.Echo.private(`chat.${conversation.id}`);
        channel.whisper('typing', { user_id: currentUserId });
    };

    return (
        <>
            <Head title={conversation.other_user?.name ? `Chat • ${conversation.other_user.name}` : 'Chat'} />

            <div className="h-svh w-full overflow-hidden bg-gradient-to-b from-orange-50/50 via-white to-pink-50/30 md:min-h-screen md:overflow-visible dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
                <div className="fixed inset-x-0 top-16 bottom-[72px] mx-auto w-full max-w-4xl md:static md:h-[calc(100vh-4rem)] md:p-6">
                    <div className="flex h-full min-h-0 flex-col rounded-2xl border-2 border-gray-200 bg-white/80 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
                        {/* Header */}
                        <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-r from-orange-50/50 to-pink-50/50 dark:from-gray-800 dark:to-gray-800 rounded-t-2xl">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-md">
                                <span className="text-xl">🐾</span>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {conversation.other_user?.name ?? 'Pet Owner'}
                                </h2>
                                {isTyping && (
                                    <p className="text-xs text-orange-500 font-medium animate-pulse">Typing...</p>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={listRef} className="flex-1 min-h-0 space-y-4 overflow-y-auto p-4 bg-gradient-to-b from-transparent to-orange-50/30 dark:to-gray-900/30">
                            <div ref={topRef} className="h-4" />
                            {sortedItems.map((message) => {
                                const isMine = message.sender_id === currentUserId;
                                const showRead = isMine && message.read_at;

                                return (
                                    <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] space-y-2 rounded-2xl px-4 py-3 text-sm shadow-md ${
                                            isMine
                                                ? 'bg-gradient-to-br from-orange-500 to-rose-500 text-white rounded-br-sm'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                                        }`}>
                                            {message.body && <p className="leading-relaxed">{message.body}</p>}
                                            {message.media_url && message.media_type?.startsWith('image') && (
                                                <img
                                                    src={message.media_url}
                                                    alt="Attachment"
                                                    className="mt-2 max-h-64 rounded-lg object-cover shadow-md"
                                                />
                                            )}
                                            {message.media_url && message.media_type?.startsWith('video') && (
                                                <video controls className="mt-2 max-h-64 rounded-lg shadow-md">
                                                    <source src={message.media_url} type={message.media_type} />
                                                </video>
                                            )}
                                            <div className={`text-xs ${isMine ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {showRead && (
                                                    <span className="ml-1">
                                                        ✓ Read
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {loadingOlderMessages && (
                                <div className="flex items-center justify-center py-4">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-red-500" />
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white/50 dark:bg-gray-800/50 rounded-b-2xl">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-orange-100 dark:hover:bg-gray-600 transition-colors">
                                        <Paperclip className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={(event) => setMedia(event.target.files?.[0] ?? null)}
                                        accept="image/*,video/*"
                                    />
                                </label>

                                <textarea
                                    value={messageBody}
                                    onChange={(event) => {
                                        setMessageBody(event.target.value);
                                        handleTyping();
                                    }}
                                    className="flex-1 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all resize-none"
                                    rows={2}
                                    placeholder="Write a message..."
                                />

                                <button
                                    type="button"
                                    onClick={handleSend}
                                    disabled={isSending}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    <Send className="h-5 w-5" />
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
