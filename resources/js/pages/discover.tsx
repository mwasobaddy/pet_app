import { Head, usePage } from '@inertiajs/react';
import { Filter, Heart, MapPin, Search, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import MatchModal from '@/components/match-modal';
import SwipeCard from '@/components/swipe-card';
import * as matchingRoutes from '@/routes/matching';
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
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [matchModal, setMatchModal] = useState({ isOpen: false, pet: null as MatchedPet | null, matchId: null as number | null });
    const [distance, setDistance] = useState(100);
    const [petTypes, setPetTypes] = useState<PetType[]>([]);
    const [personalityTags, setPersonalityTags] = useState<{ id: number; name: string }[]>([]);
    const [filters, setFilters] = useState({
        petTypeId: '',
        personalityTagIds: [] as number[],
    });
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [desktopPets, setDesktopPets] = useState<Recommendation[]>([]);
    const [exitingPetId, setExitingPetId] = useState<number | null>(null);
    const [enteringPetId, setEnteringPetId] = useState<number | null>(null);
    const recommendationsRef = useRef<Recommendation[]>([]);
    const desktopCursorRef = useRef(0);

    // Load recommendations on mount
    useEffect(() => {
        loadRecommendations();
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

        return () => {
            channel.stopListening('.match.created', handleMatchCreated);
            window.Echo?.leave(`users.${auth.user.id}`);
        };
    }, [auth?.user?.id]);

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
            setPetTypes(data.filters?.pet_types ?? []);
            setPersonalityTags(data.filters?.personality_tags ?? []);
            setCurrentIndex(0);
        } catch (error) {
            console.error('Failed to load recommendations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getFilteredRecommendations = (items: Recommendation[], query: string) => {
        const normalized = query.trim().toLowerCase();

        if (!normalized) {
            return items;
        }

        return items.filter((pet) => {
            const haystack = [pet.name, pet.breed ?? '', pet.pet_type?.name ?? '', pet.owner?.name ?? '']
                .join(' ')
                .toLowerCase();

            return haystack.includes(normalized);
        });
    };

    useEffect(() => {
        const filtered = getFilteredRecommendations(recommendations, searchQuery);
        recommendationsRef.current = filtered;
        setCurrentIndex(0);
        const initialDesktopPets = filtered.slice(0, 12);
        setDesktopPets(initialDesktopPets);
        desktopCursorRef.current = initialDesktopPets.length;
        setExitingPetId(null);
        setEnteringPetId(null);
    }, [recommendations, searchQuery]);

    const recordInteraction = async (petId: number, type: 'pass' | 'like' | 'super_like') => {
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

            return data;
        } catch (error) {
            console.error('Failed to record interaction:', error);

            return null;
        }
    };

    const handleDesktopReaction = async (petId: number, type: 'pass' | 'like' | 'super_like') => {
        const data = await recordInteraction(petId, type);

        if (!data) {
            return;
        }

        setExitingPetId(petId);

        window.setTimeout(() => {
            setDesktopPets((prev) => {
                const nextPets = prev.filter((pet) => pet.id !== petId);
                const nextPet = recommendationsRef.current[desktopCursorRef.current];

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

    const handleSwipe = async (petId: number, type: 'pass' | 'like' | 'super_like') => {
        const data = await recordInteraction(petId, type);

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

    if (isLoading) {
        return (
            <>
                <Head title="Discover" />
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

    const filteredRecommendations = getFilteredRecommendations(recommendations, searchQuery);
    const hasRecommendations = filteredRecommendations.length > 0 && currentIndex < filteredRecommendations.length;
    const currentPet = hasRecommendations ? filteredRecommendations[currentIndex] : null;
    const hasDesktopPets = desktopPets.length > 0;

    return (
        <>
            <Head title="Discover" />
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
                <div className="relative z-10">
                    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-16 pt-6 lg:px-6">
                        {/* Center - Main Swipe Area */}
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
                                        {filteredRecommendations.length > 0
                                            ? `${filteredRecommendations.length} pets nearby are waiting!`
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
                            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm transition focus-within:border-orange-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                <Search className="h-4 w-4 text-orange-500" />
                                <input
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Search by name, breed, or type"
                                    className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none dark:text-gray-200"
                                />
                            </div>
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
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <div>
                                        <label className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-2 block">Pet Type</label>
                                        <select
                                            value={filters.petTypeId}
                                            onChange={(event) => setFilters((prev) => ({ ...prev, petTypeId: event.target.value }))}
                                            className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-4 py-2.5 text-sm focus:border-orange-400 focus:ring-orange-400/20 transition"
                                        >
                                            <option value="">Any Type</option>
                                            {petTypes.map((type) => (
                                                <option key={type.id} value={type.id}>
                                                    {type.icon ?? ''} {type.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
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

                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <label className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-3 block">Personality Traits</label>
                                    <div className="flex flex-wrap gap-2">
                                        {personalityTags.map((tag) => {
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

                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                    <button
                                        onClick={() => {
                                            setFilters({
                                                petTypeId: '',
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

                        {/* Desktop Grid */}
                        <div className="hidden lg:block" data-scroll-to="swipe-area">
                            <div className="grid grid-cols-3 gap-6">
                                {hasDesktopPets ? (
                                    desktopPets.map((pet) => {
                                        const isExiting = exitingPetId === pet.id;
                                        const isEntering = enteringPetId === pet.id;
                                        const heroImage = pet.images?.[0]?.url;

                                        return (
                                            <div
                                                key={pet.id}
                                                className={`group relative overflow-hidden rounded-3xl border border-white/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 shadow-xl transition-all duration-300 ${
                                                    isExiting
                                                        ? 'animate-out fade-out zoom-out-95'
                                                        : 'hover:-translate-y-1 hover:shadow-2xl'
                                                } ${isEntering ? 'animate-in fade-in zoom-in-95' : ''}`}
                                            >
                                                <div className="relative h-60 w-full overflow-hidden">
                                                    {heroImage ? (
                                                        <img src={heroImage} alt={pet.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30">
                                                            <span className="text-5xl">🐾</span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-gray-950/10 to-transparent" />
                                                    <div className="absolute bottom-4 left-4 right-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-lg font-bold text-white">{pet.name}</p>
                                                                <p className="text-xs text-white/80">
                                                                    {pet.breed ?? 'Mixed'} · {pet.age} yrs · {pet.gender}
                                                                </p>
                                                            </div>
                                                            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                                                                {pet.pet_type?.icon ?? '🐶'} {pet.pet_type?.name ?? 'Pet'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-5">
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                                        {pet.description}
                                                    </p>
                                                    <div className="mt-4 flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleDesktopReaction(pet.id, 'pass')}
                                                            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition"
                                                        >
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() => handleDesktopReaction(pet.id, 'like')}
                                                            className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-2 text-xs font-semibold text-white shadow-md hover:shadow-lg transition"
                                                        >
                                                            Like
                                                        </button>
                                                        <button
                                                            onClick={() => handleDesktopReaction(pet.id, 'super_like')}
                                                            className="flex-1 rounded-xl border border-orange-200/70 dark:border-orange-500/60 bg-orange-50/60 dark:bg-orange-900/30 px-3 py-2 text-xs font-semibold text-orange-600 dark:text-orange-300 hover:bg-orange-100/80 dark:hover:bg-orange-900/50 transition"
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
                                        <div className="rounded-3xl border border-white/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 p-10 text-center shadow-xl">
                                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30">
                                                <Heart className="h-10 w-10 text-orange-400 dark:text-orange-500" />
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">No more matches nearby!</p>
                                            <p className="mt-2 text-gray-500 dark:text-gray-400">Try adjusting your filters or distance</p>
                                            <button
                                                onClick={loadRecommendations}
                                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-8 py-3 font-bold text-white shadow-xl transition-all duration-200 hover:scale-[1.02]"
                                            >
                                                <span className="text-lg">🔄</span>
                                                Find More Pets
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Swipe Area */}
                        <div className="lg:hidden">
                            <div className="relative min-h-[500px] flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-white via-orange-50/50 to-pink-50/50 dark:from-gray-900 dark:via-gray-900/50 dark:to-gray-800/50 shadow-2xl border border-white/50 dark:border-gray-700/50 p-8">
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

Discover.layout = {
    breadcrumbs: [
        {
            title: 'Discover',
            href: '/',
        },
    ],
};
