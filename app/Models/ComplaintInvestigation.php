<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplaintInvestigation extends Model
{
    use HasFactory;

    protected $fillable = [
        'complaint_id',
        'fp_id',
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
}
