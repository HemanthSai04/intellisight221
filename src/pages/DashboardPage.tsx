import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ScanFace, Brain, Eye, Hand, Shield, Activity, LogOut, Bell } from 'lucide-react';

const modules = [
  {
    id: 'attendance',
    icon: ScanFace,
    title: 'Facial Recognition Attendance',
    desc: 'Detect and recognize faces to automatically mark attendance with timestamps.',
    color: 'from-blue-500/20 to-cyan-500/20',
    path: '/module/attendance',
  },
  {
    id: 'emotion',
    icon: Brain,
    title: 'Facial Emotion Analysis',
    desc: 'Analyze facial expressions in real-time to detect emotions like happy, sad, angry.',
    color: 'from-purple-500/20 to-pink-500/20',
    path: '/module/emotion',
  },
  {
    id: 'retinal',
    icon: Eye,
    title: 'Retinal Health Analysis',
    desc: 'Upload retina images for diabetic risk screening and health insights.',
    color: 'from-green-500/20 to-emerald-500/20',
    path: '/module/retinal',
  },
  {
    id: 'gesture',
    icon: Hand,
    title: 'Gesture Control System',
    desc: 'Use YOLOv8 for gesture recognition — capture screenshots, control recording.',
    color: 'from-orange-500/20 to-yellow-500/20',
    path: '/module/gesture',
  },
  {
    id: 'authenticity',
    icon: Shield,
    title: 'AI Media Authenticity',
    desc: 'Detect whether images or videos are AI-generated or authentic content.',
    color: 'from-red-500/20 to-rose-500/20',
    path: '/module/authenticity',
  },
  {
    id: 'analytics',
    icon: Activity,
    title: 'Analytics Dashboard',
    desc: 'View usage statistics, attendance logs, and analysis history.',
    color: 'from-cyan-500/20 to-blue-500/20',
    path: '/module/analytics',
  },
];

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/dashboard" className="font-display text-xl font-bold gradient-text">INTELLISIGHT</Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:block">
              Welcome, <span className="text-foreground font-medium">{displayName}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground mb-10">Select an AI module to get started.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={m.path} className="block glass-card p-6 hover:border-primary/50 transition-all duration-300 group h-full">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <m.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{m.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{m.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
