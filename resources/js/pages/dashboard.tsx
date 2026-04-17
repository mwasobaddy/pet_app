import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import SwipeCard from '@/components/swipe-card';
import MatchModal from '@/components/match-modal';
import TextLink from '@/components/text-link';
import { Bell, Flame, Heart } from 'lucide-react';
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

interface FilterOptions {
    advanced_allowed: boolean;
    pet_types: PetType[];
    personality_tags: { id: number; name: string }[];
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
    type: string;
    read_at: string | null;
    created_at: string | null;
    data: {
        match_id?: number;
        matched_at?: string | null;
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
    const [stats, setStats] = useState({ likes: 0, passes: 0 });
    const [distance, setDistance] = useState(100);
    const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        advanced_allowed: false,
        pet_types: [],
        personality_tags: [],
    });
    const [filters, setFilters] = useState({
        petTypeId: '',
        ageMin: '',
        ageMax: '',
        gender: '',
        breed: '',
        personalityTagIds: [] as number[],
    });

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
                        age_min: filterOptions.advanced_allowed ? filters.ageMin || undefined : undefined,
                        age_max: filterOptions.advanced_allowed ? filters.ageMax || undefined : undefined,
                        gender: filterOptions.advanced_allowed ? filters.gender || undefined : undefined,
                        breed: filterOptions.advanced_allowed ? filters.breed || undefined : undefined,
                        personality_tags:
                            filterOptions.advanced_allowed && filters.personalityTagIds.length > 0
                                ? filters.personalityTagIds.join(',')
                                : undefined,
                    },
                }),
            );
            const data = await response.json();
            setRecommendations(data.recommendations);
            setFilterOptions(data.filters ?? filterOptions);
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

            if (type === 'pass') {
                setStats(prev => ({ ...prev, passes: prev.passes + 1 }));
            } else if (type === 'like' || type === 'super_like') {
                setStats(prev => ({ ...prev, likes: prev.likes + 1 }));
            }

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

    const markNotificationRead = async (notificationId: string) => {
        try {
            await fetch(notificationsRoutes.read.url({ notification: notificationId }), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, read_at: new Date().toISOString() }
                        : notification,
                ),
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
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
                <div className="flex h-full flex-1 justify-center items-center">
                    <div className="text-center space-y-4">
                        <div className="animate-spin">
                            <Flame className="w-16 h-16 text-orange-500 mx-auto" />
                        </div>
                        <p className="text-gray-600">Loading perfect matches...</p>
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
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Swipe analytics</p>
                                <p className="text-lg font-semibold text-foreground">Your match momentum</p>
                            </div>
                            <button
                                type="button"
                                onClick={loadAnalytics}
                                className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground transition hover:bg-muted/60"
                            >
                                Refresh
                            </button>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {analyticsLoading ? (
                                <div className="col-span-full grid gap-3 sm:grid-cols-2">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <div key={index} className="h-20 rounded-xl border border-border bg-muted/40" />
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div className="rounded-xl border border-orange-200/70 bg-gradient-to-br from-orange-100/70 via-white to-white p-4">
                                        <p className="text-xs font-semibold uppercase text-orange-700/80">Total swipes</p>
                                        <p className="mt-2 text-2xl font-semibold text-orange-600">
                                            {analyticsSummary?.swipes.total ?? 0}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-rose-200/70 bg-gradient-to-br from-rose-100/70 via-white to-white p-4">
                                        <p className="text-xs font-semibold uppercase text-rose-700/80">Likes + super</p>
                                        <p className="mt-2 text-2xl font-semibold text-rose-600">
                                            {(analyticsSummary?.swipes.like ?? 0) + (analyticsSummary?.swipes.super_like ?? 0)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-sky-200/70 bg-gradient-to-br from-sky-100/70 via-white to-white p-4">
                                        <p className="text-xs font-semibold uppercase text-sky-700/80">Matches</p>
                                        <p className="mt-2 text-2xl font-semibold text-sky-700">
                                            {analyticsSummary?.matches ?? 0}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-emerald-200/70 bg-gradient-to-br from-emerald-100/70 via-white to-white p-4">
                                        <p className="text-xs font-semibold uppercase text-emerald-700/80">Match rate</p>
                                        <p className="mt-2 text-2xl font-semibold text-emerald-700">
                                            {analyticsSummary ? `${Math.round(analyticsSummary.match_rate * 1000) / 10}%` : '0%'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notifications</p>
                                <p className="text-lg font-semibold text-foreground">Recent matches</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                                        {unreadCount} new
                                    </span>
                                )}
                                <Bell className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            {notificationsLoading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <div key={index} className="h-16 rounded-xl border border-border bg-muted/40" />
                                    ))}
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                                    No new matches yet. Keep swiping to light up your inbox.
                                </div>
                            ) : (
                                notifications.map((notification) => {
                                    const petName = notification.data?.other_pet?.name ?? 'a new friend';
                                    const matchId = notification.data?.match_id;
                                    const isUnread = !notification.read_at;

                                    return (
                                        <div
                                            key={notification.id}
                                            className={`rounded-xl border p-4 ${
                                                isUnread
                                                    ? 'border-rose-200/70 bg-gradient-to-r from-white via-rose-50/60 to-white'
                                                    : 'border-border bg-muted/20'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-foreground">
                                                        New match with {petName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatTimestamp(notification.created_at)}
                                                        {matchId ? (
                                                            <>
                                                                {' · '}
                                                                <TextLink href={chatRoutes.match.url(matchId)} className="text-xs">
                                                                    Open chat
                                                                </TextLink>
                                                            </>
                                                        ) : null}
                                                    </p>
                                                </div>
                                                {isUnread && (
                                                    <button
                                                        type="button"
                                                        onClick={() => markNotificationRead(notification.id)}
                                                        className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                                                    >
                                                        Mark read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-sm text-gray-600">Likes</p>
                        <p className="text-2xl font-bold text-red-500">{stats.likes}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-sm text-gray-600">Distance</p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <input
                                type="range"
                                min="1"
                                max="500"
                                value={distance}
                                onChange={(e) => {
                                    setDistance(Number(e.target.value));
                                    setRecommendations([]);
                                }}
                                className="w-full"
                            />
                        </div>
                        <p className="text-sm font-semibold mt-2">{distance} km</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-sm text-gray-600">Passes</p>
                        <p className="text-2xl font-bold text-gray-500">{stats.passes}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Filters</p>
                            <p className="text-xs text-gray-500">Refine your recommendations</p>
                        </div>
                        {!filterOptions.advanced_allowed && (
                            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                VIP filters locked
                            </span>
                        )}
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase text-gray-500">Pet Type</label>
                            <select
                                value={filters.petTypeId}
                                onChange={(event) => setFilters((prev) => ({ ...prev, petTypeId: event.target.value }))}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Any</option>
                                {filterOptions.pet_types.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.icon ?? ''} {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase text-gray-500">Breed</label>
                            <input
                                value={filters.breed}
                                onChange={(event) => setFilters((prev) => ({ ...prev, breed: event.target.value }))}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder={filterOptions.advanced_allowed ? 'e.g., Labrador' : 'VIP only'}
                                disabled={!filterOptions.advanced_allowed}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase text-gray-500">Gender</label>
                            <select
                                value={filters.gender}
                                onChange={(event) => setFilters((prev) => ({ ...prev, gender: event.target.value }))}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                disabled={!filterOptions.advanced_allowed}
                            >
                                <option value="">Any</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-xs font-semibold uppercase text-gray-500">Age Range</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={filters.ageMin}
                                    onChange={(event) => setFilters((prev) => ({ ...prev, ageMin: event.target.value }))}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Min"
                                    disabled={!filterOptions.advanced_allowed}
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={filters.ageMax}
                                    onChange={(event) => setFilters((prev) => ({ ...prev, ageMax: event.target.value }))}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Max"
                                    disabled={!filterOptions.advanced_allowed}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2 md:col-span-2 lg:col-span-3">
                            <label className="text-xs font-semibold uppercase text-gray-500">Personality Traits</label>
                            <div className="flex flex-wrap gap-2">
                                {filterOptions.personality_tags.map((tag) => {
                                    const isSelected = filters.personalityTagIds.includes(tag.id);

                                    return (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() =>
                                                filterOptions.advanced_allowed &&
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    personalityTagIds: isSelected
                                                        ? prev.personalityTagIds.filter((id) => id !== tag.id)
                                                        : [...prev.personalityTagIds, tag.id],
                                                }))
                                            }
                                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                                isSelected
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted text-gray-600'
                                            } ${!filterOptions.advanced_allowed ? 'opacity-60' : ''}`}
                                            disabled={!filterOptions.advanced_allowed}
                                        >
                                            {tag.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={loadRecommendations}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                        >
                            Apply Filters
                        </button>
                        <button
                            type="button"
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
                            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-muted/50"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Main Swipe Area */}
                <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl">
                    {hasRecommendations && currentPet ? (
                        <SwipeCard {...currentPet} onSwipe={handleSwipe} />
                    ) : (
                        <div className="text-center space-y-4">
                            <Heart className="w-16 h-16 text-gray-300 mx-auto" />
                            <p className="text-xl font-semibold text-gray-600">No more matches nearby!</p>
                            <p className="text-sm text-gray-500">Try adjusting your distance filter</p>
                            <button
                                onClick={loadRecommendations}
                                className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
                            >
                                Refresh
                            </button>
                        </div>
                    )}
                </div>

                {/* Info Bar */}
                {hasRecommendations && currentPet && (
                    <div className="text-center text-sm text-gray-600">
                        <p>Card {currentIndex + 1} of {recommendations.length}</p>
                    </div>
                )}
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
