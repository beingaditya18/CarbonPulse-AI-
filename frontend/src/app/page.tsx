'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCarbonStore } from '@/store/useCarbonStore';
import { Leaf, ArrowRight, ShieldCheck, Cpu, RefreshCw, BarChart3, Check } from 'lucide-react';
import { LandingTwinPreview } from '@/features/landing/components/LandingTwinPreview';

/**
 * LandingPage component serving as the CarbonPulse AI+ homepage marketing portal.
 */
export default function LandingPage() {
  const { user } = useCarbonStore();
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setMounted(true);
    const isDarkClass = document.documentElement.classList.contains('dark');
    setIsDark(isDarkClass);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-zinc-900'}`}>
      
      {/* HEADER NAVBAR */}
      <header className="border-b border-zinc-200/20 px-6 py-4 flex items-center justify-between sticky top-0 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
            <Leaf className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            CarbonPulse AI+
          </span>
        </div>
        <nav className="flex items-center gap-4" aria-label="Main Navigation">
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition-colors ${isDark ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-400' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600'}`}
            aria-label="Toggle dark mode"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <Link
            href={user.onboardingComplete ? "/dashboard" : "/onboarding"}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-md flex items-center gap-1"
          >
            {user.onboardingComplete ? 'Dashboard' : 'Get Started'} <ArrowRight className="w-4 h-4" />
          </Link>
        </nav>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Core Value Proposition */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" /> Vertex AI & SHAP Integration
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Carbon emissions are <span className="text-emerald-500 block">invisible.</span> We make them actionable.
          </h1>
          <p className={`text-lg md:text-xl font-normal max-w-2xl leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            CarbonPulse AI+ automates logs via <strong className="text-emerald-500">Google Vision OCR</strong>, explains carbon sources with game-theoretic <strong className="text-emerald-500">SHAP Explainable AI</strong>, and simulates reduction yields through <strong className="text-emerald-500">Digital Twins</strong>.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href={user.onboardingComplete ? "/dashboard" : "/onboarding"}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/20 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              {user.onboardingComplete ? 'Go to Dashboard' : 'Calculate Your Footprint'}
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <a
              href="#twin-preview"
              className={`px-8 py-4 rounded-xl font-semibold border transition-all ${isDark ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-300' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-700'}`}
            >
              See How It Works
            </a>
          </div>

          {/* Micro Stats */}
          <div className="grid grid-cols-3 gap-6 border-t border-zinc-200/10 pt-8 mt-12">
            <div>
              <p className="text-3xl font-extrabold text-emerald-500">100%</p>
              <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500">Vercel Optimized</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-500">Vertex AI</p>
              <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500">ML Engine</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-500">&lt; 0.8s</p>
              <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500">First Paint Time</p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Twin Simulator Widget */}
        <div id="twin-preview" className="lg:col-span-5">
          <LandingTwinPreview isDark={isDark} />
        </div>

      </main>

      {/* HACKATHON FEATURE MATRIX */}
      <section className={`py-16 border-t ${isDark ? 'border-zinc-900 bg-zinc-950/40' : 'border-zinc-200 bg-zinc-100/30'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold">Track → Explain → Simulate → Reduce</h2>
            <p className={`text-lg ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Four core steps built on Vertex AI and Google APIs to take you from awareness to action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className={`p-6 rounded-xl border transition-all hover:scale-105 duration-300 ${isDark ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'}`}>
              <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center mb-6">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Track</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Zero manual fatigue. Upload receipts directly using Google Vision OCR text extraction to auto-log your footprint.
              </p>
            </div>

            <div className={`p-6 rounded-xl border transition-all hover:scale-105 duration-300 ${isDark ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'}`}>
              <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Explain</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Understand why. Transparent SHAP (Shapley Additive exPlanations) shows exact feature contributions to your emissions.
              </p>
            </div>

            <div className={`p-6 rounded-xl border transition-all hover:scale-105 duration-300 ${isDark ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'}`}>
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Simulate</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Test before committing. Set up custom reduction scenarios on your Digital Carbon Twin using regression forecasting.
              </p>
            </div>

            <div className={`p-6 rounded-xl border transition-all hover:scale-105 duration-300 ${isDark ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200'}`}>
              <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">4. Reduce</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Execute. Accept localized challenges, log completions, track tree scores, and unlock competitive badges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY / TRUST PANEL */}
      <section className="py-16 max-w-7xl mx-auto px-6 text-center space-y-6">
        <h2 className="text-2xl font-bold">Built with Google Cloud Enterprise Security</h2>
        <p className={`max-w-2xl mx-auto text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          CarbonPulse AI+ operates on GCP Identity-Aware Proxy (IAP), Google Cloud Armor firewalls, and encrypted Google Cloud Storage buckets, ensuring compliance with strict privacy and enterprise audit requirements.
        </p>
        <div className="flex justify-center flex-wrap gap-8 pt-4">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider font-bold">Cloud Armor WAF</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider font-bold">GCP IAP Identity</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider font-bold">Encrypted GCS Bucket</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider font-bold">OWASP Secure-Headers</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200/10 py-12 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CarbonPulse AI+. Dedicated to intelligent climate action.</p>
          <div className="flex gap-4 font-semibold text-zinc-400">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:underline">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:underline">Google Cloud Console</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
