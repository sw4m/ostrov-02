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
import { usePage } from '@inertiajs/react';
import AnnouncementDialog from './announcement-dialog';
import { json } from 'stream/consumers';

interface RoadDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    road: RoadFeatureProperties | null;
}

export function RoadDetailsDialog({ open, onOpenChange, road }: RoadDetailsDialogProps) {
    const [announcementOpen, setAnnouncementOpen] = React.useState(false)
    const [localAnnouncements, setLocalAnnouncements] = React.useState<any[]>((road?.recent_announcements ?? []) as any[])
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
    const [selectedReport, setSelectedReport] = React.useState<Report | null>(null)
    const sliderRef = React.useRef<HTMLDivElement | null>(null)
    const page = usePage<any>()
    const { auth } = page.props

    const isAdminUser = React.useMemo(() => {
        return auth?.user?.is_admin
    }, [auth])

    React.useEffect(() => {
        setLocalAnnouncements((road?.recent_announcements ?? []) as any[])
    }, [road])

    const handleCreate = (ann: any) => {
        // Normalize returned announcement shape
        const shaped = {
            id: ann.id,
            user_id: ann.user_id,
            user_name: ann.user?.name ?? ann.user_name ?? null,
            description: ann.description ?? ann.message ?? '',
            created_at: ann.created_at,
        }

        setLocalAnnouncements((s) => [shaped, ...s].slice(0, 5))
    }

    const handleImageClick = (imgUrl: string) => {
        setSelectedImage(imgUrl)
        // Try to find the report associated with this image
        const report = ((road as any)?.recent_reports as any[])?.find((r: any) => r.photo_url === imgUrl)
        if (report) {
            setSelectedReport(report)
        }
    }

    React.useEffect(() => {
        setLocalAnnouncements((road?.recent_announcements ?? []) as any[])
    }, [road])

    return (
        <>
        <Dialog open={open} onOpenChange={(v) => {
            onOpenChange(v);
        }}>
            
            <DialogContent className="sm:max-w-md">
                
                <DialogHeader>
                    <DialogTitle><p className='text-start'>{road?.name == "Unnamed Road" ? 'Unnamed Street' : 'Street ' + road?.name}</p></DialogTitle>
                                        <DialogDescription><div className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
</svg>
{(road as any)?.reports_count + " reports"}</div></DialogDescription>
                </DialogHeader>

                <hr />

                <div className="space-y-4 py-2">
                    {!road && <div className="text-sm text-muted-foreground">No road selected.</div>}

                    {road && (
                        <div className="space-y-3">
                            <div>
                                <Label className="mb-1">Condition</Label>
                                <div className="text-sm">{road.condition ?? 'Unknown'}</div>
                            </div>

                            {/* announcement slider: horizontal scroll */}
                            {localAnnouncements && localAnnouncements.length > 0 && (
                                <div>
                                    <Label className="mb-1">Announcements</Label>
                                    <div
                                        ref={sliderRef}
                                        className="w-full overflow-x-auto hide-scrollbar"
                                        style={{ WebkitOverflowScrolling: 'touch' }}
                                        onWheel={(e) => {
                                            const el = e.currentTarget as HTMLDivElement
                                            // Convert vertical wheel to horizontal scroll for desktop users
                                            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                                                el.scrollLeft += e.deltaY
                                                e.preventDefault()
                                            }
                                        }}
                                    >
                                        <div className="flex flex-col gap-2 flex-nowrap">
                                            {localAnnouncements.map((ann, index) => (
                                                <div
                                                    key={index}
                                                    className="min-w-[250px] shrink-0 p-2 rounded-md border flex flex-col justify-center bg-[#F67D3C] relative"
                                                    style={{ WebkitOverflowScrolling: 'touch' }}
                                                >
                                                    {/* show delete X if admin */}
                                                    {isAdminUser && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const tokenEl = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null
                                                                    const token = tokenEl?.getAttribute('content') || ''
                                                                    const res = await fetch(`/api/announcements/${ann.id}`, {
                                                                        method: 'DELETE',
                                                                        headers: {
                                                                            'X-CSRF-TOKEN': token,
                                                                            Accept: 'application/json',
                                                                        },
                                                                        credentials: 'same-origin',
                                                                    })
                                                                    if (!res.ok) throw new Error('Delete failed')
                                                                    setLocalAnnouncements((s) => s.filter((a) => a.id !== ann.id))
                                                                } catch (err) {
                                                                    console.error(err)
                                                                }
                                                            }}
                                                            className="absolute top-2 right-2 rounded-full bg-white text-sm w-6 h-6 flex items-center justify-center text-black"
                                                            title="Delete announcement"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                    <p className="text-sm">{ann.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <Label className="mb-1">Photos</Label>
                                <div className="flex w-full overflow-x-auto">
                                    <div className="flex gap-2">
                                        {Array.isArray((road as any)?.recent_reports) && (road as any).recent_reports.length > 0 ? (
                                            ((road as any).recent_reports as any[]).map((report, index) => (
                                                <img
                                                    key={index}
                                                    src={report.photo_url}
                                                    alt={`Road Image ${index + 1}`}
                                                    className="h-20 w-20 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                                                    onClick={() => handleImageClick(report.photo_url)}
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
                    <div className="flex flex-col md:flex-row-reverse gap-2 w-full">
                        {road && isAdminUser && (
                            <Button className="bg-primary text-white hover:bg-primary-dark" onClick={() => setAnnouncementOpen(true)}>
                                Add Announcement
                            </Button>
                        )}
                    </div>
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

            <AnnouncementDialog 
                open={announcementOpen} 
                onOpenChange={setAnnouncementOpen} 
                roadId={(road as any)?.id ?? null} 
                onCreate={handleCreate} 
            />
        </>
    );
}
