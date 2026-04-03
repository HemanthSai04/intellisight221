import { useState, useEffect, useCallback, useRef } from 'react';
import { ScanFace, UserPlus, Fingerprint, LayoutDashboard, Trash2 } from 'lucide-react';
import * as faceapi from '@vladmandic/face-api';
import ModuleLayout from '@/components/ModuleLayout';
import LiveFaceCamera from '@/components/LiveFaceCamera';
import { useFaceRecognition } from '@/hooks/useFaceRecognition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export interface AttendanceRecord {
  id: string;
  name: string;
  date: string;
  day: string;
  period: string;
  time: string;
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
  } catch (e) {
    console.error("Error loading profiles", e);
    return [];
  }
};

const saveProfiles = (profiles: faceapi.LabeledFaceDescriptors[]) => {
  localStorage.setItem('faceProfiles', JSON.stringify(profiles.map(p => ({
    label: p.label,
    descriptors: p.descriptors.map(d => Array.from(d))
  }))));
};

const getCurrentPeriod = () => {
  const now = new Date();
  const dayIndex = now.getDay();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const day = days[dayIndex];
  
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const timeInMinutes = hour * 60 + minutes;
  
  const periods = [
    { name: 'Period 1', start: 9 * 60, end: 9 * 60 + 50 },
    { name: 'Period 2', start: 9 * 60 + 50, end: 10 * 60 + 40 },
    { name: 'Period 3', start: 11 * 60, end: 11 * 60 + 50 },
    { name: 'Period 4', start: 11 * 60 + 50, end: 12 * 60 + 40 },
    { name: 'Period 5', start: 13 * 60 + 30, end: 14 * 60 + 20 },
    { name: 'Period 6', start: 14 * 60 + 20, end: 15 * 60 + 10 },
    { name: 'Period 7', start: 15 * 60 + 10, end: 16 * 60 },
  ];
  
  const currentPeriod = periods.find(p => timeInMinutes >= p.start && timeInMinutes <= p.end);
  return { day, period: currentPeriod?.name || 'Out of Hours' };
};

export default function AttendanceModule() {
  const { modelsLoaded } = useFaceRecognition();
  const [viewMode, setViewMode] = useState<'live' | 'register' | 'dashboard'>('live');
  const [registeredProfiles, setRegisteredProfiles] = useState<faceapi.LabeledFaceDescriptors[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const stopCameraRef = useRef<(() => void) | null>(null);
  
  // Registration state
  const [registerName, setRegisterName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [capturedDescriptors, setCapturedDescriptors] = useState<Float32Array[]>([]);

  useEffect(() => {
    setRegisteredProfiles(loadProfiles());
    const savedLogs = localStorage.getItem('attendanceRecords');
    if (savedLogs) {
      setAttendanceRecords(JSON.parse(savedLogs));
    }
  }, []);

  const handleRegisterFrame = useCallback((descriptor: Float32Array) => {
    setCapturedDescriptors(prev => {
      const updated = [...prev, descriptor];
      if (updated.length >= 5) {
        // Complete registration automatically when we get 5 quality frames
        const newProfile = new faceapi.LabeledFaceDescriptors(registerName, updated);
        const allProfiles = [...registeredProfiles, newProfile];
        setRegisteredProfiles(allProfiles);
        saveProfiles(allProfiles);
        setIsRegistering(false);
        setRegisterName('');
        setCapturedDescriptors([]);
        setViewMode('live');
        toast.success(`Successfully registered ${newProfile.label}!`);
      }
      return updated;
    });
  }, [registerName, registeredProfiles]);

  const startRegistration = () => {
    if (!registerName.trim()) {
      toast.error('Please enter your name first');
      return;
    }
    setCapturedDescriptors([]);
    setIsRegistering(true);
    toast.info('Look at the camera and move your head slightly...');
  };

  const handleFaceMatched = useCallback((label: string) => {
    if (viewMode !== 'live') return;
    
    setAttendanceRecords(prev => {
      const now = new Date();
      const dateStr = now.toLocaleDateString();
      const { day, period } = getCurrentPeriod();
      
      // Prevent duplicate logging for the same person, date, and period
      const alreadyLogged = prev.some(r => r.name === label && r.date === dateStr && r.period === period);
      if (alreadyLogged) return prev;
      
      const newRecord: AttendanceRecord = {
        id: crypto.randomUUID(),
        name: label,
        date: dateStr,
        day,
        period,
        time: now.toLocaleTimeString()
      };
      
      const updated = [newRecord, ...prev];
      localStorage.setItem('attendanceRecords', JSON.stringify(updated));
      toast.success(`${label} marked present for ${period}`);
      return updated;
    });
  }, [viewMode]);

  const handleDeleteRecord = (id: string) => {
    setAttendanceRecords(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('attendanceRecords', JSON.stringify(updated));
      toast.success('Record deleted');
      return updated;
    });
  };

  const handleDeleteProfile = (label: string) => {
    setRegisteredProfiles(prev => {
      const updated = prev.filter(p => p.label !== label);
      saveProfiles(updated);
      toast.success(`Profile ${label} deleted`);
      return updated;
    });
  };

  return (
    <ModuleLayout
      title="IntelliSight Recognition"
      description="Register your face and track it automatically"
      icon={<ScanFace className="w-6 h-6 text-primary" />}
    >
      {!modelsLoaded ? (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="text-xl font-bold text-foreground">Loading AI Models...</h2>
          <p className="text-muted-foreground mt-2">Downloading securely from edge location (~10MB).</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {viewMode !== 'dashboard' && (
            <div className="lg:col-span-2 space-y-4">
              <LiveFaceCamera 
                mode={viewMode === 'live' ? 'live' : 'register'}
                onRegisterFrame={handleRegisterFrame}
                registeredProfiles={registeredProfiles}
                isRegistering={isRegistering}
                onFaceMatched={handleFaceMatched}
                stopCameraRef={stopCameraRef}
              />
            </div>
          )}

          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex bg-secondary rounded-lg p-1 mb-6">
                <button 
                  onClick={() => { setViewMode('live'); setIsRegistering(false); }}
                  className={`flex-1 py-2 px-3 lg:px-4 rounded-md text-xs lg:text-sm font-medium transition-all ${viewMode === 'live' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Live Detection
                </button>
                <button 
                  onClick={() => setViewMode('register')}
                  className={`flex-1 py-2 px-3 lg:px-4 rounded-md text-xs lg:text-sm font-medium transition-all ${viewMode === 'register' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Register Face
                </button>
                <button 
                  onClick={() => { 
                    // Stop camera before switching to dashboard so light turns off
                    stopCameraRef.current?.(); 
                    setViewMode('dashboard'); 
                    setIsRegistering(false); 
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 lg:px-4 rounded-md text-xs lg:text-sm font-medium transition-all ${viewMode === 'dashboard' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 hidden lg:block" /> Dashboard
                </button>
              </div>

              {viewMode === 'live' ? (
                <div className="space-y-4">
                  <h3 className="font-display font-semibold flex items-center gap-2"><Fingerprint className="w-5 h-5 text-primary" /> Active Profiles Database</h3>
                  {registeredProfiles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No faces registered yet. Switch to Registration to add a profile.</p>
                  ) : (
                    <ul className="space-y-2">
                      {registeredProfiles.map(p => (
                        <li key={p.label} className="flex justify-between items-center py-2 px-3 bg-secondary/50 rounded border border-border/50 group hover:border-primary/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-sm">{p.label}</span>
                            <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border/50">5 frames</span>
                          </div>
                          <button 
                            onClick={() => handleDeleteProfile(p.label)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            aria-label="Delete profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : viewMode === 'register' ? (
                <div className="space-y-4">
                   <h3 className="font-display font-semibold flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" /> Register New Profile</h3>
                   <p className="text-sm text-muted-foreground">Enter a name and start the camera.</p>
                   {!isRegistering ? (
                     <>
                        <Input 
                          placeholder="E.g. John Doe" 
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          className="bg-secondary/50"
                        />
                        <Button className="w-full" onClick={startRegistration} variant="neon">
                          Begin Capture
                        </Button>
                     </>
                   ) : (
                      <div className="text-center space-y-3 py-4 border uppercase text-xs tracking-wider border-primary/30 rounded bg-primary/5">
                        <div className="animate-pulse font-bold text-primary">Capturing Descriptors...</div>
                        <div className="font-mono text-xl">{capturedDescriptors.length} / 5</div>
                        <p className="text-muted-foreground px-2">Please look directly at the camera while we sample your face.</p>
                      </div>
                   )}
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  <h3 className="font-display font-semibold flex items-center gap-2 mb-4"><LayoutDashboard className="w-5 h-5 text-primary" /> Attendance Analytics</h3>
                  
                  {attendanceRecords.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-lg">
                      No attendance data recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {attendanceRecords.map(record => (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-secondary/30 border border-border/50 rounded-lg group hover:border-primary/30 transition-colors">
                          <div className="flex flex-col gap-1">
                            <div className="font-semibold text-sm flex items-center gap-2">
                              {record.name}
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">{record.period}</span>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span>{record.date} ({record.day})</span>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <span>{record.time}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteRecord(record.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            aria-label="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ModuleLayout>
  );
}
