import { useState, useCallback, useRef } from 'react';
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
import { Camera, Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (latitude: number, longitude: number) => void;
}

export function UploadDialog({ open, onOpenChange, onSuccess }: UploadDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = useCallback(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsDragging(false);
        setError(null);
        setSuccess(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleFileSelect = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('Image size must be less than 10MB.');
            return;
        }

        setSelectedFile(file);
        setError(null);
        setSuccess(false);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [handleFileSelect]);

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [handleFileSelect]);

    const handleUpload = useCallback(async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('photo', selectedFile);

        try {
            const response = await fetch('/api/upload-photo', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                setError(null);

                // Wait a moment to show success message
                setTimeout(() => {
                    onSuccess(data.latitude, data.longitude);
                    onOpenChange(false);
                    resetState();
                }, 2000);
            } else {
                setError(data.error || 'Failed to upload photo. Please try again.');
            }
        } catch {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsUploading(false);
        }
    }, [selectedFile, onSuccess, onOpenChange, resetState]);

    const handleClose = useCallback(() => {
        if (!isUploading) {
            onOpenChange(false);
            setTimeout(resetState, 300); // Reset after dialog animation
        }
    }, [isUploading, onOpenChange, resetState]);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Upload Photo
                    </DialogTitle>
                    <DialogDescription>
                        Take or select a photo with location data enabled
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Drag and Drop Zone */}
                    {!previewUrl && (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={cn(
                                'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer',
                                isDragging
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                            )}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                            <p className="text-sm font-medium text-center mb-1">
                                Drop your photo here
                            </p>
                            <p className="text-xs text-muted-foreground text-center">
                                or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground text-center mt-2">
                                PNG, JPG, HEIC up to 10MB
                            </p>
                        </div>
                    )}

                    {/* Preview */}
                    {previewUrl && !success && (
                        <div className="relative">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full rounded-lg object-cover max-h-64"
                            />
                            {!isUploading && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => {
                                        resetState();
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileInputChange}
                        className="hidden"
                    />

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                <strong className="font-semibold">📍 Location Required:</strong> {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Success Alert */}
                    {success && (
                        <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                                Photo uploaded! Map centering on location...
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Action Buttons */}
                    {selectedFile && !success && (
                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={isUploading}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="flex-1 bg-primary hover:bg-primary/90"
                            >
                                {isUploading ? (
                                    <>
                                        <Spinner className="h-4 w-4 mr-2" />
                                        Analyzing with AI...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Photo
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
