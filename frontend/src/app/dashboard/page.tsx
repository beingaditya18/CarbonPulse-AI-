'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useCarbonStore } from '@/store/useCarbonStore';
import { CategoryType } from '@/types/store';
import { calculateSHAPExplanations } from '@/lib/shapEngine';
import { ScoreGaugeCard } from '@/features/dashboard/components/ScoreGaugeCard';
import { OcrScannerCard } from '@/features/dashboard/components/OcrScannerCard';
import { ChatCoachCard } from '@/features/dashboard/components/ChatCoachCard';
import { ManualLogDialog } from '@/features/dashboard/components/ManualLogDialog';
import { ShapExplanationsCard } from '@/features/dashboard/components/ShapExplanationsCard';
import { RecentLogsCard } from '@/features/dashboard/components/RecentLogsCard';
import { TrendingDown, Check, Plus } from 'lucide-react';

// Dynamically import the Recharts chart for bundle size reduction (First Contentful Paint < 0.8s)
const HistoryChartWidget = dynamic(
  () => import('@/features/dashboard/components/HistoryChartWidget').then((mod) => mod.HistoryChartWidget),
  { 
    ssr: false, 
    loading: () => (
      <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl h-60 animate-pulse flex items-center justify-center">
        <span className="text-xs text-zinc-600 font-bold uppercase tracking-wider">Loading carbon timeline...</span>
      </div>
    )
  }
);

/**
 * DashboardPage is the central command center for tracking, SHAP explanations, and AI coach.
 */
export default function DashboardPage() {
  const { 
    logs, 
    user, 
    addLog, 
    deleteLog, 
    challenges, 
    completeChallenge, 
    acceptChallenge, 
    chatHistory, 
    addChatMessage, 
    clearChat 
  } = useCarbonStore();

  const [mounted, setMounted] = useState(false);

  // Modal Dialog and Visual Progress States
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [ocrScanStep, setOcrScanStep] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [ocrFeedback, setOcrFeedback] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isCoachTyping, setIsCoachTyping] = useState(false);

  // Core Math Calculations
  const shapData = calculateSHAPExplanations(logs);
  const currentEmissions = shapData.predictedEmissions;
  const baseline = user.baselineEmissions;
  const ratio = baseline > 0 ? currentEmissions / baseline : 1.0;

  // Visual grade calculation based on relative carbon emission ratio
  let grade = 'C';
  let gradeColor = 'text-yellow-500';
  if (ratio < 0.7) {
    grade = 'A';
    gradeColor = 'text-emerald-500';
  } else if (ratio < 0.85) {
    grade = 'B';
    gradeColor = 'text-green-500';
  } else if (ratio >= 1.0) {
    grade = 'D';
    gradeColor = 'text-red-500';
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Format Recharts daily aggregates for history chart
  const formatChartData = () => {
    const weeklyData = [
      { name: 'Week 1', transportation: 0, electricity: 0, food: 0, shopping: 0, waste: 0 },
      { name: 'Week 2', transportation: 0, electricity: 0, food: 0, shopping: 0, waste: 0 },
      { name: 'Week 3', transportation: 0, electricity: 0, food: 0, shopping: 0, waste: 0 },
      { name: 'Week 4', transportation: 0, electricity: 0, food: 0, shopping: 0, waste: 0 },
    ];

    const now = new Date();
    logs.forEach((log) => {
      const logDate = new Date(log.logged_date);
      const diffDays = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let weekIdx = -1;
      if (diffDays >= 0 && diffDays < 7) weekIdx = 3;
      else if (diffDays >= 7 && diffDays < 14) weekIdx = 2;
      else if (diffDays >= 14 && diffDays < 21) weekIdx = 1;
      else if (diffDays >= 21 && diffDays < 30) weekIdx = 0;

      if (weekIdx !== -1) {
        weeklyData[weekIdx][log.category] += log.emission_amount;
      }
    });

    return weeklyData.map(w => ({
      ...w,
      transportation: Math.round(w.transportation),
      electricity: Math.round(w.electricity),
      food: Math.round(w.food),
      shopping: Math.round(w.shopping),
      waste: Math.round(w.waste),
    }));
  };

  const chartData = formatChartData();

  // Call receipt OCR endpoint with user file upload
  const handleReceiptUpload = async (file: File) => {
    setOcrScanStep('scanning');
    setOcrFeedback('Uploading receipt to secure GCS bucket...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/carbon/receipt', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.json().catch(() => ({}));
        throw new Error(errorText.detail || 'Vision API processing failure.');
      }

      const parsedResult = await res.json();
      
      const logged = addLog({
        category: parsedResult.category,
        emission_amount: parsedResult.emission_amount,
        source: 'ocr',
        description: parsedResult.description || 'Receipt Scan Activity',
      });

      setOcrScanStep('success');
      setOcrFeedback(`OCR Successful! Logged ${logged.emission_amount} kg CO₂ into ${logged.category}.`);
      
      setTimeout(() => setOcrScanStep('idle'), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setOcrScanStep('error');
      setOcrFeedback(`Error: ${msg}`);
      setTimeout(() => setOcrScanStep('idle'), 4000);
    }
  };

  // Demo scan helper to run pipeline visuals without file dialog
  const handleDemoScan = async () => {
    setOcrScanStep('scanning');
    setOcrFeedback('Triggering OCR sandbox pipelines...');

    try {
      const demoFormData = new FormData();
      // Create empty mock file
      const blob = new Blob(['mock-data'], { type: 'image/png' });
      const file = new File([blob], 'gas_station_invoice.png', { type: 'image/png' });
      demoFormData.append('file', file);

      const res = await fetch('/api/carbon/receipt', {
        method: 'POST',
        body: demoFormData,
      });

      if (!res.ok) throw new Error('Demo endpoint failed.');

      const parsedResult = await res.json();
      
      const logged = addLog({
        category: parsedResult.category,
        emission_amount: parsedResult.emission_amount,
        source: 'ocr',
        description: parsedResult.description || 'Whole Foods Organic Receipt',
      });

      setOcrScanStep('success');
      setOcrFeedback(`OCR Sandbox Success! Logged ${logged.emission_amount} kg CO₂ into ${logged.category}.`);
      setTimeout(() => setOcrScanStep('idle'), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Demo run failed';
      setOcrScanStep('error');
      setOcrFeedback(`Error: ${msg}`);
      setTimeout(() => setOcrScanStep('idle'), 4000);
    }
  };

  // Add Manual log entries
  const handleManualSubmit = (category: CategoryType, amount: number, description: string) => {
    addLog({
      category,
      emission_amount: amount,
      source: 'manual',
      description: description || `Manual ${category} entry`,
    });
  };

  // Connect AI Coach conversation dynamically to Edge Gemini Chat Endpoint
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    addChatMessage('user', userMessage);
    setChatInput('');
    setIsCoachTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatHistory, { role: 'user', content: userMessage }],
          userLogs: logs.slice(0, 10), // Pass logs as analytical context
        }),
      });

      if (!res.ok) throw new Error('Coach service connection failed.');

      const data = await res.json();
      addChatMessage('assistant', data.content);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      addChatMessage('assistant', `Coach Offline. Quick Tip: Switch to composting or public transit to save up to 40 kg CO₂ monthly. [Details: ${msg}]`);
    } finally {
      setIsCoachTyping(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER BAR */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Eco Dashboard</h1>
          <p className="text-zinc-500 mt-1">
            Track, explain, and manage your localized carbon emissions.
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="bg-zinc-100 hover:bg-white text-zinc-950 px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          aria-label="Add manual carbon footprint log entry"
        >
          <Plus className="w-4 h-4" /> Log Manual
        </button>
      </header>

      {/* OCR UPLOADER CARD */}
      <OcrScannerCard
        ocrScanStep={ocrScanStep}
        ocrFeedback={ocrFeedback}
        onReceiptUpload={handleReceiptUpload}
        onDemoScan={handleDemoScan}
      />

      {/* GRID OVERVIEW */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left main grids */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5">
              <ScoreGaugeCard
                currentEmissions={currentEmissions}
                baseline={baseline}
                ratio={ratio}
                grade={grade}
                gradeColor={gradeColor}
              />
            </div>
            <div className="md:col-span-7">
              <HistoryChartWidget chartData={chartData} />
            </div>
          </div>

          {/* Attributions and Log Table */}
          <ShapExplanationsCard explanations={shapData.explanations} />
          <RecentLogsCard logs={logs} onDeleteLog={deleteLog} />
        </div>

        {/* Right sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Action cards checklist */}
          <section className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl"></div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-1.5">
                <TrendingDown className="w-5 h-5 text-emerald-500" /> Next Reduction Actions
              </h2>
              <p className="text-xs text-zinc-500 mt-1 font-semibold uppercase tracking-wider">What to do next</p>
            </div>

            <div className="space-y-3">
              {challenges
                .filter((c) => c.status !== 'completed')
                .slice(0, 3)
                .map((challenge) => (
                  <div 
                    key={challenge.id} 
                    className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-colors ${
                      challenge.status === 'accepted' 
                        ? 'bg-emerald-500/5 border-emerald-500/20' 
                        : 'bg-zinc-950 border-zinc-800/80'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-sm text-zinc-200 leading-tight">{challenge.title}</span>
                        <span className="text-[10px] shrink-0 uppercase tracking-widest font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          -{challenge.potential_impact} kg/mo
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed font-semibold">{challenge.description}</p>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      {challenge.status === 'accepted' ? (
                        <button
                          onClick={() => completeChallenge(challenge.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-md cursor-pointer"
                        >
                          Complete Challenge
                        </button>
                      ) : (
                        <button
                          onClick={() => acceptChallenge(challenge.id)}
                          className="border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                        >
                          Accept Challenge
                        </button>
                      )}
                    </div>
                  </div>
                ))}

              {challenges.filter((c) => c.status !== 'completed').length === 0 && (
                <div className="text-center py-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                  <Check className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs text-emerald-400 font-bold">All challenges conquerered! Check achievements vault.</p>
                </div>
              )}
            </div>
          </section>

          {/* Conversations assistant */}
          <ChatCoachCard
            chatHistory={chatHistory}
            chatInput={chatInput}
            setChatInput={setChatInput}
            isCoachTyping={isCoachTyping}
            onSendMessage={handleSendMessage}
            onClearChat={clearChat}
          />
        </aside>

      </main>

      {/* POPUP LOG INPUT DIALOG */}
      <ManualLogDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleManualSubmit}
      />

    </div>
  );
}
