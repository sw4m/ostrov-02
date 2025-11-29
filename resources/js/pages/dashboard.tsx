import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { LeafletMap } from '@/components/map/leaflet-map';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Upload, FileJson } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            // Trigger map file upload via global handler
            if (typeof window !== 'undefined' && (window as any).__mapFileUpload) {
                (window as any).__mapFileUpload(file);
            }
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden rounded-xl p-4">
                {/* File upload controls */}
                <div className="flex items-center gap-4">
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

                {/* Map container */}
                <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <LeafletMap onFileLoad={(file) => setFileName(file.name)} />
                </div>
            </div>
        </AppLayout>
    );
}

