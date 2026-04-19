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
            className="relative w-full h-full md:max-w-md lg:h-96 rounded-3xl bg-white shadow-lg overflow-hidden cursor-grab active:cursor-grabbing flex flex-col dark:bg-slate-900 dark:shadow-[0_20px_50px_-24px_rgba(2,6,23,0.9)]"
        >
            {/* Image Container */}
            <div className="relative w-full flex-1 bg-linear-to-br from-gray-200 to-gray-300">
                {currentImage ? (
                    <img
                        src={currentImage.url}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-6xl">🐾</span>
                    </div>
                )}

                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent dark:from-black/55" />
                
                {/* Image Navigation */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
                        >
                            ‹
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
                        >
                            ›
                        </button>
                    </>
                )}

                {/* Image Indicators */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
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
                    <div className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm dark:bg-slate-900/85 dark:text-slate-100">
                        {pet_type.icon} {pet_type.name}
                    </div>
                )}
            </div>

            {/* Info Container */}
            <div className="space-y-3 bg-white px-6 py-4 dark:bg-slate-900">
                {/* Name and Age */}
                <div className="space-y-1">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-slate-50">
                        {name}, <span className="font-bold text-gray-600 dark:text-slate-300">{age}</span>
                    </h3>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-300">{gender} • {owner.name}'s pet</p>
                </div>

                {/* Description */}
                {description && (
                    <p className="line-clamp-3 text-sm leading-relaxed text-gray-700 dark:text-slate-300">
                        {description}
                    </p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 bg-white px-6 pb-6 dark:bg-slate-900">
                <button
                    onClick={() => onSwipe(id, 'pass')}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-600 shadow-md transition hover:scale-110 hover:bg-gray-300 active:scale-95 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    title="Pass"
                >
                    <X size={26} strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => onSwipe(id, 'super_like')}
                    className="flex h-18 w-18 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition hover:scale-110 hover:bg-blue-600 active:scale-95 dark:bg-blue-500 dark:hover:bg-blue-400"
                    title="Super Like"
                >
                    <Star size={28} strokeWidth={2} fill="currentColor" />
                </button>
                <button
                    onClick={() => onSwipe(id, 'like')}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white shadow-md transition hover:scale-110 hover:bg-rose-600 active:scale-95 dark:bg-rose-500 dark:hover:bg-rose-400"
                    title="Like"
                >
                    <Heart size={26} strokeWidth={2.5} fill="currentColor" />
                </button>
            </div>
        </div>
    );
}
