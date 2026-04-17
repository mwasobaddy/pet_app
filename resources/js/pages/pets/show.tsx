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

            <h1 className="sr-only">{pet.name}'s Profile</h1>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title={pet.name}
                        description={`${pet.petType.name}${pet.age ? ` • ${pet.age} years old` : ''}`}
                    />
                    <div className="flex gap-2">
                        <Link href={pets.edit.get(pet.id)} as={InertiaLink}>
                            <Button variant="outline">Edit</Button>
                        </Link>
                        <Link href={pets.index.get()} as={InertiaLink}>
                            <Button variant="ghost">Back to Pets</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Pet Images */}
                    <div className="md:col-span-2 space-y-4">
                        {pet.images.length > 0 ? (
                            <div className="space-y-2">
                                <div className="rounded-lg overflow-hidden bg-muted aspect-square">
                                    <img
                                        src={pet.images[0].path}
                                        alt={pet.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                {pet.images.length > 1 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {pet.images.slice(1).map((image) => (
                                            <div key={image.id} className="rounded-lg overflow-hidden bg-muted aspect-square">
                                                <img
                                                    src={image.path}
                                                    alt={`${pet.name} ${image.order}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-lg bg-muted aspect-square flex items-center justify-center text-6xl">
                                {pet.petType.icon || '🐾'}
                            </div>
                        )}

                        {/* Description */}
                        {pet.description && (
                            <div className="rounded-lg border border-border bg-card p-4">
                                <h3 className="font-semibold text-lg mb-2">About {pet.name}</h3>
                                <p className="text-muted-foreground whitespace-pre-line">{pet.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Pet Details Sidebar */}
                    <div className="space-y-4">
                        {/* Basic Info Card */}
                        <div className="rounded-lg border border-border bg-card p-4">
                            <h3 className="font-semibold text-lg mb-4">Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Type</p>
                                    <p className="font-medium">{pet.petType.icon} {pet.petType.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Gender</p>
                                    <p className="font-medium">{pet.gender}</p>
                                </div>
                                {pet.age && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Age</p>
                                        <p className="font-medium">{pet.age} years old</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Personality Tags Card */}
                        {pet.personalityTags.length > 0 && (
                            <div className="rounded-lg border border-border bg-card p-4">
                                <h3 className="font-semibold text-lg mb-4">Personality</h3>
                                <div className="flex flex-wrap gap-2">
                                    {pet.personalityTags.map((tag) => (
                                        <div
                                            key={tag.id}
                                            className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary dark:bg-primary/20 group"
                                        >
                                            {tag.name}
                                            {tag.description && (
                                                <div className="invisible group-hover:visible absolute bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap mt-1 z-10">
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
