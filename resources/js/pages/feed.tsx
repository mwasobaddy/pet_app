import { Head, usePage } from '@inertiajs/react';
import { Bell, Heart, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import TextLink from '@/components/text-link';
import * as analyticsRoutes from '@/routes/analytics';
import * as chatRoutes from '@/routes/chat';
import * as notificationsRoutes from '@/routes/notifications';
import type { Auth } from '@/types/auth';

interface AnalyticsSummary {
    swipes: {
        pass: number;
        like: number;
        super_like: number;
        total: number;
    };
    matches: number;
    match_rate: number;
}

interface NotificationItem {
    id: string;
    read_at: string | null;
    created_at: string | null;
    data: {
        match_id?: number;
        other_pet?: {
            id: number;
            name: string;
            owner_id: number;
            owner_name: string | null;
        };
    };
}

export default function Feed() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadAnalytics();
        loadNotifications();
    }, []);

    useEffect(() => {
        if (!auth?.user?.id || !window.Echo) {
            return undefined;
        }

        const channel = window.Echo.private(`users.${auth.user.id}`);

        channel.notification(() => {
            loadNotifications();
        });

        return () => {
            channel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
            window.Echo?.leave(`users.${auth.user.id}`);
        };
    }, [auth?.user?.id]);

    const loadAnalytics = async () => {
        try {
            const response = await fetch(analyticsRoutes.summary.url());
            const data = await response.json();
            setAnalyticsSummary(data);
        } catch (error) {
            console.error('Failed to load analytics summary:', error);
        }
    };

    const loadNotifications = async () => {
        setNotificationsLoading(true);

        try {
            const response = await fetch(notificationsRoutes.index.url());
            const data = await response.json();
            setNotifications(data.notifications ?? []);
            setUnreadCount(data.unread_count ?? 0);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setNotificationsLoading(false);
        }
    };

    const formatTimestamp = (value: string | null) => {
        if (!value) {
            return 'Just now';
        }

        return new Date(value).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Head title="Feed" />
            <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-pink-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
                <div className="fixed inset-0 opacity-5 pointer-events-none">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="paw-pattern-feed" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                                <text x="20" y="50" fontSize="28" fill="currentColor" className="text-orange-500">&#128062;</text>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#paw-pattern-feed)" />
                    </svg>
                </div>

                <div className="relative z-10">
                    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 pt-6 lg:px-6">
                        <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-orange-500 via-pink-500 to-rose-500 p-6 shadow-2xl">
                            <div className="flex items-center gap-2 text-white/90">
                                <Sparkles className="h-4 w-4" />
                                <span className="text-xs font-semibold uppercase tracking-[0.2em]">Your Feed</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h1 className="text-2xl font-bold text-white">Welcome back{auth?.user?.name ? `, ${auth.user.name.split(' ')[0]}` : ''}</h1>
                                <p className="text-sm text-white/80">Track your activity and keep up with new matches.</p>
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="space-y-6">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30">
                                                <span className="text-lg">&#128152;</span>
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">{analyticsSummary?.matches ?? 0}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Matches</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30">
                                                <Heart className="h-5 w-5 text-rose-500" />
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">{(analyticsSummary?.swipes.like ?? 0) + (analyticsSummary?.swipes.super_like ?? 0)}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Likes</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
                                                <span className="text-lg">&#128064;</span>
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">{analyticsSummary?.swipes.total ?? 0}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Swipes</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-lg backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30">
                                                <TrendingUp className="h-5 w-5 text-orange-500" />
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {analyticsSummary ? `${Math.round(analyticsSummary.match_rate * 100)}%` : '0%'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Match rate</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-500/80">Momentum</p>
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Keep your streak going</h2>
                                        </div>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900/30">
                                            <span className="text-lg">&#128293;</span>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                                        Your daily engagement helps surface better matches. Try liking a few more pets to improve your match rate.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/80">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                            <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                                        </div>
                                        {unreadCount > 0 && (
                                            <span className="rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-3 max-h-80 overflow-y-auto">
                                        {notificationsLoading ? (
                                            <>
                                                {Array.from({ length: 3 }).map((_, index) => (
                                                    <div key={index} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                                                ))}
                                            </>
                                        ) : notifications.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                                <span className="text-4xl mb-2 block">&#128062;</span>
                                                <p className="text-sm">No notifications yet</p>
                                            </div>
                                        ) : (
                                            notifications.slice(0, 6).map((notification) => {
                                                const petName = notification.data?.other_pet?.name ?? 'a new friend';
                                                const matchId = notification.data?.match_id;
                                                const isUnread = !notification.read_at;

                                                return (
                                                    <div
                                                        key={notification.id}
                                                        className={`rounded-xl p-3 transition-all duration-200 ${
                                                            isUnread
                                                                ? 'bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-900/20 dark:to-rose-900/20 border border-orange-200 dark:border-orange-800'
                                                                : 'bg-gray-50 dark:bg-gray-800/50 border border-transparent'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                                    Match with {petName}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                    {formatTimestamp(notification.created_at)}
                                                                </p>
                                                            </div>
                                                            {matchId && (
                                                                <TextLink
                                                                    href={chatRoutes.match.url(matchId)}
                                                                    className="whitespace-nowrap text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                                                                >
                                                                    Chat
                                                                </TextLink>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Feed.layout = {
    breadcrumbs: [
        {
            title: 'Feed',
            href: '/feed',
        },
    ],
};
