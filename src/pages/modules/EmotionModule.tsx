import { useState, useCallback, useRef, useEffect } from 'react';
import { Brain, Trash2, User } from 'lucide-react';
import ModuleLayout from '@/components/ModuleLayout';
import AffectivaCameraView from '@/components/AffectivaCameraView';
import { motion, AnimatePresence } from 'framer-motion';
import * as faceapi from '@vladmandic/face-api';
import { useFaceRecognition } from '@/hooks/useFaceRecognition';
import { toast } from 'sonner';

const emotionColors: Record<string, string> = {
  'Happy': 'bg-success/20 text-success',
  'Sad': 'bg-blue-500/20 text-blue-400',
  'Angry': 'bg-destructive/20 text-destructive',
  'Surprised': 'bg-warning/20 text-warning',
  'Fearful': 'bg-purple-500/20 text-purple-400',
  'Neutral': 'bg-muted text-muted-foreground'
};

const emotionEmoji: Record<string, string> = {
  'Happy': '😊', 'Sad': '😢', 'Angry': '😠',
  'Surprised': '😲', 'Fearful': '😨', 'Neutral': '😐'
};

interface EmotionRecord {
  id: string;
  name: string;
  emotion: string;
  scores: Record<string, number>;
  time: string;
  date: string;
}

const loadProfiles = (): faceapi.LabeledFaceDescriptors[] => {
  try {
    const data = localStorage.getItem('faceProfiles');
    if (!data) return [];
    const parsed = JSON.parse(data);
    return parsed.map((p: any) => new faceapi.LabeledFaceDescriptors(
      p.label,
      p.descriptors.map((d: any) => new Float32Array(Object.values(d)))
    ));
  } catch {
    return [];
  }
};

export default function EmotionModule() {
  const { modelsLoaded } = useFaceRecognition();
  const [result, setResult] = useState<{ emotion: string; scores: Record<string, number> } | null>(null);
  const [currentPerson, setCurrentPerson] = useState<string>('Unknown');
  const [records, setRecords] = useState<EmotionRecord[]>(() => {
    try {
      const stored = localStorage.getItem('emotionRecords');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const identifyIntervalRef = useRef<number | null>(null);
  const lastLoggedRef = useRef<{ name: string; emotion: string; ts: number }>({ name: '', emotion: '', ts: 0 });
  const modelsLoadedRef = useRef(false);  // ref so interval closure always reads current value

  // Build face matcher when models + profiles are ready
  useEffect(() => {
    if (!modelsLoaded) return;
    modelsLoadedRef.current = true;
    const profiles = loadProfiles();
    faceMatcherRef.current = profiles.length > 0
      ? new faceapi.FaceMatcher(profiles, 0.6)  // slightly more lenient threshold
      : null;
    // If container is already available (Affectiva already running), restart the interval
    if (containerRef.current) {
      startIdentifyInterval(containerRef.current);
    }
  }, [modelsLoaded]);

  const startIdentifyInterval = (container: HTMLDivElement) => {
    if (identifyIntervalRef.current) clearInterval(identifyIntervalRef.current);
    identifyIntervalRef.current = window.setInterval(async () => {
      // Read from refs — never stale
      if (!modelsLoadedRef.current || !faceMatcherRef.current) return;
      const video = container.querySelector('video') as HTMLVideoElement | null;
      if (!video || video.readyState < 2 || video.videoWidth === 0) return;
      try {
        const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });
        const detection = await faceapi.detectSingleFace(video, options).withFaceLandmarks().withFaceDescriptor();
        if (detection) {
          const match = faceMatcherRef.current.findBestMatch(detection.descriptor);
          setCurrentPerson(match.label === 'unknown' ? 'Unknown' : match.label);
        } else {
          setCurrentPerson('Unknown');
        }
      } catch {
        // silently ignore
      }
    }, 1500);
  };

  // Called by AffectivaCameraView once its video is live
  const handleContainerReady = useCallback((container: HTMLDivElement) => {
    containerRef.current = container;
    startIdentifyInterval(container);
  }, []);  // stable — reads refs only, no closures over state

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (identifyIntervalRef.current) clearInterval(identifyIntervalRef.current);
    };
  }, []);

  const handleEmotions = useCallback((emotions: Record<string, number>) => {
    const scores = {
      'Happy': Math.round(emotions.joy || 0),
      'Sad': Math.round(emotions.sadness || 0),
      'Angry': Math.round(emotions.anger || 0),
      'Surprised': Math.round(emotions.surprise || 0),
      'Fearful': Math.round(emotions.fear || 0),
    };
    const maxVal = Math.max(...Object.values(scores));
    scores['Neutral'] = maxVal < 10 ? 100 - maxVal : 0;
    const dominant = Object.entries(scores).reduce((a, b) => b[1] > a[1] ? b : a)[0];

    setResult({ emotion: dominant, scores });

    // Log record — throttle: only log if person or emotion changed and at least 10s since last log
    const now = Date.now();
    const last = lastLoggedRef.current;
    const name = currentPerson;
    if ((name !== last.name || dominant !== last.emotion) && (now - last.ts > 10000)) {
      lastLoggedRef.current = { name, emotion: dominant, ts: now };
      const newRecord: EmotionRecord = {
        id: crypto.randomUUID(),
        name,
        emotion: dominant,
        scores,
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
      };
      setRecords(prev => {
        const updated = [newRecord, ...prev];
        localStorage.setItem('emotionRecords', JSON.stringify(updated));
        return updated;
      });
      toast.success(`${name}: ${dominant} logged`);
    }
  }, [currentPerson]);

  const deleteRecord = (id: string) => {
    setRecords(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('emotionRecords', JSON.stringify(updated));
      return updated;
    });
    toast.success('Record deleted');
  };

  return (
    <ModuleLayout
      title="Affectiva Emotion Engine"
      description="Clinical-grade real-time emotion detection with face identification"
      icon={<Brain className="w-6 h-6 text-primary" />}
    >
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left — camera + live result */}
        <div className="space-y-4">
          <AffectivaCameraView onEmotionsSuccess={handleEmotions} onContainerReady={handleContainerReady} />

          {/* Person badge */}
          {result && (
            <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-lg border border-border/50">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Identified as:</span>
              <span className={`font-semibold text-sm ${currentPerson === 'Unknown' ? 'text-muted-foreground' : 'text-primary'}`}>
                {currentPerson}
              </span>
              {!modelsLoaded && <span className="text-xs text-muted-foreground ml-auto italic">Face models loading...</span>}
            </div>
          )}

          {/* Live emotion display */}
          {!result ? (
            <div className="glass-card p-12 text-center text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Start the camera and look forward to analyze your real-time emotions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode='wait'>
                <motion.div
                  key={result.emotion}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-6 text-center"
                >
                  <p className="text-4xl mb-2">{emotionEmoji[result.emotion]}</p>
                  <p className="font-display text-2xl font-bold text-foreground">{result.emotion}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${emotionColors[result.emotion]}`}>
                    Dominant Emotion
                  </span>
                </motion.div>
              </AnimatePresence>

              <div className="glass-card p-4 space-y-3">
                {Object.entries(result.scores).sort((a, b) => b[1] - a[1]).map(([emotion, score]) => (
                  <div key={emotion}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{emotion}</span>
                      <span className="text-foreground font-medium">{score}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 0.1, ease: "linear" }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — emotion records */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-foreground">Emotion Records</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">{records.length} logs</span>
          </div>

          {records.length === 0 ? (
            <div className="glass-card p-10 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl">
              <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No emotion records yet. Start the camera to begin logging.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {records.map(record => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 glass-card border border-border/50 rounded-lg group hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{emotionEmoji[record.emotion] ?? '😐'}</span>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{record.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${emotionColors[record.emotion] ?? 'bg-muted text-muted-foreground'}`}>
                          {record.emotion}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{record.date} · {record.time}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModuleLayout>
  );
}
