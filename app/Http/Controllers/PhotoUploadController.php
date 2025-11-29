<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Intervention\Image\Laravel\Facades\Image;
use Illuminate\Support\Facades\Storage;
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
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,jpg,png,heic|max:10240', // 10MB max
        ]);

        try {
            $file = $request->file('photo');
            $tempPath = $file->getRealPath();

            // Extract EXIF data
            $exif = @exif_read_data($tempPath);

            if (!$exif || !isset($exif['GPSLatitude']) || !isset($exif['GPSLongitude'])) {
                return response()->json([
                    'success' => false,
                    'error' => 'Location data not found in photo. Please enable location services in your camera settings and take a new photo.',
                ], 422);
            }

            // Convert EXIF GPS to decimal coordinates
            $latitude = $this->getGps($exif['GPSLatitude'], $exif['GPSLatitudeRef']);
            $longitude = $this->getGps($exif['GPSLongitude'], $exif['GPSLongitudeRef']);

            if ($latitude === null || $longitude === null) {
                return response()->json([
                    'success' => false,
                    'error' => 'Unable to read location data from photo. Please try another image with valid GPS information.',
                ], 422);
            }

            // Generate unique filename
            $filename = Str::uuid() . '.webp';
            $storagePath = 'photos/' . $filename;

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

            // Analyze image with OpenAI Vision API
            $aiAnalysis = $this->analyzeRoadCondition($tempPath);

            // Find or create nearest road
            $road = $this->findOrCreateNearestRoad($latitude, $longitude);

            // Create report in database
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

            return response()->json([
                'success' => true,
                'message' => 'Photo uploaded and analyzed successfully!',
                'latitude' => $latitude,
                'longitude' => $longitude,
                'photo_url' => $photoUrl,
                'filename' => $filename,
                'report_id' => $report->id,
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
                                'text' => 'Analyze this road image and provide a JSON response with the following fields:\n'
                                    . '- type: "crack", "pothole", or "damage"\n'
                                    . '- description: Brief description of the road condition\n'
                                    . '- condition: A score from 0.00 to 1.00 (1.00 being perfect condition)\n'
                                    . '- severity: "low", "medium", or "high"\n'
                                    . '- detected_issues: Array of specific issues found\n'
                                    . 'Only respond with valid JSON, no additional text.',
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
            ]);

            $content = $response->choices[0]->message->content;

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
        if ($nearestRoad) {
            return $nearestRoad;
        }

        // Otherwise create or get a generic road entry
        return Road::firstOrCreate(
            ['osm_id' => 'unknown'],
            [
                'name' => 'Unknown Road',
                'highway_type' => 'unclassified',
                'geometry' => [[[$longitude, $latitude]]],
                'bbox_min_lat' => $latitude - 0.001,
                'bbox_max_lat' => $latitude + 0.001,
                'bbox_min_lng' => $longitude - 0.001,
                'bbox_max_lng' => $longitude + 0.001,
                'condition' => 1.0,
            ]
        );
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
