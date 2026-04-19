import { Head, Link } from '@inertiajs/react';
import { Link as InertiaLink } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import pets from '@/routes/pets';

interface PetImage {
    id: number;
    path: string;
    order: number;
}

interface PersonalityTag {
    id: number;
    name: string;
    description?: string;
}

interface PetType {
    id: number;
    name: string;
    icon?: string;
}

interface Pet {
    id: number;
    name: string;
    age?: number;
    gender: string;
    description?: string;
    petType: PetType;
    images: PetImage[];
    personalityTags: PersonalityTag[];
}

export default function ShowPet({ pet }: { pet: Pet }) {
    return (
        <>
            <Head title={`${pet.name}'s Profile`} />

            <div className="min-h-screen w-full bg-gradient-to-b from-orange-50/50 via-white to-pink-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
                <div className="max-w-5xl mx-auto p-6 md:p-12">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 shadow-xl mb-4">
                                <span className="text-3xl">🐾</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {pet.name}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                {pet.petType.name}{pet.age ? ` • ${pet.age} years old` : ''}
                            </p>
                        </div>
                        <div className="flex gap-2 justify-center md:justify-start">
                            <Link href={pets.edit.get(pet.id)} as={InertiaLink}>
                                <Button className="h-11 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                                    Edit Profile
                                </Button>
                            </Link>
                            <Link href={pets.index.get()} as={InertiaLink}>
                                <Button variant="outline" className="h-11 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                                    Back to Pets
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Pet Images */}
                        <div className="md:col-span-2 space-y-4">
                            {pet.images.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-square shadow-lg">
                                        <img
                                            src={pet.images[0].path}
                                            alt={pet.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    {pet.images.length > 1 && (
                                        <div className="grid grid-cols-4 gap-3">
                                            {pet.images.slice(1).map((image) => (
                                                <div key={image.id} className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 aspect-square shadow-md">
                                                    <img
                                                        src={image.path}
                                                        alt={`${pet.name} ${image.order}`}
                                                        className="h-full w-full object-cover transition-transform hover:scale-110"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-2xl bg-gradient-to-br from-orange-100 to-pink-100 dark:from-gray-700 dark:to-gray-600 aspect-square flex items-center justify-center text-7xl shadow-lg">
                                    {pet.petType.icon || '🐾'}
                                </div>
                            )}

                            {/* Description */}
                            {pet.description && (
                                <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-md">
                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <span>📖</span> About {pet.name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                                        {pet.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pet Details Sidebar */}
                        <div className="space-y-4">
                            {/* Basic Info Card */}
                            <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-md">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span>ℹ️</span> Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Type</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{pet.petType.icon} {pet.petType.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Gender</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">{pet.gender}</p>
                                        </div>
                                    </div>
                                    {pet.age && (
                                        <div className="flex items-center justify-between py-2">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Age</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">{pet.age} years old</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Personality Tags Card */}
                            {pet.personalityTags.length > 0 && (
                                <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-md">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <span>✨</span> Personality
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {pet.personalityTags.map((tag) => (
                                            <div
                                                key={tag.id}
                                                className="rounded-full bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 px-4 py-2 text-sm font-semibold text-orange-700 dark:text-orange-300 shadow-sm hover:shadow-md transition-all cursor-pointer"
                                            >
                                                {tag.name}
                                                {tag.description && (
                                                    <div className="invisible group-hover:visible absolute bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap -mt-2 z-10">
                                                        {tag.description}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ShowPet.layout = {
    breadcrumbs: [
        {
            title: 'My Pets',
            href: pets.index.get(),
        },
        {
            title: 'Pet Profile',
        },
    ],
};
