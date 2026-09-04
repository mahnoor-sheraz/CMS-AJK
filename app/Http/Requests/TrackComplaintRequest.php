<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class TrackComplaintRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation (Sanitization & Normalization).
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'complaint_number' => is_string($this->complaint_number)
                ? trim(strip_tags($this->complaint_number))
                : $this->complaint_number,
            'cnic' => is_string($this->cnic)
                ? preg_replace('/[^0-9]/', '', $this->cnic)
                : $this->cnic,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     * Enforces strict types, lengths, and patterns before database lookup.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'complaint_number' => [
                'required',
                'string',
                'min:5',
                'max:50',
                'regex:/^[A-Za-z0-9\-]+$/',
            ],
            'cnic' => [
                'required',
                'string',
                'size:13',
                'regex:/^[0-9]{13}$/',
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
            'complaint_number.required' => 'Complaint number is required.',
            'complaint_number.min' => 'Complaint number is too short.',
            'complaint_number.max' => 'Complaint number cannot exceed 50 characters.',
            'complaint_number.regex' => 'Complaint number format is invalid.',
            'cnic.required' => 'CNIC number is required.',
            'cnic.size' => 'CNIC must consist of exactly 13 digits without hyphens.',
            'cnic.regex' => 'CNIC must consist of exactly 13 digits without hyphens.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator): void
    {
        $errors = $validator->errors();
        if ($errors->has('cnic')) {
            $errors->add('error_code', 'ERR_INVALID_CNIC_FORMAT');
        } else {
            $errors->add('error_code', 'ERR_VALIDATION_FAILED');
        }

        throw (new \Illuminate\Validation\ValidationException($validator))
            ->errorBag($this->errorBag)
            ->redirectTo($this->getRedirectUrl());
    }
}
