<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class ComplaintInvestigation extends Model
{
    use HasFactory, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('investigations')
            ->setDescriptionForEvent(fn (string $eventName) => "Complaint investigation has been {$eventName}");
    }

    protected $fillable = [
        'complaint_id',
        'fp_id',
        'assigned_officer_id',
        'investigation_type',
        'notes',
        'location',
        'visit_datetime',
    ];

    protected $casts = [
        'visit_datetime' => 'datetime',
    ];

    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    public function focalPerson(): BelongsTo
    {
        return $this->belongsTo(User::class, 'fp_id');
    }

    public function assignedOfficer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_officer_id');
    }

    /**
     * Scope query to investigations accessible by user's role and assignment.
     */
    public function scopeAccessibleBy(Builder $query, User $user): Builder
    {
        if ($user->is_active === false) {
            return $query->whereRaw('0 = 1');
        }

        // Admin has global investigation oversight
        if ($user->isAdmin()) {
            return $query;
        }

        // Director & Focal Person can oversee investigations in their department
        if ($user->isDirector() || $user->isFocalPerson()) {
            if (empty($user->department_id)) {
                return $query->whereRaw('0 = 1');
            }

            return $query->whereHas('complaint', fn ($cq) => $cq->where('department_id', $user->department_id));
        }

        // Field Officer can only access investigations assigned to them
        if ($user->isFieldOfficer()) {
            return $query->where('assigned_officer_id', $user->id);
        }

        return $query->whereRaw('0 = 1');
    }
}
