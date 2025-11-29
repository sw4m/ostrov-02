<?php

namespace App\Http\Controllers;

use App\Models\Road;
use Illuminate\Http\JsonResponse;

class RoadController extends Controller
{
    /**
     * Get all roads as GeoJSON
     */
    public function index(): JsonResponse
    {
        $roads = Road::all();

        $features = $roads->map(function ($road) {
            return [
                'type' => 'Feature',
                'properties' => [
                    'id' => $road->id,
                    'osm_id' => $road->osm_id,
                    'name' => $road->name,
                    'condition' => 'critical', // All roads red for now
                    'severity' => $road->condition ?? 1.0,
                    'highway_type' => $road->highway_type,
                ],
                'geometry' => $road->geometry,
            ];
        });

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features,
        ]);
    }
}
