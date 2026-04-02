import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Aperture } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';

interface CameraViewProps {
  onCapture: (imageSrc: string) => void;
  overlay?: React.ReactNode;
}

export default function CameraView({ onCapture, overlay }: CameraViewProps) {
  const { videoRef, canvasRef, streaming, error, startCamera, stopCamera, captureFrame } = useCamera({ onCapture });

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden bg-secondary aspect-video flex items-center justify-center">
        {!streaming && !error && (
          <div className="text-center text-muted-foreground">
            <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Click Start Camera to begin</p>
          </div>
        )}
        {error && <p className="text-destructive text-sm px-4 text-center">{error}</p>}
        <video ref={videoRef} className={`w-full h-full object-cover ${streaming ? '' : 'hidden'}`} muted playsInline />
        {streaming && overlay}
        {streaming && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1.5 text-xs bg-destructive/80 text-destructive-foreground px-2 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
              LIVE
            </span>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex gap-3">
        {!streaming ? (
          <Button variant="neon" onClick={startCamera}><Camera className="w-4 h-4 mr-2" /> Start Camera</Button>
        ) : (
          <>
            <Button variant="neon" onClick={() => captureFrame()}><Aperture className="w-4 h-4 mr-2" /> Capture</Button>
            <Button variant="neon-outline" onClick={stopCamera}><CameraOff className="w-4 h-4 mr-2" /> Stop</Button>
          </>
        )}
      </div>
    </div>
  );
}
