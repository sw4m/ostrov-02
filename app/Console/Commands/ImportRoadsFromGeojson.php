<?php

namespace App\Console\Commands;

use App\Models\Road;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;

class ImportRoadsFromGeojson extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:roads {file}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import roads from GeoJSON or Overpass JSON export';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filePath = $this->argument('file');

        if (!File::exists($filePath)) {
            $this->error('File not found: ' . $filePath);
            return 1;
        }

        $this->info('Reading file...');
        $data = json_decode(File::get($filePath), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error('Invalid JSON file: ' . json_last_error_msg());
            return 1;
        }

        // Handle both GeoJSON and Overpass API formats
        $elements = $this->normalizeData($data);

        if (empty($elements)) {
            $this->error('No valid road elements found in file');
            return 1;
        }

        $this->info('Found ' . count($elements) . ' roads to import');
        $bar = $this->output->createProgressBar(count($elements));
        $bar->start();

        $imported = 0;
        $skipped = 0;

        DB::beginTransaction();
        try {
            foreach ($elements as $element) {
                if ($this->importRoad($element)) {
                    $imported++;
                } else {
                    $skipped++;
                }
                $bar->advance();
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            $bar->finish();
            $this->newLine(2);
            $this->error('Import failed: ' . $e->getMessage());
            return 1;
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("Import completed!");
        $this->info("Imported: {$imported}");
        $this->info("Skipped: {$skipped}");

        return 0;
    }

    /**
     * Normalize data from different formats (GeoJSON features or Overpass elements)
     */
    private function normalizeData(array $data): array
    {
        // GeoJSON format
        if (isset($data['type']) && $data['type'] === 'FeatureCollection' && isset($data['features'])) {
            return $data['features'];
        }

        // Overpass API format
        if (isset($data['elements'])) {
            return $data['elements'];
        }

        return [];
    }

    /**
     * Import a single road element
     */
    private function importRoad(array $element): bool
    {
        // Handle GeoJSON Feature format
        if (isset($element['type']) && $element['type'] === 'Feature') {
            $properties = $element['properties'] ?? [];
            $geometry = $element['geometry'] ?? [];

            if ($geometry['type'] !== 'LineString' || empty($geometry['coordinates'])) {
                return false;
            }

            $osmId = $properties['@id'] ?? $properties['id'] ?? null;
            if (!$osmId) {
                return false;
            }

            $coordinates = $this->geoJsonToOverpass($geometry['coordinates']);

            return $this->saveRoad(
                $osmId,
                $properties['name'] ?? 'Unnamed Road',
                $properties['highway'] ?? 'unknown',
                $coordinates
            );
        }

        // Handle Overpass API format
        if (isset($element['type']) && $element['type'] === 'way' && isset($element['geometry'])) {
            $tags = $element['tags'] ?? [];
            $geometry = $element['geometry'] ?? [];

            if (empty($geometry)) {
                return false;
            }

            return $this->saveRoad(
                $element['id'],
                $tags['name'] ?? 'Unnamed Road',
                $tags['highway'] ?? 'unknown',
                $geometry
            );
        }

        return false;
    }

    /**
     * Convert GeoJSON coordinates [lng, lat] to Overpass format [{lat, lon}]
     */
    private function geoJsonToOverpass(array $coordinates): array
    {
        return array_map(function($coord) {
            return [
                'lat' => $coord[1],
                'lon' => $coord[0]
            ];
        }, $coordinates);
    }

    /**
     * Save road to database
     */
    private function saveRoad(string $osmId, string $name, string $highwayType, array $geometry): bool
    {
        if (empty($geometry)) {
            return false;
        }

        // Calculate bounding box
        $lats = array_column($geometry, 'lat');
        $lons = array_column($geometry, 'lon');

        Road::updateOrCreate(
            ['osm_id' => $osmId],
            [
                'name' => $name,
                'highway_type' => $highwayType,
                'geometry' => $geometry,
                'bbox_min_lat' => min($lats),
                'bbox_max_lat' => max($lats),
                'bbox_min_lng' => min($lons),
                'bbox_max_lng' => max($lons),
            ]
        );

        return true;
    }
}
