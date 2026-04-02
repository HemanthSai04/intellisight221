import { useState, useRef, useCallback } from 'react';
import { Hand, Video, Download, Image as ImageIcon, Film, Trash2 } from 'lucide-react';
import ModuleLayout from '@/components/ModuleLayout';
import MediapipeGestureCamera from '@/components/MediapipeGestureCamera';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const uiMap: Record<string, { label: string; action: string; color: string }> = {
  'Victory': { label: '✌️ Peace Sign', action: 'Capturing Screenshot...', color: 'bg-primary/20 text-primary' },
  'Closed_Fist': { label: '👊 Fist', action: 'Starting Screen Recording...', color: 'bg-destructive/20 text-destructive' },
  'Open_Palm': { label: '🖐️ Open Palm', action: 'Stopping Recording System...', color: 'bg-success/20 text-success' },
  'Thumb_Up': { label: '👍 Thumbs Up', action: 'Confirm Active', color: 'bg-warning/20 text-warning' },
  'Thumb_Down': { label: '👎 Thumbs Down', action: 'Reject Active', color: 'bg-muted text-muted-foreground' },
  'Pointing_Up': { label: '👆 Pointing Up', action: 'Scrolling Up', color: 'bg-blue-500/20 text-blue-400' },
  'None': { label: 'Waiting...', action: 'No Gesture', color: 'bg-secondary text-secondary-foreground'}
};

interface CapturedMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
  timestamp: string;
}

export default function GestureModule() {
  const [detectedGesture, setDetectedGesture] = useState<string | null>(null);
  const [log, setLog] = useState<{ gesture: string; action: string; time: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaGallery, setMediaGallery] = useState<CapturedMedia[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const lastCapturedGesture = useRef<string | null>(null);
  const cooldownRef = useRef<boolean>(false);

  // Helper to force local browser downloads manually when requested by user
  const forceDownloadFile = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
  };

  const addMediaToGallery = (type: 'image' | 'video', url: string, name: string) => {
    setMediaGallery(prev => [{
      id: Math.random().toString(36).substring(7),
      type,
      url,
      name,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev]);
  };
  
  const deleteMedia = (id: string, url: string) => {
    setMediaGallery(prev => prev.filter(m => m.id !== id));
    // Clean up memory
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
    toast.success("Media deleted successfully from gallery");
  };

  const handleScreenshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png'); // Strictly forcing PNG format
      const filename = `IntelliSight_Screenshot_${new Date().getTime()}.png`;
      addMediaToGallery('image', dataUrl, filename);
      toast.success("Screenshot saved to UI Gallery (PNG)");
    }
  };

  const startRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    if (isRecording) return;
    
    recordedChunks.current = [];
    const stream = videoRef.current.srcObject as MediaStream;
    try {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const filename = `IntelliSight_Recording_${new Date().getTime()}.webm`;
        addMediaToGallery('video', url, filename);
        toast.success("Video recording saved to UI Gallery");
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      toast("Recording Initiated...");
    } catch (e) {
      console.error(e);
      toast.error("Failed to begin background recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleGestureDetected = useCallback((gestureName: string) => {
    if (gestureName === 'None' || gestureName === '') return;
    
    if (gestureName !== lastCapturedGesture.current && !cooldownRef.current) {
      lastCapturedGesture.current = gestureName;
      setDetectedGesture(gestureName);
      
      const mapped = uiMap[gestureName];
      if (mapped) {
        setLog(prev => [{ gesture: mapped.label, action: mapped.action, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 19)]);
        
        cooldownRef.current = true;
        
        if (gestureName === 'Victory') {
          handleScreenshot();
        } else if (gestureName === 'Closed_Fist') {
          startRecording();
        } else if (gestureName === 'Open_Palm') {
          stopRecording();
        }
        
        setTimeout(() => {
          cooldownRef.current = false;
          setDetectedGesture(null);
          lastCapturedGesture.current = null;
        }, 2500);
      }
    }
  }, [isRecording]);

  const activeUI = detectedGesture ? uiMap[detectedGesture] : null;

  return (
    <ModuleLayout title="MediaPipe Gesture Engine" description="Real-time physical hand tracking bound directly to localized media export subsystems" icon={<Hand className="w-6 h-6 text-primary" />}>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="relative">
             <MediapipeGestureCamera ref={videoRef} onGestureDetected={handleGestureDetected} />
             {isRecording && (
                <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-xs font-bold animate-pulse flex items-center gap-2 shadow-lg shadow-destructive/20 border border-white/20">
                  <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                  REC
                </div>
             )}
          </div>

          <div className="glass-card p-5">
            <h4 className="font-display font-semibold text-foreground mb-4 uppercase tracking-wider text-xs">Active Neural Bindings</h4>
            <div className="space-y-3">
                <div className="flex items-center text-sm border border-white/10 p-3 rounded-lg bg-secondary/80 hover:bg-secondary transition-colors">
                  <span className="w-8 flex justify-center text-2xl">✌️</span>
                  <span className="flex-1 ml-3 font-semibold tracking-wide">Victory / Peace</span>
                  <span className="px-3 py-1 rounded bg-primary/20 text-primary text-xs font-bold border border-primary/20">Save Screenshot to Gallery</span>
                </div>
                <div className="flex items-center text-sm border border-white/10 p-3 rounded-lg bg-secondary/80 hover:bg-secondary transition-colors">
                  <span className="w-8 flex justify-center text-2xl">👊</span>
                  <span className="flex-1 ml-3 font-semibold tracking-wide">Closed Fist</span>
                  <span className="px-3 py-1 rounded bg-destructive/20 text-destructive text-xs font-bold border border-destructive/20">Start Video Recording</span>
                </div>
                <div className="flex items-center text-sm border border-white/10 p-3 rounded-lg bg-secondary/80 hover:bg-secondary transition-colors">
                  <span className="w-8 flex justify-center text-2xl">🖐️</span>
                  <span className="flex-1 ml-3 font-semibold tracking-wide">Open Palm</span>
                  <span className="px-3 py-1 rounded bg-success/20 text-success text-xs font-bold border border-success/20">Stop & Save Video to Gallery</span>
                </div>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {activeUI && (
              <motion.div key={activeUI.label} initial={{ opacity: 0, scale: 0.95 }} flex-shrink-0 animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className={`glass-card p-6 text-center shadow-lg border-2 ${activeUI.color.split(' ')[1].replace('text-', 'border-')}`}>
                <p className="text-6xl mb-2 drop-shadow-md">{activeUI.label.split(' ')[0]}</p>
                <p className="font-display text-2xl font-bold text-foreground mt-3">{activeUI.label.split(' ').slice(1).join(' ')}</p>
                <p className={`text-md mt-2 font-bold tracking-wider uppercase ${activeUI.color.split(' ')[1]}`}>→ {activeUI.action}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div>
             <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center justify-between">
                Captured Media Gallery
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">{mediaGallery.length} Items</span>
             </h3>
             {mediaGallery.length === 0 ? (
                <div className="glass-card p-8 text-center text-muted-foreground opacity-50 bg-secondary/30">
                  <p className="text-sm">Perform a physical gesture to automatically capture and append media.</p>
                </div>
             ) : (
               <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 pb-2">
                  <AnimatePresence>
                    {mediaGallery.map(media => (
                      <motion.div key={media.id} initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }} className="relative glass-card overflow-hidden group border border-white/5">
                        
                        <button 
                           onClick={() => deleteMedia(media.id, media.url)}
                           className="absolute top-2 right-2 bg-black/60 p-2 rounded-xl text-white/70 hover:text-destructive hover:bg-black/80 transition-all z-20 shadow-md opacity-0 group-hover:opacity-100"
                           title="Delete Media"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>

                        {media.type === 'image' ? (
                           <img src={media.url} alt="Screenshot" className="w-full aspect-video object-cover" />
                        ) : (
                           <video src={media.url} className="w-full aspect-video object-cover" controls />
                        )}
                        <div className="p-3 bg-card/60 backdrop-blur-md">
                          <div className="flex items-center gap-2 mb-2">
                             {media.type === 'image' ? <ImageIcon className="w-4 h-4 text-primary" /> : <Film className="w-4 h-4 text-destructive" />}
                             <span className="text-xs font-mono text-muted-foreground truncate flex-1">{media.timestamp}</span>
                          </div>
                          <button 
                             onClick={() => forceDownloadFile(media.url, media.name)}
                             className="flex items-center justify-center gap-2 w-full py-2 bg-primary/10 hover:bg-primary/30 text-primary rounded text-xs font-semibold transition-colors"
                          >
                            <Download className="w-3 h-3" /> Force Download
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
               </div>
             )}
          </div>
          
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Command Terminal Log</h3>
            {log.length === 0 ? (
              <div className="glass-card p-6 text-center text-muted-foreground shadow-inner bg-background/50">
                <Video className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="tracking-wide text-sm">Initialize the Neural matrix and perform a registered gesture.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                <AnimatePresence>
                  {log.map((l, i) => (
                    <motion.div key={`${l.time}-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-4 flex items-center justify-between text-sm shadow border-l-4 border-l-primary/50">
                      <span className="font-bold text-foreground/90 text-[11px] uppercase tracking-widest">{l.gesture.split(' ')[0]} GESTURE</span>
                      <span className="text-primary font-bold uppercase text-[10px]">{l.action}</span>
                      <span className="text-xs text-muted-foreground font-mono">{l.time}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}
