import { useRef, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/useCamera';

interface LiveFaceCameraProps {
  mode: 'register' | 'live';
  onRegisterFrame: (descriptor: Float32Array) => void;
  registeredProfiles: faceapi.LabeledFaceDescriptors[];
  isRegistering: boolean;
}

export default function LiveFaceCamera({ mode, onRegisterFrame, registeredProfiles, isRegistering }: LiveFaceCameraProps) {
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const { videoRef, streaming, error, startCamera, stopCamera } = useCamera({ onCapture: () => {} });
  
  useEffect(() => {
    if (!streaming || !videoRef.current || !overlayRef.current) return;
    
    let active = true;
    let animationFrameId: number;
    const video = videoRef.current;
    const canvas = overlayRef.current;
    
    const faceMatcher = registeredProfiles.length > 0 
      ? new faceapi.FaceMatcher(registeredProfiles, 0.5) 
      : null;

    const detectLoop = async () => {
      if (!active || video.paused || video.ended) return;

      // Handle video dimensions when ready
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
          faceapi.matchDimensions(canvas, displaySize);
        }

        if (mode === 'live') {
          const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 });
          const detections = await faceapi.detectAllFaces(video, options)
            .withFaceLandmarks()
            .withFaceDescriptors();
            
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
          
          resizedDetections.forEach((d) => {
            const result = faceMatcher ? faceMatcher.findBestMatch(d.descriptor) : new faceapi.FaceMatch('Unknown', d.detection.score);
            const box = d.detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, { 
              label: result.toString(),
              boxColor: result.label === 'Unknown' ? 'red' : '#00ff00' 
            });
            drawBox.draw(canvas);
          });
        } else if (mode === 'register' && isRegistering) {
          const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 });
          const detection = await faceapi.detectSingleFace(video, options)
            .withFaceLandmarks()
            .withFaceDescriptor();
            
          if (detection) {
            const resized = faceapi.resizeResults(detection, displaySize);
            canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resized);
            faceapi.draw.drawFaceLandmarks(canvas, resized);
            onRegisterFrame(detection.descriptor);
          } else {
             canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
          }
        } else {
          canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      
      animationFrameId = requestAnimationFrame(detectLoop);
    };

    video.addEventListener('play', detectLoop);
    // Since video might already be playing when mode changes, trigger loop
    if (!video.paused) detectLoop();

    return () => {
      active = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      video.removeEventListener('play', detectLoop);
    };
  }, [streaming, mode, isRegistering, registeredProfiles, onRegisterFrame]);

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden bg-secondary aspect-video flex items-center justify-center">
        {!streaming && !error && (
          <div className="text-center text-muted-foreground">
            <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Click Start Camera to begin detection</p>
          </div>
        )}
        {error && <p className="text-destructive text-sm px-4 text-center">{error}</p>}
        <video 
          ref={videoRef} 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: streaming ? 1 : 0 }}
          muted 
          playsInline 
        />
        <canvas 
          ref={overlayRef} 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10" 
        />
        {streaming && (
          <div className="absolute top-3 right-3 z-20">
            <span className="flex items-center gap-1.5 text-xs bg-destructive/80 text-destructive-foreground px-2 py-1 rounded-full shadow-lg">
              <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
              LIVE
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        {!streaming ? (
          <Button variant="neon" onClick={startCamera}>
            <Camera className="w-4 h-4 mr-2" /> Start Camera
          </Button>
        ) : (
          <Button variant="neon-outline" onClick={stopCamera}>
            <CameraOff className="w-4 h-4 mr-2" /> Stop Camera
          </Button>
        )}
      </div>
    </div>
  );
}
