import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, Filter, Heart, MapPin, Search, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import MatchModal from '@/components/match-modal';
import SwipeCard from '@/components/swipe-card';
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

export default function Discover() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [recommendations, setRecommendations] = useState<Recommendation[]>(
        [],
    );
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [matchModal, setMatchModal] = useState({
        isOpen: false,
        pet: null as MatchedPet | null,
        matchId: null as number | null,
    });
    const [distance, setDistance] = useState(100);
    const [petTypes, setPetTypes] = useState<PetType[]>([]);
    const [personalityTags, setPersonalityTags] = useState<
        { id: number; name: string }[]
    >([]);
    const [filters, setFilters] = useState({
        petTypeId: '',
        personalityTagIds: [] as number[],
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [desktopPets, setDesktopPets] = useState<Recommendation[]>([]);
    const [exitingPetId, setExitingPetId] = useState<number | null>(null);
    const [enteringPetId, setEnteringPetId] = useState<number | null>(null);
    const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);
    const [showMobileFiltersModal, setShowMobileFiltersModal] = useState(false);
    const [hasHistory, setHasHistory] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const recommendationsRef = useRef<Recommendation[]>([]);
    const desktopCursorRef = useRef(0);

    const loadRecommendations = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const query = {
                distance: distance.toString(),
                ...(filters.petTypeId && { pet_type: filters.petTypeId }),
                ...(filters.personalityTagIds.length > 0 && {
                    personality_tags: filters.personalityTagIds.join(','),
                }),
            };

            const queryString = new URLSearchParams(query).toString();
            const url = `/web-api/matching/recommendations${queryString ? '?' + queryString : ''}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setError('Your session has expired. Please refresh the page.');
                } else if (response.status === 403) {
                    setError('You do not have permission to access this resource.');
                } else if (response.status === 404) {
                    setError('Recommendations not found.');
                } else {
                    setError(`Failed to load recommendations (Error ${response.status})`);
                }

                return;
            }

            const data = await response.json();
            setRecommendations(data.recommendations || []);
            setPetTypes(data.filters?.pet_types ?? []);
            setPersonalityTags(data.filters?.personality_tags ?? []);
            setCurrentIndex(0);
        } catch (error) {
            console.error('Failed to load recommendations:', error);

            if (error instanceof TypeError && error.message.includes('fetch')) {
                setError('Network error. Please check your connection.');
            } else {
                setError('Failed to load recommendations. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [distance, filters]);

    // Check if there's browser history for back button
    useEffect(() => {
        setHasHistory(
            typeof window !== 'undefined' && window.history.length > 1,
        );
    }, []);

    // Load recommendations on mount
    useEffect(() => {
        loadRecommendations();
    }, [loadRecommendations]);

    useEffect(() => {
        if (!auth?.user?.id || !window.Echo) {
            return undefined;
        }

        const channel = window.Echo.private(`users.${auth.user.id}`);

        const handleMatchCreated = (event: MatchCreatedEvent) => {
            const pets = [event.match.pet_profile_1, event.match.pet_profile_2];
            const otherPet =
                pets.find((pet) => pet.owner_id !== auth.user.id) ?? pets[0];

            setMatchModal({
                isOpen: true,
                pet: {
                    id: otherPet.id,
                    name: otherPet.name,
                    images: otherPet.images?.[0]
                        ? { url: otherPet.images[0].url }
                        : null,
                    user: {
                        id: otherPet.owner_id,
                        name: otherPet.owner_name ?? 'Pet Owner',
                    },
                },
                matchId: event.match.id,
            });
        };

        channel.listen('.match.created', handleMatchCreated);

        return () => {
            channel.stopListening('.match.created', handleMatchCreated);
            window.Echo?.leave(`users.${auth.user.id}`);
        };
    }, [auth?.user?.id]);

    const getFilteredRecommendations = (
        items: Recommendation[],
        query: string,
    ) => {
        const normalized = query.trim().toLowerCase();

        if (!normalized) {
            return items;
        }

        return items.filter((pet) => {
            const haystack = [
                pet.name,
                pet.breed ?? '',
                pet.pet_type?.name ?? '',
                pet.owner?.name ?? '',
            ]
                .join(' ')
                .toLowerCase();

            return haystack.includes(normalized);
        });
    };

    useEffect(() => {
        const filtered = getFilteredRecommendations(
            recommendations,
            searchQuery,
        );
        recommendationsRef.current = filtered;
        setCurrentIndex(0);
        const initialDesktopPets = filtered.slice(0, 12);
        setDesktopPets(initialDesktopPets);
        desktopCursorRef.current = initialDesktopPets.length;
        setExitingPetId(null);
        setEnteringPetId(null);
    }, [recommendations, searchQuery]);

    const sendRecordInteraction = async (
        petId: number,
        type: 'pass' | 'like' | 'super_like',
    ) => {
        try {
            const response = await fetch('/web-api/matching/interaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    to_pet_profile_id: petId,
                    interaction_type: type,
                }),
            });

            const data = await response.json();

            // Check for match
            if (data.match) {
                setMatchModal({
                    isOpen: true,
                    pet: data.match.pet_profile_2,
                    matchId: data.match.id,
                });
            }

            return data;
        } catch (error) {
            console.error('Failed to record interaction:', error);

            return null;
        }
    };

    const handleDesktopReaction = async (
        petId: number,
        type: 'pass' | 'like' | 'super_like',
    ) => {
        const data = await sendRecordInteraction(petId, type);

        if (!data) {
            return;
        }

        setExitingPetId(petId);

        window.setTimeout(() => {
            setDesktopPets((prev) => {
                const nextPets = prev.filter((pet) => pet.id !== petId);
                const nextPet =
                    recommendationsRef.current[desktopCursorRef.current];

                if (nextPet) {
                    nextPets.push(nextPet);
                    const nextCursor = desktopCursorRef.current + 1;
                    desktopCursorRef.current = nextCursor;
                    setEnteringPetId(nextPet.id);
                    window.setTimeout(() => setEnteringPetId(null), 220);
                }

                return nextPets;
            });
            setExitingPetId(null);
        }, 220);
    };

    const handleSwipe = async (
        petId: number,
        type: 'pass' | 'like' | 'super_like',
    ) => {
        const data = await sendRecordInteraction(petId, type);

        if (!data) {
            return;
        }

        // Move to next card
        setCurrentIndex((prev) => prev + 1);

        // Load more if running low
        if (currentIndex >= recommendationsRef.current.length - 3) {
            loadRecommendations();
        }
    };

    if (isLoading && !error) {
        return (
            <>
                <Head title="Discover" />
                <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50/50 via-white to-pink-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
                    <div className="space-y-4 text-center">
                        <div className="relative">
                            <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-rose-500">
                                <span className="text-4xl">🐾</span>
                            </div>
                            <div className="absolute -top-2 -right-2 animate-bounce text-3xl">
                                🐕
                            </div>
                            <div
                                className="absolute -bottom-2 -left-2 animate-bounce text-2xl"
                                style={{ animationDelay: '0.5s' }}
                            >
                                🐱
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Loading perfect matches...
                        </p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Head title="Discover" />
                <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50/50 via-white to-pink-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
                    <div className="mx-auto max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
                        <div className="text-center">
                            <div className="mb-4 text-5xl">⚠️</div>
                            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                                Oops!
                            </h2>
                            <p className="mb-6 text-gray-600 dark:text-gray-400">
                                {error}
                            </p>
                            <button
                                onClick={() => {
                                    setError(null);
                                    loadRecommendations();
                                }}
                                className="rounded-lg bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-2 text-white font-medium hover:opacity-90 transition-opacity"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const filteredRecommendations = getFilteredRecommendations(
        recommendations,
        searchQuery,
    );
    const hasRecommendations =
        filteredRecommendations.length > 0 &&
        currentIndex < filteredRecommendations.length;
    const currentPet = hasRecommendations
        ? filteredRecommendations[currentIndex]
        : null;
    const hasDesktopPets = desktopPets.length > 0;

    return (
        <>
            <Head title="Discover" />
            <div className="h-svh overflow-hidden bg-gradient-to-br from-orange-50/50 via-white to-pink-50/30 md:min-h-screen md:overflow-visible dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                {/* Pattern Background */}
                <div className="pointer-events-none fixed inset-0 opacity-5">
                    <svg
                        className="h-full w-full bg-red-50 text-red-500"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <pattern
                                id="paw-pattern"
                                x="0"
                                y="0"
                                width="80"
                                height="80"
                                patternUnits="userSpaceOnUse"
                            >
                                <text
                                    x="20"
                                    y="50"
                                    fontSize="28"
                                    fill="currentColor"
                                    className="text-orange-900"
                                >
                                    🐾
                                </text>
                            </pattern>
                        </defs>
                        <rect
                            width="100%"
                            height="100%"
                            fill="url(#paw-pattern)"
                        />
                    </svg>
                </div>

                {/* Main Content */}
                <div className="relative h-full w-full">
                    <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col pb-0 md:pb-16 lg:px-6">
                        {/* Filters Bar - Desktop Layout */}
                        <div className="md:backdrop-blur-0 sticky top-0 z-20 mb-6 hidden flex-wrap items-center gap-3 bg-white/80 p-4 backdrop-blur md:relative md:flex md:bg-transparent dark:bg-gray-900/80">
                            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm transition focus-within:border-orange-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                <Search className="h-4 w-4 text-orange-500" />
                                <input
                                    value={searchQuery}
                                    onChange={(event) =>
                                        setSearchQuery(event.target.value)
                                    }
                                    placeholder="Search by name, breed, or type"
                                    className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none dark:text-gray-200"
                                />
                            </div>
                            <button
                                onClick={() => setShowMobileFiltersModal(true)}
                                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-orange-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-orange-500"
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                            </button>
                            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
                                <MapPin className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {distance}km
                                </span>
                            </div>
                            <button
                                onClick={loadRecommendations}
                                className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-95"
                            >
                                <span className="text-lg">🔄</span>
                                Refresh
                            </button>
                        </div>

                        {/* Filters Bar - Mobile Layout */}
                        <div className="fixed top-0 right-0 left-0 z-30 md:hidden">
                            {/* Mobile Header: Back + Search Icon */}
                            {!mobileSearchExpanded && (
                                <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
                                    <button
                                        onClick={() =>
                                            hasHistory && window.history.back()
                                        }
                                        className={`rounded-lg p-2 transition ${
                                            hasHistory
                                                ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
                                                : 'pointer-events-none opacity-0'
                                        }`}
                                        disabled={!hasHistory}
                                    >
                                        <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            setMobileSearchExpanded(true)
                                        }
                                        className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <Search className="h-5 w-5 text-orange-500" />
                                    </button>
                                </div>
                            )}

                            {/* Mobile Search Bar - Expanded */}
                            {mobileSearchExpanded && (
                                <div className="flex h-16 items-center gap-3 border-b border-gray-200 bg-white/80 px-4 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
                                    <button
                                        onClick={() =>
                                            setMobileSearchExpanded(false)
                                        }
                                        className="flex-shrink-0 rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                    </button>
                                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm focus-within:border-orange-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                        <Search className="h-4 w-4 flex-shrink-0 text-orange-500" />
                                        <input
                                            autoFocus
                                            value={searchQuery}
                                            onChange={(event) =>
                                                setSearchQuery(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Search by name, breed..."
                                            className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none dark:text-gray-200"
                                        />
                                    </div>
                                    <button
                                        onClick={() =>
                                            setShowMobileFiltersModal(true)
                                        }
                                        className="flex-shrink-0 rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <Filter className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Filters Modal */}
                        {showMobileFiltersModal && (
                            <div className="fixed inset-0 z-50 flex items-end">
                                {/* Backdrop */}
                                <div
                                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                    onClick={() =>
                                        setShowMobileFiltersModal(false)
                                    }
                                />

                                {/* Modal */}
                                <div className="relative max-h-[90vh] w-full animate-in overflow-y-auto rounded-t-3xl bg-white shadow-2xl slide-in-from-bottom-5 dark:bg-gray-900">
                                    <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            Filters
                                        </h3>
                                        <button
                                            onClick={() =>
                                                setShowMobileFiltersModal(false)
                                            }
                                            className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                        </button>
                                    </div>

                                    <div className="space-y-6 p-6">
                                        {/* Pet Type Filter */}
                                        <div>
                                            <label className="mb-3 block text-xs font-semibold text-gray-600 uppercase dark:text-gray-400">
                                                Pet Type
                                            </label>
                                            <select
                                                value={filters.petTypeId}
                                                onChange={(event) =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        petTypeId:
                                                            event.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition focus:border-orange-400 focus:ring-orange-400/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            >
                                                <option value="">
                                                    Any Type
                                                </option>
                                                {petTypes.map((type) => (
                                                    <option
                                                        key={type.id}
                                                        value={type.id}
                                                    >
                                                        {type.icon ?? ''}{' '}
                                                        {type.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Distance Filter */}
                                        <div>
                                            <label className="mb-3 block text-xs font-semibold text-gray-600 uppercase dark:text-gray-400">
                                                Distance: {distance}km
                                            </label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="500"
                                                value={distance}
                                                onChange={(e) => {
                                                    setDistance(
                                                        Number(e.target.value),
                                                    );
                                                    setRecommendations([]);
                                                }}
                                                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-orange-500 dark:bg-gray-700"
                                            />
                                        </div>

                                        {/* Personality Traits */}
                                        <div>
                                            <label className="mb-3 block text-xs font-semibold text-gray-600 uppercase dark:text-gray-400">
                                                Personality Traits
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {personalityTags.map((tag) => {
                                                    const isSelected =
                                                        filters.personalityTagIds.includes(
                                                            tag.id,
                                                        );

                                                    return (
                                                        <button
                                                            key={tag.id}
                                                            onClick={() =>
                                                                setFilters(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        personalityTagIds:
                                                                            isSelected
                                                                                ? prev.personalityTagIds.filter(
                                                                                      (
                                                                                          id,
                                                                                      ) =>
                                                                                          id !==
                                                                                          tag.id,
                                                                                  )
                                                                                : [
                                                                                      ...prev.personalityTagIds,
                                                                                      tag.id,
                                                                                  ],
                                                                    }),
                                                                )
                                                            }
                                                            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                                                                isSelected
                                                                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
                                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                                            }`}
                                                        >
                                                            {tag.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="sticky bottom-0 flex items-center gap-3 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                                        <button
                                            onClick={() => {
                                                setFilters({
                                                    petTypeId: '',
                                                    personalityTagIds: [],
                                                });
                                                loadRecommendations();
                                            }}
                                            className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:text-orange-600 dark:border-gray-700 dark:text-gray-400 dark:hover:text-orange-400"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            onClick={() =>
                                                setShowMobileFiltersModal(false)
                                            }
                                            className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Desktop Grid */}
                        <div
                            className="hidden lg:block"
                            data-scroll-to="swipe-area"
                        >
                            <div className="grid grid-cols-3 gap-6">
                                {hasDesktopPets ? (
                                    desktopPets.map((pet) => {
                                        const isExiting =
                                            exitingPetId === pet.id;
                                        const isEntering =
                                            enteringPetId === pet.id;
                                        const heroImage = pet.images?.[0]?.url;

                                        return (
                                            <div
                                                key={pet.id}
                                                className={`group relative overflow-hidden rounded-3xl border border-white/50 bg-white/80 shadow-xl transition-all duration-300 dark:border-gray-700/50 dark:bg-gray-900/80 ${
                                                    isExiting
                                                        ? 'animate-out zoom-out-95 fade-out'
                                                        : 'hover:-translate-y-1 hover:shadow-2xl'
                                                } ${isEntering ? 'animate-in zoom-in-95 fade-in' : ''}`}
                                            >
                                                <div className="relative h-60 w-full overflow-hidden">
                                                    {heroImage ? (
                                                        <img
                                                            src={heroImage}
                                                            alt={pet.name}
                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30">
                                                            <span className="text-5xl">
                                                                🐾
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-gray-950/10 to-transparent" />
                                                    <div className="absolute right-4 bottom-4 left-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-lg font-bold text-white">
                                                                    {pet.name}
                                                                </p>
                                                                <p className="text-xs text-white/80">
                                                                    {pet.breed ??
                                                                        'Mixed'}{' '}
                                                                    · {pet.age}{' '}
                                                                    yrs ·{' '}
                                                                    {pet.gender}
                                                                </p>
                                                            </div>
                                                            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                                                                {pet.pet_type
                                                                    ?.icon ??
                                                                    '🐶'}{' '}
                                                                {pet.pet_type
                                                                    ?.name ??
                                                                    'Pet'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-5">
                                                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                                                        {pet.description}
                                                    </p>
                                                    <div className="mt-4 flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleDesktopReaction(
                                                                    pet.id,
                                                                    'pass',
                                                                )
                                                            }
                                                            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-white"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDesktopReaction(
                                                                    pet.id,
                                                                    'like',
                                                                )
                                                            }
                                                            className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:shadow-lg"
                                                        >
                                                            Like
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDesktopReaction(
                                                                    pet.id,
                                                                    'super_like',
                                                                )
                                                            }
                                                            className="flex-1 rounded-xl border border-orange-200/70 bg-orange-50/60 px-3 py-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-100/80 dark:border-orange-500/60 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/50"
                                                        >
                                                            Super Like
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-3">
                                        <div className="rounded-3xl border border-white/50 bg-white/80 p-10 text-center shadow-xl dark:border-gray-700/50 dark:bg-gray-900/80">
                                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30">
                                                <Heart className="h-10 w-10 text-orange-400 dark:text-orange-500" />
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                No more matches nearby!
                                            </p>
                                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                                Try adjusting your filters or
                                                distance
                                            </p>
                                            <button
                                                onClick={loadRecommendations}
                                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-8 py-3 font-bold text-white shadow-xl transition-all duration-200 hover:scale-[1.02]"
                                            >
                                                <span className="text-lg">
                                                    🔄
                                                </span>
                                                Find More Pets
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Swipe Area */}
                        <div className="fixed top-16 right-0 bottom-[72px] left-0 mx-auto w-full max-w-6xl overflow-hidden lg:hidden">
                            <div className="relative flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden">
                                {hasRecommendations && currentPet ? (
                                    <div className="h-full w-full md:max-w-md">
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
                                    <div className="space-y-6 px-4 text-center">
                                        <div className="relative inline-block">
                                            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30">
                                                <Heart className="h-16 w-16 text-orange-400 dark:text-orange-500" />
                                            </div>
                                            <div className="absolute -top-2 -right-2 animate-bounce text-4xl">
                                                🐕
                                            </div>
                                            <div
                                                className="absolute -bottom-2 -left-2 animate-bounce text-3xl"
                                                style={{
                                                    animationDelay: '0.5s',
                                                }}
                                            >
                                                🐱
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                No more matches nearby!
                                            </p>
                                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                                Try adjusting your filters or
                                                distance
                                            </p>
                                        </div>
                                        <button
                                            onClick={loadRecommendations}
                                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-8 py-3 font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-95"
                                        >
                                            <span className="text-lg">🔄</span>
                                            Find More Pets
                                        </button>
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
                onClose={() =>
                    setMatchModal({ isOpen: false, pet: null, matchId: null })
                }
            />
        </>
    );
}

Discover.layout = {
    breadcrumbs: [
        {
            title: 'Discover',
            href: '/',
        },
    ],
};
