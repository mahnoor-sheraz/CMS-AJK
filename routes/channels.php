<?php

use App\Models\Complaint;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function (User $user, int $id) {
    return (int) $user->id === $id;
});

Broadcast::channel('department.{departmentId}', function (User $user, int $departmentId) {
    return $user->role === 'admin' || (int) $user->department_id === $departmentId;
});

Broadcast::channel('complaint.{complaintId}', function (User $user, int $complaintId) {
    if ($user->role === 'admin') {
        return true;
    }

    $complaint = Complaint::find($complaintId);

    return $complaint && (int) $complaint->department_id === (int) $user->department_id;
});
