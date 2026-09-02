<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'department_id',
        'sub_department_id',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function subDepartment(): BelongsTo
    {
        return $this->belongsTo(SubDepartment::class);
    }

    public function assignedComplaints(): HasMany
    {
        return $this->hasMany(Complaint::class, 'assigned_fp_id');
    }

    public function adminAssignedComplaints(): HasMany
    {
        return $this->hasMany(Complaint::class, 'admin_assigned_by');
    }

    public function complaintAttachments(): HasMany
    {
        return $this->hasMany(ComplaintAttachment::class, 'uploaded_by_user_id');
    }

    public function complaintInvestigations(): HasMany
    {
        return $this->hasMany(ComplaintInvestigation::class, 'fp_id');
    }

    public function complaintActions(): HasMany
    {
        return $this->hasMany(ComplaintAction::class, 'fp_id');
    }

    public function complaintClubs(): HasMany
    {
        return $this->hasMany(ComplaintClub::class, 'clubbed_by');
    }

    public function reviewedSimilarityMatches(): HasMany
    {
        return $this->hasMany(ComplaintSimilarityMatch::class, 'reviewed_by');
    }

    public function complaintExternalForwards(): HasMany
    {
        return $this->hasMany(ComplaintExternalForward::class, 'forwarded_by');
    }

    public function complaintStatusHistories(): HasMany
    {
        return $this->hasMany(ComplaintStatusHistory::class, 'changed_by');
    }

    public function complaintAssignments(): HasMany
    {
        return $this->hasMany(ComplaintAssignment::class, 'fp_id');
    }

    public function adminAssignments(): HasMany
    {
        return $this->hasMany(ComplaintAssignment::class, 'assigned_by');
    }
}
