<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class District extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    public function tehsils(): HasMany
    {
        return $this->hasMany(Tehsil::class);
    }

    public function citizens(): HasMany
    {
        return $this->hasMany(Citizen::class);
    }

    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class);
    }
}
