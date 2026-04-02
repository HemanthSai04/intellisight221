import { useState } from 'react';
import { ScanFace, CheckCircle2, Clock } from 'lucide-react';
import ModuleLayout from '@/components/ModuleLayout';
import CameraView from '@/components/CameraView';
import { motion } from 'framer-motion';

interface AttendanceRecord {
  id: string;
  name: string;
  timestamp: string;
  status: 'present' | 'late';
  confidence: number;
}

const mockNames = ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Ross', 'Eve Wilson'];

export default function AttendanceModule() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleCapture = async (_imageSrc: string) => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    const name = mockNames[Math.floor(Math.random() * mockNames.length)];
    const record: AttendanceRecord = {
      id: Date.now().toString(),
      name,
      timestamp: new Date().toLocaleString(),
      status: Math.random() > 0.3 ? 'present' : 'late',
      confidence: 85 + Math.random() * 14,
    };
    setRecords(prev => [record, ...prev]);
    setProcessing(false);
  };

  return (
    <ModuleLayout
      title="Facial Recognition Attendance"
      description="Mark attendance using face detection"
      icon={<ScanFace className="w-6 h-6 text-primary" />}
    >
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <CameraView
            onCapture={handleCapture}
            overlay={
              processing ? (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                  <div className="glass-card p-4 text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-foreground">Detecting face...</p>
                  </div>
                </div>
              ) : null
            }
          />
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Attendance Log</h3>
          {records.length === 0 ? (
            <div className="glass-card p-8 text-center text-muted-foreground">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No attendance records yet. Capture a face to begin.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {records.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`w-5 h-5 ${r.status === 'present' ? 'text-success' : 'text-warning'}`} />
                    <div>
                      <p className="font-medium text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.timestamp}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'present' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                      {r.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{r.confidence.toFixed(1)}%</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModuleLayout>
  );
}
