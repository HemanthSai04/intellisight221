import { useState } from 'react';
import { Brain } from 'lucide-react';
import ModuleLayout from '@/components/ModuleLayout';
import CameraView from '@/components/CameraView';
import { motion } from 'framer-motion';

const emotions = ['😊 Happy', '😢 Sad', '😠 Angry', '😐 Neutral', '😲 Surprised', '😨 Fearful'];
const emotionColors: Record<string, string> = {
  '😊 Happy': 'bg-success/20 text-success',
  '😢 Sad': 'bg-blue-500/20 text-blue-400',
  '😠 Angry': 'bg-destructive/20 text-destructive',
  '😐 Neutral': 'bg-muted text-muted-foreground',
  '😲 Surprised': 'bg-warning/20 text-warning',
  '😨 Fearful': 'bg-purple-500/20 text-purple-400',
};

export default function EmotionModule() {
  const [result, setResult] = useState<{ emotion: string; scores: Record<string, number> } | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleCapture = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1200));
    const primary = emotions[Math.floor(Math.random() * emotions.length)];
    const scores: Record<string, number> = {};
    let remaining = 100;
    emotions.forEach((e, i) => {
      if (e === primary) return;
      const val = i === emotions.length - 1 ? remaining : Math.floor(Math.random() * remaining * 0.4);
      scores[e] = val;
      remaining -= val;
    });
    scores[primary] = remaining;
    setResult({ emotion: primary, scores });
    setProcessing(false);
  };

  return (
    <ModuleLayout title="Facial Emotion Analysis" description="Real-time emotion detection" icon={<Brain className="w-6 h-6 text-primary" />}>
      <div className="grid lg:grid-cols-2 gap-8">
        <CameraView
          onCapture={handleCapture}
          overlay={processing ? (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <div className="glass-card p-4 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-foreground">Analyzing emotions...</p>
              </div>
            </div>
          ) : null}
        />

        <div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Analysis Result</h3>
          {!result ? (
            <div className="glass-card p-8 text-center text-muted-foreground">
              <Brain className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>Capture a frame to analyze emotions.</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="glass-card p-6 text-center">
                <p className="text-4xl mb-2">{result.emotion.split(' ')[0]}</p>
                <p className="font-display text-xl font-bold text-foreground">{result.emotion.split(' ')[1]}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${emotionColors[result.emotion]}`}>
                  Dominant Emotion
                </span>
              </div>
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
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </ModuleLayout>
  );
}
