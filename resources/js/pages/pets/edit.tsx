import { Form, Head, router } from '@inertiajs/react';
import { useState } from 'react';
import PetProfileController from '@/actions/App/Http/Controllers/PetProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import pets from '@/routes/pets';

interface PetType {
    id: number;
    name: string;
    icon?: string;
}

interface PersonalityTag {
    id: number;
    name: string;
    description?: string;
}

interface Pet {
    id: number;
    name: string;
    breed?: string | null;
    age?: number;
    gender: string;
    description?: string;
    pet_type_id: number;
    personalityTags: PersonalityTag[];
}

export default function EditPet({
    pet,
    petTypes,
    personalityTags,
}: {
    pet: Pet;
    petTypes: PetType[];
    personalityTags: PersonalityTag[];
}) {
    const [selectedTags, setSelectedTags] = useState<number[]>(
        pet.personalityTags?.map((tag) => tag.id) || []
    );

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this pet profile?')) {
            router.delete(pets.destroy.url(pet.id));
        }
    };

    return (
        <>
            <Head title={`Edit ${pet.name}`} />

            <h1 className="sr-only">Edit {pet.name}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={`Edit ${pet.name}`}
                    description="Update your pet's information"
                />

                <Form
                    {...PetProfileController.update.form()}
                    action={pets.update.url(pet.id)}
                    method="patch"
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors, setData }) => (
                        <>
                            {/* Pet Type */}
                            <div className="grid gap-2">
                                <Label htmlFor="pet_type_id">Pet Type *</Label>
                                <select
                                    id="pet_type_id"
                                    name="pet_type_id"
                                    required
                                    className="rounded-md border border-input bg-background px-3 py-2"
                                    onChange={(e) =>
                                        setData('pet_type_id', e.target.value ? Number(e.target.value) : '')
                                    }
                                    defaultValue={pet.pet_type_id}
                                >
                                    <option value="">Select a pet type</option>
                                    {petTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.icon || ''} {type.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.pet_type_id} />
                            </div>

                            {/* Pet Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Pet Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="Enter your pet's name"
                                    autoComplete="off"
                                    defaultValue={pet.name}
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Breed */}
                            <div className="grid gap-2">
                                <Label htmlFor="breed">Breed</Label>
                                <Input
                                    id="breed"
                                    name="breed"
                                    placeholder="e.g., Golden Retriever"
                                    autoComplete="off"
                                    defaultValue={pet.breed || ''}
                                />
                                <InputError message={errors.breed} />
                            </div>

                            {/* Age */}
                            <div className="grid gap-2">
                                <Label htmlFor="age">Age (years)</Label>
                                <Input
                                    id="age"
                                    name="age"
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="e.g., 3"
                                    autoComplete="off"
                                    defaultValue={pet.age || ''}
                                />
                                <InputError message={errors.age} />
                            </div>

                            {/* Gender */}
                            <div className="grid gap-2">
                                <Label htmlFor="gender">Gender</Label>
                                <select
                                    id="gender"
                                    name="gender"
                                    className="rounded-md border border-input bg-background px-3 py-2"
                                    defaultValue={pet.gender}
                                >
                                    <option value="Unknown">Unknown</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                <InputError message={errors.gender} />
                            </div>

                            {/* Description */}
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Tell us more about your pet..."
                                    className="rounded-md border border-input bg-background px-3 py-2"
                                    rows={4}
                                    defaultValue={pet.description || ''}
                                />
                                <InputError message={errors.description} />
                            </div>

                            {/* Personality Tags */}
                            <div className="space-y-3">
                                <Label>Personality Traits</Label>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                    {personalityTags.map((tag) => (
                                        <div key={tag.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`tag-${tag.id}`}
                                                checked={selectedTags.includes(tag.id)}
                                                onCheckedChange={(checked) => {
                                                    const updated = checked
                                                        ? [...selectedTags, tag.id]
                                                        : selectedTags.filter((id) => id !== tag.id);
                                                    setSelectedTags(updated);
                                                    setData('personality_tag_ids', updated);
                                                }}
                                            />
                                            <Label htmlFor={`tag-${tag.id}`} className="cursor-pointer font-normal">
                                                {tag.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                <InputError message={errors.personality_tag_ids} />
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="min-w-[200px]"
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit(pets.show.url(pet.id))}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleDelete}
                                >
                                    Delete Pet
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

EditPet.layout = {
    breadcrumbs: [
        {
            title: 'My Pets',
            href: pets.index.url(),
        },
        {
            title: 'Edit Pet',
        },
    ],
};
