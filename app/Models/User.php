<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Activitylog\Models\Concerns\CausesActivity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use CausesActivity, HasFactory, LogsActivity, Notifiable;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'role', 'department_id', 'sub_department_id', 'supervisor_id', 'is_active'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('users')
            ->setDescriptionForEvent(fn (string $eventName) => "User account has been {$eventName}");
    }

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
        'role_id',
        'department_id',
        'sub_department_id',
        'supervisor_id',
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

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function subordinates(): HasMany
    {
        return $this->hasMany(User::class, 'supervisor_id');
    }

    public function assignedInvestigations(): HasMany
    {
        return $this->hasMany(ComplaintInvestigation::class, 'assigned_officer_id');
    }

    public function requestedReassignments(): HasMany
    {
        return $this->hasMany(ComplaintReassignmentRequest::class, 'requested_by');
    }

    public function reviewedReassignments(): HasMany
    {
        return $this->hasMany(ComplaintReassignmentRequest::class, 'reviewed_by');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isFocalPerson(): bool
    {
        return $this->role === 'focal_person';
    }

    public function isDirector(): bool
    {
        return $this->role === 'director';
    }

    public function isFieldOfficer(): bool
    {
        return $this->role === 'field_officer';
    }

    public function roleModel(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /**
     * Get the active role for this user (falling back to slug lookup if role_id is null).
     */
    public function getResolvedRole(): ?Role
    {
        if ($this->relationLoaded('roleModel') && $this->roleModel) {
            return $this->roleModel;
        }

        if ($this->role_id) {
            return $this->roleModel;
        }

        if ($this->role) {
            return Role::where('slug', $this->role)->first();
        }

        return null;
    }

    /**
     * Check if user has a given permission slug.
     */
    public function hasPermission(string $permissionSlug): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $role = $this->getResolvedRole();
        if (! $role) {
            return false;
        }

        if (! isset($this->cachedPermissions)) {
            $this->cachedPermissions = $role->permissions()->pluck('slug')->all();
        }

        return in_array($permissionSlug, $this->cachedPermissions, true);
    }

    /**
     * Check if user has any of the given permissions.
     */
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has all of the given permissions.
     */
    public function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (! $this->hasPermission($permission)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get the complete permissions matrix for this user.
     */
    public function getPermissionsMatrix(): array
    {
        $role = $this->getResolvedRole();
        if (! $role) {
            return [];
        }

        return $role->permissions()
            ->with('feature')
            ->get()
            ->groupBy('feature.name')
            ->toArray();
    }
}
