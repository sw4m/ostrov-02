import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LeafletMap } from '@/components/map/leaflet-map';
import { MapLegend } from '@/components/map/map-legend';
import { UploadDialog } from '@/components/upload-dialog';
import { Head } from '@inertiajs/react';
import { Search, X, Camera } from 'lucide-react';
import { SearchResultItem } from 'nominatim-client';

export default function Dashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number; zoom?: number } | null>(null);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [highlightedRoadId, setHighlightedRoadId] = useState<number | null>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const skipNextSearchRef = useRef(false);

    const searchCity = async (query: string): Promise<SearchResultItem[] | undefined> => {
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        }
    };

    useEffect(() => {
        // If we just selected a result, skip the next debounced search
        if (skipNextSearchRef.current) {
            skipNextSearchRef.current = false;
            return;
        }

        // Clear any existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Only search if query has content
        if (searchQuery.length >= 3) {
            // Set a new timer to search after 500ms of no typing
            debounceTimerRef.current = setTimeout(() => {
                searchCity(searchQuery);
            }, 500);
        }

        // Cleanup function to clear timer on unmount
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [searchQuery]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Clear results immediately if query is too short
        if (query.length < 3) {
            setSearchResults([]);
        }
    };

    const handleResultClick = (result: SearchResultItem) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        // Prevent the debounced effect from re-searching for the display name
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
        skipNextSearchRef.current = true;

        setMapCenter({ lat, lon });
        setSearchQuery(result.display_name);
        setSearchResults([]);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleUploadSuccess = (latitude: number, longitude: number, roadId?: number) => {
        setMapCenter({ lat: latitude, lon: longitude, zoom: 16 });
        if (roadId) {
            setHighlightedRoadId(roadId);
        }
    };

    return (
        <div className="relative h-screen w-full overflow-hidden">
            <Head title="" />

            {/* Fixed Search Bar - Top */}
            <div className="absolute left-0 right-0 top-0 z-50">
                <div className="relative w-full p-3">
                    <div className="relative flex items-center gap-2 rounded-lg bg-white/95 backdrop-blur border border-input/50 p-2 shadow-lg dark:bg-neutral-900/95">
                        <Search className="ml-2 h-4 w-4 text-muted-foreground shrink-0" />
                        <Input
                            type="text"
                            placeholder="Search cities..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="border-0 bg-transparent focus-visible:ring-0 px-2"
                        />
                        {searchQuery && (
                            <Button
                                onClick={clearSearch}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Search results dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute mt-2 left-3 right-3 rounded-lg bg-white/95 backdrop-blur dark:bg-neutral-900/95 shadow-xl border border-input/50 z-10 max-h-64 overflow-y-auto">
                            {searchResults.map((result, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleResultClick(result)}
                                    className="w-full px-4 py-3 text-left text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg border-b last:border-b-0"
                                >
                                    {result.display_name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Legend - Top Right */}
            <div className="absolute right-3 top-[72px] z-50 max-w-[200px]">
                <MapLegend />
            </div>

            {/* Map container - full screen */}
            <div className="absolute inset-0 z-0">
                <LeafletMap
                    onFileLoad={() => {}}
                    center={mapCenter}
                    uploadedFile={null}
                    highlightedRoadId={highlightedRoadId}
                />
            </div>

            {/* Fixed Upload Button - Bottom */}
            <div className="absolute left-0 right-0 bottom-0 z-40 p-4">
                <Button
                    onClick={() => setUploadDialogOpen(true)}
                    className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 shadow-xl"
                    size="lg"
                >
                    <Camera className="h-5 w-5 mr-2" />
                    Upload Photo with Location
                </Button>
            </div>

            {/* Upload Dialog */}
            <UploadDialog
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
                onSuccess={handleUploadSuccess}
            />
        </div>
    );
}

