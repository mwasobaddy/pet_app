import { Head, usePage } from '@inertiajs/react';
import { Bell, Heart, MapPin, Filter, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import MatchModal from '@/components/match-modal';
import SwipeCard from '@/components/swipe-card';
import TextLink from '@/components/text-link';
import * as analyticsRoutes from '@/routes/analytics';
import * as chatRoutes from '@/routes/chat';
import * as matchingRoutes from '@/routes/matching';
import * as notificationsRoutes from '@/routes/notifications';
import type { Auth } from '@/types/auth';

interface Image {
    id: number;
    url: string;
}

interface PetType {
    id: number;
    name: string;
    icon: string;
}

interface Owner {
    id: number;
    name: string;
}

interface Recommendation {
    id: number;
    name: string;
    breed: string | null;
    age: number;
    gender: string;
    description: string;
    pet_type: PetType | null;
    images: Image[];
    owner: Owner;
}

interface MatchedPet {
    id: number;
    name: string;
    images: { url: string } | null;
    user: { id: number; name: string };
}

interface MatchPayloadPet {
    id: number;
    name: string;
    owner_id: number;
    owner_name: string | null;
    images: { id: number; url: string }[];
}

interface MatchCreatedEvent {
    match: {
        id: number;
        matched_at: string | null;
        pet_profile_1: MatchPayloadPet;
        pet_profile_2: MatchPayloadPet;
    };
}

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

export default function Dashboard() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [matchModal, setMatchModal] = useState({ isOpen: false, pet: null as MatchedPet | null, matchId: null as number | null });
    const [distance, setDistance] = useState(100);
    const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filters, setFilters] = useState({
        petTypeId: '',
        personalityTagIds: [] as number[],
    });
    const [showFilters, setShowFilters] = useState(false);

    // Load recommendations on mount
    useEffect(() => {
        loadRecommendations();
        loadAnalytics();
        loadNotifications();
    }, []);

    useEffect(() => {
        if (!auth?.user?.id || !window.Echo) {
            return undefined;
        }

        const channel = window.Echo.private(`users.${auth.user.id}`);

        const handleMatchCreated = (event: MatchCreatedEvent) => {
            const pets = [event.match.pet_profile_1, event.match.pet_profile_2];
            const otherPet = pets.find((pet) => pet.owner_id !== auth.user.id) ?? pets[0];

            setMatchModal({
                isOpen: true,
                pet: {
                    id: otherPet.id,
                    name: otherPet.name,
                    images: otherPet.images?.[0] ? { url: otherPet.images[0].url } : null,
                    user: {
                        id: otherPet.owner_id,
                        name: otherPet.owner_name ?? 'Pet Owner',
                    },
                },
                matchId: event.match.id,
            });
        };

        channel.listen('.match.created', handleMatchCreated);
        channel.notification(() => {
            loadNotifications();
        });

        return () => {
            channel.stopListening('.match.created', handleMatchCreated);
            channel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
            window.Echo?.leave(`users.${auth.user.id}`);
        };
    }, [auth?.user?.id]);

    const loadAnalytics = async () => {
        setAnalyticsLoading(true);

        try {
            const response = await fetch(analyticsRoutes.summary.url());
            const data = await response.json();
            setAnalyticsSummary(data);
        } catch (error) {
            console.error('Failed to load analytics summary:', error);
        } finally {
            setAnalyticsLoading(false);
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

    const loadRecommendations = async () => {
        setIsLoading(true);

        try {
            const response = await fetch(
                matchingRoutes.recommendations.url({
                    query: {
                        distance,
                        pet_type: filters.petTypeId || undefined,
                        personality_tags: filters.personalityTagIds.length > 0 ? filters.personalityTagIds.join(',') : undefined,
                    },
                }),
            );
            const data = await response.json();
            setRecommendations(data.recommendations);
            setCurrentIndex(0);
        } catch (error) {
            console.error('Failed to load recommendations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwipe = async (petId: number, type: 'pass' | 'like' | 'super_like') => {
        try {
            const response = await fetch(matchingRoutes.recordInteraction.url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    to_pet_profile_id: petId,
                    interaction_type: type,
                }),
            });

            const data = await response.json();

            // Check for match
            if (data.match) {
                setMatchModal({ isOpen: true, pet: data.match.pet_profile_2, matchId: data.match.id });
            }

            setAnalyticsSummary((prev) => {
                if (!prev) {
                    return prev;
                }

                const nextSwipes = { ...prev.swipes };

                if (type === 'pass') {
                    nextSwipes.pass += 1;
                }

                if (type === 'like') {
                    nextSwipes.like += 1;
                }

                if (type === 'super_like') {
                    nextSwipes.super_like += 1;
                }

                nextSwipes.total = nextSwipes.pass + nextSwipes.like + nextSwipes.super_like;

                const nextMatches = data.match ? prev.matches + 1 : prev.matches;
                const engaged = Math.max(1, nextSwipes.like + nextSwipes.super_like);

                return {
                    ...prev,
                    swipes: nextSwipes,
                    matches: nextMatches,
                    match_rate: nextMatches / engaged,
                };
            });

            // Move to next card
            setCurrentIndex(prev => prev + 1);

            // Load more if running low
            if (currentIndex >= recommendations.length - 3) {
                loadRecommendations();
            }
        } catch (error) {
            console.error('Failed to record interaction:', error);
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

    if (isLoading) {
        return (
            <>
                <Head title="Dashboard" />
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50/50 via-white to-pink-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
                    <div className="text-center space-y-4">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center animate-pulse">
                                <span className="text-4xl">🐾</span>
                            </div>
                            <div className="absolute -top-2 -right-2 text-3xl animate-bounce">🐕</div>
                            <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🐱</div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">Loading perfect matches...</p>
                    </div>
                </div>
            </>
        );
    }

    const hasRecommendations = recommendations.length > 0 && currentIndex < recommendations.length;
    const currentPet = hasRecommendations ? recommendations[currentIndex] : null;

    return (
        <>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-pink-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
                {/* Pattern Background */}
                <div className="fixed inset-0 opacity-5 pointer-events-none">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="paw-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                                <text x="20" y="50" fontSize="28" fill="currentColor" className="text-orange-500">🐾</text>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#paw-pattern)" />
                    </svg>
                </div>

                {/* Main Content */}
                <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
                    {/* Left Sidebar - User Profile & Stats */}
                    <div className="lg:w-80 lg:fixed lg:h-screen lg:overflow-y-auto p-4 lg:p-6 space-y-4">
                        {/* User Card */}
                        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-xl shadow-lg">
                                    {auth?.user?.name?.charAt(0).toUpperCase() || '👤'}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-orange-600/70 dark:text-orange-400/70">Welcome back,</p>
                                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {auth?.user?.name?.split(' ')[0]}
                                    </h1>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
                            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 flex items-center justify-center">
                                        <span className="text-xl">💞</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsSummary?.matches ?? 0}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Matches</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 flex items-center justify-center">
                                        <span className="text-xl">❤️</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{(analyticsSummary?.swipes.like ?? 0) + (analyticsSummary?.swipes.super_like ?? 0)}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Likes</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                                        <span className="text-xl">👀</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsSummary?.swipes.total ?? 0}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Swipes</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="hidden lg:block bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6">
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
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {notificationsLoading ? (
                                    <>
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <div key={index} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                                        ))}
                                    </>
                                ) : notifications.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                        <span className="text-4xl mb-2 block">🐾</span>
                                        <p className="text-sm">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.slice(0, 5).map((notification) => {
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
                                                            💞 {petName}
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
                                                            Chat →
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

                    {/* Center - Main Swipe Area */}
                    <div className="flex-1 lg:ml-80 p-4 lg:p-6">
                        {/* CTA Banner */}
                        <div className="mb-6 relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-pink-500 to-rose-500 p-6 shadow-2xl">
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute -right-10 -top-10 text-9xl">🐾</div>
                                <div className="absolute right-20 bottom-0 text-6xl opacity-50">🐕</div>
                                <div className="absolute left-1/2 top-1/2 text-5xl opacity-30">🐱</div>
                            </div>
                            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="h-4 w-4 text-yellow-300" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-white/80">Ready to explore?</span>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                                        {recommendations.length > 0
                                            ? `${recommendations.length} pets nearby are waiting!`
                                            : 'Start swiping to find matches!'}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => document.querySelector('[data-scroll-to="swipe-area"]')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="px-6 py-2.5 rounded-xl bg-white text-orange-600 font-bold hover:bg-orange-50 transition shadow-lg hover:shadow-xl active:scale-95"
                                >
                                    Start Swiping
                                </button>
                            </div>
                        </div>

                        {/* Filters Bar */}
                        <div className="mb-6 flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                                    showFilters
                                        ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500'
                                }`}
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                            </button>
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <MapPin className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{distance}km</span>
                            </div>
                            <button
                                onClick={loadRecommendations}
                                className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold text-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-95"
                            >
                                <span className="text-lg">🔄</span>
                                Refresh
                            </button>
                        </div>

                        {/* Filters Panel */}
                        {showFilters && (
                            <div className="mb-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6 animate-in slide-in-from-top-2">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div>
                                        <label className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-2 block">Pet Type</label>
                                        <select
                                            value={filters.petTypeId}
                                            onChange={(event) => setFilters((prev) => ({ ...prev, petTypeId: event.target.value }))}
                                            className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-4 py-2.5 text-sm focus:border-orange-400 focus:ring-orange-400/20 transition"
                                        >
                                            <option value="">Any Type</option>
                                            {filterOptions.pet_types.map((type: { id: Key | readonly string[] | null | undefined; icon: any; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
                                                <option key={type.id} value={type.id}>
                                                    {type.icon ?? ''} {type.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-2 block">Gender</label>
                                        <select
                                            value={filters.gender}
                                            onChange={(event) => setFilters((prev) => ({ ...prev, gender: event.target.value }))}
                                            disabled={!filterOptions.advanced_allowed}
                                            className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-4 py-2.5 text-sm focus:border-orange-400 focus:ring-orange-400/20 transition disabled:opacity-50"
                                        >
                                            <option value="">Any</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2 lg:col-span-2">
                                        <label className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-2 block">Distance: {distance}km</label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="500"
                                            value={distance}
                                            onChange={(e) => {
                                                setDistance(Number(e.target.value));
                                                setRecommendations([]);
                                            }}
                                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                        />
                                    </div>
                                </div>

                                {filterOptions.advanced_allowed && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <label className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-3 block">Personality Traits</label>
                                        <div className="flex flex-wrap gap-2">
                                            {filterOptions.personality_tags.map((tag) => {
                                                const isSelected = filters.personalityTagIds.includes(tag.id);

                                                return (
                                                    <button
                                                        key={tag.id}
                                                        onClick={() =>
                                                            setFilters((prev) => ({
                                                                ...prev,
                                                                personalityTagIds: isSelected
                                                                    ? prev.personalityTagIds.filter((id) => id !== tag.id)
                                                                    : [...prev.personalityTagIds, tag.id],
                                                            }))
                                                        }
                                                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                                                            isSelected
                                                                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
                                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                    >
                                                        {tag.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                    <button
                                        onClick={() => {
                                            setFilters({
                                                petTypeId: '',
                                                ageMin: '',
                                                ageMax: '',
                                                gender: '',
                                                breed: '',
                                                personalityTagIds: [],
                                            });
                                            loadRecommendations();
                                        }}
                                        className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition"
                                    >
                                        Reset all filters
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Swipe Card Area */}
                        <div data-scroll-to="swipe-area" className="relative min-h-[500px] flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-white via-orange-50/50 to-pink-50/50 dark:from-gray-900 dark:via-gray-900/50 dark:to-gray-800/50 shadow-2xl border border-white/50 dark:border-gray-700/50 p-8">
                            {hasRecommendations && currentPet ? (
                                <div className="w-full max-w-md">
                                    <SwipeCard
                                        id={currentPet.id}
                                        name={currentPet.name}
                                        age={currentPet.age}
                                        gender={currentPet.gender}
                                        description={currentPet.description}
                                        pet_type={currentPet.pet_type}
                                        images={currentPet.images}
                                        owner={currentPet.owner}
                                        onSwipe={handleSwipe}
                                    />
                                </div>
                            ) : (
                                <div className="text-center space-y-6 px-4">
                                    <div className="relative inline-block">
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30 flex items-center justify-center">
                                            <Heart className="w-16 h-16 text-orange-400 dark:text-orange-500" />
                                        </div>
                                        <div className="absolute -top-2 -right-2 text-4xl animate-bounce">🐕</div>
                                        <div className="absolute -bottom-2 -left-2 text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>🐱</div>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">No more matches nearby!</p>
                                        <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters or distance</p>
                                    </div>
                                    <button
                                        onClick={loadRecommendations}
                                        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95"
                                    >
                                        <span className="text-lg">🔄</span>
                                        Find More Pets
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Notifications */}
                        <div className="lg:hidden mt-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    <h3 className="font-bold text-gray-900 dark:text-white">Recent Matches</h3>
                                </div>
                                {unreadCount > 0 && (
                                    <span className="rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-3">
                                {!notificationsLoading && notifications.length > 0 ? (
                                    notifications.slice(0, 3).map((notification) => {
                                        const petName = notification.data?.other_pet?.name ?? 'a new friend';
                                        const matchId = notification.data?.match_id;
                                        const isUnread = !notification.read_at;

                                        return (
                                            <div
                                                key={notification.id}
                                                className={`rounded-xl p-4 border transition-all duration-200 ${
                                                    isUnread
                                                        ? 'border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-900/20 dark:to-rose-900/20'
                                                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            💞 You matched with {petName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {formatTimestamp(notification.created_at)}
                                                        </p>
                                                    </div>
                                                    {matchId && (
                                                        <TextLink
                                                            href={chatRoutes.match.url(matchId)}
                                                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-semibold hover:shadow-md transition"
                                                        >
                                                            Chat
                                                        </TextLink>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                        <span className="text-4xl mb-2 block">🐾</span>
                                        <p className="text-sm">No matches yet. Keep swiping!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Match Modal */}
            <MatchModal
                isOpen={matchModal.isOpen}
                matchedPet={matchModal.pet}
                matchId={matchModal.matchId}
                onClose={() => setMatchModal({ isOpen: false, pet: null, matchId: null })}
            />
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/',
        },
    ],
};
