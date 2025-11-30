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
            ->with('reports')
            ->get();

        // Convert to GeoJSON format
        $features = $roads->map(function ($road) {
            // Calculate average condition from all reports
            $reportConditions = $road->reports->pluck('condition')->filter(function ($condition) {
                return $condition !== null;
            });

            $averageCondition = $reportConditions->count() > 0
                ? $reportConditions->avg()
                : $road->condition;

            // Collect all photo URLs from reports
            $images = $road->reports->pluck('photo_url')->filter(function ($url) {
                return $url !== null;
            })->values()->all();

            // Prepare full report data
            $reports = $road->reports->map(function ($report) {
                return [
                    'id' => $report->id,
                    'type' => $report->type,
                    'description' => $report->description,
                    'status' => $report->status,
                    'photo_url' => $report->photo_url,
                    'condition' => $report->condition,
                    'ai_analysis' => $report->ai_analysis,
                    'latitude' => $report->latitude,
                    'longitude' => $report->longitude,
                    'created_at' => $report->created_at,
                    'user_id' => $report->user_id,
                ];
            })->all();

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
                    'condition' => $this->mapConditionToLabel($averageCondition),
                    'severity' => $averageCondition ? (1 - $averageCondition) : 0,
                    'reports_count' => $road->reports->count(),
                    'images' => $images,
                    'reports' => $reports,
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
