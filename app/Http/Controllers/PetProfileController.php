<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePetProfileRequest;
use App\Models\PetPersonalityTag;
use App\Models\PetProfile;
use App\Models\PetType;
use App\Services\PetProfileService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PetProfileController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private PetProfileService $petProfileService) {}

    public function create(): Response
    {
        return Inertia::render('pets/create', [
            'petTypes' => PetType::all(['id', 'name', 'icon']),
            'personalityTags' => PetPersonalityTag::all(['id', 'name', 'description']),
        ]);
    }

    public function store(StorePetProfileRequest $request): RedirectResponse
    {
        $petProfile = $this->petProfileService->createPetProfile(
            auth()->user(),
            $request->validated(),
        );

        if ($request->hasFile('images')) {
            $this->petProfileService->saveImages($petProfile, $request->file('images'));
        }

        return redirect()
            ->route('discover')
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
        $this->authorize('view', $petProfile);
        $petProfile->load('petType', 'images', 'personalityTags');

        return Inertia::render('pets/show', [
            'pet' => [
                'id' => $petProfile->id,
                'name' => $petProfile->name,
                'breed' => $petProfile->breed,
                'age' => $petProfile->age,
                'gender' => $petProfile->gender,
                'description' => $petProfile->description,
                'pet_type_id' => $petProfile->pet_type_id,
                'petType' => $petProfile->petType,
                'images' => $petProfile->images,
                'personalityTags' => $petProfile->personalityTags,
            ],
        ]);
    }

    public function edit(PetProfile $petProfile): Response
    {
        $this->authorize('update', $petProfile);
        $petProfile->load('petType', 'images', 'personalityTags');

        return Inertia::render('pets/edit', [
            'pet' => [
                'id' => $petProfile->id,
                'name' => $petProfile->name,
                'breed' => $petProfile->breed,
                'age' => $petProfile->age,
                'gender' => $petProfile->gender,
                'description' => $petProfile->description,
                'pet_type_id' => $petProfile->pet_type_id,
                'personalityTags' => $petProfile->personalityTags,
            ],
            'petTypes' => PetType::all(['id', 'name', 'icon']),
            'personalityTags' => PetPersonalityTag::all(['id', 'name', 'description']),
        ]);
    }

    public function update(StorePetProfileRequest $request, PetProfile $petProfile): RedirectResponse
    {
        $this->authorize('update', $petProfile);

        $this->petProfileService->updatePetProfile($petProfile, $request->validated());

        if ($request->hasFile('images')) {
            $this->petProfileService->saveImages($petProfile, $request->file('images'));
        }

        return redirect()
            ->route('pets.show', $petProfile)
            ->with('success', 'Pet profile updated successfully!');
    }

    public function destroy(PetProfile $petProfile): RedirectResponse
    {
        $this->authorize('delete', $petProfile);
        $petProfile->delete();

        return redirect()
            ->route('pets.index')
            ->with('success', 'Pet profile deleted successfully!');
    }
}
