<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use OpenAI\Laravel\Facades\OpenAI;

class OpenAIController extends Controller
{
    public static function index()
    {

        $response = OpenAI::responses()->create([
            'model' => 'gpt-5.1',
            'messages' => [
                [
                    'role' => 'user',
                    'content' =>[
                        ['type' => 'You are an expert in road and pavement conditions.

Analyze the given image and provide a structured JSON output with the following fields:

1. "road_present": a number from 0 to 1 representing the likelihood that the image shows a road (1 = definitely a road, 0 = definitely not a road).
2. "damage_type": one of the following strings only: "crack", "pothole", "damage". Use "damage" for any general damage not clearly a crack or a pothole. If there is no damage, use "none".
3. "condition_score": a number from 0 to 1 representing the condition of the road (1 = perfect, 0 = completely damaged). If road_present is close to 0, you can set this to null.
4. "confidence": a number from 0 to 1 representing how confident you are in this assessment.

Respond **only in JSON format**.'],
[
    'type'=> 'image',
    'image' => fopen(storage_path('app/public/road.png'), 'r'),

]
                    ]
                    
            ],
            ],
        ]);

            dump($response->toArray());

        return response()->json($response);
    }
}
