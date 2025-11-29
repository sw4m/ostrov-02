<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Road;
use Illuminate\Support\Facades\File;

class RoadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing roads
        Road::truncate();

        // Load the sample GeoJSON file
        $geoJsonPath = public_path('sample-roads.geojson');
        
        if (!File::exists($geoJsonPath)) {
            $this->command->error('Sample roads file not found!');
            return;
        }

        $geoJsonContent = File::get($geoJsonPath);
        $geoJson = json_decode($geoJsonContent, true);

        if (!isset($geoJson['features'])) {
            $this->command->error('Invalid GeoJSON format!');
            return;
        }

        foreach ($geoJson['features'] as $index => $feature) {
            $geometry = $feature['geometry'];
            $properties = $feature['properties'];

            // Calculate bounding box
            $coords = $geometry['coordinates'];
            $lats = array_column($coords, 1);
            $lngs = array_column($coords, 0);

            Road::create([
                'osm_id' => 'sample_' . $index,
                'name' => $properties['name'] ?? 'Unnamed Road',
                'condition' => $properties['severity'] ?? 0.5,
                'highway_type' => 'road',
                'geometry' => $geometry,
                'bbox_min_lat' => min($lats),
                'bbox_max_lat' => max($lats),
                'bbox_min_lng' => min($lngs),
                'bbox_max_lng' => max($lngs),
            ]);
        }

        $this->command->info('Successfully seeded ' . count($geoJson['features']) . ' roads!');
    }
}
