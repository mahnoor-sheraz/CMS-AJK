<?php

namespace App\Http\Requests;

use App\Models\Category;
use App\Models\Department;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePublicComplaintRequest extends FormRequest
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
            'name' => is_string($this->name) ? trim(strip_tags($this->name)) : $this->name,
            'cnic' => is_string($this->cnic) ? preg_replace('/[^0-9]/', '', $this->cnic) : $this->cnic,
            'mobile_number' => is_string($this->mobile_number) ? preg_replace('/[^0-9+]/', '', trim($this->mobile_number)) : $this->mobile_number,
            'gender' => (!empty($this->gender) && is_string($this->gender)) ? strtolower(trim($this->gender)) : null,
            'subject' => is_string($this->subject) ? trim(strip_tags($this->subject)) : $this->subject,
            'details' => is_string($this->details) ? trim(strip_tags($this->details)) : $this->details,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     * Enforces strict types, lengths, and patterns before database insertion.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // 1. Citizen Personal Information
            'name' => [
                'required',
                'string',
                'min:2',
                'max:100',
                'regex:/^[\pL\s\.\'-]+$/u', // Unicode letters, spaces, dots, hyphens, apostrophes
            ],
            'cnic' => [
                'required',
                'string',
                'size:13',
                'regex:/^[0-9]{13}$/', // Exactly 13 numeric digits
            ],
            'mobile_number' => [
                'required',
                'string',
                'regex:/^(03|\+?923)[0-9]{9}$/', // Valid Pakistani mobile pattern (03XXXXXXXXX or +923XXXXXXXXX)
            ],
            'gender' => [
                'nullable',
                'string',
                Rule::in(['male', 'female']),
            ],
            'district_id' => [
                'required',
                'integer',
                'exists:districts,id',
            ],
            'tehsil_id' => [
                'required',
                'integer',
                $this->district_id
                    ? Rule::exists('tehsils', 'id')->where('district_id', $this->district_id)
                    : 'exists:tehsils,id',
            ],

            // 2. Department & Categorization
            'department_id' => [
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    if ($value !== 'other' && ! Department::where('id', $value)->exists()) {
                        $fail('The selected department is invalid.');
                    }
                },
            ],
            'sub_department_id' => [
                'nullable',
                'integer',
                'exists:sub_departments,id',
            ],
            'category_id' => [
                'nullable',
                'string',
                function ($attribute, $value, $fail) {
                    if ($value && $value !== 'other' && ! Category::where('id', $value)->exists()) {
                        $fail('The selected category is invalid.');
                    }
                },
            ],
            'sub_category_id' => [
                'nullable',
                'string',
                function ($attribute, $value, $fail) {
                    if ($value && $value !== 'other' && ! Category::where('id', $value)->exists()) {
                        $fail('The selected sub-category is invalid.');
                    }
                },
            ],

            // 3. Grievance Narrative
            'subject' => [
                'required',
                'string',
                'min:5',
                'max:100',
                'regex:/^[\pL\pN\s\-_.,?!()#\/&\'":;]+$/u', // Disallow raw script/html tags while allowing punctuation
            ],
            'details' => [
                'required',
                'string',
                'min:50',
                'max:5000',
            ],

            // 4. Attachments
            'attachments' => [
                'nullable',
                'array',
                'max:5',
            ],
            'attachments.*' => [
                'file',
                'mimes:jpeg,png,jpg,gif,pdf,mp3,wav,mp4,avi,mov',
                'max:10240', // 10MB limit in kilobytes
            ],
        ];
    }

    /**
     * Get custom error messages with error codes and clear guidance.
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

            'cnic.required' => 'CNIC Number is required.',
            'cnic.size' => 'CNIC must consist of exactly 13 digits without hyphens.',
            'cnic.regex' => 'CNIC must consist of exactly 13 digits without hyphens.',

            'mobile_number.required' => 'Mobile Number is required.',
            'mobile_number.regex' => 'Mobile number must be a valid Pakistani mobile number (e.g. 03001234567).',

            'district_id.required' => 'Please select a District.',
            'district_id.exists' => 'The selected District does not exist in our records.',

            'tehsil_id.required' => 'Please select a Tehsil.',
            'tehsil_id.exists' => 'The selected Tehsil is invalid or does not belong to the chosen District.',

            'department_id.required' => 'Please select a Department.',

            'subject.required' => 'Complaint subject is required.',
            'subject.min' => 'Subject must be at least 5 characters long.',
            'subject.max' => 'Subject cannot exceed 100 characters.',
            'subject.regex' => 'Subject contains disallowed special characters or tags.',

            'details.required' => 'Complaint details are required.',
            'details.min' => 'Details must be at least 50 characters long.',
            'details.max' => 'Details cannot exceed 5000 characters.',

            'attachments.max' => 'You can upload a maximum of 5 files.',
            'attachments.*.max' => 'Each attachment must not exceed 10MB in size.',
            'attachments.*.mimes' => 'Attachment format is not allowed. Permitted: JPG, PNG, PDF, Audio, Video.',
        ];
    }
}
