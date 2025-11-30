<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Announcement;

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

    /**
     * Calculate the minimum distance from a point to this road's geometry in meters
     */
    public function distanceToPoint(float $latitude, float $longitude): float
    {
        if (empty($this->geometry)) {
            return PHP_FLOAT_MAX;
        }

        $minDistance = PHP_FLOAT_MAX;
        $points = $this->geometry;

        // Calculate distance to each segment of the road
        for ($i = 0; $i < count($points) - 1; $i++) {
            $segmentDistance = $this->pointToSegmentDistance(
                $latitude,
                $longitude,
                $points[$i]['lat'],
                $points[$i]['lon'],
                $points[$i + 1]['lat'],
                $points[$i + 1]['lon']
            );
            $minDistance = min($minDistance, $segmentDistance);
        }

        return $minDistance;
    }

    /**
     * Calculate the shortest distance from a point to a line segment using Haversine formula
     */
    private function pointToSegmentDistance(
        float $pointLat,
        float $pointLon,
        float $lat1,
        float $lon1,
        float $lat2,
        float $lon2
    ): float {
        // Convert to radians
        $pointLatRad = deg2rad($pointLat);
        $pointLonRad = deg2rad($pointLon);
        $lat1Rad = deg2rad($lat1);
        $lon1Rad = deg2rad($lon1);
        $lat2Rad = deg2rad($lat2);
        $lon2Rad = deg2rad($lon2);

        // Calculate the cross-track distance
        $bearing13 = $this->bearing($lat1Rad, $lon1Rad, $pointLatRad, $pointLonRad);
        $bearing12 = $this->bearing($lat1Rad, $lon1Rad, $lat2Rad, $lon2Rad);
        $distance13 = $this->haversineDistance($lat1, $lon1, $pointLat, $pointLon);

        // Distance from start point to the point perpendicular to the line
        $crossTrackDistance = abs(asin(sin($distance13 / 6371000) * sin($bearing13 - $bearing12)) * 6371000);

        // Calculate along-track distance
        $alongTrackDistance = acos(cos($distance13 / 6371000) / cos($crossTrackDistance / 6371000)) * 6371000;

        // Check if the perpendicular point is within the segment
        $segmentLength = $this->haversineDistance($lat1, $lon1, $lat2, $lon2);

        if ($alongTrackDistance > 0 && $alongTrackDistance < $segmentLength) {
            // Perpendicular point is on the segment
            return $crossTrackDistance;
        } else {
            // Return distance to the nearest endpoint
            $distance1 = $this->haversineDistance($lat1, $lon1, $pointLat, $pointLon);
            $distance2 = $this->haversineDistance($lat2, $lon2, $pointLat, $pointLon);
            return min($distance1, $distance2);
        }
    }

    /**
     * Calculate bearing between two points
     */
    private function bearing(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $dLon = $lon2 - $lon1;
        $y = sin($dLon) * cos($lat2);
        $x = cos($lat1) * sin($lat2) - sin($lat1) * cos($lat2) * cos($dLon);
        return atan2($y, $x);
    }

    /**
     * Calculate distance between two points using Haversine formula (in meters)
     */
    private function haversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // meters

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    public function announcements(): HasMany
    {
        return $this->hasMany(Announcement::class);
    }
}
