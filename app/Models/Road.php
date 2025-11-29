<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Road extends Model
{
    protected $fillable = [
        'osm_id',
        'name',
        'condition',
        'highway_type',
        'geometry',
        'bbox_min_lat',
        'bbox_max_lat',
        'bbox_min_lng',
        'bbox_max_lng',
    ];

    protected $casts = [
        'geometry' => 'array',
        'condition' => 'decimal:2',
        'bbox_min_lat' => 'decimal:7',
        'bbox_max_lat' => 'decimal:7',
        'bbox_min_lng' => 'decimal:7',
        'bbox_max_lng' => 'decimal:7',
    ];

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}
