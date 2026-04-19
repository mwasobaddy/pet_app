import { Form, Head, router } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { useState } from 'react';
import PetProfileController from '@/actions/App/Http/Controllers/PetProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

export default function CreatePet({
    petTypes,
    personalityTags,
}: {
    petTypes: PetType[];
    personalityTags: PersonalityTag[];
}) {
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);

    return (
        <>
            <Head title="Create Pet Profile" />

            <div className="min-h-screen w-full bg-gradient-to-b from-orange-50/50 via-white to-pink-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
                <div className="max-w-3xl mx-auto p-6 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 shadow-xl mb-4">
                            <span className="text-3xl">🐾</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Create your pet profile
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Tell us about your furry friend! This information helps us connect you with other pet lovers.
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 md:p-8 shadow-xl">
                        <Form
                            {...PetProfileController.store.form()}
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
                                            defaultValue=""
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
                                            defaultValue="Unknown"
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
                                            placeholder="Tell us more about your pet's personality, habits, and any other details..."
                                            className="rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all resize-none"
                                            rows={4}
                                        />
                                        <InputError message={errors.description} />
                                    </div>

                                    {/* Pet Images */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="images" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Pet Photos (Optional)
                                        </Label>
                                        <div
                                            className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-8 text-center cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-gray-700 transition-all"
                                            onClick={() => document.getElementById('image-input')?.click()}
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center mb-3">
                                                    <Upload className="h-6 w-6 text-white" />
                                                </div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">Click to upload photos</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">or drag and drop</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    PNG, JPG, GIF, WebP up to 5MB each (max 5 photos)
                                                </p>
                                            </div>
                                            <input
                                                id="image-input"
                                                type="file"
                                                name="images[]"
                                                multiple
                                                accept="image/jpeg,image/png,image/gif,image/webp"
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    setSelectedImages(files);
                                                }}
                                                hidden
                                            />
                                        </div>

                                        {/* Display selected images */}
                                        {selectedImages.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                                    {selectedImages.length} photo{selectedImages.length !== 1 ? 's' : ''} selected
                                                </p>
                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                                    {selectedImages.map((file, index) => (
                                                        <Card key={index} className="relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                                            <CardContent className="p-2">
                                                                <img
                                                                    src={URL.createObjectURL(file)}
                                                                    alt={`Preview ${index + 1}`}
                                                                    className="h-24 w-full object-cover rounded-lg"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedImages(selectedImages.filter((_, i) => i !== index));
                                                                    }}
                                                                    className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition-colors shadow-md"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <InputError message={errors['images.*'] || errors.images} />
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
                                        {selectedTags.map((id) => (
                                            <input
                                                key={id}
                                                type="hidden"
                                                name="personality_tag_ids[]"
                                                value={id}
                                            />
                                        ))}
                                    </div>

                                    {/* Submit Buttons */}
                                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-12 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02]"
                                        >
                                            {processing ? 'Creating pet profile...' : 'Create Pet Profile'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit(pets.index.get())}
                                            className="h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 rounded-2xl border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 p-6 shadow-sm">
                        <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span>✨</span> Why create a pet profile?
                        </p>
                        <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-center gap-2">
                                <span className="text-orange-500">•</span>
                                Connect with other pet owners in your community
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-orange-500">•</span>
                                Share your pet's personality and interests
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-orange-500">•</span>
                                Find play dates and pet-friendly activities
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-orange-500">•</span>
                                Build a community around your furry friend
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}

CreatePet.layout = {
    breadcrumbs: [
        {
            title: 'Set up pet profile',
            href: pets.create.get(),
        },
    ],
};
