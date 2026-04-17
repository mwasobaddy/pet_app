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

            <h1 className="sr-only">My Pets</h1>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Your Pets"
                        description={`You have ${petList.length} pet profile${petList.length !== 1 ? 's' : ''}`}
                    />
                    <Link
                        href={pets.create.get()}
                        as={InertiaLink}
                    >
                        <Button>Add New Pet</Button>
                    </Link>
                </div>

                {petList.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
                        <div className="text-4xl mb-4">🐾</div>
                        <h3 className="font-semibold text-lg">No pets yet</h3>
                        <p className="text-muted-foreground mt-2 mb-4">
                            Create your first pet profile to get started!
                        </p>
                        <Link href={pets.create.get()} as={InertiaLink}>
                            <Button>Create Your First Pet</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {petList.map((pet) => (
                            <Link
                                key={pet.id}
                                href={pets.show.get(pet.id)}
                                as={InertiaLink}
                                className="not-prose"
                            >
                                <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg">
                                    {/* Pet Image or Placeholder */}
                                    <div className="relative aspect-square overflow-hidden bg-muted">
                                        {pet.images?.length > 0 ? (
                                            <img
                                                src={pet.images[0]?.path}
                                                alt={pet.name}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-4xl">
                                                {pet.petType?.icon || '🐾'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Pet Info */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-semibold text-lg">{pet.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {pet.petType?.name || 'Pet type not set'}
                                                    {pet.age && ` • ${pet.age} years old`}
                                                </p>
                                            </div>
                                            <span className="text-sm font-medium">{pet.petType?.icon || '🐾'}</span>
                                        </div>

                                        {/* Personality Tags */}
                                        {pet.personalityTags?.length > 0 ? (
                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {(pet.personalityTags ?? []).slice(0, 2).map((tag) => (
                                                    <span
                                                        key={tag.id}
                                                        className="whitespace-nowrap rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary dark:bg-primary/20"
                                                    >
                                                        {tag.name}
                                                    </span>
                                                ))}
                                                {(pet.personalityTags?.length ?? 0) > 2 && (
                                                    <span className="whitespace-nowrap rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                                                        +{(pet.personalityTags?.length ?? 0) - 2}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-3 text-xs font-medium text-muted-foreground">
                                                No personality tags yet
                                            </div>
                                        )}

                                        {/* Description */}
                                        {pet.description && (
                                            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                                                {pet.description}
                                            </p>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="mt-4 flex gap-2">
                                            <Link
                                                href={pets.edit.get(pet.id)}
                                                as={InertiaLink}
                                                className="not-prose flex-1"
                                            >
                                                <Button variant="outline" size="sm" className="w-full">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Link
                                                href={pets.show.get(pet.id)}
                                                as={InertiaLink}
                                                className="not-prose flex-1"
                                            >
                                                <Button size="sm" className="w-full">
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
