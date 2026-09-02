<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplaintAction extends Model
{
    use HasFactory;

    protected $fillable = [
        'complaint_id',
        'fp_id',
        'action_summary',
        'resolution_status',
        'complainant_feedback',
    ];

    protected static function booted(): void
    {
        static::created(function (ComplaintAction $action) {
            $statusMap = [
                'resolved' => 'resolved',
                'clubbed' => 'clubbed',
                'forwarded_externally' => 'forwarded_external',
                'rejected' => 'rejected',
            ];

            if (isset($statusMap[$action->resolution_status])) {
                $action->complaint->update([
                    'status' => $statusMap[$action->resolution_status],
                ]);
            }
        });
    }

    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    public function focalPerson(): BelongsTo
    {
        return $this->belongsTo(User::class, 'fp_id');
    }
}
