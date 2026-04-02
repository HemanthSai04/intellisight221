import { Activity, Users, ScanFace, Brain, Eye, Shield, TrendingUp } from 'lucide-react';
import ModuleLayout from '@/components/ModuleLayout';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Total Users', value: '1,248', icon: Users, change: '+12%' },
  { label: 'Attendance Scans', value: '8,432', icon: ScanFace, change: '+8%' },
  { label: 'Emotion Analyses', value: '3,217', icon: Brain, change: '+15%' },
  { label: 'Media Checks', value: '1,892', icon: Shield, change: '+22%' },
];

const recentLogs = [
  { time: '2 min ago', action: 'Attendance marked', user: 'Alice Johnson', module: 'Face Recognition' },
  { time: '5 min ago', action: 'Emotion detected: Happy', user: 'Bob Smith', module: 'Emotion Analysis' },
  { time: '12 min ago', action: 'Retinal scan completed', user: 'Charlie Brown', module: 'Retinal Health' },
  { time: '18 min ago', action: 'Media verified: Real', user: 'Diana Ross', module: 'Authenticity' },
  { time: '25 min ago', action: 'Gesture detected: Peace', user: 'Eve Wilson', module: 'Gesture Control' },
  { time: '30 min ago', action: 'Attendance marked', user: 'Frank Lee', module: 'Face Recognition' },
];

export default function AnalyticsModule() {
  return (
    <ModuleLayout title="Analytics Dashboard" description="Usage statistics and logs" icon={<Activity className="w-6 h-6 text-primary" />}>
      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <s.icon className="w-5 h-5 text-primary" />
              <span className="flex items-center gap-1 text-xs text-success">
                <TrendingUp className="w-3 h-3" /> {s.change}
              </span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts placeholder + logs */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Weekly Activity</h3>
          <div className="space-y-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const val = 30 + Math.random() * 70;
              return (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-8 text-xs text-muted-foreground">{day}</span>
                  <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.8, delay: i * 0.05 }} className="h-full rounded-full bg-gradient-to-r from-primary to-neon-cyan" />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{Math.round(val)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
            {recentLogs.map((l, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{l.action}</p>
                  <p className="text-xs text-muted-foreground">{l.user} · {l.module}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{l.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}
