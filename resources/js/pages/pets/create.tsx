import { Form, Head } from '@inertiajs/react';
import { Camera } from 'lucide-react';
import { useState } from 'react';
import PetProfileController from '@/actions/App/Http/Controllers/PetProfileController';
// import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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

            <div className="min-h-screen w-full bg-white dark:bg-gray-950">
                <div className="max-w-3xl mx-auto p-6 md:p-12">
                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                            Personal Informations
                        </h1>
                        
                        <div className="flex flex-col md:flex-row items-center gap-6 mb-10 pb-10 border-b border-gray-100 dark:border-gray-800">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-900 shadow-xl ring-1 ring-gray-100 dark:ring-gray-800">
                                    {selectedImages.length > 0 ? (
                                        <img 
                                            src={URL.createObjectURL(selectedImages[0])} 
                                            className="w-full h-full object-cover"
                                            alt="Preview"
                                        />
                                    ) : (
                                        <Camera className="w-10 h-10 text-gray-400 group-hover:scale-110 transition-transform" />
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 border-4 border-white dark:border-gray-950 rounded-full" />
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button 
                                    type="button" 
                                    onClick={() => document.getElementById('image-input')?.click()}
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl px-6 h-11"
                                >
                                    Upload New Picture
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => setSelectedImages([])}
                                    className="border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl px-8 h-11"
                                >
                                    Delete
                                </Button>
                                <input
                                    id="image-input"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        setSelectedImages(files);
                                    }}
                                    hidden
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <Form
                        action={PetProfileController.store.url()}
                        method="post"
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Pet Name */}
                                <div className="grid gap-2">
                                    <div className="relative group">
                                        <Input
                                            id="name"
                                            name="name"
                                            required
                                            placeholder="Pet Name"
                                            className="h-16 rounded-2xl border-none bg-gray-50/50 dark:bg-gray-900/50 px-6 text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-200 dark:focus-visible:ring-gray-800 transition-all font-medium py-0"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400">
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <InputError message={errors.name} />
                                </div>

                                {/* Pet Type & Breed */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <div className="relative group">
                                            <select
                                                id="pet_type_id"
                                                name="pet_type_id"
                                                required
                                                className="w-full h-16 rounded-2xl border-none bg-gray-50/50 dark:bg-gray-900/50 px-6 appearance-none text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-800 transition-all font-medium"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Select Pet Type</option>
                                                {petTypes.map((type) => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <InputError message={errors.pet_type_id} />
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="relative group">
                                            <Input
                                                id="breed"
                                                name="breed"
                                                placeholder="Breed (e.g. Beagle)"
                                                className="h-16 rounded-2xl border-none bg-gray-50/50 dark:bg-gray-900/50 px-6 text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-200 dark:focus-visible:ring-gray-800 transition-all font-medium py-0"
                                            />
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400">
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <InputError message={errors.breed} />
                                    </div>
                                </div>

                                {/* Age & Gender */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <div className="relative group">
                                            <Input
                                                id="age"
                                                name="age"
                                                type="number"
                                                placeholder="Age (years)"
                                                className="h-16 rounded-2xl border-none bg-gray-50/50 dark:bg-gray-900/50 px-6 text-gray-900 dark:text-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-200 dark:focus-visible:ring-gray-800 transition-all font-medium py-0"
                                            />
                                        </div>
                                        <InputError message={errors.age} />
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="relative group">
                                            <select
                                                id="gender"
                                                name="gender"
                                                className="w-full h-16 rounded-2xl border-none bg-gray-50/50 dark:bg-gray-900/50 px-6 appearance-none text-gray-900 dark:text-white focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-800 transition-all font-medium"
                                                defaultValue="Unknown"
                                            >
                                                <option value="Unknown">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <InputError message={errors.gender} />
                                    </div>
                                </div>

                                {/* Personality Tags */}
                                <div className="space-y-4 pt-4 pb-4">
                                    <Label className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider ml-1">
                                        Personality Traits
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {personalityTags.map((tag) => (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => {
                                                    const updated = selectedTags.includes(tag.id)
                                                        ? selectedTags.filter((id) => id !== tag.id)
                                                        : [...selectedTags, tag.id];
                                                    setSelectedTags(updated);
                                                }}
                                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${
                                                    selectedTags.includes(tag.id)
                                                        ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                                                        : 'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                            >
                                                {tag.name}
                                            </button>
                                        ))}
                                    </div>
                                    <InputError message={errors.personality_tag_ids} />
                                    {selectedTags.map((id) => (
                                        <input key={id} type="hidden" name="personality_tag_ids[]" value={id} />
                                    ))}
                                </div>

                                {/* Description */}
                                <div className="grid gap-2">
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        placeholder="Tell us about your pet's personality..."
                                        className="w-full rounded-2xl border-none bg-gray-50/50 dark:bg-gray-900/50 px-6 py-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-800 transition-all resize-none font-medium"
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                {/* Submit */}
                                <div className="pt-6">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full h-16 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98]"
                                    >
                                        {processing ? 'Creating...' : 'Create Profile'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
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
