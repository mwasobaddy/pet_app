<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMatchingPreferenceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'distance_min' => ['required', 'integer', 'min:1', 'max:500'],
            'distance_max' => ['required', 'integer', 'min:1', 'max:500'],
            'pet_gender' => ['required', 'in:Male,Female,Unknown'],
            'pet_age_min' => ['nullable', 'integer', 'min:0'],
            'pet_age_max' => ['nullable', 'integer', 'min:0'],
            'pet_type_ids' => ['nullable', 'array'],
            'pet_type_ids.*' => ['integer', 'exists:pet_types,id'],
        ];
    }
}
