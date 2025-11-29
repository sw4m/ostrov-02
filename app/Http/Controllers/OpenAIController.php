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
            'messages' => [
                [
                    'role' => 'system',
<<<<<<< HEAD
                    'content' => 'You are an expert in road and pavement conditions.
=======
                    'content' => 'You are an expert in road and pavement conditions. Analyze images and provide structured JSON responses.'
                ],
                [
                    'role' => 'user',
                    'content' => [
                        [
                            'type' => 'text',
                            'text' => 'You are an expert in road and pavement conditions.
>>>>>>> eee1a31 (prompt fix)

Analyze the given image and provide a structured JSON output with the following fields:

1. "road_present": a number from 0 to 1 representing the likelihood that the image shows a road (1 = definitely a road, 0 = definitely not a road).
2. "damage_type": one of the following strings only: "crack", "pothole", "damage". Use "damage" for any general damage not clearly a crack or a pothole. If there is no damage, use "none".
3. "condition_score": a number from 0 to 1 representing the condition of the road (1 = perfect, 0 = completely damaged). If road_present is close to 0, you can set this to null.
4. "confidence": a number from 0 to 1 representing how confident you are in this assessment.

Respond **only in JSON format**.'
<<<<<<< HEAD
                ],
                [
                    'role' => 'user',
                    'content' => [
                                                [
=======
                        ],
                        [
>>>>>>> eee1a31 (prompt fix)
                            'type' => 'image_url',
                            'image_url' => [
                                'url' => "data:{$mimeType};base64,{$base64Image}"
                            ]
<<<<<<< HEAD
                        ],
=======
                        ]
>>>>>>> eee1a31 (prompt fix)
                    ]
                ]
            ],
            'max_tokens' => 300,
        ]);

        // Extract the content from the response
        $content = $response->choices[0]->message->content ?? '';
<<<<<<< HEAD

        // Parse JSON response
        $analysis = json_decode($content, true);
        dump($response->toArray());
        if (!$analysis) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid AI response format',
                'raw_response' => $content
            ], 500);
        }

=======

        // Parse JSON response
        $analysis = json_decode($content, true);

        if (!$analysis) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid AI response format',
                'raw_response' => $content
            ], 500);
        }

        return response()->json([
            'success' => true,
            'analysis' => $analysis
        ]);
>>>>>>> eee1a31 (prompt fix)
    }
}
