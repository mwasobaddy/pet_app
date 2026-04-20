import { Head, Link } from '@inertiajs/react';
import { Link as InertiaLink } from '@inertiajs/react';
import {
    Heart,
    PawPrint,
    Plus,
    Edit2,
    Eye,
    Sparkles,
    Dog,
    Cat,
    Bird,
    Fish,
    Rabbit,
    Shield,
    Zap,
    Smile,
    Clock,
    MapPin,
    ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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
    status?: 'available' | 'adopted' | 'pending' | string;
    location?: string;
    lastVetVisit?: string;
}

const petTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    Dog: Dog,
    Cat: Cat,
    Bird: Bird,
    Fish: Fish,
    Rabbit: Rabbit,
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ComponentType<{ className?: string }> }> = {
    available: { label: 'Available', variant: 'default', icon: Sparkles },
    adopted: { label: 'Adopted', variant: 'secondary', icon: Heart },
    pending: { label: 'Pending', variant: 'outline', icon: Clock },
};

const tagIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    Friendly: Smile,
    Energetic: Zap,
    Calm: Shield,
};

function getStatusBadge(pet: Pet) {
    const status = pet.status || 'available';
    const config = statusConfig[status] || statusConfig.available;
    const Icon = config.icon;

    return (
        <Badge variant={config.variant} className="gap-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    );
}

function getPetTypeIcon(petType?: PetType) {
    if (!petType?.name) {
        return PawPrint;
    }

    return petTypeIcons[petType.name] || PawPrint;
}

function PersonalityTagBadge({ tag }: { tag: PersonalityTag }) {
    const Icon = tagIcons[tag.name] || Sparkles;

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 px-2.5 py-1 text-xs font-medium text-orange-700 dark:text-orange-300 border border-orange-200/50 dark:border-orange-800/50">
            <Icon className="h-3 w-3" />
            {tag.name}
        </span>
    );
}

export default function PetsIndex({ pets: petList }: { pets: Pet[] }) {
    return (
        <>
            <Head title="My Pets" />

            <div className="min-h-screen w-full bg-gradient-to-b from-orange-50/80 via-amber-50/30 to-pink-50/40 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-rose-500 shadow-lg shadow-orange-500/25">
                                    <PawPrint className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                        My Pets
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {petList.length} pet{petList.length !== 1 ? 's' : ''} in your care
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Link href={pets.create.get()} as={InertiaLink}>
                            <Button
                                size="lg"
                                className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Plus className="h-5 w-5" />
                                Add New Pet
                            </Button>
                        </Link>
                    </div>

                    {/* Empty State */}
                    {petList.length === 0 ? (
                        <Card className="relative overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                            <CardContent className="flex flex-col items-center justify-center py-10">
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-rose-400/20 rounded-full blur-2xl" />
                                    <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-rose-100 dark:from-gray-700 dark:to-gray-600 shadow-inner">
                                        <PawPrint className="h-12 w-12 text-orange-400 dark:text-orange-300" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    No pets yet
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                                    Start your pet journey! Create your first pet profile to track health, personality, and memories.
                                </p>
                                <Link href={pets.create.get()} as={InertiaLink}>
                                    <Button
                                        size="lg"
                                        className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02]"
                                    >
                                        <Plus className="h-5 w-5" />
                                        Create Your First Pet
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <>

                            {/* Pet Grid */}
                            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {petList.map((pet) => {
                                    const PetIcon = getPetTypeIcon(pet.petType);
                                    const hasImage = pet.images?.length > 0;

                                    return (
                                        <Card
                                            key={pet.id}
                                            className="group relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 p-0"
                                        >
                                            {/* Card Image Section */}
                                            <Link
                                                href={pets.show.get(pet.id)}
                                                as={InertiaLink}
                                                className="not-prose block relative aspect-square overflow-hidden bg-gradient-to-br from-orange-100 via-amber-50 to-pink-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"
                                            >
                                                {hasImage ? (
                                                    <>
                                                        <img
                                                            src={pet.images[0].path}
                                                            alt={pet.name}
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                            loading="lazy"
                                                        />
                                                        {/* Gradient Overlay */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                    </>
                                                ) : (
                                                    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-400/20 to-rose-400/20">
                                                            <PetIcon className="h-10 w-10 text-orange-400 dark:text-orange-300" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                                                            No photo
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Status Badge - Always visible on image */}
                                                <div className="absolute top-3 left-3">
                                                    {getStatusBadge(pet)}
                                                </div>

                                                {/* Quick View Button - Shows on hover */}
                                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg">
                                                        <Eye className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                                                    </div>
                                                </div>

                                                {/* Pet Name Overlay - Shows on hover for images */}
                                                {hasImage && (
                                                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                        <h3 className="text-lg font-bold text-white drop-shadow-lg">
                                                            {pet.name}
                                                        </h3>
                                                    </div>
                                                )}
                                            </Link>

                                            {/* Card Content */}
                                            <CardContent className="px-6 py-4 space-y-3">
                                                {/* Name and Type - Only show if no image (image cards show name on hover) */}
                                                {!hasImage && (
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                                                {pet.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {pet.petType?.name || 'Pet'}
                                                                {pet.age && ` • ${pet.age} year${pet.age !== 1 ? 's' : ''}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Location (if available) */}
                                                {pet.location && (
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        <span className="truncate">{pet.location}</span>
                                                    </div>
                                                )}

                                                {/* Personality Tags */}
                                                {pet.personalityTags?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {pet.personalityTags.slice(0, 3).map((tag) => (
                                                            <PersonalityTagBadge key={tag.id} tag={tag} />
                                                        ))}
                                                        {pet.personalityTags.length > 3 && (
                                                            <Badge variant="outline" className="rounded-full bg-gray-50 dark:bg-gray-700/50">
                                                                +{pet.personalityTags.length - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Description Preview */}
                                                {pet.description && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                        {pet.description}
                                                    </p>
                                                )}
                                            </CardContent>

                                            {/* Card Footer - Action Buttons */}
                                            <CardFooter className="px-6 pb-6 pt-0 flex gap-2">
                                                <Link href={pets.edit.get(pet.id)} as={InertiaLink} className="flex-1 not-prose">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full rounded-xl border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Link href={pets.show.get(pet.id)} as={InertiaLink} className="flex-1 not-prose">
                                                    <Button
                                                        size="sm"
                                                        className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                                                    >
                                                        View
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </CardFooter>
                                        </Card>
                                    );
                                })}
                            </div>
                        </>
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
