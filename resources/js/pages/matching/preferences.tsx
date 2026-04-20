import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

interface PetType {
    id: number;
    name: string;
    icon?: string;
}

interface PreferenceOptions {
    pet_types: PetType[];
    personality_tags: { id: number; name: string }[];
    pet_gender_options: string[];
    pet_age_presets: { label: string; min: number; max: number }[];
    distance_limits: { min: number; max: number };
    advanced_filters_allowed: boolean;
}

interface PreferenceData {
    distance_min: number;
    distance_max: number;
    pet_gender: string;
    pet_age_min: number | null;
    pet_age_max: number | null;
    pet_type_ids: number[];
}

export default function MatchingPreferences({
    preference,
    options,
}: {
    preference: PreferenceData | null;
    options: PreferenceOptions;
}) {
    const [distanceMin, setDistanceMin] = useState<number>(preference?.distance_min ?? options.distance_limits.min);
    const [distanceMax, setDistanceMax] = useState<number>(preference?.distance_max ?? options.distance_limits.max);
    const [petGender, setPetGender] = useState<string>(preference?.pet_gender ?? options.pet_gender_options[0]);
    const [petAgeMin, setPetAgeMin] = useState<number | ''>(preference?.pet_age_min ?? '');
    const [petAgeMax, setPetAgeMax] = useState<number | ''>(preference?.pet_age_max ?? '');
    const [selectedPetTypeIds, setSelectedPetTypeIds] = useState<number[]>(preference?.pet_type_ids ?? []);

    const togglePetType = (id: number) => {
        setSelectedPetTypeIds((current) =>
            current.includes(id) ? current.filter((typeId) => typeId !== id) : [...current, id],
        );
    };

    return (
        <>
            <Head title="Matching Preferences" />

            <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
                <div className="max-w-3xl mx-auto p-6 md:p-12">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Set your matching preferences</h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Save your preferences so Discover can connect you with the best pet matches.
                        </p>
                    </div>

                    <Card className="overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
                        <CardContent className="space-y-6 p-6 md:p-8">
                            <Form action="/matching/preferences" method="post" className="space-y-6">
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="distance_min" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                Distance range (km)
                                            </Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Input
                                                        id="distance_min"
                                                        name="distance_min"
                                                        type="number"
                                                        min={options.distance_limits.min}
                                                        max={options.distance_limits.max}
                                                        value={distanceMin}
                                                        onChange={(event) => setDistanceMin(Number(event.target.value))}
                                                        className="h-12"
                                                    />
                                                    <InputError message={errors.distance_min} />
                                                </div>
                                                <div>
                                                    <Input
                                                        id="distance_max"
                                                        name="distance_max"
                                                        type="number"
                                                        min={options.distance_limits.min}
                                                        max={options.distance_limits.max}
                                                        value={distanceMax}
                                                        onChange={(event) => setDistanceMax(Number(event.target.value))}
                                                        className="h-12"
                                                    />
                                                    <InputError message={errors.distance_max} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Pet types</Label>
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                {options.pet_types.map((type) => (
                                                    <label
                                                        key={type.id}
                                                        className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 cursor-pointer"
                                                    >
                                                        <Checkbox
                                                            name="pet_type_ids[]"
                                                            value={type.id}
                                                            checked={selectedPetTypeIds.includes(type.id)}
                                                            onChange={() => togglePetType(type.id)}
                                                        />
                                                        <span className="text-sm text-slate-900 dark:text-slate-100">
                                                            {type.icon ? `${type.icon} ` : ''}{type.name}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                            <InputError message={errors.pet_type_ids} />
                                        </div>

                                        {options.advanced_filters_allowed ? (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="pet_gender" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                        Pet gender
                                                    </Label>
                                                    <select
                                                        id="pet_gender"
                                                        name="pet_gender"
                                                        value={petGender}
                                                        onChange={(event) => setPetGender(event.target.value)}
                                                        className="h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                                                    >
                                                        {options.pet_gender_options.map((genderOption) => (
                                                            <option key={genderOption} value={genderOption}>
                                                                {genderOption}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <InputError message={errors.pet_gender} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                        Pet age range
                                                    </Label>
                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                        <select
                                                            id="pet_age_min"
                                                            name="pet_age_min"
                                                            value={petAgeMin ?? ''}
                                                            onChange={(event) => setPetAgeMin(event.target.value ? Number(event.target.value) : '')}
                                                            className="h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                                                        >
                                                            <option value="">Min age</option>
                                                            {options.pet_age_presets.map((preset) => (
                                                                <option key={preset.label} value={preset.min}>
                                                                    {preset.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <select
                                                            id="pet_age_max"
                                                            name="pet_age_max"
                                                            value={petAgeMax ?? ''}
                                                            onChange={(event) => setPetAgeMax(event.target.value ? Number(event.target.value) : '')}
                                                            className="h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                                                        >
                                                            <option value="">Max age</option>
                                                            {options.pet_age_presets.map((preset) => (
                                                                <option key={preset.label} value={preset.max}>
                                                                    {preset.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <InputError message={errors.pet_age_min} />
                                                    <InputError message={errors.pet_age_max} />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900 dark:border-orange-700 dark:bg-orange-950/40 dark:text-orange-200">
                                                Advanced matching preferences are available on paid tiers.
                                            </div>
                                        )}

                                        <input type="hidden" name="pet_gender" value={petGender} />
                                        <input type="hidden" name="pet_age_min" value={petAgeMin ?? ''} />
                                        <input type="hidden" name="pet_age_max" value={petAgeMax ?? ''} />

                                        <Button type="submit" className="w-full" disabled={processing}>
                                            {processing ? 'Saving preferences...' : 'Save preferences'}
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
