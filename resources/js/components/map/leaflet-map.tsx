import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { useEffect, useCallback } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { GeoJSONRoadLayer } from './geojson-road-layer';
import { MapLegend } from './map-legend';
import { useGeoJSONLoader } from './use-geojson-loader';

interface LeafletMapProps {
    onFileLoad?: (file: File) => void;
}

export function LeafletMap({ onFileLoad }: LeafletMapProps) {
    const { appearance } = useAppearance();
    const { getFeaturesInViewport, hasData, loadGeoJSON } = useGeoJSONLoader();

    // Handle file drop/upload
    const handleFileUpload = useCallback((file: File) => {
        loadGeoJSON(file);
        onFileLoad?.(file);
    }, [loadGeoJSON, onFileLoad]);

    // Expose file upload handler globally for parent components
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as typeof window & { __mapFileUpload?: (file: File) => void }).__mapFileUpload = handleFileUpload;
        }
    }, [handleFileUpload]);

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
                center={[50.0755, 14.4378]} // Prague, Czech Republic as default
                zoom={13}
                zoomControl={false}
                className="h-full w-full"
                style={{ background: appearance === 'dark' ? '#1a1a1a' : '#f0f0f0' }}
            >
                <TileLayer url={tileUrl} attribution={attribution} />
                <ZoomControl position="bottomright" />

                {hasData && (
                    <GeoJSONRoadLayer
                        getFeaturesInViewport={getFeaturesInViewport}
                        hasData={hasData}
                    />
                )}

                <MapLegend />
            </MapContainer>
        </div>
    );
}
