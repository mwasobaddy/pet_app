<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePetProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'pet_type_id' => ['required', 'exists:pet_types,id'],
            'name' => ['required', 'string', 'max:255'],
            'breed' => ['nullable', 'string', 'max:255'],
            'age' => ['nullable', 'integer', 'min:0', 'max:100'],
            'gender' => ['nullable', 'in:Male,Female,Unknown'],
            'description' => ['nullable', 'string', 'max:1000'],
            'personality_tag_ids' => ['nullable', 'array'],
            'personality_tag_ids.*' => ['exists:pet_personality_tags,id'],
        ];
    }
}
