<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
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
        $maxUploadKb = (int) config('chat.max_upload_mb', 25) * 1024;
        $allowedMimes = array_merge(
            config('chat.allowed_image_mimes', []),
            config('chat.allowed_video_mimes', [])
        );

        return [
            'body' => ['nullable', 'string', 'max:2000', 'required_without:media'],
            'media' => ['nullable', 'file', 'required_without:body', 'mimetypes:'.implode(',', $allowedMimes), 'max:'.$maxUploadKb],
        ];
    }

    /**
     * @return array<int, string>
     */
    public function messages(): array
    {
        return [
            'media.mimetypes' => 'Only images or videos are allowed.',
        ];
    }

}
