<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'complaint_number',
        'citizen_id',
        'cnic',
        'channel_id',
        'district_id',
        'tehsil_id',
        'department_id',
        'sub_department_id',
        'category_id',
        'is_uncategorized',
        'subject',
        'details',
        'embedding',
        'assigned_fp_id',
        'status',
        'stage',
        'admin_assigned_by',
        'admin_remarks',
        'submitted_at',
    ];

    protected $casts = [
        'is_uncategorized' => 'boolean',
        'embedding' => 'array',
        'submitted_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Complaint $complaint) {
            if (empty($complaint->cnic) && ! empty($complaint->citizen_id)) {
                $complaint->cnic = Citizen::where('id', $complaint->citizen_id)->value('cnic');
            }
        });

        static::created(function (Complaint $complaint) {
            if (! $complaint->complaint_number) {
                $year = now()->format('Y');
                $paddedId = str_pad((string) $complaint->id, 6, '0', STR_PAD_LEFT);
                $complaint->complaint_number = "PMCC-{$year}-{$paddedId}";
                $complaint->saveQuietly();
            }
        });
    }

    public function citizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class);
    }

    public function channel(): BelongsTo
    {
        return $this->belongsTo(Channel::class);
    }

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    public function tehsil(): BelongsTo
    {
        return $this->belongsTo(Tehsil::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function subDepartment(): BelongsTo
    {
        return $this->belongsTo(SubDepartment::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function assignedFp(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_fp_id');
    }

    public function adminAssignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_assigned_by');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ComplaintAttachment::class);
    }

    public function investigations(): HasMany
    {
        return $this->hasMany(ComplaintInvestigation::class);
    }

    public function actions(): HasMany
    {
        return $this->hasMany(ComplaintAction::class);
    }

    public function primaryClubs(): HasMany
    {
        return $this->hasMany(ComplaintClub::class, 'primary_complaint_id');
    }

    public function clubbedEntry(): HasOne
    {
        return $this->hasOne(ComplaintClub::class, 'clubbed_complaint_id');
    }

    public function similarityMatches(): HasMany
    {
        return $this->hasMany(ComplaintSimilarityMatch::class, 'complaint_id');
    }

    public function matchedSimilarityEntries(): HasMany
    {
        return $this->hasMany(ComplaintSimilarityMatch::class, 'matched_complaint_id');
    }

    public function externalForwards(): HasMany
    {
        return $this->hasMany(ComplaintExternalForward::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(ComplaintStatusHistory::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(ComplaintAssignment::class);
    }

    public function reassignmentRequests(): HasMany
    {
        return $this->hasMany(ComplaintReassignmentRequest::class);
    }
}
