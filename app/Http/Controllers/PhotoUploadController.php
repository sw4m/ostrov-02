<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Intervention\Image\Laravel\Facades\Image;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use OpenAI\Laravel\Facades\OpenAI;
use App\Models\Report;
use App\Models\Road;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PhotoUploadController extends Controller
{

    public function store(Request $request)
    {
        Log::info('Photo upload started', [
            'has_photo' => $request->hasFile('photo'),
            'files' => $request->allFiles(),
            'input_photo' => $request->input('photo'),
            'content_type' => $request->header('Content-Type'),
            'method' => $request->method(),
            'all_input' => $request->all(),
        ]);

        // Check if file exists before validation
        if (!$request->hasFile('photo')) {
            Log::error('No photo file in request');
            return response()->json([
                'success' => false,
                'error' => 'No photo file received. Please ensure you have selected an image file.',
                'debug' => config('app.debug') ? [
                    'files' => $request->allFiles(),
                    'input' => $request->all(),
                ] : null,
            ], 422);
        }

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,jpg,png,heic|max:10240', // 10MB max
        ], [
            'photo.required' => 'Please select a photo to upload.',
            'photo.image' => 'The file must be an image.',
            'photo.mimes' => 'The photo must be a JPEG, JPG, PNG, or HEIC file.',
            'photo.max' => 'The photo size must not exceed 10MB.',
        ]);

        Log::info('Validation passed');

        try {
            $file = $request->file('photo');
            $tempPath = $file->getRealPath();

            Log::info('File received', [
                'path' => $tempPath,
                'mime' => $file->getMimeType(),
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
            ]);

            $exif = false;
            $latitude = null;
            $longitude = null;

            // Attempt to read EXIF data
            try {
                $exif = @exif_read_data($tempPath, 0, true);
                if ($exif !== false) {
                    Log::info('EXIF data found', [
                        'sections' => array_keys($exif),
                        'has_gps' => isset($exif['GPS']),
                        'gps_data' => isset($exif['GPS']) ? $exif['GPS'] : null,
                    ]);
                } else {
                    Log::warning('exif_read_data returned false');
                }
            } catch (\Exception $e) {
                Log::error('EXIF reading failed', ['error' => $e->getMessage()]);
            }

            // Try to extract GPS coordinates from EXIF
            if ($exif && isset($exif['GPS'])) {
                $gps = $exif['GPS'];

                if (isset($gps['GPSLatitude'], $gps['GPSLatitudeRef'], $gps['GPSLongitude'], $gps['GPSLongitudeRef'])) {
                    $latitude = $this->getGps($gps['GPSLatitude'], $gps['GPSLatitudeRef']);
                    $longitude = $this->getGps($gps['GPSLongitude'], $gps['GPSLongitudeRef']);

                    Log::info('GPS coordinates extracted', [
                        'lat' => $latitude,
                        'lng' => $longitude,
                        'lat_raw' => $gps['GPSLatitude'],
                        'lng_raw' => $gps['GPSLongitude'],
                    ]);
                } else {
                    Log::warning('GPS section exists but missing required fields', [
                        'available_fields' => array_keys($gps),
                    ]);
                }
            } else if ($exif && (isset($exif['GPSLatitude']) || isset($exif['GPSLongitude']))) {
                // Some cameras might store GPS data at root level
                if (isset($exif['GPSLatitude'], $exif['GPSLatitudeRef'], $exif['GPSLongitude'], $exif['GPSLongitudeRef'])) {
                    $latitude = $this->getGps($exif['GPSLatitude'], $exif['GPSLatitudeRef']);
                    $longitude = $this->getGps($exif['GPSLongitude'], $exif['GPSLongitudeRef']);

                    Log::info('GPS coordinates extracted from root', [
                        'lat' => $latitude,
                        'lng' => $longitude,
                    ]);
                }
            }

            // If no valid GPS data, use default coordinates
            if ($latitude === null || $longitude === null) {
                Log::warning('No valid GPS data in photo, using default coordinates', [
                    'exif_available' => $exif !== false,
                    'lat_extracted' => $latitude,
                    'lng_extracted' => $longitude,
                ]);

                // In debug mode, let user know GPS data wasn't found
                if (config('app.debug')) {
                    $debugMessage = 'No GPS data found in image. ';
                    if (!function_exists('exif_read_data')) {
                        $debugMessage .= 'EXIF extension not available. ';
                    }
                    $debugMessage .= 'Using default location.';
                    Log::warning($debugMessage);
                }

                $latitude = 48.73186705397255;
                $longitude = 21.24299601733856;
            }

            Log::info('Final coordinates', ['lat' => $latitude, 'lng' => $longitude]);

            // Generate unique filename
            $filename = Str::uuid() . '.webp';
            $storagePath = 'photos/' . $filename;

            Log::info('Starting image processing');

            // Load image and convert to WebP
            $image = Image::read($tempPath);

            // Resize if too large (max 1920px width)
            if ($image->width() > 1920) {
                $image->scale(width: 1920);
            }

            // Save as WebP with good quality
            $webpData = $image->toWebp(quality: 85);

            // Store in public storage
            Storage::disk('public')->put($storagePath, (string) $webpData);

            // Get the full URL for the stored image
            $photoUrl = Storage::url($storagePath);

            Log::info('Image saved', ['url' => $photoUrl]);

            // Analyze image with OpenAI Vision API
            Log::info('Starting AI analysis');
            $aiAnalysis = $this->analyzeRoadCondition($tempPath);
            Log::info('AI analysis complete', ['type' => $aiAnalysis['type'] ?? 'unknown']);

            // Find nearest road with distance calculation
            Log::info('Finding nearest road');
            $roadMatch = $this->findNearestRoad($latitude, $longitude);

            // If no clear match or multiple candidates, return them for user selection
            if (isset($roadMatch['requires_selection'])) {
                Log::info('Multiple road candidates found, requiring user selection');
                return response()->json([
                    'success' => true,
                    'requires_road_selection' => true,
                    'candidates' => $roadMatch['candidates'],
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'photo_url' => $photoUrl,
                    'filename' => $filename,
                    'ai_analysis' => $aiAnalysis,
                    'temp_photo_path' => $storagePath,
                ]);
            }

            if (!isset($roadMatch['road'])) {
                throw new \Exception('No road found within acceptable distance');
            }

            $road = $roadMatch['road'];
            $distance = $roadMatch['distance'];
            Log::info('Road found', ['road_id' => $road->id, 'distance' => $distance]);

            // Create report in database
            Log::info('Creating report');
            $report = Report::create([
                'road_id' => $road->id,
                'user_id' => Auth::id() ?? 1, // Default to user 1 if not authenticated
                'type' => $aiAnalysis['type'] ?? 'damage',
                'description' => $aiAnalysis['description'] ?? 'Road condition report from photo',
                'status' => 'pending',
                'photo_url' => $photoUrl,
                'condition' => $aiAnalysis['condition'] ?? null,
                'ai_analysis' => $aiAnalysis,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'distance_to_road' => $distance,
                'road_manually_selected' => false,
            ]);

            // Update road condition based on the report
            if (isset($aiAnalysis['condition']) && $aiAnalysis['condition'] !== null) {
                // If road has no condition yet, use the report's condition
                // Otherwise, calculate average of existing condition and new report
                if ($road->condition === null) {
                    $road->condition = $aiAnalysis['condition'];
                } else {
                    // Calculate weighted average (gives more weight to worse conditions)
                    $road->condition = min($road->condition, $aiAnalysis['condition']);
                }
                $road->save();
                Log::info('Road condition updated', ['road_id' => $road->id, 'new_condition' => $road->condition]);
            }

            Log::info('Report created', ['report_id' => $report->id]);
            Log::info('Sending success response');

            return response()->json([
                'success' => true,
                'message' => 'Photo uploaded and analyzed successfully!',
                'latitude' => $latitude,
                'longitude' => $longitude,
                'photo_url' => $photoUrl,
                'filename' => $filename,
                'report_id' => $report->id,
                'road_id' => $road->id,
                'ai_analysis' => $aiAnalysis,
                'distance_to_road' => $distance,
                'debug' => config('app.debug') ? [
                    'gps_from_exif' => $exif !== false,
                    'used_default_coords' => ($latitude == 48.73186705397255 && $longitude == 21.24299601733856),
                ] : null,
            ]);
        } catch (\Exception $e) {
            Log::error('Photo upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'An error occurred while processing your photo. Please try again.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Confirm manual road selection and create report
     */
    public function confirmRoadSelection(Request $request)
    {
        $validated = $request->validate([
            'road_id' => 'required|exists:roads,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'photo_url' => 'required|string',
            'ai_analysis' => 'required|array',
        ]);

        try {
            $road = Road::findOrFail($validated['road_id']);
            $distance = $road->distanceToPoint($validated['latitude'], $validated['longitude']);

            // Create report with manually selected road
            $report = Report::create([
                'road_id' => $road->id,
                'user_id' => Auth::id() ?? 1,
                'type' => $validated['ai_analysis']['type'] ?? 'damage',
                'description' => $validated['ai_analysis']['description'] ?? 'Road condition report from photo',
                'status' => 'pending',
                'photo_url' => $validated['photo_url'],
                'condition' => $validated['ai_analysis']['condition'] ?? null,
                'ai_analysis' => $validated['ai_analysis'],
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'distance_to_road' => $distance,
                'road_manually_selected' => true,
            ]);

            // Update road condition
            if (isset($validated['ai_analysis']['condition']) && $validated['ai_analysis']['condition'] !== null) {
                if ($road->condition === null) {
                    $road->condition = $validated['ai_analysis']['condition'];
                } else {
                    $road->condition = min($road->condition, $validated['ai_analysis']['condition']);
                }
                $road->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Report created successfully!',
                'report_id' => $report->id,
                'road_id' => $road->id,
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to confirm road selection', [
                'error' => $e->getMessage(),
                'road_id' => $validated['road_id'] ?? null,
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to create report. Please try again.',
            ], 500);
        }
    }

    /**
     * Update a report with user-confirmed details
     */
    public function update(Request $request, Report $report)
    {
        Log::info('Report update started', ['report_id' => $report->id]);

        $request->validate([
            'type' => 'required|in:crack,pothole,damage',
            'description' => 'required|string|max:1000',
            'severity' => 'sometimes|in:low,medium,high',
        ]);

        try {
            // Update report with user-confirmed data
            $report->update([
                'type' => $request->type,
                'description' => $request->description,
            ]);

            // Update AI analysis with severity if provided
            if ($request->has('severity')) {
                $aiAnalysis = $report->ai_analysis ?? [];
                $aiAnalysis['severity'] = $request->severity;
                $aiAnalysis['user_confirmed'] = true;
                $report->ai_analysis = $aiAnalysis;
                $report->save();
            }

            Log::info('Report updated successfully', ['report_id' => $report->id]);

            return response()->json([
                'success' => true,
                'message' => 'Report updated successfully!',
                'report' => $report,
            ]);
        } catch (\Exception $e) {
            Log::error('Report update error', [
                'report_id' => $report->id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'An error occurred while updating the report. Please try again.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Analyze road condition using OpenAI Vision API
     */
    private function analyzeRoadCondition(string $imagePath): array
    {
        try {
            // Read image and encode to base64
            $imageData = base64_encode(file_get_contents($imagePath));
            $mimeType = mime_content_type($imagePath);

            $response = OpenAI::chat()->create([
                'model' => 'gpt-4o',
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => 'Analyze this image to determine if it shows a ROAD SURFACE photographed from ABOVE (top-down or angled downward view). ALWAYS respond with valid JSON only, no markdown, no code blocks, no explanatory text.\n\n'
                                    . 'CRITICAL CRITERIA for road_probability:\n'
                                    . '- You must be able to see the actual road surface texture, cracks, or pavement details\n'
                                    . 'Required JSON format:\n'
                                    . '{\n'
                                    . '  "type": "crack" | "pothole" | "damage",\n'
                                    . '  "description": "Brief description",\n'
                                    . '  "condition": 0.00 to 1.00 (1.00 = perfect, 0.00 = severe damage),\n'
                                    . '  "severity": "low" | "medium" | "high",\n'
                                    . '  "detected_issues": ["array of specific issues"],\n'
                                    . '  "road_probability": 0.00 to 1.00 (probability this is a usable road surface photo taken from above)\n'
                                    . '}\n\n'
                                    . 'Set road_probability to 0.00 if:\n'
                                    . '- No road surface visible\n'
                                    . '- Photo is from side view, distant view, or landscape perspective\n'
                                    . '- Photo shows bridges, buildings, cars, or other objects instead of road surface\n'
                                    . '- Surface details (cracks, texture, potholes) are not clearly visible\n\n'
                                    . 'CRITICAL: Return ONLY the JSON object, nothing else.',
                            ],
                            [
                                'type' => 'image_url',
                                'image_url' => [
                                    'url' => "data:{$mimeType};base64,{$imageData}",
                                ],
                            ],
                        ],
                    ],
                ],
                'max_tokens' => 500,
                'response_format' => ['type' => 'json_object'],
            ]);

            $content = $response->choices[0]->message->content;

            // Log only the raw JSON response
            Log::info('Raw OpenAI JSON Response: ' . $content);

            // Parse JSON response
            $analysis = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON response from AI');
            }

            return $analysis;
        } catch (\Exception $e) {
            // Return default analysis if AI fails
            return [
                'type' => 'damage',
                'description' => 'Road condition report (AI analysis unavailable)',
                'condition' => null,
                'severity' => 'medium',
                'detected_issues' => [],
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Find the nearest road to the given coordinates using actual distance calculation
     * Returns array with 'road' and 'distance', or 'requires_selection' with 'candidates'
     */
    private function findNearestRoad(float $latitude, float $longitude): array
    {
        // Distance thresholds in meters
        $maxDistance = 50; // Maximum acceptable distance
        $ambiguousThreshold = 10; // If multiple roads within this distance, ask user

        // Expand search area by ~0.001 degrees (~111m)
        $searchBuffer = 0.001;

        // Get candidate roads within expanded bounding box
        $candidates = Road::where('bbox_min_lat', '<=', $latitude + $searchBuffer)
            ->where('bbox_max_lat', '>=', $latitude - $searchBuffer)
            ->where('bbox_min_lng', '<=', $longitude + $searchBuffer)
            ->where('bbox_max_lng', '>=', $longitude - $searchBuffer)
            ->get();

        if ($candidates->isEmpty()) {
            Log::warning('No candidate roads found', [
                'latitude' => $latitude,
                'longitude' => $longitude,
                'search_buffer' => $searchBuffer,
            ]);
            throw new \Exception('No roads found near this location. Please ensure you are in an area with mapped roads, or the photo location is accurate.');
        }

        // Calculate actual distances
        $roadsWithDistance = [];
        foreach ($candidates as $road) {
            $distance = $road->distanceToPoint($latitude, $longitude);
            if ($distance <= $maxDistance) {
                $roadsWithDistance[] = [
                    'road' => $road,
                    'distance' => round($distance, 2),
                ];
            }
        }

        if (empty($roadsWithDistance)) {
            Log::warning('No roads within acceptable distance', [
                'latitude' => $latitude,
                'longitude' => $longitude,
                'max_distance' => $maxDistance,
                'candidates_checked' => $candidates->count(),
            ]);
            throw new \Exception('No roads found within ' . $maxDistance . 'm of this location. The closest road may be too far away.');
        }

        // Sort by distance
        usort($roadsWithDistance, fn($a, $b) => $a['distance'] <=> $b['distance']);

        // Check if we have ambiguous matches (multiple roads very close)
        $closestDistance = $roadsWithDistance[0]['distance'];
        $ambiguousCandidates = array_filter(
            $roadsWithDistance,
            fn($item) => $item['distance'] <= $closestDistance + $ambiguousThreshold
        );

        // If multiple roads are similarly close, require user selection
        if (count($ambiguousCandidates) > 1) {
            return [
                'requires_selection' => true,
                'candidates' => array_map(function ($item) use ($latitude, $longitude) {
                    return [
                        'id' => $item['road']->id,
                        'name' => $item['road']->name,
                        'distance' => $item['distance'],
                        'highway_type' => $item['road']->highway_type,
                    ];
                }, array_values($ambiguousCandidates)),
            ];
        }

        // Return the closest road
        return [
            'road' => $roadsWithDistance[0]['road'],
            'distance' => $roadsWithDistance[0]['distance'],
        ];
    }

    /**
     * Convert EXIF GPS coordinates to decimal format
     */
    private function getGps($exifCoord, $hemi)
    {
        if (!is_array($exifCoord) || count($exifCoord) < 3) {
            return null;
        }

        $degrees = count($exifCoord) > 0 ? $this->gps2Num($exifCoord[0]) : 0;
        $minutes = count($exifCoord) > 1 ? $this->gps2Num($exifCoord[1]) : 0;
        $seconds = count($exifCoord) > 2 ? $this->gps2Num($exifCoord[2]) : 0;

        $flip = ($hemi === 'W' || $hemi === 'S') ? -1 : 1;

        return $flip * ($degrees + $minutes / 60 + $seconds / 3600);
    }

    /**
     * Convert EXIF GPS fraction to number
     */
    private function gps2Num($coordPart)
    {
        if (is_string($coordPart)) {
            $parts = explode('/', $coordPart);
            if (count($parts) <= 0) {
                return 0;
            }
            if (count($parts) === 1) {
                return (float) $parts[0];
            }
            return (float) $parts[0] / (float) $parts[1];
        }
        return (float) $coordPart;
    }
}
