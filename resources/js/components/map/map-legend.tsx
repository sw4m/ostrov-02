import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="bg-white/95 backdrop-blur dark:bg-neutral-900/95 rounded-lg shadow-lg border border-input/50 overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold hover:bg-accent/50 transition-colors"
            >
                <span>Legend</span>
                <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${
                        isCollapsed ? '-rotate-90' : 'rotate-0'
                    }`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${
                    isCollapsed ? 'max-h-0' : 'max-h-48'
                }`}
            >
                <div className="px-3 pb-3 space-y-2">
                    {Object.entries(CONDITION_COLORS).map(([condition, color]) => (
                        <div key={condition} className="flex items-center gap-2">
                            <div
                                className="w-5 h-0.5 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-xs">
                                {CONDITION_LABELS[condition as RoadCondition]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
