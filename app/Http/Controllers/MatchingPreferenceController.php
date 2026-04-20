<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMatchingPreferenceRequest;
use App\Models\MatchingPreference;
use App\Services\MatchingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MatchingPreferenceController extends Controller
{
    public function __construct(private MatchingService $matchingService) {}

    public function index(Request $request): Response
    {
        $user = auth()->user();
        $preference = $user->matchingPreference;

        $options = $this->matchingService->getPreferenceOptions($user);

        return Inertia::render('matching/preferences', [
            'preference' => $preference ? [
                'distance_min' => $preference->distance_min,
                'distance_max' => $preference->distance_max,
                'pet_gender' => $preference->pet_gender,
                'pet_age_min' => $preference->pet_age_min,
                'pet_age_max' => $preference->pet_age_max,
                'pet_type_ids' => $preference->preferredPetTypes->pluck('id')->values(),
            ] : null,
            'options' => $options,
        ]);
    }

    public function store(StoreMatchingPreferenceRequest $request): RedirectResponse
    {
        $user = auth()->user();
        $validated = $request->validated();

        $validated['distance_min'] = max(1, $validated['distance_min']);
        $validated['distance_max'] = max($validated['distance_min'], $validated['distance_max']);
        $validated['pet_age_min'] = $validated['pet_age_min'] !== '' ? $validated['pet_age_min'] : null;
        $validated['pet_age_max'] = $validated['pet_age_max'] !== '' ? $validated['pet_age_max'] : null;

        $preference = MatchingPreference::updateOrCreate(
            ['user_id' => $user->id],
            [
                'distance_min' => $validated['distance_min'],
                'distance_max' => $validated['distance_max'],
                'pet_gender' => $validated['pet_gender'],
                'pet_age_min' => $validated['pet_age_min'],
                'pet_age_max' => $validated['pet_age_max'],
            ]
        );

        $petTypeIds = $validated['pet_type_ids'] ?? [];
        $preference->preferredPetTypes()->sync($petTypeIds);

        return redirect()->route('discover')
            ->with('success', 'Matching preferences saved successfully.');
    }
}
