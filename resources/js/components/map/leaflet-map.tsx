import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { GeoJSONRoadLayer } from './geojson-road-layer';
import { useGeoJSONLoader } from './use-geojson-loader';

interface LeafletMapProps {
    onFileLoad?: (file: File) => void;
    center?: { lat: number; lon: number; zoom?: number } | null;
    uploadedFile?: File | null;
    highlightedRoadId?: number | null;
}

// Component to handle map navigation and database loading
function MapController({
    center,
    loadRoadsFromDatabase
}: {
    center?: { lat: number; lon: number; zoom?: number } | null;
    loadRoadsFromDatabase: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void;
}) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            const zoom = center.zoom ?? 13;
            map.setView([center.lat, center.lon], zoom);
        }
    }, [center, map]);

    // Load roads from database when map is ready
    useEffect(() => {
        const loadInitialRoads = () => {
            const bounds = map.getBounds();
            loadRoadsFromDatabase({
                minLat: bounds.getSouth(),
                maxLat: bounds.getNorth(),
                minLng: bounds.getWest(),
                maxLng: bounds.getEast(),
            });
        };

        // Wait for map to be ready
        map.whenReady(() => {
            loadInitialRoads();
        });

        // Reload on significant map movements
        const handleMoveEnd = () => {
            const bounds = map.getBounds();
            loadRoadsFromDatabase({
                minLat: bounds.getSouth(),
                maxLat: bounds.getNorth(),
                minLng: bounds.getWest(),
                maxLng: bounds.getEast(),
            });
        };

        map.on('moveend', handleMoveEnd);

        return () => {
            map.off('moveend', handleMoveEnd);
        };
    }, [map, loadRoadsFromDatabase]);

    return null;
}

export function LeafletMap({ onFileLoad, center, uploadedFile, highlightedRoadId }: LeafletMapProps) {
    const { appearance } = useAppearance();
    const { getFeaturesInViewport, hasData, loadGeoJSON, loadRoadsFromDatabase } = useGeoJSONLoader();

    // Handle file upload from props
    useEffect(() => {
        if (uploadedFile) {
            loadGeoJSON(uploadedFile);
            onFileLoad?.(uploadedFile);
        }
    }, [uploadedFile, loadGeoJSON, onFileLoad]);

    // Tile layer URLs for light and dark modes
    const tileUrl =
        appearance === 'dark'
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const attribution =
        appearance === 'dark'
            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    return (
        <div className="relative h-full w-full">
            <MapContainer
                center={[48.713950, 21.258081]}
                zoom={13}
                zoomControl={false}
                className="h-full w-full"
                style={{ background: appearance === 'dark' ? '#1a1a1a' : '#f0f0f0' }}
            >
                <MapController center={center} loadRoadsFromDatabase={loadRoadsFromDatabase} />
                <TileLayer url={tileUrl} attribution={attribution} />

                {hasData && (
                    <GeoJSONRoadLayer
                        getFeaturesInViewport={getFeaturesInViewport}
                        hasData={hasData}
                        highlightedRoadId={highlightedRoadId}
                    />
                )}
            </MapContainer>
        </div >
    );
}
