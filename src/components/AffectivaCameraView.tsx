import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Declare global affdex to avoid TS errors
declare global {
  interface Window {
    affdex: any;
  }
}

interface AffectivaCameraViewProps {
  onEmotionsSuccess: (emotions: Record<string, number>) => void;
}

export default function AffectivaCameraView({ onEmotionsSuccess }: AffectivaCameraViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [detector, setDetector] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for the script to load if it hasn't yet (simple fallback check)
    if (typeof window === 'undefined') return;

    const initDetector = () => {
      if (!window.affdex) {
        setError("Affectiva SDK not loaded yet...");
        return;
      }
      
      if (containerRef.current && !detector) {
        setError(null);
        const w = 640;
        const h = 480;
        const faceMode = window.affdex.FaceDetectorMode.LARGE_FACES;
        
        // Initialize the Native Affectiva Camera Detector
        const det = new window.affdex.CameraDetector(containerRef.current, w, h, faceMode);
        
        det.detectAllEmotions();
        det.detectAllExpressions();
        
        det.addEventListener("onInitializeSuccess", () => {
          setIsRunning(true);
        });
        
        det.addEventListener("onWebcamConnectFailure", () => {
          setError("Webcam access denied. Please allow camera permissions.");
        });

        det.addEventListener("onImageResultsSuccess", (faces: any[]) => {
          if (faces && faces.length > 0) {
            onEmotionsSuccess(faces[0].emotions);
          }
        });

        setDetector(det);
      }
    };

    // Retry initialization a few times in case the CDN is slow
    const interval = setInterval(initDetector, 500);
    setTimeout(() => clearInterval(interval), 5000);

    return () => clearInterval(interval);
  }, [detector, onEmotionsSuccess]);

  const startCamera = () => {
    if (detector && !detector.isRunning) {
      detector.start();
    }
  };

  const stopCamera = () => {
    if (detector && detector.isRunning) {
      detector.stop();
      setIsRunning(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detector && detector.isRunning) {
        detector.stop();
      }
    };
  }, [detector]);

  return (
    <div className="space-y-4">
      <div 
        ref={containerRef} 
        className="relative rounded-xl overflow-hidden bg-secondary aspect-video flex items-center justify-center affectiva-container"
      >
        {/* Affectiva injects <video> and <canvas> directly into containerRef */}
        {!isRunning && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground z-10 bg-secondary">
            <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Click Start Camera to initialize Affectiva AI</p>
          </div>
        )}
        {error && <p className="absolute inset-0 flex items-center justify-center text-destructive text-sm px-4 text-center z-10 bg-background/80">{error}</p>}
        {isRunning && (
            <div className="absolute top-3 right-3 z-50">
              <span className="flex items-center gap-1.5 text-xs bg-destructive/80 text-destructive-foreground px-2 py-1 rounded-full shadow-md">
                <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
                AFFECTIVA LIVE
              </span>
            </div>
        )}
        
        {/* Force affectiva injected video/canvas to fit screen perfectly */}
        <style dangerouslySetInnerHTML={{__html: `
          .affectiva-container video, .affectiva-container canvas {
             width: 100% !important;
             height: 100% !important;
             object-fit: cover !important;
             position: absolute !important;
             top: 0 !important;
             left: 0 !important;
          }
        `}} />
      </div>
      <div className="flex gap-3">
        {!isRunning ? (
          <Button variant="neon" onClick={startCamera}><Camera className="w-4 h-4 mr-2" /> Start Analysis</Button>
        ) : (
          <Button variant="neon-outline" onClick={stopCamera}><CameraOff className="w-4 h-4 mr-2" /> Stop</Button>
        )}
      </div>
    </div>
  );
}
