"use client";

// Imported only on the client (see page.tsx dynamic import) because
// react-media-recorder -> extendable-media-recorder spawns an audio Worker at
// module evaluation, which crashes SSR/prerendering on Node.
import { useEffect, useRef } from "react";
import {
    MicIcon, UploadCloudIcon, RotateCwIcon, PlayIcon, EqualSquareIcon, PauseIcon, Loader2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReactMediaRecorder } from "react-media-recorder";

// Helper component for live video preview during recording
export const VideoPreview = ({ stream }: { stream: MediaStream | null }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);
    if (!stream) return null;
    return <video ref={videoRef} autoPlay muted className="w-full h-full object-cover rounded-xl bg-black" />;
};

// Reusable Recorder Component for both Tabs
export const RecorderCard = ({ onSave, isProcessing, label = "Record Now", isPersonal = false }: any) => {
    const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl, previewStream, pauseRecording, resumeRecording } = useReactMediaRecorder({ video: true });

    // Instead of directly using blobUrl, we'll convert it to a file.
    const handleSave = async () => {
        if (!mediaBlobUrl) return;
        const res = await fetch(mediaBlobUrl);
        const blob = await res.blob();
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: "video/webm" });
        await onSave(file);
        clearBlobUrl();
    };

    if (mediaBlobUrl) {
        // Preview recorded video
        return (
            <div className="flex-1 flex flex-col p-4 border border-border rounded-rounded-2xl transition-colors bg-card shadow-sm h-64">
                <div className="flex-1 relative rounded-xl overflow-hidden bg-black mb-4">
                    <video src={mediaBlobUrl} controls className="w-full h-full object-contain" />
                </div>
                <div className="flex gap-2 shrink-0">
                    <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700 bg-background hover:bg-red-50" onClick={clearBlobUrl} disabled={isProcessing}>
                        <RotateCwIcon className="w-4 h-4 mr-2" /> Discard
                    </Button>
                    <Button className="flex-1 bg-primary text-white" onClick={handleSave} disabled={isProcessing}>
                        {isProcessing ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloudIcon className="w-4 h-4 mr-2" />}
                        {isProcessing ? "Uploading..." : "Save Recording"}
                    </Button>
                </div>
            </div>
        );
    }

    if (status === "recording" || status === "paused") {
        // Live recording view
        return (
            <div className="flex-1 flex flex-col p-4 border-2 border-primary/50 rounded-rounded-2xl transition-colors bg-card shadow-sm h-64">
                <div className="flex-1 relative rounded-xl overflow-hidden bg-black mb-4 flex items-center justify-center">
                    <VideoPreview stream={previewStream} />
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold font-mono">
                        <div className={`w-2.5 h-2.5 rounded-full ${status === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`} />
                        {status === 'recording' ? 'REC' : 'PAUSED'}
                    </div>
                </div>
                <div className="flex gap-2 shrink-0 justify-center">
                    {status === "recording" ? (
                        <Button variant="outline" size="sm" onClick={pauseRecording} className="gap-1 bg-background text-foreground"><PauseIcon className="w-4 h-4" /> Pause</Button>
                    ) : (
                        <Button variant="outline" size="sm" onClick={resumeRecording} className="gap-1 bg-background text-foreground"><PlayIcon className="w-4 h-4" /> Resume</Button>
                    )}
                    <Button variant="outline" size="sm" onClick={stopRecording} className="gap-1 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"><EqualSquareIcon className="w-4 h-4" /> Stop</Button>
                </div>
            </div>
        );
    }

    // Default CTA
    return (
        <div
            onClick={startRecording}
            className={`flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl hover:border-primary/50 transition-colors bg-muted/10 cursor-pointer ${isPersonal ? "h-48" : "h-64"}`}
        >
            <MicIcon className="w-10 h-10 text-muted-foreground mb-4" />
            <h4 className="font-semibold text-foreground text-lg">{label}</h4>
            <p className="text-sm text-muted-foreground text-center mt-1">Start recording directly from your browser</p>
        </div>
    );
};
