<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Channel;
use App\Models\Citizen;
use App\Models\Complaint;
use App\Models\ComplaintAttachment;
use App\Models\ComplaintStatusHistory;
use App\Models\Department;
use App\Models\District;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PublicComplaintController extends Controller
{
    /**
     * Display the complaint submission form.
     */
    public function create(): Response
    {
        $districts = Cache::remember('portal:districts_tehsils', 86400, function () {
            return District::with(['tehsils' => function ($q) {
                $q->orderBy('name');
            }])->orderBy('name')->get();
        });

        $departments = Cache::remember('portal:departments_hierarchy', 86400, function () {
            return Department::where('is_active', true)
                ->with([
                    'subDepartments' => fn ($q) => $q->where('is_active', true)->orderBy('name'),
                    'categories' => fn ($q) => $q->where('is_active', true)
                        ->whereNull('parent_category_id')
                        ->with(['subCategories' => fn ($sq) => $sq->where('is_active', true)->orderBy('name')])
                        ->orderBy('name'),
                ])
                ->orderBy('display_order')
                ->get();
        });

        return Inertia::render('Public/ComplaintSubmit', [
            'districts' => $districts,
            'departments' => $departments,
        ]);
    }

    /**
     * Handle incoming complaint submission.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'cnic' => ['required', 'string', 'regex:/^[0-9]{13}$/'],
            'mobile_number' => ['required', 'string', 'regex:/^(03|\+?923)[0-9]{9}$/'],
            'district_id' => 'required|exists:districts,id',
            'tehsil_id' => 'required|exists:tehsils,id',
            'subject' => 'required|string|max:100',
            'details' => 'required|string|min:50',
            'department_id' => 'required|string',
            'sub_department_id' => 'nullable|exists:sub_departments,id',
            'category_id' => 'nullable|exists:categories,id',
            'sub_category_id' => 'nullable|exists:categories,id',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|mimes:jpeg,png,jpg,gif,pdf,mp3,wav,mp4,avi,mov|max:10240',
        ]);

        $isUncategorized = ($request->department_id === 'other');
        $departmentId = $isUncategorized ? null : (int) $request->department_id;
        $subDepartmentId = ($isUncategorized || !$request->sub_department_id) ? null : (int) $request->sub_department_id;
        $categoryId = ($isUncategorized || !$request->category_id || $request->category_id === 'other') ? null : (int) $request->category_id;
        if (!$isUncategorized && $request->sub_category_id && $request->sub_category_id !== 'other') {
            $categoryId = (int) $request->sub_category_id;
        }

        // Clean CNIC and Mobile number digits
        $cnic = preg_replace('/[^0-9]/', '', $request->cnic);
        $mobileNumber = preg_replace('/[^0-9]/', '', $request->mobile_number);

        // Enforce 24-hour rate limit by citizen CNIC
        $existingCitizen = Citizen::where('cnic', $cnic)->first();
        if ($existingCitizen) {
            $recentComplaint = Complaint::where('citizen_id', $existingCitizen->id)
                ->where('submitted_at', '>=', now()->subHours(24))
                ->latest('submitted_at')
                ->first();

            if ($recentComplaint && $recentComplaint->submitted_at) {
                $nextAllowedAt = $recentComplaint->submitted_at->copy()->addHours(24);
                $formattedTime = $nextAllowedAt->format('d M Y, h:i A');

                throw ValidationException::withMessages([
                    'rate_limit' => $formattedTime,
                ]);
            }
        }

        // Deduplicate or create Citizen
        $citizen = Citizen::updateOrCreate(
            ['cnic' => $cnic],
            [
                'name' => $request->name,
                'mobile_number' => $mobileNumber,
                'district_id' => $request->district_id,
                'tehsil_id' => $request->tehsil_id,
            ]
        );

        $channel = Channel::firstOrCreate(['name' => 'Web']);

        // Create Complaint
        $complaint = Complaint::create([
            'citizen_id' => $citizen->id,
            'cnic' => $cnic,
            'channel_id' => $channel->id,
            'district_id' => $request->district_id,
            'tehsil_id' => $request->tehsil_id,
            'department_id' => $departmentId,
            'sub_department_id' => $subDepartmentId,
            'category_id' => $categoryId,
            'is_uncategorized' => $isUncategorized,
            'subject' => $request->subject,
            'details' => $request->details,
            'stage' => 'application_submission',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        // Upload attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('attachments', 'public');

                ComplaintAttachment::create([
                    'complaint_id' => $complaint->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'file_type' => $file->getClientMimeType(),
                    'uploaded_by_type' => 'citizen',
                    'uploaded_by_user_id' => null,
                ]);
            }
        }

        // Record initial status history
        ComplaintStatusHistory::create([
            'complaint_id' => $complaint->id,
            'stage' => 'application_submission',
            'status_detail' => 'Complaint lodged by citizen via PMCC Web Portal',
            'changed_by' => null,
            'changed_at' => now(),
        ]);

        return redirect()->route('complaints.confirmation', $complaint->complaint_number);
    }

    /**
     * Display the confirmation screen.
     */
    public function confirmation(string $complaint_number): Response
    {
        $complaint = Complaint::where('complaint_number', $complaint_number)
            ->with(['citizen', 'district', 'tehsil', 'department'])
            ->firstOrFail();

        return Inertia::render('Public/ComplaintConfirmation', [
            'complaint' => $complaint,
        ]);
    }

    /**
     * Display the complaint tracking search page.
     */
    public function trackForm(): Response
    {
        return Inertia::render('Public/ComplaintTrack', [
            'complaint' => null,
            'searched' => false,
            'notFound' => false,
        ]);
    }

    /**
     * Handle complaint tracking search request.
     */
    public function track(Request $request): Response
    {
        $request->validate([
            'complaint_number' => 'required|string',
            'cnic' => 'required|string',
        ]);

        $cnic = preg_replace('/[^0-9]/', '', $request->cnic);
        $complaintNumber = trim($request->complaint_number);
        $cacheKey = "complaint:track:{$complaintNumber}:{$cnic}";

        $complaint = Cache::remember($cacheKey, 60, function () use ($complaintNumber, $cnic) {
            return Complaint::with(['citizen', 'district', 'tehsil', 'department', 'statusHistories'])
                ->where('complaint_number', $complaintNumber)
                ->whereHas('citizen', function ($q) use ($cnic) {
                    $q->where('cnic', $cnic);
                })
                ->first();
        });

        return Inertia::render('Public/ComplaintTrack', [
            'complaint' => $complaint,
            'searched' => true,
            'notFound' => is_null($complaint),
            'searchParams' => [
                'complaint_number' => $request->complaint_number,
                'cnic' => $request->cnic,
            ],
        ]);
    }
}
