import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import type { RoadCondition } from '@/types';

const CONDITION_COLORS: Record<RoadCondition, string> = {
    excellent: '#22c55e',
    good: '#eab308',
    poor: '#f97316',
    critical: '#ef4444',
};

const CONDITION_LABELS: Record<RoadCondition, string> = {
    excellent: 'Excellent',
    good: 'Good',
    poor: 'Poor',
    critical: 'Critical',
};

export function MapLegend() {
    const map = useMap();

    useEffect(() => {
        const legend = new L.Control({ position: 'bottomleft' });

        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'map-legend');
            div.style.cssText = `
                background: white;
                padding: 10px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                font-size: 13px;
                line-height: 1.5;
            `;

            div.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 6px;">Road Conditions</div>
                ${Object.entries(CONDITION_COLORS)
                    .map(
                        ([condition, color]) => `
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <div style="width: 20px; height: 3px; background: ${color}; border-radius: 2px;"></div>
                        <span>${CONDITION_LABELS[condition as RoadCondition]}</span>
                    </div>
                `
                    )
                    .join('')}
            `;

            return div;
        };

        legend.addTo(map);

        return () => {
            legend.remove();
        };
    }, [map]);

    return null;
}
