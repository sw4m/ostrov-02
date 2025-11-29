import { useState, useCallback, useMemo } from 'react';
import RBush from 'rbush';
import type { RoadGeoJSON, SpatialIndexItem, ViewportBounds } from '@/types';

export function useGeoJSONLoader() {
    const [geoJsonData, setGeoJsonData] = useState<RoadGeoJSON | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create spatial index using RBush
    const spatialIndex = useMemo(() => {
        if (!geoJsonData) return null;

        const tree = new RBush<SpatialIndexItem>();
        const items: SpatialIndexItem[] = [];

        geoJsonData.features.forEach((feature) => {
            if (feature.geometry.type === 'LineString') {
                const coords = feature.geometry.coordinates;

                // Calculate bounding box for the LineString
                let minX = Infinity;
                let minY = Infinity;
                let maxX = -Infinity;
                let maxY = -Infinity;

                coords.forEach(([lng, lat]) => {
                    minX = Math.min(minX, lng);
                    minY = Math.min(minY, lat);
                    maxX = Math.max(maxX, lng);
                    maxY = Math.max(maxY, lat);
                });

                items.push({
                    minX,
                    minY,
                    maxX,
                    maxY,
                    feature,
                });
            }
        });

        tree.load(items);
        return tree;
    }, [geoJsonData]);

    // Load GeoJSON from database via API
    const loadRoadsFromDatabase = useCallback(async (bounds: ViewportBounds) => {
        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                minLat: bounds.minLat.toString(),
                maxLat: bounds.maxLat.toString(),
                minLng: bounds.minLng.toString(),
                maxLng: bounds.maxLng.toString(),
            });

            const response = await fetch(`/api/roads?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch roads: ${response.statusText}`);
            }

            const json = (await response.json()) as RoadGeoJSON;

            console.log('Loaded roads from database:', json.features?.length || 0, 'features');

            // Validate GeoJSON structure
            if (!json.type || json.type !== 'FeatureCollection') {
                throw new Error('Invalid GeoJSON: Must be a FeatureCollection');
            }

            if (!Array.isArray(json.features)) {
                throw new Error('Invalid GeoJSON: Missing features array');
            }

            setGeoJsonData(json);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load roads from database';
            setError(message);
            console.error('Database roads loading error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load GeoJSON from file
    const loadGeoJSON = useCallback(async (file: File) => {
        setIsLoading(true);
        setError(null);

        try {
            const text = await file.text();
            const json = JSON.parse(text) as RoadGeoJSON;

            // Validate GeoJSON structure
            if (!json.type || json.type !== 'FeatureCollection') {
                throw new Error('Invalid GeoJSON: Must be a FeatureCollection');
            }

            if (!Array.isArray(json.features)) {
                throw new Error('Invalid GeoJSON: Missing features array');
            }

            setGeoJsonData(json);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load GeoJSON';
            setError(message);
            console.error('GeoJSON loading error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Query features within viewport bounds
    const getFeaturesInViewport = useCallback(
        (bounds: ViewportBounds): RoadGeoJSON | null => {
            if (!spatialIndex || !geoJsonData) return null;

            const results = spatialIndex.search({
                minX: bounds.minLng,
                minY: bounds.minLat,
                maxX: bounds.maxLng,
                maxY: bounds.maxLat,
            });

            return {
                type: 'FeatureCollection',
                features: results.map((item) => item.feature),
            };
        },
        [spatialIndex, geoJsonData]
    );

    // Clear loaded data
    const clearGeoJSON = useCallback(() => {
        setGeoJsonData(null);
        setError(null);
    }, []);

    return {
        geoJsonData,
        isLoading,
        error,
        loadGeoJSON,
        loadRoadsFromDatabase,
        getFeaturesInViewport,
        clearGeoJSON,
        hasData: !!geoJsonData,
    };
}
