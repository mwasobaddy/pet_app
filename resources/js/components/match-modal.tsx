import { Link } from '@inertiajs/react';
import { Heart, MessageCircle } from 'lucide-react';

interface MatchImage {
    url: string;
}

interface MatchUser {
    id: number;
    name: string;
}

interface MatchPetProfile {
    id: number;
    name: string;
    images: MatchImage | null;
    user: MatchUser;
}

interface MatchModalProps {
    isOpen: boolean;
    matchedPet: MatchPetProfile | null;
    matchId: number | null;
    onClose: () => void;
}

export default function MatchModal({ isOpen, matchedPet, matchId, onClose }: MatchModalProps) {
    if (!isOpen || !matchedPet) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden animated-in zoom-in duration-300">
                {/* Header */}
                <div className="relative h-64 bg-gradient-to-br from-pink-400 to-rose-400 overflow-hidden">
                    {matchedPet.images && (
                        <img
                            src={matchedPet.images.url}
                            alt={matchedPet.name}
                            className="w-full h-full object-cover"
                        />
                    )}
                    
                    {/* Confetti-like background */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    
                    {/* Hearts Animation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Heart className="text-white w-20 h-20 fill-white animate-pulse" />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 text-center">
                    <h2 className="text-3xl font-bold">It's a match! 💕</h2>
                    <p className="text-gray-600">
                        You and{' '}
                        <span className="font-semibold text-gray-900">
                            {matchedPet.name}
                        </span>
                        {' '}({matchedPet.user.name}) like each other!
                    </p>

                    {/* Suggested Messages */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                        <p className="font-semibold text-gray-700 mb-2">Conversation Starters:</p>
                        <div className="space-y-2 text-left">
                            <button className="w-full text-gray-700 hover:bg-gray-200 p-2 rounded transition text-sm">
                                "Hey! {matchedPet.name} looks amazing! 🐾"
                            </button>
                            <button className="w-full text-gray-700 hover:bg-gray-200 p-2 rounded transition text-sm">
                                "Our pets would be great friends! 😊"
                            </button>
                            <button className="w-full text-gray-700 hover:bg-gray-200 p-2 rounded transition text-sm">
                                "Let's plan a playdate! 🎉"
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition"
                        >
                            Keep Swiping
                        </button>
                        <Link
                            href={matchId ? `/chat/match/${matchId}` : '#'}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                        >
                            <MessageCircle size={18} />
                            Start Chat
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
