import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { GeoJSON } from 'react-leaflet';
import type { PathOptions } from 'leaflet';
import type { RoadCondition, RoadFeatureProperties, RoadGeoJSON, ViewportBounds } from '@/types';

interface GeoJSONRoadLayerProps {
    getFeaturesInViewport: (bounds: ViewportBounds) => RoadGeoJSON | null;
    hasData: boolean;
}

// Color mapping for road conditions
const CONDITION_STYLES: Record<RoadCondition, PathOptions> = {
    excellent: {
        color: '#ef4444', // red-500
        weight: 5,
        opacity: 0.9,
    },
    good: {
        color: '#ef4444', // red-500
        weight: 5,
        opacity: 0.9,
    },
    poor: {
        color: '#ef4444', // red-500
        weight: 5,
        opacity: 0.9,
    },
    critical: {
        color: '#ef4444', // red-500
        weight: 5,
        opacity: 0.9,
    },
};

export function GeoJSONRoadLayer({ getFeaturesInViewport, hasData }: GeoJSONRoadLayerProps) {
    const map = useMap();
    const [visibleFeatures, setVisibleFeatures] = useState<RoadGeoJSON | null>(null);
    const [key, setKey] = useState(0); // Force re-render when features change

    useEffect(() => {
        // Update visible features based on viewport
        const updateVisibleFeatures = () => {
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

    if (!visibleFeatures || !visibleFeatures.features.length) {
        return null;
    }

    // Style function based on road condition
    const styleFeature = (feature: GeoJSON.Feature | undefined): PathOptions => {
        if (!feature || !feature.properties) {
            return CONDITION_STYLES.good;
        }

        const props = feature.properties as RoadFeatureProperties;
        const condition = props.condition || 'good';
        return CONDITION_STYLES[condition];
    };

    // Popup content for each feature
    const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
        if (!feature.properties) return;

        const props = feature.properties as RoadFeatureProperties;
        const popupContent = `
            <div class="p-2">
                <h3 class="font-semibold text-sm mb-1">${props.name || 'Unnamed Road'}</h3>
                <div class="text-xs space-y-1">
                    <p><span class="font-medium">Condition:</span> ${props.condition || 'Unknown'}</p>
                    <p><span class="font-medium">Severity:</span> ${((props.severity || 0) * 100).toFixed(0)}%</p>
                    ${props.lastInspected ? `<p><span class="font-medium">Last Inspected:</span> ${props.lastInspected}</p>` : ''}
                </div>
            </div>
        `;
        layer.bindPopup(popupContent);
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
