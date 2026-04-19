import { X, Heart, Star } from 'lucide-react';
import { useState, useRef } from 'react';

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

interface SwipeCardProps {
    id: number;
    name: string;
    age: number;
    gender: string;
    description: string;
    pet_type: PetType | null;
    images: Image[];
    owner: Owner;
    onSwipe: (petId: number, type: 'pass' | 'like' | 'super_like') => void;
}

export default function SwipeCard({ id, name, age, gender, description, pet_type, images, owner, onSwipe }: SwipeCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) {
            return;
        }
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            onSwipe(id, 'pass');
        } else if (isRightSwipe) {
            onSwipe(id, 'like');
        }
    };

    const nextImage = () => {
        if (images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const prevImage = () => {
        if (images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    const currentImage = images[currentImageIndex];

    return (
        <div
            ref={cardRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            className="relative w-full h-full md:max-w-md lg:h-96 bg-white rounded-2xl shadow-xl overflow-hidden mb-6 cursor-grab active:cursor-grabbing"
        >
            {/* Image Container */}
            <div className="relative w-full h-3/4 bg-gradient-to-br from-gray-200 to-gray-300">
                {currentImage && (
                    <img
                        src={currentImage.url}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                )}
                
                {/* Image Navigation */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                        >
                            ‹
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
                        >
                            ›
                        </button>
                    </>
                )}

                {/* Image Indicators */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                    {images.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1 rounded-full transition-all ${
                                idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 w-2'
                            }`}
                        />
                    ))}
                </div>

                {/* Pet Type Badge */}
                {pet_type && (
                    <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-sm font-semibold">
                        {pet_type.icon} {pet_type.name}
                    </div>
                )}
            </div>

            {/* Info Container */}
            <div className="p-4 space-y-2">
                {/* Name and Age */}
                <div>
                    <h3 className="text-xl font-bold">
                        {name}, <span className="text-gray-600">{age}</span>
                    </h3>
                    <p className="text-sm text-gray-500">{gender} • {owner.name}'s pet</p>
                </div>

                {/* Description */}
                {description && (
                    <p className="text-sm text-gray-700 line-clamp-2">
                        {description}
                    </p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/10 to-transparent px-4 pb-4 flex gap-3 justify-center">
                <button
                    onClick={() => onSwipe(id, 'pass')}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 text-white transition backdrop-blur"
                    title="Pass"
                >
                    <X size={24} />
                </button>
                <button
                    onClick={() => onSwipe(id, 'super_like')}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/80 hover:bg-blue-600 text-white transition"
                    title="Super Like"
                >
                    <Star size={24} />
                </button>
                <button
                    onClick={() => onSwipe(id, 'like')}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/80 hover:bg-red-600 text-white transition"
                    title="Like"
                >
                    <Heart size={24} />
                </button>
            </div>
        </div>
    );
}
