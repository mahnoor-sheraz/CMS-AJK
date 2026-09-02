<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplaintSimilarityMatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'complaint_id',
        'matched_complaint_id',
        'similarity_score',
        'status',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'similarity_score' => 'decimal:4',
        'reviewed_at' => 'datetime',
    ];

    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class, 'complaint_id');
    }

    public function matchedComplaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class, 'matched_complaint_id');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
