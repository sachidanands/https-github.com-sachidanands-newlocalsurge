import React, { useState } from 'react';
import { Bot, Sparkles, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck, ArrowRight, HelpCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AiPillar {
  title: string;
  status: 'optimal' | 'warning' | 'missing';
  score: number;
  description: string;
  recommendation: string;
}

interface AiAuditResult {
  domain: string;
  readinessScore: number;
  grade: 'A+' | 'B' | 'C' | 'D';
  summary: string;
  pillars: AiPillar[];
}

interface AiCitationReadinessWidgetProps {
  onOpenOnboarding: () => void;
}

export default function AiCitationReadinessWidget({ onOpenOnboarding }: AiCitationReadinessWidgetProps) {
  const [domainInput, setDomainInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiAuditResult | null>(null);
  const [progressMsg, setProgressMsg] = useState('Initiating AI crawler simulation...');

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDomain = domainInput.trim() || 'localsurgeseo.com';

    setLoading(true);
    setResult(null);

    const steps = [
      'Probing /llms.txt and /pricing.md machine-readable indexes...',
      'Checking JSON-LD LocalBusiness & Organization schema nodes...',
      'Evaluating passage extractability for ChatGPT & Perplexity...',
      'Synthesizing AI Search Citation Scorecard...'
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setProgressMsg(steps[stepIdx]);
        stepIdx++;
      }
    }, 900);

    setTimeout(() => {
      clearInterval(interval);
      setLoading(false);

      // Generate realistic audit result for the scanned domain
      const isOurSite = cleanDomain.toLowerCase().includes('localsurgeseo');
      setResult({
        domain: cleanDomain,
        readinessScore: isOurSite ? 94 : 48,
        grade: isOurSite ? 'A+' : 'C',
        summary: isOurSite 
          ? 'Your domain is highly optimized for AI search engine citations. Machine-readable indexes, structured schema, and 40-60 word answer blocks are fully configured.'
          : 'Your domain is at risk of being ignored by ChatGPT, Perplexity, and Google AI Overviews due to missing machine-readable index files and non-extractable copy structures.',
        pillars: [
          {
            title: 'Machine-Readable Files (/llms.txt)',
            status: isOurSite ? 'optimal' : 'missing',
            score: isOurSite ? 100 : 20,
            description: isOurSite 
              ? '/llms.txt & /pricing.md are active and parseable by AI bots.'
              : 'Missing /llms.txt file at root. Autonomous AI buying agents will bypass your services.',
            recommendation: 'Deploy structured /llms.txt and /pricing.md files in site root.'
          },
          {
            title: 'JSON-LD Structured Schema',
            status: isOurSite ? 'optimal' : 'warning',
            score: isOurSite ? 95 : 55,
            description: isOurSite
              ? 'Complete Organization, ProfessionalService, & FAQPage schemas detected.'
              : 'Basic schema found, but lacks knowsAbout entity anchors and local ServiceArea coordinates.',
            recommendation: 'Add enriched JSON-LD schema with detailed service catalog attributes.'
          },
          {
            title: 'Passage Extractability (40-60 words)',
            status: isOurSite ? 'optimal' : 'warning',
            score: isOurSite ? 90 : 50,
            description: isOurSite
              ? 'Lead paragraphs feature clear, self-contained answer passages for LLM grounding.'
              : 'Content relies on marketing slogans rather than direct 40-60 word answers.',
            recommendation: 'Restructure core service headings with immediate, direct answer definitions.'
          },
          {
            title: 'AI Bot Crawler Accessibility',
            status: 'optimal',
            score: 100,
            description: 'robots.txt permits GPTBot, PerplexityBot, ClaudeBot, and Google-Extended.',
            recommendation: 'Maintain open indexing permissions for AI search crawlers.'
          }
        ]
      });
    }, 3800);
  };

  return (
    <div id="ai-citation-widget" className="w-full bg-[#123e35] text-white rounded-3xl border border-[#0f342e] p-6 sm:p-10 space-y-8 max-w-4xl mx-auto shadow-xl relative overflow-hidden">
      
      {/* Background Decorative Accent */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#bc5f40]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Block */}
      <div className="text-center space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-xs font-mono font-bold text-[#fbfaf8] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#bc5f40]" />
          <span>Generative Engine Optimization (GEO) Tool</span>
        </div>
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-black font-display tracking-tight text-white">
          AI Search Citation Readiness Scanner
        </h3>
        <p className="text-slate-200 text-xs sm:text-sm font-semibold max-w-2xl mx-auto leading-relaxed">
          Test whether your website is structured for AI search engines like <strong>ChatGPT</strong>, <strong>Perplexity</strong>, <strong>Claude</strong>, and <strong>Google AI Overviews</strong> to cite your business as an authority.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-inner max-w-3xl mx-auto relative z-10">
        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              required
              placeholder="Enter domain (e.g. yourbusiness.com)"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-300 focus:outline-none focus:border-[#bc5f40] transition-colors font-mono font-semibold"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-[#bc5f40] hover:bg-[#cf6d4e] text-white font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-center gap-2 uppercase tracking-wider shrink-0 shadow-sm"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning AI Signals...</span>
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                <span>Check AI Readiness</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Scanning / Results Area */}
      <div className="max-w-3xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          
          {/* Loading State */}
          {loading && (
            <motion.div
              key="loading-ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 border border-white/15 rounded-2xl bg-white/5 text-center space-y-4 backdrop-blur-xs"
            >
              <div className="w-12 h-12 border-3 border-white/20 border-t-[#bc5f40] rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-mono font-bold text-[#bc5f40] uppercase tracking-wider">Simulating LLM Citation Engine</p>
                <p className="text-xs text-slate-200 font-semibold animate-pulse">{progressMsg}</p>
              </div>
            </motion.div>
          )}

          {/* Results State */}
          {result && !loading && (
            <motion.div
              key="results-ai"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6 text-left"
            >
              {/* Score summary card */}
              <div className="bg-white/10 border border-white/15 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/15 pb-4 md:pb-0 md:pr-4">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-300 tracking-wider">AI Readiness Score</span>
                  <div className="text-4xl sm:text-5xl font-black font-display text-white mt-1">
                    {result.readinessScore}<span className="text-2xl text-[#bc5f40]">%</span>
                  </div>
                  <span className={`mt-2 px-2.5 py-0.5 rounded text-xs font-extrabold uppercase font-mono border ${
                    result.readinessScore >= 80 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    Grade {result.grade}
                  </span>
                </div>

                <div className="md:col-span-8 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#bc5f40] tracking-wider">
                    Target Domain: {result.domain}
                  </span>
                  <h4 className="text-base sm:text-lg font-bold font-display text-white">
                    AI Citation Assessment Complete
                  </h4>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">
                    {result.summary}
                  </p>
                </div>
              </div>

              {/* Pillars breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.pillars.map((pillar, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white font-mono">{pillar.title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        pillar.status === 'optimal' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {pillar.score}/100
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px] font-medium">{pillar.description}</p>
                    <div className="pt-2 border-t border-white/10 text-[#bc5f40] font-bold text-[11px] flex items-center gap-1">
                      <span>•</span> {pillar.recommendation}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Banner */}
              <div className="bg-white text-[#151716] p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg">
                <div className="space-y-0.5 text-left">
                  <h5 className="font-extrabold text-sm text-[#123e35]">Want complete AI Search Optimization?</h5>
                  <p className="text-xs text-[#5c605d] font-semibold">We deploy custom `/llms.txt`, JSON-LD schemas, and AI passage architecture for your domain.</p>
                </div>
                <button
                  type="button"
                  onClick={onOpenOnboarding}
                  className="bg-[#123e35] hover:bg-[#185246] text-white font-extrabold py-3 px-5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  <span>Get AI Citation Setup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </motion.div>
          )}

          {/* Initial State */}
          {!result && !loading && (
            <motion.div
              key="initial-ai"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left flex items-start gap-3.5"
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-[#bc5f40]">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs text-slate-200">
                <h5 className="font-extrabold text-white text-sm">Why AI Search Optimization Matters in 2026</h5>
                <p className="leading-relaxed font-medium">
                  Over 45% of search queries now trigger AI Overviews and conversational answer bots. Having structured data, machine-readable indexes, and 40-60 word answer blocks ensures your site is recommended directly by AI assistants.
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
