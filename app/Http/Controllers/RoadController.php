<?php

namespace App\Http\Controllers;

use App\Models\Road;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RoadController extends Controller
{
    /**
     * Get roads within viewport bounds as GeoJSON
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'minLat' => 'required|numeric|min:-90|max:90',
            'maxLat' => 'required|numeric|min:-90|max:90',
            'minLng' => 'required|numeric|min:-180|max:180',
            'maxLng' => 'required|numeric|min:-180|max:180',
        ]);

        $roads = Road::where('bbox_min_lat', '<=', $validated['maxLat'])
            ->where('bbox_max_lat', '>=', $validated['minLat'])
            ->where('bbox_min_lng', '<=', $validated['maxLng'])
            ->where('bbox_max_lng', '>=', $validated['minLng'])
            ->get();

        // Convert to GeoJSON format
        $features = $roads->map(function ($road) {
            return [
                'type' => 'Feature',
                'geometry' => [
                    'type' => 'LineString',
                    'coordinates' => array_map(function ($point) {
                        return [$point['lon'], $point['lat']];
                    }, $road->geometry),
                ],
                'properties' => [
                    'id' => $road->id,
                    'osm_id' => $road->osm_id,
                    'name' => $road->name,
                    'highway_type' => $road->highway_type,
                    'condition' => $this->mapConditionToLabel($road->condition),
                    'severity' => $road->condition ? (1 - $road->condition) : 0,
                ],
            ];
        });

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features,
        ]);
    }

    /**
     * Map numeric condition to label
     */
    private function mapConditionToLabel(?float $condition): ?string
    {
        if ($condition === null) {
            return null; // Return null for roads with no condition data
        }

        if ($condition >= 0.9) {
            return 'excellent';
        } elseif ($condition >= 0.7) {
            return 'good';
        } elseif ($condition >= 0.5) {
            return 'poor';
        } else {
            return 'critical';
        }
    }
}
