import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { GeoJSON } from 'react-leaflet';
import type { PathOptions } from 'leaflet';
import type { RoadCondition, RoadFeatureProperties, RoadGeoJSON, ViewportBounds } from '@/types';

interface GeoJSONRoadLayerProps {
    getFeaturesInViewport: (bounds: ViewportBounds) => RoadGeoJSON | null;
    hasData: boolean;
    highlightedRoadId?: number | null;
    onFeatureClick?: (props: RoadFeatureProperties) => void;
}

// Color mapping for road conditions
const CONDITION_STYLES: Record<RoadCondition | 'unknown', PathOptions> = {
    excellent: {
        color: '#22c55e', // green-500 - excellent condition
        weight: 5,
        opacity: 0.9,
    },
    good: {
        color: '#84cc16', // lime-500 - good condition
        weight: 5,
        opacity: 0.9,
    },
    poor: {
        color: '#f97316', // orange-500 - poor condition
        weight: 5,
        opacity: 0.9,
    },
    critical: {
        color: '#ef4444', // red-500 - critical condition
        weight: 5,
        opacity: 0.9,
    },
    unknown: {
        color: '#9ca3af', // gray-400 - no data
        weight: 4,
        opacity: 0.6,
    },
};

export function GeoJSONRoadLayer({ getFeaturesInViewport, hasData, highlightedRoadId, onFeatureClick }: GeoJSONRoadLayerProps) {
    const map = useMap();
    const [visibleFeatures, setVisibleFeatures] = useState<RoadGeoJSON | null>(null);
    const [key, setKey] = useState(0); // Force re-render when features change
    const [currentZoom, setCurrentZoom] = useState(map.getZoom());

    // Minimum zoom level to show roads (adjust this value as needed)
    const MIN_ZOOM_FOR_ROADS = 14;

    useEffect(() => {
        // Update visible features based on viewport
        const updateVisibleFeatures = () => {
            const zoom = map.getZoom();
            setCurrentZoom(zoom);

            // Don't show roads if zoom level is too low
            if (zoom < MIN_ZOOM_FOR_ROADS) {
                setVisibleFeatures(null);
                return;
            }

            if (!hasData) {
                setVisibleFeatures(null);
                return;
            }

            const bounds = map.getBounds();
            const viewportBounds: ViewportBounds = {
                minLat: bounds.getSouth(),
                maxLat: bounds.getNorth(),
                minLng: bounds.getWest(),
                maxLng: bounds.getEast(),
            };

            const features = getFeaturesInViewport(viewportBounds);
            setVisibleFeatures(features);
            setKey((prev) => prev + 1); // Force GeoJSON component to re-render
        };

        // Update on map events
        map.on('moveend', updateVisibleFeatures);
        map.on('zoomend', updateVisibleFeatures);

        // Trigger initial update
        updateVisibleFeatures();

        return () => {
            map.off('moveend', updateVisibleFeatures);
            map.off('zoomend', updateVisibleFeatures);
        };
    }, [map, hasData, getFeaturesInViewport]);

    // Don't render if zoom is too low
    if (currentZoom < MIN_ZOOM_FOR_ROADS) {
        return null;
    }

    if (!visibleFeatures || !visibleFeatures.features.length) {
        return null;
    }

    // Style function based on road condition
    const styleFeature = (feature: GeoJSON.Feature | undefined): PathOptions => {
        if (!feature || !feature.properties) {
            return CONDITION_STYLES.unknown;
        }

        const props = feature.properties as RoadFeatureProperties;

        // Highlight the road that was just reported in blue
        if (highlightedRoadId && props.id === highlightedRoadId) {
            return {
                color: '#3b82f6', // blue-500
                weight: 6,
                opacity: 1,
            };
        }

        const condition = props.condition;

        // If no condition data, show as gray
        if (!condition) {
            return CONDITION_STYLES.unknown;
        }

        return CONDITION_STYLES[condition] || CONDITION_STYLES.unknown;
    };

    // Popup content for each feature
    const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
        if (!feature.properties) return;

        const props = feature.properties as RoadFeatureProperties;
        // Najskredsi if statement aky som kedy videl, neznasam laravel
        if ('on' in layer && typeof layer.on === 'function' && onFeatureClick) {
            layer.on('click', () => {
                onFeatureClick(props);
            });
        } else {
            const popupContent = `
            <div class="p-2">
                <h3 class="font-semibold text-sm mb-1"> ${props.name != "Unnamed Road" ? 'Street ' + props.name : 'Unnamed Street'}</h3>
                <div class="text-xs space-y-1">
                    <p><span class="font-medium">Condition:</span> ${props.condition || 'Unknown'}</p>
                </div>
            </div>
        `;
            layer.bindPopup(popupContent);
        }
    };

    return (
        <GeoJSON
            key={key}
            data={visibleFeatures}
            style={styleFeature}
            onEachFeature={onEachFeature}
        />
    );
}
