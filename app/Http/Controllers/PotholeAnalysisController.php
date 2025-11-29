<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PotholeAnalysisController extends Controller
{
    public function analyze(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:10240', // 10MB max
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $image = $request->file('image');
        $base64Image = base64_encode(file_get_contents($image->getRealPath()));

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert at analyzing road conditions and identifying potholes. Analyze images and provide structured responses about pothole presence, severity, and confidence.'
                    ],
                    [
                        'role' => 'user',
                        'content' => [
                            [
                                'type' => 'text',
                                'text' => 'Analyze this image for potholes. Respond ONLY with valid JSON in this exact format: {"hasPothole": true/false, "severity": "none/low/medium/high/critical", "confidence": 0-100, "description": "brief description"}'
                            ],
                            [
                                'type' => 'image_url',
                                'image_url' => [
                                    'url' => "data:image/jpeg;base64,{$base64Image}"
                                ]
                            ]
                        ]
                    ]
                ],
                'max_tokens' => 300,
            ]);

            $result = $response->json();
            $content = $result['choices'][0]['message']['content'] ?? '';

            // Parse JSON response
            $analysis = json_decode($content, true);

            if (!$analysis) {
                throw new \Exception('Invalid AI response format');
            }

            return response()->json([
                'success' => true,
                'analysis' => $analysis,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
