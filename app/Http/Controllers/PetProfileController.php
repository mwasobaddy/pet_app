<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePetProfileRequest;
use App\Models\PetPersonalityTag;
use App\Models\PetProfile;
use App\Models\PetType;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PetProfileController extends Controller
{
    use AuthorizesRequests;

    public function create(): Response
    {
        $petTypes = PetType::all(['id', 'name', 'icon']);
        $personalityTags = PetPersonalityTag::all(['id', 'name', 'description']);

        return Inertia::render('pets/create', [
            'petTypes' => $petTypes,
            'personalityTags' => $personalityTags,
        ]);
    }

    public function store(StorePetProfileRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $petProfile = auth()->user()->petProfiles()->create([
            'pet_type_id' => $validated['pet_type_id'],
            'name' => $validated['name'],
            'breed' => $validated['breed'] ?? null,
            'age' => $validated['age'] ?? null,
            'gender' => $validated['gender'] ?? 'Unknown',
            'description' => $validated['description'] ?? null,
        ]);

        // Attach personality tags if provided
        if (! empty($validated['personality_tag_ids'])) {
            $petProfile->personalityTags()->attach($validated['personality_tag_ids']);
        }

        // Handle image uploads
        if ($request->hasFile('images')) {
            $this->saveImages($petProfile, $request->file('images'));
        }

        return redirect()
            ->route('dashboard')
            ->with('success', 'Pet profile created successfully!');
    }

    public function index(): Response
    {
        $petProfiles = auth()->user()->petProfiles()
            ->with('petType', 'images', 'personalityTags')
            ->get();

        return Inertia::render('pets/index', [
            'pets' => $petProfiles,
        ]);
    }

    public function show(PetProfile $petProfile): Response
    {
        // Authorize the user
        $this->authorize('view', $petProfile);

        $petProfile->load('petType', 'images', 'personalityTags');

        return Inertia::render('pets/show', [
            'pet' => $petProfile,
        ]);
    }

    public function edit(PetProfile $petProfile): Response
    {
        // Authorize the user
        $this->authorize('update', $petProfile);

        $petTypes = PetType::all(['id', 'name', 'icon']);
        $personalityTags = PetPersonalityTag::all(['id', 'name', 'description']);
        $petProfile->load('petType', 'images', 'personalityTags');

        return Inertia::render('pets/edit', [
            'pet' => $petProfile,
            'petTypes' => $petTypes,
            'personalityTags' => $personalityTags,
        ]);
    }

    public function update(StorePetProfileRequest $request, PetProfile $petProfile): RedirectResponse
    {
        // Authorize the user
        $this->authorize('update', $petProfile);

        $validated = $request->validated();

        $petProfile->update([
            'pet_type_id' => $validated['pet_type_id'],
            'name' => $validated['name'],
            'breed' => $validated['breed'] ?? null,
            'age' => $validated['age'] ?? null,
            'gender' => $validated['gender'] ?? 'Unknown',
            'description' => $validated['description'] ?? null,
        ]);

        // Sync personality tags if provided
        if (! empty($validated['personality_tag_ids'])) {
            $petProfile->personalityTags()->sync($validated['personality_tag_ids']);
        } else {
            $petProfile->personalityTags()->detach();
        }

        // Handle image uploads
        if ($request->hasFile('images')) {
            $this->saveImages($petProfile, $request->file('images'));
        }

        return redirect()
            ->route('pets.show', $petProfile)
            ->with('success', 'Pet profile updated successfully!');
    }

    public function destroy(PetProfile $petProfile): RedirectResponse
    {
        // Authorize the user
        $this->authorize('delete', $petProfile);

        $petProfile->delete();

        return redirect()
            ->route('pets.index')
            ->with('success', 'Pet profile deleted successfully!');
    }

    /**
     * Save images for a pet profile.
     */
    private function saveImages(PetProfile $petProfile, array $images): void
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
