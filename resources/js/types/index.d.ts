import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

// Map types
export type RoadCondition = 'excellent' | 'good' | 'poor' | 'critical';

export interface RoadFeatureProperties {
    condition: RoadCondition;
    severity: number; // 0-1 scale
    name?: string;
    lastInspected?: string;
    [key: string]: unknown;
}

export interface RoadConditionStyle {
    color: string;
    weight: number;
    opacity: number;
}

export interface ViewportBounds {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
}

export interface RoadGeoJSON extends GeoJSON.FeatureCollection {
    features: Array<GeoJSON.Feature<GeoJSON.LineString, RoadFeatureProperties>>;
}

export interface SpatialIndexItem {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    feature: GeoJSON.Feature<GeoJSON.LineString, RoadFeatureProperties>;
}
