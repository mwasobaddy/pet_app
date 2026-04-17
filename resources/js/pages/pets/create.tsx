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

            <h1 className="sr-only">Create Pet Profile</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Create your pet profile"
                    description="Tell us about your furry friend! This information helps us connect you with other pet lovers."
                />

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
                                <Label htmlFor="pet_type_id">Pet Type *</Label>
                                <select
                                    id="pet_type_id"
                                    name="pet_type_id"
                                    required
                                    className="rounded-md border border-input bg-background px-3 py-2"
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
                                <Label htmlFor="name">Pet Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="Enter your pet's name"
                                    autoComplete="off"
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
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Tell us more about your pet's personality, habits, and any other details..."
                                    className="rounded-md border border-input bg-background px-3 py-2"
                                    rows={4}
                                />
                                <InputError message={errors.description} />
                            </div>

                            {/* Pet Images */}
                            <div className="grid gap-2">
                                <Label htmlFor="images">Pet Photos (Optional)</Label>
                                <div className="rounded-lg border-2 border-dashed border-input bg-muted/50 p-6 text-center cursor-pointer hover:bg-muted transition"
                                    onClick={() => document.getElementById('image-input')?.click()}
                                >
                                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm font-medium text-foreground">Click to upload photos</p>
                                    <p className="text-xs text-muted-foreground">or drag and drop</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        PNG, JPG, GIF, WebP up to 5MB each (max 5 photos)
                                    </p>
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
                                        <p className="text-sm font-medium mb-2">
                                            {selectedImages.length} photo{selectedImages.length !== 1 ? 's' : ''} selected
                                        </p>
                                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                            {selectedImages.map((file, index) => (
                                                <Card key={index} className="relative overflow-hidden">
                                                    <CardContent className="p-2">
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={`Preview ${index + 1}`}
                                                            className="h-24 w-full object-cover rounded"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedImages(selectedImages.filter((_, i) => i !== index));
                                                            }}
                                                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
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
                                                }}
                                            />
                                            <Label htmlFor={`tag-${tag.id}`} className="cursor-pointer font-normal">
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

                            {/* Submit Button */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="min-w-[200px]"
                                >
                                    {processing ? 'Creating pet profile...' : 'Create Pet Profile'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit(pets.index.get())}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                {/* Info Box */}
                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                    <p className="font-medium">✨ Why create a pet profile?</p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                        <li>Connect with other pet owners in your community</li>
                        <li>Share your pet's personality and interests</li>
                        <li>Find play dates and pet-friendly activities</li>
                        <li>Build a community around your furry friend</li>
                    </ul>
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
