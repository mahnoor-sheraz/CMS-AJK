<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class ComplaintReassignmentRequest extends Model
{
    use HasFactory, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('reassignments')
            ->setDescriptionForEvent(fn (string $eventName) => "Complaint reassignment request has been {$eventName}");
    }

    protected $fillable = [
        'complaint_id',
        'requested_by',
        'from_department_id',
        'to_department_id',
        'reason',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function fromDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'from_department_id');
    }

    public function toDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'to_department_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Scope query to reassignment requests accessible by user's role and department.
     */
    public function scopeAccessibleBy(Builder $query, User $user): Builder
    {
        if ($user->is_active === false) {
            return $query->whereRaw('0 = 1');
        }

        // Admin can view all reassignment requests across government
        if ($user->isAdmin()) {
            return $query;
        }

        // Departmental officers can only view requests where their department is the source or destination
        if ($user->isDirector() || $user->isFocalPerson()) {
            if (empty($user->department_id)) {
                return $query->whereRaw('0 = 1');
            }

            return $query->where(function (Builder $q) use ($user) {
                $q->where('from_department_id', $user->department_id)
                    ->orWhere('to_department_id', $user->department_id);
            });
        }

        return $query->whereRaw('0 = 1');
    }
}
