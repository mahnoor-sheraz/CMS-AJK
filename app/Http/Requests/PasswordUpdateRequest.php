<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class PasswordUpdateRequest extends FormRequest
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
     * Checks input types, lengths, and complexity patterns before hashing and database write.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'current_password' => [
                'required',
                'string',
                'current_password',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'max:100',
                Password::defaults(),
                'confirmed',
            ],
        ];
    }

    /**
     * Custom validation error messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'current_password.required' => 'Your current password is required.',
            'current_password.current_password' => 'The provided current password does not match our records.',
            'password.required' => 'A new password is required.',
            'password.min' => 'The new password must be at least 8 characters long.',
            'password.max' => 'The new password cannot exceed 100 characters.',
            'password.confirmed' => 'The password confirmation does not match.',
        ];
    }
}
