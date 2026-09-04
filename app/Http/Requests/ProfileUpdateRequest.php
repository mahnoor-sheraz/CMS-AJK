<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Prepare the data for validation (Sanitization & Normalization).
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => is_string($this->name) ? trim(strip_tags($this->name)) : $this->name,
            'email' => is_string($this->email) ? trim(strtolower($this->email)) : $this->email,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     * Enforces types, lengths, and regex patterns before database writes.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:100',
                'regex:/^[\pL\s\.\'-]+$/u',
            ],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
        ];
    }

    /**
     * Custom error messages for profile inputs.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Full Name is required.',
            'name.min' => 'Full Name must be at least 2 characters long.',
            'name.max' => 'Full Name cannot exceed 100 characters.',
            'name.regex' => 'Full Name may only contain alphabetic letters, spaces, dots, and hyphens.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.max' => 'Email address cannot exceed 255 characters.',
            'email.unique' => 'This email address is already registered to another account.',
        ];
    }
}
