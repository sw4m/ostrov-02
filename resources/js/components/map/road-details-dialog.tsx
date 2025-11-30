import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { RoadFeatureProperties } from '@/types';

interface RoadDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    road: RoadFeatureProperties | null;
}

export function RoadDetailsDialog({ open, onOpenChange, road }: RoadDetailsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(v) => {
            onOpenChange(v);
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{road?.name ?? 'Unnamed Road'}</DialogTitle>
                    <DialogDescription>{road?.reports_count ?? 'No reports'}</DialogDescription>
                </DialogHeader>

                <hr />

                <div className="space-y-4 py-2">
                    {!road && <div className="text-sm text-muted-foreground">No road selected.</div>}

                    {road && (
                        <div className="space-y-2">
                            <div className="">
                                <Label className="mb-1">Status</Label>
                                <div className="text-sm">{road.status ?? 'Unknown'}</div>
                            </div>

                            <div>
                                <Label className="mb-1">Condition</Label>
                                <div className="text-sm">{road.condition ?? 'Unknown'}</div>
                            </div>

                            {/* slider */}
                            <div className="flex w-full overflow-hidden scroll-auto">
                                <div className="ml-2 flex flex-wrap gap-2">
                                    {road.images && road.images.length > 0 ? (
                                        road.images.map((imgUrl, index) => (
                                            <img
                                                key={index}
                                                src={imgUrl}
                                                alt={`Road Image ${index + 1}`}
                                                className="h-20 w-20 object-cover rounded-md border"
                                            />
                                        ))
                                    ) : (
                                        ''
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
