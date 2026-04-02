import { useState } from 'react';
import { Hand } from 'lucide-react';
import ModuleLayout from '@/components/ModuleLayout';
import CameraView from '@/components/CameraView';
import { motion } from 'framer-motion';

const gestureMap = [
  { gesture: '✌️ Peace Sign', action: 'Capture Screenshot', color: 'bg-primary/20 text-primary' },
  { gesture: '👊 Fist', action: 'Start Screen Recording', color: 'bg-success/20 text-success' },
  { gesture: '✊ Closed Fist', action: 'Stop Screen Recording', color: 'bg-destructive/20 text-destructive' },
  { gesture: '👍 Thumbs Up', action: 'Confirm Action', color: 'bg-warning/20 text-warning' },
  { gesture: '🖐️ Open Palm', action: 'Pause System', color: 'bg-purple-500/20 text-purple-400' },
];

export default function GestureModule() {
  const [detectedGesture, setDetectedGesture] = useState<typeof gestureMap[0] | null>(null);
  const [log, setLog] = useState<{ gesture: string; action: string; time: string }[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleCapture = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1000));
    const g = gestureMap[Math.floor(Math.random() * gestureMap.length)];
    setDetectedGesture(g);
    setLog(prev => [{ gesture: g.gesture, action: g.action, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 19)]);
    setProcessing(false);
  };

  return (
    <ModuleLayout title="Gesture Control System" description="YOLOv8 powered gesture recognition" icon={<Hand className="w-6 h-6 text-primary" />}>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <CameraView
            onCapture={handleCapture}
            overlay={processing ? (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                <div className="glass-card p-4 text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-foreground">Detecting gesture...</p>
                </div>
              </div>
            ) : null}
          />

          {detectedGesture && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 text-center animate-pulse-glow">
              <p className="text-5xl mb-2">{detectedGesture.gesture.split(' ')[0]}</p>
              <p className="font-display text-lg font-bold text-foreground">{detectedGesture.gesture.split(' ').slice(1).join(' ')}</p>
              <p className="text-sm text-primary mt-1">→ {detectedGesture.action}</p>
            </motion.div>
          )}

          {/* Gesture Map */}
          <div className="glass-card p-4">
            <h4 className="font-semibold text-foreground mb-3 text-sm">Gesture Mappings</h4>
            <div className="space-y-2">
              {gestureMap.map(g => (
                <div key={g.gesture} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{g.gesture}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${g.color}`}>{g.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Detection Log</h3>
          {log.length === 0 ? (
            <div className="glass-card p-8 text-center text-muted-foreground">
              <Hand className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>Capture a frame to detect gestures.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {log.map((l, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-3 flex items-center justify-between text-sm">
                  <span className="text-foreground">{l.gesture}</span>
                  <span className="text-muted-foreground">{l.action}</span>
                  <span className="text-xs text-muted-foreground">{l.time}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModuleLayout>
  );
}
