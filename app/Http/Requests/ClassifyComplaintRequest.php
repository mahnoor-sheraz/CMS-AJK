<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ClassifyComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->isFocalPerson() || $user->isDirector());
    }

    public function rules(): array
    {
        return [
            'path' => [
                'required',
                'string',
                Rule::in(['handle_directly', 'club_with_existing', 'forward_externally', 'schedule_field_visit']),
            ],
            'notes' => [
                'nullable',
                'string',
                'max:2000',
            ],
            'destination_id' => [
                'required_if:path,forward_externally',
                'nullable',
                Rule::exists('forward_destinations', 'id')->where('is_active', true),
            ],
            'remarks' => [
                'required_if:path,forward_externally',
                'nullable',
                'string',
                'min:5',
                'max:2000',
            ],
            'visit_datetime' => [
                'required_if:path,schedule_field_visit',
                'nullable',
                'date',
            ],
            'assigned_officer_id' => [
                'required_if:path,schedule_field_visit',
                'nullable',
                'integer',
            ],
            'location' => [
                'nullable',
                'string',
                'max:255',
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            if ($this->input('path') === 'schedule_field_visit') {
                $officerId = (int) $this->input('assigned_officer_id');
                $currentUser = $this->user();

                // Officer must be either the logged in FP or an active field officer supervised by this FP
                $isValidOfficer = $officerId === $currentUser->id || User::where('id', $officerId)
                    ->where('role', 'field_officer')
                    ->where('supervisor_id', $currentUser->id)
                    ->where('is_active', true)
                    ->exists();

                if (! $isValidOfficer) {
                    $v->errors()->add(
                        'assigned_officer_id',
                        'You can only assign field visits to yourself or active field officers under your direct supervision.'
                    );
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'path.required' => 'Please select one of the four classification pathways.',
            'destination_id.required_if' => 'Please select an external department/agency destination.',
            'remarks.required_if' => 'Please provide detailed forwarding remarks.',
            'visit_datetime.required_if' => 'A scheduled date and time is required for the field visit.',
            'assigned_officer_id.required_if' => 'Please assign a field officer or yourself for this inspection.',
        ];
    }
}
