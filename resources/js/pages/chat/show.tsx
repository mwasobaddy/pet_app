import { useEffect, useMemo, useRef, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Paperclip, Send } from 'lucide-react';
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

export default function ChatShow({ conversation, messages }: { conversation: ConversationDetails; messages: ChatMessage[] }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [items, setItems] = useState<ChatMessage[]>(messages);
    const [messageBody, setMessageBody] = useState('');
    const [media, setMedia] = useState<File | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeout = useRef<number | null>(null);
    const listRef = useRef<HTMLDivElement | null>(null);

    const currentUserId = auth.user.id;

    const sortedItems = useMemo(
        () => [...items].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        [items]
    );

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    }, [sortedItems.length]);

    useEffect(() => {
        markRead();
    }, []);

    useEffect(() => {
        if (!window.Echo) return;

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
    }, [conversation.id, currentUserId]);

    const markRead = async () => {
        await fetch(`/chat/${conversation.id}/read`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });
    };

    const handleSend = async () => {
        if (!messageBody.trim() && !media) return;

        setIsSending(true);

        const formData = new FormData();
        formData.append('body', messageBody);
        if (media) {
            formData.append('media', media);
        }

        try {
            const response = await fetch(`/chat/${conversation.id}/messages`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            const data = await response.json();

            if (data.message) {
                setItems((prev) => [...prev, data.message]);
            }

            setMessageBody('');
            setMedia(null);
        } catch (error) {
            console.error('Failed to send message', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleTyping = () => {
        if (!window.Echo) return;

        const channel = window.Echo.private(`chat.${conversation.id}`);
        channel.whisper('typing', { user_id: currentUserId });
    };

    return (
        <>
            <Head title={conversation.other_user?.name ? `Chat • ${conversation.other_user.name}` : 'Chat'} />

            <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl border border-border bg-card">
                <div className="border-b border-border p-4">
                    <h2 className="text-lg font-semibold">
                        {conversation.other_user?.name ?? 'Pet Owner'}
                    </h2>
                    {isTyping && (
                        <p className="text-xs text-muted-foreground">Typing...</p>
                    )}
                </div>

                <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4">
                    {sortedItems.map((message) => {
                        const isMine = message.sender_id === currentUserId;
                        const showRead = isMine && message.read_at;

                        return (
                            <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] space-y-1 rounded-2xl px-4 py-2 text-sm ${isMine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                                    {message.body && <p>{message.body}</p>}
                                    {message.media_url && message.media_type?.startsWith('image') && (
                                        <img
                                            src={message.media_url}
                                            alt="Attachment"
                                            className="mt-2 max-h-64 rounded-lg object-cover"
                                        />
                                    )}
                                    {message.media_url && message.media_type?.startsWith('video') && (
                                        <video controls className="mt-2 max-h-64 rounded-lg">
                                            <source src={message.media_url} type={message.media_type} />
                                        </video>
                                    )}
                                    <div className="text-xs opacity-70">
                                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {showRead && ' • Read'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="border-t border-border p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                            <Paperclip className="h-4 w-4" />
                            <span>Attach</span>
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
                            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={2}
                            placeholder="Write a message..."
                        />

                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={isSending}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                        >
                            <Send className="h-4 w-4" />
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
