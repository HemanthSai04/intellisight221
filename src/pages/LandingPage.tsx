import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, ScanFace, Eye, Hand, Shield, Activity } from 'lucide-react';
import heroImg from '@/assets/hero-3d.jpg';

const features = [
  { icon: ScanFace, title: 'Face Recognition', desc: 'Automated attendance with facial detection' },
  { icon: Brain, title: 'Emotion Analysis', desc: 'Real-time facial emotion detection' },
  { icon: Eye, title: 'Retinal Analysis', desc: 'Diabetic risk screening via retina imaging' },
  { icon: Hand, title: 'Gesture Control', desc: 'Control system actions with hand gestures' },
  { icon: Shield, title: 'Media Authenticity', desc: 'Detect AI-generated content' },
  { icon: Activity, title: 'Analytics', desc: 'Usage stats & attendance logs' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="font-display text-xl font-bold gradient-text">NEXUS AI</Link>
          <div className="flex gap-3">
            <Button variant="ghost" asChild><Link to="/login">Sign In</Link></Button>
            <Button variant="neon" asChild><Link to="/register">Get Started</Link></Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center grid-bg animate-grid-scroll">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="container mx-auto px-6 pt-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-6">
                ✨ Next-Gen AI Platform
              </div>
              <h1 className="text-5xl lg:text-7xl font-display font-bold leading-tight mb-6">
                <span className="gradient-text">Intelligent</span>
                <br />
                <span className="text-foreground">Vision System</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mb-8 font-body">
                Harness the power of AI for facial recognition, emotion analysis, retinal health screening, gesture control, and media authenticity detection — all in one unified platform.
              </p>
              <div className="flex gap-4">
                <Button variant="neon" size="lg" asChild>
                  <Link to="/register">Launch Platform</Link>
                </Button>
                <Button variant="neon-outline" size="lg" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden neon-border">
                <img src={heroImg} alt="AI Vision Platform" width={1920} height={1080} className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-neon-cyan/20 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
              <span className="gradient-text">AI-Powered</span> Modules
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Six powerful AI modules working together to create the most comprehensive vision intelligence platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 hover:border-primary/50 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 lg:p-16 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4 text-foreground">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join the platform and unlock the full power of AI-driven vision analysis.
            </p>
            <Button variant="neon" size="lg" asChild>
              <Link to="/register">Create Free Account</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
          © 2026 Nexus AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
