import { Form, Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
// import Heading from '@/components/heading';
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

    const { setData } = useForm({
        pet_type_id: pet.pet_type_id,
        personality_tag_ids: selectedTags,
    });

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this pet profile?')) {
            router.delete(pets.destroy.url(pet.id));
        }
    };

    return (
        <>
            <Head title={`Edit ${pet.name}`} />

            <div className="min-h-screen w-full bg-gradient-to-b from-orange-50/50 via-white to-pink-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
                <div className="max-w-3xl mx-auto p-6 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 shadow-xl mb-4">
                            <span className="text-3xl">🐾</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Edit {pet.name}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Update your pet's information
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 md:p-8 shadow-xl">
                        <Form
                            action={pets.update.url(pet.id)}
                            method="patch"
                            options={{
                                preserveScroll: true,
                            }}
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Pet Type */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="pet_type_id" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Pet Type *
                                        </Label>
                                        <select
                                            id="pet_type_id"
                                            name="pet_type_id"
                                            required
                                            className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all"
                                            onChange={(e) =>
                                                setData('pet_type_id', e.target.value ? Number(e.target.value) : 0)
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
                                        <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Pet Name *
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            required
                                            placeholder="Enter your pet's name"
                                            autoComplete="off"
                                            defaultValue={pet.name}
                                            className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    {/* Breed */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="breed" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Breed
                                        </Label>
                                        <Input
                                            id="breed"
                                            name="breed"
                                            placeholder="e.g., Golden Retriever"
                                            autoComplete="off"
                                            defaultValue={pet.breed || ''}
                                            className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all"
                                        />
                                        <InputError message={errors.breed} />
                                    </div>

                                    {/* Age */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="age" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Age (years)
                                        </Label>
                                        <Input
                                            id="age"
                                            name="age"
                                            type="number"
                                            min="0"
                                            max="100"
                                            placeholder="e.g., 3"
                                            autoComplete="off"
                                            defaultValue={pet.age || ''}
                                            className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all"
                                        />
                                        <InputError message={errors.age} />
                                    </div>

                                    {/* Gender */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="gender" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Gender
                                        </Label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all"
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
                                        <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Description
                                        </Label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            placeholder="Tell us more about your pet..."
                                            className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all resize-none"
                                            rows={4}
                                            defaultValue={pet.description || ''}
                                        />
                                        <InputError message={errors.description} />
                                    </div>

                                    {/* Personality Tags */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Personality Traits
                                        </Label>
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
                                                        className="border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                                    />
                                                    <Label htmlFor={`tag-${tag.id}`} className="cursor-pointer font-normal text-gray-700 dark:text-gray-300">
                                                        {tag.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                        <InputError message={errors.personality_tag_ids} />
                                    </div>

                                    {/* Submit Buttons */}
                                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-12 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02]"
                                        >
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(pets.show.url(pet.id))}
                                            className="h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={handleDelete}
                                            className="h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-md transition-all duration-200 hover:scale-[1.02]"
                                        >
                                            Delete Pet
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
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
