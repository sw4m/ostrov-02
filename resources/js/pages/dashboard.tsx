import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LeafletMap } from '@/components/map/leaflet-map';
import { Head } from '@inertiajs/react';
import { Upload, FileJson, Search, X } from 'lucide-react';
import { SearchResultItem } from 'nominatim-client';

export default function Dashboard() {
    const [fileName, setFileName] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number } | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setUploadedFile(file);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

            searchCity(query);
    };

    const handleResultClick = (result: SearchResultItem) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        setMapCenter({ lat, lon });
        setSearchQuery(result.display_name);
        setSearchResults([]);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <div className="relative h-screen w-full">
            <Head title="Dashboard" />

            {/* Floating controls */}
            <div className="absolute left-4 right-4 top-4 z-1000 flex flex-col gap-2 md:left-8 md:right-8 md:top-8">
                {/* Search bar */}
                <div className="relative mx-auto w-full max-w-md">
                    <div className="relative flex items-center gap-2 rounded-lg bg-background/95 p-2 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/80">
                        <Search className="ml-2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search cities..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="border-0 bg-transparent focus-visible:ring-0"
                        />
                        {searchQuery && (
                            <Button
                                onClick={clearSearch}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Search results dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute mt-2 w-full rounded-lg bg-background shadow-lg border">
                            {searchResults.map((result, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleResultClick(result)}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
                                >
                                    {result.display_name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* File upload controls */}
                <div className="mx-auto flex items-center gap-4 rounded-lg bg-background/95 p-2 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/80">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,.geojson"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <Button
                        onClick={handleButtonClick}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <Upload className="h-4 w-4" />
                        Load GeoJSON
                    </Button>
                    {fileName && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileJson className="h-4 w-4" />
                            <span>{fileName}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Map container - full screen */}
            <div className="h-full w-full">
                <LeafletMap
                    onFileLoad={(file) => setFileName(file.name)}
                    center={mapCenter}
                    uploadedFile={uploadedFile}
                />
            </div>
        </div>
    );
}

