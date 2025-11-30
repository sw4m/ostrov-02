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
        Log::info('Photo upload started');

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,jpg,png,heic|max:10240', // 10MB max
        ]);

        Log::info('Validation passed');

        try {
            $file = $request->file('photo');
            $tempPath = $file->getRealPath();

            Log::info('File received', ['path' => $tempPath]);

            // Extract EXIF data
            $exif = @exif_read_data($tempPath);
            Log::info('EXIF data read', ['has_gps' => isset($exif['GPSLatitude'])]);

            // Check if GPS data exists, otherwise use default coordinates
            if (!$exif || !isset($exif['GPSLatitude']) || !isset($exif['GPSLongitude'])) {
                Log::warning('No GPS data in photo, using default coordinates');
                // Default coordinates: Košice, Slovakia
                $latitude = 48.732282;
                $longitude = 21.242572;
            } else {
                // Convert EXIF GPS to decimal coordinates
                $latitude = $this->getGps($exif['GPSLatitude'], $exif['GPSLatitudeRef']);
                $longitude = $this->getGps($exif['GPSLongitude'], $exif['GPSLongitudeRef']);

                Log::info('Coordinates extracted from EXIF', ['lat' => $latitude, 'lng' => $longitude]);

                if ($latitude === null || $longitude === null) {
                    Log::warning('Invalid GPS data in photo, using default coordinates');
                    $latitude = 48.732282;
                    $longitude = 21.242572;
                }
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

            // Find or create nearest road
            Log::info('Finding nearest road');
            $road = $this->findOrCreateNearestRoad($latitude, $longitude);
            Log::info('Road found/created', ['road_id' => $road->id]);

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
            ]);

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
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'An error occurred while processing your photo. Please try again.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
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
     * Find or create the nearest road to the given coordinates
     */
    private function findOrCreateNearestRoad(float $latitude, float $longitude): Road
    {
        // Try to find nearest road by bounding box
        $nearestRoad = Road::where('bbox_min_lat', '<=', $latitude)
            ->where('bbox_max_lat', '>=', $latitude)
            ->where('bbox_min_lng', '<=', $longitude)
            ->where('bbox_max_lng', '>=', $longitude)
            ->first();

        // If found within bounding box, use it
        return $nearestRoad;
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
