<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class MessageWallIndexRequest extends FormRequest
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
            'sort' => ['nullable', 'in:latest,popular,following'],
            'pet_category' => ['nullable', 'exists:pet_types,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['integer', 'exists:message_wall_tags,id'],
            'cursor' => ['nullable', 'string'],
        ];
    }
}
