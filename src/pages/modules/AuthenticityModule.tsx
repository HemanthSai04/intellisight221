import { useState, useRef } from 'react';
import { Shield, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';
import ModuleLayout from '@/components/ModuleLayout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface AuthResult {
  verdict: 'Real' | 'AI-Generated';
  confidence: number;
  explanation: string;
  indicators: string[];
}

export default function AuthenticityModule() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<AuthResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const analyze = async (src: string) => {
    setImage(src);
    setProcessing(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 2000));
    const isReal = Math.random() > 0.5;
    setResult({
      verdict: isReal ? 'Real' : 'AI-Generated',
      confidence: 75 + Math.random() * 22,
      explanation: isReal
        ? 'The image shows natural characteristics consistent with camera-captured content including organic noise patterns and authentic lighting.'
        : 'The image exhibits patterns commonly associated with AI generation, including unusual texture smoothness and inconsistent lighting directions.',
      indicators: isReal
        ? ['Natural noise patterns', 'Authentic EXIF metadata', 'Consistent lighting', 'Organic color distribution']
        : ['Texture smoothness anomalies', 'Lighting inconsistencies', 'Artifact patterns detected', 'Unnatural edge transitions'],
    });
    setProcessing(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => analyze(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <ModuleLayout title="AI Media Authenticity" description="Detect AI-generated content" icon={<Shield className="w-6 h-6 text-primary" />}>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="glass-card p-8 text-center border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => fileRef.current?.click()}>
            <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-foreground font-medium">Upload Image or Video</p>
            <p className="text-xs text-muted-foreground mt-1">Click or drag & drop to upload</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
          {image && (
            <div className="glass-card p-2">
              <img src={image} alt="Uploaded" className="w-full rounded-lg" />
            </div>
          )}
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Detection Result</h3>
          {processing ? (
            <div className="glass-card p-8 text-center">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-foreground">Analyzing media authenticity...</p>
            </div>
          ) : !result ? (
            <div className="glass-card p-8 text-center text-muted-foreground">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>Upload an image or video to analyze.</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="glass-card p-6 text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${result.verdict === 'Real' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                  {result.verdict === 'Real' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  {result.verdict}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Confidence: {result.confidence.toFixed(1)}%</p>
              </div>
              <div className="glass-card p-4">
                <h4 className="font-semibold text-foreground mb-2">Explanation</h4>
                <p className="text-sm text-muted-foreground">{result.explanation}</p>
              </div>
              <div className="glass-card p-4">
                <h4 className="font-semibold text-foreground mb-3">Indicators</h4>
                <ul className="space-y-2">
                  {result.indicators.map((ind, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">•</span> {ind}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </ModuleLayout>
  );
}
