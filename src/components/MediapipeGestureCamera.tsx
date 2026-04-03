import { useEffect, useRef, useState, forwardRef } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';

interface MediapipeGestureCameraProps {
  onGestureDetected: (gesture: string) => void;
}

const MediapipeGestureCamera = forwardRef<HTMLVideoElement, MediapipeGestureCameraProps>(
  ({ onGestureDetected }, forwardedRef) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [recognizer, setRecognizer] = useState<GestureRecognizer | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const requestRef = useRef<number>();

    // Forward the local video ref so the parent can access it for raw WebRecorder extraction
    useEffect(() => {
      if (!forwardedRef) return;
      if (typeof forwardedRef === 'function') {
        forwardedRef(videoRef.current);
      } else {
        forwardedRef.current = videoRef.current;
      }
    }, [forwardedRef, videoRef.current]);

    useEffect(() => {
      const initMediapipe = async () => {
        try {
          const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
          );
          const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: "/models/gesture_recognizer.task",
              delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 1
          });
          setRecognizer(gestureRecognizer);
        } catch (err) {
          console.error(err);
          setError("Failed to initialize MediaPipe models.");
        }
      };
      
      initMediapipe();
    }, []);

    const startCamera = async () => {
      if (!videoRef.current) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', () => {
          setIsRunning(true);
        });
      } catch (err) {
        setError("Camera access denied.");
      }
    };

    const stopCamera = () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
      setIsRunning(false);
    };

    const predictWebcam = async () => {
      if (videoRef.current && recognizer && isRunning) {
         let startTimeMs = performance.now();
         if (videoRef.current.currentTime > 0) {
           const results = recognizer.recognizeForVideo(videoRef.current, startTimeMs);
           if (results.gestures.length > 0) {
             const categoryName = results.gestures[0][0].categoryName;
             onGestureDetected(categoryName);
           }
         }
         requestRef.current = requestAnimationFrame(predictWebcam);
      }
    };

    useEffect(() => {
      if (isRunning) predictWebcam();
    }, [isRunning, recognizer]);

    useEffect(() => {
      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        // Stop every track so the camera light turns off when navigating away
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(t => t.stop());
          videoRef.current.srcObject = null;
        }
      };
    }, []);

    return (
      <div className="space-y-4">
        <div className="relative rounded-xl overflow-hidden bg-secondary aspect-video flex items-center justify-center">
          <video 
            ref={videoRef} 
            className={`w-full h-full object-cover ${isRunning ? 'opacity-100' : 'opacity-0'}`} 
            autoPlay 
            playsInline
          />
          {!isRunning && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground z-10">
              <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Click Start Engine to initialize tracking</p>
            </div>
          )}
          {error && <p className="absolute text-destructive text-sm px-4 text-center">{error}</p>}
        </div>
        <div className="flex gap-3">
          {!isRunning ? (
            <Button variant="neon" onClick={startCamera} disabled={!recognizer}>
              <Camera className="w-4 h-4 mr-2" /> 
              {recognizer ? "Start Matrix" : "Loading Offline Weights..."}
            </Button>
          ) : (
            <Button variant="neon-outline" onClick={stopCamera}>
              <CameraOff className="w-4 h-4 mr-2" /> Shutdown Target
            </Button>
          )}
        </div>
      </div>
    );
  }
);

MediapipeGestureCamera.displayName = "MediapipeGestureCamera";

export default MediapipeGestureCamera;
