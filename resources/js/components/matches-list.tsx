import { Link } from '@inertiajs/react';
import { Heart, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MatchImage {
    url: string;
}

interface MatchUser {
    id: number;
    name: string;
}

interface MatchPet {
    id: number;
    name: string;
    images: MatchImage | null;
    user: MatchUser;
}

interface Match {
    id: number;
    matched_at: string;
    pet_profile_1: MatchPet;
    pet_profile_2: MatchPet;
}

export default function MatchesList() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        setIsLoading(true);

        try {
            const response = await fetch('/api/matching/matches');
            const data = await response.json();
            setMatches(data.matches);
        } catch (error) {
            console.error('Failed to load matches:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center space-y-2">
                    <div className="animate-spin">
                        <Heart className="w-8 h-8 text-red-500 mx-auto" />
                    </div>
                    <p className="text-gray-600">Loading matches...</p>
                </div>
            </div>
        );
    }

    if (matches.length === 0) {
        return (
            <div className="text-center p-8">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">No matches yet. Keep swiping! 🐾</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => (
                <div key={match.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                    {/* Image */}
                    <div className="relative h-40 bg-gradient-to-br from-pink-200 to-rose-200 overflow-hidden">
                        {match.pet_profile_2.images && (
                            <img
                                src={match.pet_profile_2.images.url}
                                alt={match.pet_profile_2.name}
                                className="w-full h-full object-cover"
                            />
                        )}
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Heart size={12} className="fill-white" /> Match
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                        <div>
                            <h3 className="font-bold text-lg">{match.pet_profile_2.name}</h3>
                            <p className="text-sm text-gray-600">{match.pet_profile_2.user.name}'s pet</p>
                        </div>

                        <p className="text-xs text-gray-500">
                            Matched {new Date(match.matched_at).toLocaleDateString()}
                        </p>

                        {/* Action Button */}
                        <Link
                            href={`/chat/match/${match.id}`}
                            className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-semibold transition"
                        >
                            <MessageCircle size={16} />
                            Start Chat
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}
