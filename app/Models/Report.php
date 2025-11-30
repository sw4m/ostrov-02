<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    protected $fillable = [
        'road_id',
        'user_id',
        'type',
        'description',
        'status',
        'photo_url',
        'condition',
        'ai_analysis',
        'latitude',
        'longitude',
        'distance_to_road',
        'road_manually_selected',
    ];

    protected $casts = [
        'ai_analysis' => 'array',
        'condition' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'distance_to_road' => 'decimal:2',
        'road_manually_selected' => 'boolean',
    ];

    public function road(): BelongsTo
    {
        return $this->belongsTo(Road::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
