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
  onContainerReady?: (container: HTMLDivElement) => void;
}

export default function AffectivaCameraView({ onEmotionsSuccess, onContainerReady }: AffectivaCameraViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [detector, setDetector] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cleanup on unmount only — do NOT auto-start
  useEffect(() => {
    return () => {
      if (detector) {
        try { detector.stop(); } catch (_) {}
      }
    };
  }, [detector]);

  const [sdkLoading, setSdkLoading] = useState(false);

  const loadAffdexScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.affdex) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://download.affectiva.com/js/3.2.1/affdex.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Affectiva SDK'));
      document.head.appendChild(script);
    });
  };

  const startCamera = async () => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    if (!window.affdex) {
      setSdkLoading(true);
      setError(null);
      try {
        await loadAffdexScript();
      } catch {
        setError('Failed to load Affectiva SDK. Check your internet connection.');
        setSdkLoading(false);
        return;
      }
      setSdkLoading(false);
    }

    setError(null);
    const w = 640;
    const h = 480;
    const faceMode = window.affdex.FaceDetectorMode.LARGE_FACES;
    const det = new window.affdex.CameraDetector(containerRef.current, w, h, faceMode);

    det.detectAllEmotions();
    det.detectAllExpressions();

    det.addEventListener('onInitializeSuccess', () => {
      setIsRunning(true);
      // Notify parent so it can access the injected video element
      if (onContainerReady && containerRef.current) {
        onContainerReady(containerRef.current);
      }
    });

    det.addEventListener('onWebcamConnectFailure', () => {
      setError('Webcam access denied. Please allow camera permissions.');
      setIsRunning(false);
    });

    det.addEventListener('onImageResultsSuccess', (faces: any[]) => {
      if (faces && faces.length > 0) {
        onEmotionsSuccess(faces[0].emotions);
      }
    });

    setDetector(det);
    det.start();
  };

  const stopCamera = () => {
    if (detector) {
      try { detector.stop(); } catch (_) {}
      setIsRunning(false);
      setDetector(null);
    }
  };

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
          <Button variant="neon" onClick={startCamera} disabled={sdkLoading}>
            {sdkLoading ? (
              <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" /> Loading SDK...</>
            ) : (
              <><Camera className="w-4 h-4 mr-2" /> Start Analysis</>
            )}
          </Button>
        ) : (
          <Button variant="neon-outline" onClick={stopCamera}><CameraOff className="w-4 h-4 mr-2" /> Stop</Button>
        )}
      </div>
    </div>
  );
}
