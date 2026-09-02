<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use InvalidArgumentException;

class ComplaintClub extends Model
{
    use HasFactory;

    protected $fillable = [
        'primary_complaint_id',
        'clubbed_complaint_id',
        'clubbed_by',
        'notes',
    ];

    protected static function booted(): void
    {
        static::saving(function (ComplaintClub $club) {
            if ((int) $club->primary_complaint_id === (int) $club->clubbed_complaint_id) {
                throw new InvalidArgumentException('Primary complaint ID cannot be equal to clubbed complaint ID.');
            }
        });
    }

    public function primaryComplaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class, 'primary_complaint_id');
    }

    public function clubbedComplaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class, 'clubbed_complaint_id');
    }

    public function clubbedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'clubbed_by');
    }
}
