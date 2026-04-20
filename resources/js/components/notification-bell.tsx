import { router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { Heart, MessageCircle, PawPrint } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import notificationRoutes from '@/routes/notifications';
import type { Notification } from '@/types';

export function NotificationBell() {
    const { auth } = usePage().props;
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await fetch(notificationRoutes.index.url());
            const data = await response.json();
            setNotifications(data.notifications.slice(0, 5));
            setUnreadCount(data.unread_count);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, []);

    const getNotificationType = (notification: any, payload: any) => {
        if (payload.type) {
            return payload.type;
        }

        const notificationClass = notification.type?.toString() ?? '';

        if (notificationClass.includes('MatchNotification')) {
            return 'match';
        }

        if (notificationClass.includes('PostLikedNotification')) {
            return 'post_liked';
        }

        if (notificationClass.includes('PostCommentedNotification')) {
            return 'post_commented';
        }

        if (notificationClass.includes('MessageWallCommentReplyNotification')) {
            return 'message_wall_comment_reply';
        }

        return 'match';
    };

    const getNotificationMessage = (type: string, payload: any) => {
        if (payload.message) {
            return payload.message;
        }

        switch (type) {
            case 'post_liked':
                return `${payload.liker_name ?? 'Someone'} liked your post`;
            case 'post_commented':
                return `${payload.commenter_name ?? 'Someone'} commented on your post`;
            case 'message_wall_comment_reply':
                return `${payload.replier_name ?? 'Someone'} replied to your comment`;
            case 'match':
                return payload.other_pet?.name
                    ? `${payload.other_pet.name} matched with you`
                    : 'You have a new match';
            default:
                return 'New notification';
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchNotifications();

        // Subscribe to real-time broadcast notifications

        const userId = auth?.user?.id;

        if (window.Echo && userId) {
            window.Echo.private(`users.${userId}`)
                .notification((notification: any) => {
                    const payload = notification.data ?? notification;
                    const type = getNotificationType(notification, payload);
                    const message = getNotificationMessage(type, payload);

                    const newNotification: Notification = {
                        id: notification.id || `notif-${Date.now()}`,
                        type: type as Notification['data']['type'],
                        read_at: null,
                        created_at: notification.created_at ?? new Date().toISOString(),
                        data: {
                            ...payload,
                            type: type as Notification['data']['type'],
                            message,
                        },
                    };

                    setNotifications((prev) => [newNotification, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                });
        }

        // Keep polling as fallback
        const interval = setInterval(fetchNotifications, 60000);

        return () => {
            clearInterval(interval);

            if (window.Echo && userId) {
                window.Echo.leave(`users.${userId}`);
            }
        };
    }, [auth?.user?.id, fetchNotifications]);

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch(notificationRoutes.read.url(notificationId), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            setNotifications((prev) =>
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

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }

        router.visit('/notifications');
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'post_liked':
                return <Heart className="h-4 w-4 fill-red-500 text-red-500" />;
            case 'post_commented':
                return <MessageCircle className="h-4 w-4 fill-blue-500 text-blue-500" />;
            case 'message_wall_comment_reply':
                return <MessageCircle className="h-4 w-4 fill-green-500 text-green-500" />;
            case 'match':
                return <PawPrint className="h-4 w-4 fill-purple-500 text-purple-500" />;
            default:
                return <Bell className="h-4 w-4" />;
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
            return `${Math.floor(seconds / 60)}m`;
        }

        if (seconds < 86400) {
            return `${Math.floor(seconds / 3600)}h`;
        }

        return `${Math.floor(seconds / 86400)}d`;
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="group relative h-9 w-9 cursor-pointer"
                >
                    <Bell className="h-5 w-5 opacity-80 group-hover:opacity-100" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between border-b px-4 py-2">
                    <h4 className="text-sm font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <span className="text-xs text-red-500">
                            {unreadCount} unread
                        </span>
                    )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Bell className="mb-2 h-8 w-8 text-gray-300" />
                            <p className="text-sm text-gray-500">No notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                                        !notification.read_at ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                                    }`}
                                >
                                    <div className="flex-shrink-0 rounded-full bg-gray-100 p-1.5 dark:bg-gray-800">
                                        {getNotificationIcon(notification.data.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${
                                            !notification.read_at ? 'font-semibold' : ''
                                        }`}>
                                            {notification.data.message}
                                        </p>
                                        <p className="text-xs text-gray-500">
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
                </div>
                <div className="border-t px-4 py-2">
                    <button
                        onClick={() => router.visit('/notifications')}
                        className="w-full text-center text-sm font-medium text-blue-500 hover:text-blue-600"
                    >
                        View all notifications
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
