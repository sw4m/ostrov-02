import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoadCandidate {
    id: number;
    name: string;
    distance: number;
    highway_type: string;
}

interface RoadSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    candidates: RoadCandidate[];
    photoData: {
        latitude: number;
        longitude: number;
        photo_url: string;
        ai_analysis: {
            type?: string;
            description?: string;
            condition?: number;
            severity?: string;
            detected_issues?: string[];
        };
    };
    onSuccess: (latitude: number, longitude: number, roadId?: number) => void;
}

export function RoadSelectionDialog({
    open,
    onOpenChange,
    candidates,
    photoData,
    onSuccess
}: RoadSelectionDialogProps) {
    const [selectedRoadId, setSelectedRoadId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!selectedRoadId) {
            setError('Please select a road');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch('/api/confirm-road-selection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    road_id: selectedRoadId,
                    latitude: photoData.latitude,
                    longitude: photoData.longitude,
                    photo_url: photoData.photo_url,
                    ai_analysis: photoData.ai_analysis,
                }),
            });

            const data = await response.json();

            if (data.success) {
                onSuccess(data.latitude, data.longitude, data.road_id);
                onOpenChange(false);
            } else {
                setError(data.error || 'Failed to create report. Please try again.');
            }
        } catch (err) {
            console.error('Road selection error:', err);
            setError('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Select Road
                    </DialogTitle>
                    <DialogDescription>
                        Multiple roads found nearby. Please select the correct one.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Preview image */}
                    {photoData.photo_url && (
                        <div className="relative">
                            <img
                                src={photoData.photo_url}
                                alt="Uploaded photo"
                                className="w-full rounded-lg object-cover max-h-48"
                            />
                        </div>
                    )}

                    {/* Road candidates */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Select the road shown in the photo:</p>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {candidates.map((candidate) => (
                                <button
                                    key={candidate.id}
                                    onClick={() => setSelectedRoadId(candidate.id)}
                                    className={cn(
                                        'w-full text-left p-3 rounded-lg border-2 transition-all',
                                        selectedRoadId === candidate.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50 hover:bg-accent/50'
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="font-medium">{candidate.name}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {candidate.highway_type} • {candidate.distance.toFixed(0)}m away
                                            </div>
                                        </div>
                                        {selectedRoadId === candidate.id && (
                                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        {/* <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            Cancel
                        </Button> */}
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !selectedRoadId}
                            className="flex-1 bg-primary hover:bg-primary/90"
                        >
                            {isSubmitting ? (
                                <>
                                    <Spinner className="h-4 w-4 mr-2" />
                                    Confirming...
                                </>
                            ) : (
                                'Confirm Selection'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
