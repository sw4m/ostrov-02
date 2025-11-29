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
    ];

    protected $casts = [
        'ai_analysis' => 'array',
        'condition' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
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
