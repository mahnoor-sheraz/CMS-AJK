<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplaintExternalForward extends Model
{
    use HasFactory;

    protected $fillable = [
        'complaint_id',
        'destination_id',
        'forwarded_by',
        'remarks',
        'forwarded_at',
        'response_received_at',
        'response_notes',
    ];

    protected $casts = [
        'forwarded_at' => 'datetime',
        'response_received_at' => 'datetime',
    ];

    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(ForwardDestination::class, 'destination_id');
    }

    public function forwardedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'forwarded_by');
    }
}
