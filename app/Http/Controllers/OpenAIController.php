<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use OpenAI\Laravel\Facades\OpenAI;

class OpenAIController extends Controller
{
    public static function index(Request $request = null)
    {
        // If no request provided, use a test image for console command
        if ($request === null) {
            $imagePath = storage_path('app/public/road.png');

            if (!file_exists($imagePath)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Test image not found at: ' . $imagePath
                ], 404);
            }

            $base64Image = base64_encode(file_get_contents($imagePath));
            $mimeType = mime_content_type($imagePath);
        } else {
            // Validate the request has an image
            $request->validate([
                'image' => 'required|image|max:10240', // 10MB max
            ]);

            // Get the uploaded image and convert to base64
            $image = $request->file('image');
            $base64Image = base64_encode(file_get_contents($image->getRealPath()));
            $mimeType = $image->getMimeType();
        }

        // Create the response using OpenAI chat API
        $response = OpenAI::chat()->create([
            'model' => 'gpt-4o',
            'temperature' => 0,
            'response_format' => [
                'type' => 'json_schema',
                'json_schema' => [
                    'name' => 'RoadAnalysis',
                    'strict' => true,
                    'schema' => [
                        'type' => 'object',
                        'additionalProperties' => false,
                        'properties' => [
                            'road_present' => ['type' => 'number', 'minimum' => 0, 'maximum' => 1],
                            'damage_type' => ['type' => 'string', 'enum' => ['crack','pothole','damage','none']],
                            'condition_score' => ['type' => ['number','null'], 'minimum' => 0, 'maximum' => 1],
                            'confidence' => ['type' => 'number', 'minimum' => 0, 'maximum' => 1],
                        ],
                        'required' => ['road_present','damage_type','condition_score','confidence'],
                    ],
                ],
            ],
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are an expert in road and pavement conditions.
Definitions:
- "pothole": a visible depression/void with a clear rim/edge or missing material; often irregular with a shadowed interior.
- "crack": thin linear fracture(s) without missing chunks.
- "damage": scuffs, raveling, patchwork, stains, or ambiguous wear not clearly pothole/crack.
Decision rules:
- Label "pothole" only with a clear depression and rim. Shadows, stains, wet patches, or tire marks are NOT potholes.
- If road_present < 0.5, set condition_score to null and damage_type to "none".
- Use high confidence only if unambiguous; reduce confidence for poor lighting, blur, or occlusions.
Return JSON only with fields: road_present, damage_type, condition_score, confidence.'
                ],
                [
                    'role' => 'user',
                    'content' => [
                                                [
                            'type' => 'image_url',
                            'image_url' => [
                                'url' => "data:{$mimeType};base64,{$base64Image}",
                                'detail' => 'high'
                            ]
                        ],
                    ]
                ]
            ],
            'max_tokens' => 200,
        ]);

        // Extract the content from the response
        $content = $response->choices[0]->message->content ?? '';
        dump($response->toArray());
        // Parse JSON response
        $analysis = json_decode($content, true);
        if (!$analysis) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid AI response format',
                'raw_response' => $content
            ], 500);
        }

        // Success
        return response()->json([
            'success' => true,
            'analysis' => $analysis,
        ]);
    }
}
