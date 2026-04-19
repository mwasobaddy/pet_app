import { Head, Link } from '@inertiajs/react';
import { Link as InertiaLink } from '@inertiajs/react';
// import Heading from '@/components/heading';
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

export default function PetsIndex({ pets: petList }: { pets: Pet[] }) {
    return (
        <>
            <Head title="My Pets" />

            <div className="min-h-screen w-full bg-gradient-to-b from-orange-50/50 via-white to-pink-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
                <div className="max-w-6xl mx-auto p-6 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 shadow-xl mb-4">
                            <span className="text-3xl">🐾</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Your Pets
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            You have {petList.length} pet profile{petList.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {petList.length === 0 ? (
                        <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-12 text-center shadow-sm">
                            <div className="text-5xl mb-4">🐕</div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">No pets yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
                                Create your first pet profile to get started!
                            </p>
                            <Link
                                href={pets.create.get()}
                                as={InertiaLink}
                            >
                                <Button className="h-12 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02]">
                                    Create Your First Pet
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex justify-end mb-6">
                            <Link
                                href={pets.create.get()}
                                as={InertiaLink}
                            >
                                <Button className="h-11 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                                    Add New Pet
                                </Button>
                            </Link>
                        </div>
                    )}

                    {petList.length > 0 && (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {petList.map((pet) => (
                                <Link
                                    key={pet.id}
                                    href={pets.show.get(pet.id)}
                                    as={InertiaLink}
                                    className="not-prose group"
                                >
                                    <div className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] hover:border-orange-300 dark:hover:border-orange-500">
                                        {/* Pet Image or Placeholder */}
                                        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                                            {pet.images?.length > 0 ? (
                                                <img
                                                    src={pet.images[0]?.path}
                                                    alt={pet.name}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-5xl bg-gradient-to-br from-orange-100 to-pink-100 dark:from-gray-600 dark:to-gray-700">
                                                    {pet.petType?.icon || '🐾'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Pet Info */}
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                                        {pet.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {pet.petType?.name || 'Pet'}
                                                        {pet.age && ` • ${pet.age} yo`}
                                                    </p>
                                                </div>
                                                <span className="text-lg">{pet.petType?.icon || '🐾'}</span>
                                            </div>

                                            {/* Personality Tags */}
                                            {pet.personalityTags?.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(pet.personalityTags ?? []).slice(0, 3).map((tag) => (
                                                        <span
                                                            key={tag.id}
                                                            className="whitespace-nowrap rounded-full bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:text-orange-300"
                                                        >
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                    {(pet.personalityTags?.length ?? 0) > 3 && (
                                                        <span className="whitespace-nowrap rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                                                            +{(pet.personalityTags?.length ?? 0) - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : null}

                                            {/* Description */}
                                            {pet.description && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                    {pet.description}
                                                </p>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-2">
                                                <Link
                                                    href={pets.edit.get(pet.id)}
                                                    as={InertiaLink}
                                                    className="not-prose flex-1"
                                                >
                                                    <Button variant="outline" size="sm" className="w-full rounded-xl border-2 hover:border-orange-300 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 transition-all">
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Link
                                                    href={pets.show.get(pet.id)}
                                                    as={InertiaLink}
                                                    className="not-prose flex-1"
                                                >
                                                    <Button size="sm" className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 transition-all">
                                                        View
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

PetsIndex.layout = {
    breadcrumbs: [
        {
            title: 'My Pets',
            href: pets.index.get(),
        },
    ],
};
