import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bot, BarChart3, Shield, Zap, Eye, AlertTriangle, ArrowRight, Activity, Target, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Eye, title: "Multi-Pair Scanning", desc: "Inspect static scanner samples. No live market scan is running." },
  { icon: BarChart3, title: "Ranked Buy / Avoid / Sell", desc: "Sample scores and illustrative buy, avoid and exit examples." },
  { icon: Target, title: "Automated Exits", desc: "Simulated exit examples only. No orders or positions are managed." },
  { icon: Shield, title: "Risk Guardrails", desc: "Session-only risk settings. Profit caps are stop conditions, not targets." },
  { icon: Gauge, title: "Live & Paper Modes", desc: "Demo UI only. Paper engines and live execution are unavailable in Phase 1." },
  { icon: Zap, title: "Kill Switch", desc: "UI-only emergency rehearsal; no worker, orders or real holdings affected." },
];

const fade = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }) };

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 glass sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Crypto Sentinel</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">Explore Demo</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-glow" />
        <div className="container py-24 md:py-36 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl mx-auto text-center space-y-6">
            <div className="status-demo inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium">
              <Activity className="h-3 w-3" />
              Preview Mode — Demo Data
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Crypto Sentinel <span className="text-gradient-primary">Demo Control Center</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore simulated trading data and manual browser-local research tools. No live AI, connected services or trades. No guaranteed returns.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link to="/dashboard">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  Explore Demo <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="border-border hover:bg-secondary">
                  Open workspace
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Control Center Features</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Sample trading displays and manual research tools. No actual market monitoring or execution.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} className="glass rounded-xl p-6 shadow-card hover:shadow-glow transition-shadow duration-300">
              <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="container pb-24">
        <div className="glass rounded-xl p-8 border-warning/20 shadow-card">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-warning flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2 text-warning">Important Disclaimer</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>This platform does not guarantee profits or returns of any kind.</li>
                <li>Cryptocurrency trading involves substantial risk of loss.</li>
                <li>Past performance and simulated results do not indicate future outcomes.</li>
                <li>The preview/demo mode uses entirely simulated market data — no real trades occur.</li>
                <li>Live trading is unavailable in Phase 1. No credentials are requested or accepted.</li>
                <li>Always trade only with capital you can afford to lose.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <span>Crypto Sentinel</span>
          </div>
          <span>Demo Preview — Not Financial Advice</span>
        </div>
      </footer>
    </div>
  );
}