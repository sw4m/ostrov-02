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
            ->with([
                'reports' => function ($query) {
                    $query->orderBy('created_at', 'desc');
                },
                'announcements' => function ($query) {
                    $query->orderBy('created_at', 'desc')->with('user');
                },
            ])
            ->withCount('reports')
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
                    'condition' => $this->mapConditionToLabel($road->condition),
                    'severity' => $road->condition ? (1 - $road->condition) : 0,
                    'reports_count' => $road->reports_count ?? 0,
                    'recent_reports' => $road->reports->map(function ($report) {
                        return [
                            'id' => $report->id,
                            'type' => $report->type,
                            'status' => $report->status,
                            'photo_url' => asset($report->photo_url),
                            'description' => $report->description,
                            'ai_analysis' => $report->ai_analysis,
                            'condition' => $report->condition,
                            'created_at' => $report->created_at ? $report->created_at->toDateTimeString() : null,
                            'latitude' => $report->latitude,
                            'longitude' => $report->longitude,
                        ];
                    })->toArray(),
                    'recent_announcements' => $road->announcements->map(function ($ann) {
                        return [
                            'id' => $ann->id,
                            'user_id' => $ann->user_id,
                            'user_name' => $ann->user->name ?? null,
                            'description' => $ann->description,
                            'created_at' => $ann->created_at ? $ann->created_at->toDateTimeString() : null,
                        ];
                    })->toArray(),
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
