<?php

namespace App\Services;

use App\Models\PetProfile;
use Illuminate\Http\UploadedFile;

class PetProfileService
{
    /**
     * Create a new pet profile for a user.
     *
     * @return PetProfile
     */
    public function createPetProfile($user, array $data): PetProfile
    {
        $petProfile = $user->petProfiles()->create([
            'pet_type_id' => $data['pet_type_id'],
            'name' => $data['name'],
            'breed' => $data['breed'] ?? null,
            'age' => $data['age'] ?? null,
            'gender' => $data['gender'] ?? 'Unknown',
            'description' => $data['description'] ?? null,
        ]);

        // Attach personality tags if provided
        if (! empty($data['personality_tag_ids'])) {
            $petProfile->personalityTags()->attach($data['personality_tag_ids']);
        }

        return $petProfile;
    }

    /**
     * Update an existing pet profile.
     *
     * @return void
     */
    public function updatePetProfile(PetProfile $petProfile, array $data): void
    {
        $petProfile->update([
            'pet_type_id' => $data['pet_type_id'],
            'name' => $data['name'],
            'breed' => $data['breed'] ?? null,
            'age' => $data['age'] ?? null,
            'gender' => $data['gender'] ?? 'Unknown',
            'description' => $data['description'] ?? null,
        ]);

        // Sync personality tags if provided
        if (! empty($data['personality_tag_ids'])) {
            $petProfile->personalityTags()->sync($data['personality_tag_ids']);
        } else {
            $petProfile->personalityTags()->detach();
        }
    }

    /**
     * Save images for a pet profile.
     *
     * @param  array<UploadedFile>  $images
     * @return void
     */
    public function saveImages(PetProfile $petProfile, array $images): void
    {
        $order = $petProfile->images()->max('order') ?? 0;

        foreach ($images as $image) {
            $path = $image->store("pets/{$petProfile->id}", 'public');

            $petProfile->images()->create([
                'path' => $path,
                'order' => ++$order,
            ]);
        }
    }
}
