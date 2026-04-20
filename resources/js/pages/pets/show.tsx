import { Head, Link } from '@inertiajs/react';
import { MapPin, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    breed?: string | null;
    age?: number;
    gender: string;
    description?: string;
    petType: PetType;
    images: PetImage[];
    personalityTags: PersonalityTag[];
}

export default function ShowPet({ pet }: { pet: Pet }) {
    const mainImage = pet.images && pet.images.length > 0 ? pet.images[0].path : null;

    return (
        <>
            <Head title={`${pet.name}'s Profile`} />

            <div className="min-h-screen w-full bg-white dark:bg-gray-950">
                <div className="max-w-3xl mx-auto p-6 md:p-12">
                    {/* Header */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Personal Informations
                            </h1>
                            <Link href={pets.edit.url(pet.id)}>
                                <Button variant="outline" className="border-gray-200 dark:border-gray-800 rounded-xl font-semibold">
                                    Edit Profile
                                </Button>
                            </Link>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-center gap-6 mb-10 pb-10 border-b border-gray-100 dark:border-gray-800">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-900 shadow-xl ring-1 ring-gray-100 dark:ring-gray-800">
                                    {mainImage ? (
                                        <img 
                                            src={mainImage} 
                                            className="w-full h-full object-cover"
                                            alt={pet.name}
                                        />
                                    ) : (
                                        <div className="text-4xl">{pet.petType.icon || '🐾'}</div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 border-4 border-white dark:border-gray-950 rounded-full" />
                            </div>
                            
                            <div className="flex flex-col">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center md:text-left">
                                    {pet.name}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 font-medium text-center md:text-left mt-1">
                                    {pet.petType.name} {pet.breed ? ` • ${pet.breed}` : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Information Grid (ReadOnly) */}
                    <div className="space-y-6">
                        {/* Name Field (ReadOnly Style) */}
                        <div className="relative">
                            <Input
                                readOnly
                                value={pet.name}
                            />
                            <UserIcon className="w-5 h-5 text-gray-400 absolute right-6 top-1/2 -translate-y-1/2" />
                        </div>

                        {/* Species & Breed */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Input
                                    readOnly
                                    value={pet.petType.name}
                                />
                                <div className="text-gray-400 absolute right-6 top-1/2 -translate-y-1/2">
                                    {pet.petType.icon}
                                </div>
                            </div>
                            <div className="relative">
                                <Input
                                    readOnly
                                    value={pet.breed || 'No breed specified'}
                                />
                                <MapPin className="w-5 h-5 text-gray-400 absolute right-6 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        {/* Age & Gender */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                readOnly
                                value={pet.age ? `${pet.age} years old` : 'Age unknown'}
                            />
                            <Input
                                readOnly
                                value={pet.gender}
                            />
                        </div>

                        {/* Personality Traits */}
                        {pet.personalityTags.length > 0 && (
                            <div className="space-y-4 pt-4 pb-4">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider ml-1">
                                    Personality Traits
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {pet.personalityTags.map((tag) => (
                                        <span
                                            key={tag.id}
                                            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-2 border-transparent"
                                        >
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {pet.description && (
                            <div className="rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 px-6 py-6">
                                <p className="text-gray-900 dark:text-white font-medium leading-relaxed">
                                    {pet.description}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-6">
                            <Link href={pets.index.url()}>
                                <Button className="w-full h-16 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98]">
                                    Back to My Pets
                                </Button>
                            </Link>
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
