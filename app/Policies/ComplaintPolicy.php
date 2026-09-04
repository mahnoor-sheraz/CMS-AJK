<?php

namespace App\Policies;

use App\Models\Complaint;
use App\Models\User;

class ComplaintPolicy
{
    /**
     * Determine whether the user can view any complaints.
     */
    public function viewAny(User $user): bool
    {
        return $user->is_active && in_array($user->role, ['admin', 'director', 'focal_person', 'field_officer']);
    }

    /**
     * Determine whether the user can view the specific complaint.
     * Enforces that focal persons only view their department and field officers only view their assigned complaints.
     */
    public function view(User $user, Complaint $complaint): bool
    {
        if ($user->is_active === false) {
            return false;
        }

        // Admin: Global access
        if ($user->isAdmin()) {
            return true;
        }

        // Director & Focal Person: Strictly restricted to their department
        if ($user->isDirector() || $user->isFocalPerson()) {
            return $user->department_id !== null && $complaint->department_id === $user->department_id;
        }

        // Field Officer: Strictly restricted to assigned complaints
        if ($user->isFieldOfficer()) {
            return $complaint->assigned_fp_id === $user->id
                || $complaint->investigations()->where('assigned_officer_id', $user->id)->exists()
                || $complaint->assignments()->where('assigned_to_user_id', $user->id)->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can update the complaint.
     */
    public function update(User $user, Complaint $complaint): bool
    {
        if (! $this->view($user, $complaint)) {
            return false;
        }

        return $user->hasPermission('complaints.edit') || $user->isAdmin();
    }

    /**
     * Determine whether the user can assign the complaint to an officer.
     */
    public function assign(User $user, Complaint $complaint): bool
    {
        if (! $this->view($user, $complaint)) {
            return false;
        }

        return $user->hasPermission('assignments.assign_field_officer') || $user->isAdmin();
    }

    /**
     * Determine whether the user can record an investigation for the complaint.
     */
    public function investigate(User $user, Complaint $complaint): bool
    {
        if (! $this->view($user, $complaint)) {
            return false;
        }

        return $user->hasPermission('investigations.record') || $user->isAdmin();
    }

    /**
     * Determine whether the user can resolve or close the complaint.
     */
    public function resolve(User $user, Complaint $complaint): bool
    {
        if (! $this->view($user, $complaint)) {
            return false;
        }

        return $user->hasPermission('complaints.resolve') || $user->isAdmin();
    }

    /**
     * Determine whether the user can request departmental reassignment.
     */
    public function reassign(User $user, Complaint $complaint): bool
    {
        if (! $this->view($user, $complaint)) {
            return false;
        }

        return $user->hasPermission('reassignments.request') || $user->isAdmin();
    }
}
