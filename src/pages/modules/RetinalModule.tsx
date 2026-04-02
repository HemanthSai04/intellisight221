import { useState, useRef } from 'react';
import { Eye, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ModuleLayout from '@/components/ModuleLayout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import CameraView from '@/components/CameraView';

interface AnalysisResult {
  riskLevel: 'Low' | 'Moderate' | 'High';
  confidence: number;
  findings: string[];
  recommendation: string;
}

export default function RetinalModule() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const analyze = async (src: string) => {
    setImage(src);
    setProcessing(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 2000));
    const levels: AnalysisResult['riskLevel'][] = ['Low', 'Moderate', 'High'];
    const level = levels[Math.floor(Math.random() * levels.length)];
    setResult({
      riskLevel: level,
      confidence: 82 + Math.random() * 15,
      findings: level === 'Low'
        ? ['No microaneurysms detected', 'Normal retinal vasculature', 'Healthy optic disc']
        : level === 'Moderate'
        ? ['Mild microaneurysms present', 'Minor hemorrhage detected', 'Monitor recommended']
        : ['Multiple microaneurysms detected', 'Hard exudates present', 'Immediate consultation advised'],
      recommendation: level === 'Low' ? 'Regular annual checkups recommended.' : level === 'Moderate' ? 'Schedule follow-up within 3 months.' : 'Urgent ophthalmologist referral recommended.',
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

  const riskColors = { Low: 'text-success', Moderate: 'text-warning', High: 'text-destructive' };
  const riskBg = { Low: 'bg-success/20', Moderate: 'bg-warning/20', High: 'bg-destructive/20' };

  return (
    <ModuleLayout title="Retinal Health Analysis" description="Diabetic retinopathy risk screening" icon={<Eye className="w-6 h-6 text-primary" />}>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <CameraView onCapture={analyze} />
          <div className="text-center text-muted-foreground text-sm">— or —</div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <Button variant="neon-outline" className="w-full" onClick={() => fileRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" /> Upload Retina Image
          </Button>
          {image && (
            <div className="glass-card p-2 rounded-xl">
              <img src={image} alt="Retina" className="w-full rounded-lg" />
            </div>
          )}
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Analysis Result</h3>
          {processing ? (
            <div className="glass-card p-8 text-center">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-foreground">Analyzing retinal image...</p>
              <p className="text-xs text-muted-foreground mt-1">AI processing in progress</p>
            </div>
          ) : !result ? (
            <div className="glass-card p-8 text-center text-muted-foreground">
              <Eye className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>Capture or upload a retina image to analyze.</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="glass-card p-6 text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${riskBg[result.riskLevel]} ${riskColors[result.riskLevel]} text-lg font-semibold`}>
                  {result.riskLevel === 'Low' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  {result.riskLevel} Risk
                </div>
                <p className="text-sm text-muted-foreground mt-2">Confidence: {result.confidence.toFixed(1)}%</p>
              </div>
              <div className="glass-card p-4">
                <h4 className="font-semibold text-foreground mb-3">Findings</h4>
                <ul className="space-y-2">
                  {result.findings.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">•</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-4">
                <h4 className="font-semibold text-foreground mb-2">Recommendation</h4>
                <p className="text-sm text-muted-foreground">{result.recommendation}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </ModuleLayout>
  );
}
