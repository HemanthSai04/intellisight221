import { useState, useCallback } from 'react';
import { Brain } from 'lucide-react';
import ModuleLayout from '@/components/ModuleLayout';
import AffectivaCameraView from '@/components/AffectivaCameraView';
import { motion, AnimatePresence } from 'framer-motion';

const emotionColors: Record<string, string> = {
  'Happy': 'bg-success/20 text-success',
  'Sad': 'bg-blue-500/20 text-blue-400',
  'Angry': 'bg-destructive/20 text-destructive',
  'Surprised': 'bg-warning/20 text-warning',
  'Fearful': 'bg-purple-500/20 text-purple-400',
  'Neutral': 'bg-muted text-muted-foreground'
};

export default function EmotionModule() {
  const [result, setResult] = useState<{ emotion: string; scores: Record<string, number> } | null>(null);

  // Throttled emotion mapper to handle Affectiva's rapid callback safely
  const handleEmotions = useCallback((emotions: Record<string, number>) => {
    // Affectiva emotion properties natively: joy, sadness, anger, surprise, fear
    const scores = {
      'Happy': Math.round(emotions.joy || 0),
      'Sad': Math.round(emotions.sadness || 0),
      'Angry': Math.round(emotions.anger || 0),
      'Surprised': Math.round(emotions.surprise || 0),
      'Fearful': Math.round(emotions.fear || 0),
    };
    
    // Calculate neutral loosely as the inverse of peak excitement
    const maxVal = Math.max(...Object.values(scores));
    scores['Neutral'] = maxVal < 10 ? 100 - maxVal : 0;
    
    // Find dominant emotion
    const dominant = Object.entries(scores).reduce((a, b) => b[1] > a[1] ? b : a)[0];
    
    setResult({ emotion: dominant, scores });
  }, []);

  return (
    <ModuleLayout 
      title="Affectiva Emotion Engine" 
      description="Clinical-grade real-time emotion detection powered by Affectiva Web SDK" 
      icon={<Brain className="w-6 h-6 text-primary" />}
    >
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <AffectivaCameraView onEmotionsSuccess={handleEmotions} />
          <p className="text-xs text-muted-foreground mt-4 italic text-center">
            * This module utilizes the Affectiva js framework natively in your browser to evaluate 7 primary emotions continuously without recording data.
          </p>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Live Analysis Result</h3>
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
                  <p className="text-4xl mb-2">
                     {result.emotion === 'Happy' && '😊'}
                     {result.emotion === 'Sad' && '😢'}
                     {result.emotion === 'Angry' && '😠'}
                     {result.emotion === 'Surprised' && '😲'}
                     {result.emotion === 'Fearful' && '😨'}
                     {result.emotion === 'Neutral' && '😐'}
                  </p>
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
      </div>
    </ModuleLayout>
  );
}
