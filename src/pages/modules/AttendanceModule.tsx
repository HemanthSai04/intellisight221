import { useState, useEffect, useCallback } from 'react';
import { ScanFace, UserPlus, Fingerprint } from 'lucide-react';
import * as faceapi from '@vladmandic/face-api';
import ModuleLayout from '@/components/ModuleLayout';
import LiveFaceCamera from '@/components/LiveFaceCamera';
import { useFaceRecognition } from '@/hooks/useFaceRecognition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

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

export default function AttendanceModule() {
  const { modelsLoaded } = useFaceRecognition();
  const [viewMode, setViewMode] = useState<'live' | 'register'>('live');
  const [registeredProfiles, setRegisteredProfiles] = useState<faceapi.LabeledFaceDescriptors[]>([]);
  
  // Registration state
  const [registerName, setRegisterName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [capturedDescriptors, setCapturedDescriptors] = useState<Float32Array[]>([]);

  useEffect(() => {
    setRegisteredProfiles(loadProfiles());
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
          <div className="lg:col-span-2 space-y-4">
            <LiveFaceCamera 
              mode={viewMode}
              onRegisterFrame={handleRegisterFrame}
              registeredProfiles={registeredProfiles}
              isRegistering={isRegistering}
            />
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex bg-secondary rounded-lg p-1 mb-6">
                <button 
                  onClick={() => { setViewMode('live'); setIsRegistering(false); }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${viewMode === 'live' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Live Detection
                </button>
                <button 
                  onClick={() => setViewMode('register')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${viewMode === 'register' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Register Face
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
                        <li key={p.label} className="flex justify-between items-center py-2 px-3 bg-secondary/50 rounded border border-border/50">
                          <span className="font-medium text-sm">{p.label}</span>
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">5 frames</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      )}
    </ModuleLayout>
  );
}
