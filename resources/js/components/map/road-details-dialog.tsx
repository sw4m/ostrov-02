import * as React from 'react'
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
import type { RoadFeatureProperties, Report } from '@/types';
import { useState } from 'react';

interface RoadDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    road: RoadFeatureProperties | null;
}

export function RoadDetailsDialog({ open, onOpenChange, road }: RoadDetailsDialogProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    const handleImageClick = (imgUrl: string) => {
        setSelectedImage(imgUrl);
        // Find the report that matches this image
        const report = road?.reports?.find(r => r.photo_url === imgUrl);
        setSelectedReport(report || null);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={(v) => {
                onOpenChange(v);
                if (!v) setSelectedImage(null);
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{road?.name ?? 'Unnamed Road'}</DialogTitle>
                        <DialogDescription>
                            {road?.reports_count ? `${road.reports_count} report${road.reports_count !== 1 ? 's' : ''}` : 'No reports'}
                        </DialogDescription>
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

                                <div>
                                    <Label className="mb-1">Photos</Label>
                                    <div className="flex w-full overflow-x-auto">
                                        <div className="flex gap-2">
                                            {road.images && road.images.length > 0 ? (
                                                road.images.map((imgUrl, index) => (
                                                    <img
                                                        key={index}
                                                        src={imgUrl}
                                                        alt={`Road Image ${index + 1}`}
                                                        className="h-20 w-20 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                                                        onClick={() => handleImageClick(imgUrl)}
                                                    />
                                                ))
                                            ) : (
                                                <div className="text-sm text-muted-foreground">No photos yet</div>
                                            )}
                                        </div>
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

            {/* Full-size image viewer */}
            <Dialog open={!!selectedImage} onOpenChange={(v) => {
                if (!v) {
                    setSelectedImage(null);
                    setSelectedReport(null);
                }
            }}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Photo Details</DialogTitle>
                    </DialogHeader>
                    {selectedImage && (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <img
                                    src={selectedImage}
                                    alt="Full size road image"
                                    className="max-w-full max-h-[60vh] object-contain rounded-md"
                                />
                            </div>

                            {selectedReport && (
                                <div className="border-t pt-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Type</Label>
                                            <div className="text-sm font-medium capitalize">{selectedReport.type}</div>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Condition Score</Label>
                                            <div className="text-sm font-medium">
                                                {selectedReport.condition !== null && selectedReport.condition !== undefined
                                                    ? `${(selectedReport.condition * 100).toFixed(0)}%`
                                                    : 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Reported</Label>
                                            <div className="text-sm font-medium">
                                                {new Date(selectedReport.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    {selectedReport.description && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Description</Label>
                                            <div className="text-sm">{selectedReport.description}</div>
                                        </div>
                                    )}

                                    {selectedReport.ai_analysis && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">AI Analysis</Label>
                                            <div className="text-sm space-y-1">
                                                {selectedReport.ai_analysis.description && (
                                                    <div><span className="font-medium">Description:</span> {selectedReport.ai_analysis.description}</div>
                                                )}
                                                {selectedReport.ai_analysis.severity && (
                                                    <div><span className="font-medium">Severity:</span> <span className="capitalize">{selectedReport.ai_analysis.severity}</span></div>
                                                )}
                                                {selectedReport.ai_analysis.detected_issues && selectedReport.ai_analysis.detected_issues.length > 0 && (
                                                    <div>
                                                        <span className="font-medium">Detected Issues:</span>
                                                        <ul className="list-disc list-inside ml-2">
                                                            {selectedReport.ai_analysis.detected_issues.map((issue, idx) => (
                                                                <li key={idx}>{issue}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                        <div>
                                            <span className="font-medium">Latitude:</span> {Number(selectedReport.latitude).toFixed(6)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Longitude:</span> {Number(selectedReport.longitude).toFixed(6)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setSelectedImage(null);
                            setSelectedReport(null);
                        }}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
