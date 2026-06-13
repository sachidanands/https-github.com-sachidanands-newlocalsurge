import React, { useState, useEffect } from 'react';
import { 
  Bot, RefreshCw, Star, CheckCircle, AlertCircle, Sparkles, ArrowRight, ShieldCheck, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SeoPillar {
  title: string;
  score: number;
  description: string;
  recommendations: string[];
}

interface SeoResult {
  overallScore: number;
  domainName: string;
  executiveSummary: string;
  analysis: SeoPillar[];
}

interface SeoHomeToolProps {
  onOpenOnboarding: () => void;
  hideTitle?: boolean;
  isHomePage?: boolean;
  initialUrl?: string;
  autoAnalyze?: boolean;
  onClearAutoAnalyze?: () => void;
  onAnalyzeFromHome?: (url: string) => void;
}

export default function SeoHomeTool({ 
  onOpenOnboarding, 
  hideTitle = false,
  isHomePage = false,
  initialUrl = '',
  autoAnalyze = false,
  onClearAutoAnalyze,
  onAnalyzeFromHome
}: SeoHomeToolProps) {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressMsg, setProgressMsg] = useState('Initiating domain audits...');

  const runAnalysis = async (targetUrl?: string) => {
    const urlToUse = (targetUrl !== undefined ? targetUrl : urlInput).trim();
    if (!urlToUse) return;

    setLoading(true);
    setResult(null);
    setError(null);

    // Simulate progress changes for maximum premium feel
    const progressSteps = [
      'Sending domain connection check...',
      'Analyzing local structured markup & keywords...',
      'Consulting Gemini models for regional search competitiveness...',
      'Compiling final scorecards & action plan...'
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < progressSteps.length) {
        setProgressMsg(progressSteps[stepIdx]);
        stepIdx++;
      }
    }, 1200);

    try {
      // Use the actual backend API for real live analysis
      const response = await fetch('/api/seo-tool/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlToUse,
          niche: 'Local Contractor & Services',
          location: 'US Regional Target'
        })
      });

      clearInterval(interval);

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        setError('Unable to analyze this URL. Please verify the domain and try again.');
      }
    } catch (err) {
      clearInterval(interval);
      console.error('Error in SEO analysis:', err);
      setError('A temporary network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = urlInput.trim();
    if (!url) return;

    if (isHomePage && onAnalyzeFromHome) {
      onAnalyzeFromHome(url);
    } else {
      runAnalysis(url);
    }
  };

  useEffect(() => {
    if (initialUrl) {
      setUrlInput(initialUrl);
    }
  }, [initialUrl]);

  useEffect(() => {
    if (autoAnalyze && initialUrl && onClearAutoAnalyze) {
      onClearAutoAnalyze();
      runAnalysis(initialUrl);
    }
  }, [autoAnalyze, initialUrl, onClearAutoAnalyze]);

  return (
    <div id="free-seo-tool-home" className="w-full bg-[#faf9f6]/95 rounded-3xl border border-[#dfded4] p-6 sm:p-10 text-center space-y-8 max-w-4xl mx-auto shadow-sm">
      
      {/* Title block exactly matching the screenshot */}
      <div className="space-y-3">
        {!hideTitle && (
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-[#123e35] leading-none tracking-tight">
            Free SEO Analysis Tool
          </h2>
        )}
        <p className="text-[#4e524f] max-w-2xl mx-auto text-xs sm:text-sm font-semibold leading-relaxed">
          Enter your website URL to get AI-powered recommendations on how to improve your search engine ranking and attract more local customers.
        </p>
      </div>

      {/* Input container card */}
      <div className="bg-white border border-[#dfded4] rounded-2xl p-5 sm:p-6 shadow-xs max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3.5 items-center w-full">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              required
              placeholder="https://example.com"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="bg-[#faf9f6]/95 border border-[#dfded4] rounded-xl w-full px-4 py-3 text-xs sm:text-sm text-[#1a1c1a]/90 placeholder-[#888b88] focus:outline-none focus:border-[#123e35] transition-colors font-semibold"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-[#123e35] hover:bg-[#185246] text-white font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm cursor-pointer select-none transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <span>Analyze Website</span>
            )}
          </button>
        </form>
      </div>

      {/* Dynamic Results / States Container */}
      {!isHomePage && (
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            
            {/* Error State */}
            {error && (
              <motion.div
                key="error-box"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3 text-left text-xs sm:text-sm"
              >
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <p className="font-extrabold">Analysis Failed</p>
                  <p className="font-semibold text-red-600/90 mt-0.5">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {loading && (
              <motion.div
                key="loading-box"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 border border-dashed border-[#dfded4] rounded-2xl bg-white space-y-4 shadow-2xs"
              >
                <div className="w-10 h-10 border-2 border-[#dfded4] border-t-[#123e35] rounded-full animate-spin mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-black font-mono text-[#123e35] uppercase tracking-wider">Gathering Search Engine Insights</p>
                  <p className="text-xs text-[#4e524f] font-semibold animate-pulse">{progressMsg}</p>
                </div>
              </motion.div>
            )}

            {/* SUCCESS State: Render detailed analysis card with visual graphics */}
            {result && !loading && (
              <motion.div
                key="success-box"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6 text-left"
              >
                <div className="bg-[#123e35] text-white rounded-2xl p-6.5 border border-[#0f342e] grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-xs">
                  
                  {/* Score gauge */}
                  <div className="md:col-span-4 flex justify-center">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle className="text-white/10" strokeWidth="6" stroke="currentColor" fill="transparent" r="38" cx="48" cy="48" />
                        <circle 
                          className="text-[#bc5f40]" 
                          strokeWidth="8" 
                          strokeDasharray={2 * Math.PI * 38}
                          strokeDashoffset={2 * Math.PI * 38 * (1 - result.overallScore / 100)}
                          strokeLinecap="round" 
                          stroke="currentColor" 
                          fill="transparent" 
                          r="38" cx="48" cy="48" 
                        />
                      </svg>
                      <span className="absolute text-2xl font-black font-display text-white">{result.overallScore}%</span>
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-2">
                    <span className="px-2 py-0.5 text-[9px] font-bold font-mono tracking-wider bg-white/10 border border-white/10 text-white uppercase rounded">
                      Score Card for: {result.domainName}
                    </span>
                    <h4 className="text-lg font-bold font-display text-white leading-tight">
                      Website Audit Complete
                    </h4>
                    <p className="text-xs text-slate-100 font-medium leading-relaxed">
                      {result.executiveSummary}
                    </p>
                  </div>
                </div>

                {/* Pillars list */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.analysis.map((pillar, idx) => (
                    <div key={idx} className="bg-white border border-[#dfded4] p-4.5 rounded-xl space-y-3.5 shadow-2xs">
                      <div className="flex justify-between items-center bg-[#faf9f6] -mx-4.5 -mt-4.5 p-3.5 border-b border-[#dfded4] rounded-t-xl">
                        <h5 className="font-extrabold text-xs text-[#151716] uppercase tracking-wide">{pillar.title}</h5>
                        <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded border ${
                          pillar.score >= 70 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {pillar.score}/100
                        </span>
                      </div>

                      <p className="text-xs text-[#4e524f] leading-relaxed font-semibold">
                        {pillar.description}
                      </p>

                      <div className="pt-2 border-t border-[#dfded4]/80">
                        <span className="text-[10px] font-black uppercase text-[#bc5f40] font-mono tracking-wider block mb-1">Top Action Item</span>
                        <ul className="space-y-1 text-xs text-[#2c2d2c] font-semibold">
                          {pillar.recommendations.map((rec, i) => (
                            <li key={i} className="flex gap-1.5 leading-snug">
                              <span className="text-[#bc5f40] font-black shrink-0">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Call to action panel */}
                <div className="p-5 bg-white border border-[#dfded4] rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-2xs">
                  <div className="text-left space-y-0.5">
                    <h4 className="font-extrabold text-sm text-[#151716]">Want to solve these deficiencies?</h4>
                    <p className="text-xs text-[#4e524f] font-semibold">Our expert squad handles complete domain optimization and schema deployment.</p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenOnboarding}
                    className="bg-[#bc5f40] hover:bg-[#cf6d4e] text-white font-extrabold py-3 px-5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all shrink-0 flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>Optimize My Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </motion.div>
            )}

            {/* INITIAL State matching screenshot EXACTLY */}
            {!result && !loading && !error && (
              <motion.div
                key="placeholder-box"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#faf9f6]/95 border border-[#dfded4] rounded-xl p-4.5 shadow-2xs text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#dfded4] flex items-center justify-center text-[#123e35] shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4 text-[#123e35]" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-[#111311] text-sm flex items-center gap-1.5">
                      Ready to Analyze
                    </h3>
                    <p className="text-slate-500 font-semibold text-xs sm:text-sm">
                      Your SEO recommendations will appear here once you submit a URL.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
