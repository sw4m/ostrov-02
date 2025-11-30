import { useState, useCallback } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ReportFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (latitude: number, longitude: number, roadId?: number) => void;
    reportData: {
        report_id: number;
        latitude: number;
        longitude: number;
        photo_url: string;
        road_id?: number;
        ai_analysis: {
            type?: string;
            description?: string;
            condition?: number;
            severity?: string;
            detected_issues?: string[];
        };
    };
}

export function ReportFormDialog({
    open,
    onOpenChange,
    onSuccess,
    reportData,
}: ReportFormDialogProps) {
    const [type, setType] = useState<string>(reportData.ai_analysis.type || 'damage');
    const [description, setDescription] = useState<string>(
        reportData.ai_analysis.description || ''
    );
    const [severity, setSeverity] = useState<string>(
        reportData.ai_analysis.severity || 'medium'
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = useCallback(async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            const response = await fetch(`/api/reports/${reportData.report_id}`, {
                method: 'PUT',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    type,
                    description,
                    severity,
                }),
            });

            if (response.status === 419) {
                setError('Session expired. Please refresh the page and try again.');
                return;
            }

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess(reportData.latitude, reportData.longitude, reportData.road_id);
                    onOpenChange(false);
                }, 1500);
            } else {
                setError(data.error || 'Failed to update report. Please try again.');
            }
        } catch (err) {
            console.error('Submit error:', err);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [type, description, severity, reportData, onSuccess, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Confirm Report Details</DialogTitle>
                    <DialogDescription>
                        Review and edit the AI-analyzed information before submitting your
                        report.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Photo Preview */}
                    {reportData.photo_url && (
                        <div className="relative">
                            <img
                                src={reportData.photo_url}
                                alt="Report"
                                className="w-full rounded-lg object-cover max-h-48"
                            />
                        </div>
                    )}

                    {/* Type Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="type">Issue Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger id="type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="crack">Crack</SelectItem>
                                <SelectItem value="pothole">Pothole</SelectItem>
                                <SelectItem value="damage">General Damage</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the road condition..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    {/* Severity */}
                    <div className="space-y-2">
                        <Label htmlFor="severity">Severity</Label>
                        <Select value={severity} onValueChange={setSeverity}>
                            <SelectTrigger id="severity">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* AI Detected Issues */}
                    {reportData.ai_analysis.detected_issues &&
                        reportData.ai_analysis.detected_issues.length > 0 && (
                            <div className="space-y-2">
                                <Label>AI Detected Issues</Label>
                                <div className="flex flex-wrap gap-2">
                                    {reportData.ai_analysis.detected_issues.map(
                                        (issue, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground"
                                            >
                                                {issue}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                    {/* Condition Score */}
                    {reportData.ai_analysis.condition !== undefined && (
                        <div className="space-y-2">
                            <Label>AI Condition Score</Label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{
                                            width: `${(reportData.ai_analysis.condition || 0) * 100}%`,
                                        }}
                                    />
                                </div>
                                <span className="text-sm font-medium">
                                    {((reportData.ai_analysis.condition || 0) * 100).toFixed(
                                        0
                                    )}
                                    %
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-600">
                                Report submitted successfully!
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Message */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting || success}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || success || !description.trim()}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner className="mr-2" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Report'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
