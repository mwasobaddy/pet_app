import { Head, router, usePage } from '@inertiajs/react';
import { Heart, MessageCircle, PawPrint, User } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import feedComments from '@/routes/feed/comments';
import notificationsRoutes from '@/routes/notifications';
import type { Notification } from '@/types';

export default function Notifications() {
    const { auth } = usePage().props;
    const [notificationList, setNotificationList] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const observerRef = useRef<HTMLDivElement | null>(null);

    const loadNotifications = useCallback(async (targetCursor: string | null = null, replace = false) => {
        if (replace) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const query = {
                ...(targetCursor ? { cursor: targetCursor } : {}),
            };
            const response = await fetch(notificationsRoutes.index.get({ query }).url, {
                cache: 'no-store',
            });
            const data = await response.json();

            setNotificationList((prev) => {
                if (replace) {
                    return (data.notifications ?? []).filter(Boolean);
                }

                const existing = new Map(prev.map((notification) => [notification.id, notification]));
                (data.notifications ?? []).filter(Boolean).forEach((notification: Notification) => {
                    existing.set(notification.id, notification);
                });

                return Array.from(existing.values());
            });
            setUnreadCount(data.unread_count);
            setCursor(data.meta.next_cursor ?? null);
            setHasMore(data.meta.has_more);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            if (replace) {
                setLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    }, []);

    useEffect(() => {
        loadNotifications(null, true);

        // Subscribe to real-time broadcast notifications
        const userId = auth?.user?.id;

        if (window.Echo && userId) {
            const channel = window.Echo.private(`users.${userId}`);

            channel
                .notification((notification: any) => {
                    if (!notification) {
                        return;
                    }

                    const newNotification: Notification = {
                        id: notification.id || `notif-${Date.now()}`,
                        type: notification.type,
                        read_at: null,
                        created_at: new Date().toISOString(),
                        data: notification,
                    };
                    setNotificationList((prev) => [newNotification, ...prev.filter(Boolean)]);
                    setUnreadCount((prev) => prev + 1);
                });

            channel.error((error: unknown) => {
                console.error('Notifications channel subscription failed:', error);
            });
        }

        const interval = window.setInterval(() => {
            loadNotifications(null, true);
        }, 30000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadNotifications(null, true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);

            if (window.Echo && userId) {
                window.Echo.leave(`users.${userId}`);
            }
        };
    }, [auth?.user?.id, loadNotifications]);

    useEffect(() => {
        const target = observerRef.current;

        if (!target || !hasMore || loadingMore || loading) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            const first = entries[0];

            if (first?.isIntersecting && hasMore && !loadingMore) {
                loadNotifications(cursor, false);
            }
        }, {
            threshold: 0.4,
        });

        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, [cursor, hasMore, loading, loadingMore, loadNotifications]);

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch(notificationsRoutes.read.post(notificationId).url, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            setNotificationList((prev) =>
                prev.map((n) =>
                    n.id === notificationId
                        ? { ...n, read_at: new Date().toISOString() }
                        : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'post_liked':
                return <Heart className="h-5 w-5 fill-red-500 text-red-500" />;
            case 'post_commented':
                return <MessageCircle className="h-5 w-5 fill-blue-500 text-blue-500" />;
            case 'message_wall_comment_reply':
                return <MessageCircle className="h-5 w-5 fill-green-500 text-green-500" />;
            case 'match':
                return <PawPrint className="h-5 w-5 fill-purple-500 text-purple-500" />;
            default:
                return <User className="h-5 w-5" />;
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }

        const { data } = notification;

        // Only redirect feed post likes/comments to the feed comment details page.
        if (
            (data?.type === 'post_liked' || data?.type === 'post_commented') &&
            data.post_id
        ) {
            router.visit(feedComments.show.url(data.post_id), {
                preserveScroll: true,
            });
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) {
return 'Just now';
}

        if (seconds < 3600) {
return `${Math.floor(seconds / 60)}m ago`;
}

        if (seconds < 86400) {
return `${Math.floor(seconds / 3600)}h ago`;
}

        if (seconds < 604800) {
return `${Math.floor(seconds / 86400)}d ago`;
}

        return date.toLocaleDateString();
    };

    return (
        <>
            <Head title="Notifications" />

            <div className="min-h-screen bg-gray-50 dark:bg-black">
                <div className="mx-auto max-w-2xl px-4">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Notifications
                        </h1>
                        {unreadCount > 0 && (
                            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                                {unreadCount}
                                {' '}
                                unread
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-red-500" />
                        </div>
                    ) : notificationList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                <Heart className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                No notifications yet
                            </h3>
                            <p className="mt-1 text-gray-500 dark:text-gray-400">
                                When someone likes or comments on your posts, you'll see them here
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {notificationList.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`group flex cursor-pointer items-start gap-3 rounded-lg p-4 transition-all ${
                                        !notification.read_at
                                            ? 'bg-white shadow-sm dark:bg-gray-800'
                                            : 'bg-gray-50 dark:bg-gray-900'
                                    } hover:shadow-md`}
                                >
                                    <div className="flex-shrink-0 rounded-full bg-gray-100 p-2 dark:bg-gray-800">
                                        {getNotificationIcon(notification.data.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`text-sm ${
                                                !notification.read_at
                                                    ? 'font-semibold text-gray-900 dark:text-white'
                                                    : 'text-gray-600 dark:text-gray-400'
                                            }`}
                                        >
                                            {notification.data.message}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                            {formatTimeAgo(notification.created_at)}
                                        </p>
                                    </div>
                                    {!notification.read_at && (
                                        <div className="flex-shrink-0">
                                            <div className="h-2 w-2 rounded-full bg-red-500" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {loadingMore && (
                        <div className="flex items-center justify-center py-4">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-red-500" />
                        </div>
                    )}
                    {!loading && !hasMore && notificationList.length > 0 && (
                        <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            You’re all caught up.
                        </div>
                    )}
                    <div ref={observerRef} className="h-6" />
                </div>
            </div>
        </>
    );
}
