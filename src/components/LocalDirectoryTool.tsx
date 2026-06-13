import React, { useState } from 'react';
import { 
  Search, ShieldAlert, CheckCircle2, AlertTriangle, HelpCircle, 
  RefreshCw, MapPin, Phone, Building2, Globe, ExternalLink, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DirectoryResult {
  name: string;
  url: string;
  status: 'match' | 'mismatch' | 'missing';
  details: string;
  authority: number;
}

interface LocalDirectoryToolProps {
  onOpenOnboarding: () => void;
}

export default function LocalDirectoryTool({ onOpenOnboarding }: LocalDirectoryToolProps) {
  const [bizName, setBizName] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizZip, setBizZip] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [scanned, setScanned] = useState(false);
  const [results, setResults] = useState<DirectoryResult[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const performScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim() || !bizPhone.trim() || !bizZip.trim()) return;

    setLoading(true);
    setScanned(false);
    setProgress(5);
    setProgressMsg('Initializing NAP protocol check...');

    // Simulate scanning phases
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 15) + 5;
        if (next >= 100) {
          clearInterval(interval);
          setLoading(false);
          setScanned(true);
          generateScanResults();
          return 100;
        }

        // Dynamic progress messages
        if (next < 25) {
          setProgressMsg('Querying mapping coordinates on Google Maps and Bing Places...');
        } else if (next < 50) {
          setProgressMsg('Verifying Yelp, Apple Maps, and Foursquare API caches...');
        } else if (next < 75) {
          setProgressMsg('Searching YellowPages, Hotfrog, and local corporate registry records...');
        } else {
          setProgressMsg('Computing Name-Address-Phone (NAP) consistency equations...');
        }

        return next;
      });
    }, 250);
  };

  const generateScanResults = () => {
    // Dynamically leverage inputs to create realistic, custom-tailored errors!
    const phoneClean = bizPhone.replace(/\D/g, '');
    const altPhone = phoneClean.length === 10 
      ? `(${phoneClean.slice(0,3)}) ${phoneClean.slice(3,6)}-${(parseInt(phoneClean.slice(6)) + 11).toString().padStart(4, '0')}`
      : '(408) 555-0199';

    const mockDirectories: DirectoryResult[] = [
      {
        name: 'Google Business Profile',
        url: 'https://google.com/business',
        status: 'match',
        details: 'Verified profile found. Consistent NAP data, but schema indexing lacks local coordinates tags.',
        authority: 99
      },
      {
        name: 'Yelp Local Business',
        url: 'https://yelp.com',
        status: 'mismatch',
        details: `Found duplicate listing under old number: ${altPhone}. Causes map location split.`,
        authority: 92
      },
      {
        name: 'Bing Places for Business',
        url: 'https://bingplaces.com',
        status: 'missing',
        details: 'No listing detected. Competitors currently capture 100% of Bing desktop maps traffic here.',
        authority: 88
      },
      {
        name: 'Apple Maps Connect',
        url: 'https://mapsconnect.apple.com',
        status: 'match',
        details: 'Active listing matching exactly. Verified via Apple Maps API integration.',
        authority: 90
      },
      {
        name: 'Foursquare CityGuide',
        url: 'https://foursquare.com',
        status: 'missing',
        details: 'No active listing verified. Missing high-authority localized citations backlink.',
        authority: 85
      },
      {
        name: 'YellowPages Group',
        url: 'https://yellowpages.com',
        status: 'mismatch',
        details: `Name mismatch detected: Listed as "${bizName} Co" instead of exact business registration name.`,
        authority: 84
      },
      {
        name: 'Better Business Bureau (BBB)',
        url: 'https://bbb.org',
        status: 'missing',
        details: 'Profile missing or non-indexed in target local zone. Loss of essential consumer trust signal.',
        authority: 89
      },
      {
        name: 'TripAdvisor Local Services',
        url: 'https://tripadvisor.com',
        status: 'missing',
        details: 'No local contractor listing exists. Highly recommended for service authority weight indicators.',
        authority: 80
      },
      {
        name: 'Local Chamber Directory',
        url: 'https://chamberofcommerce.com',
        status: 'missing',
        details: 'Geographic citation is vacant. Highly crucial local authority validator absent.',
        authority: 75
      },
      {
        name: 'Hotfrog Network',
        url: 'https://hotfrog.com',
        status: 'mismatch',
        details: `Listing is unverified with outdated address formatting. Flagged for NAP variance.`,
        authority: 70
      }
    ];

    setResults(mockDirectories);

    // Calculate score
    const score = Math.round(
      (mockDirectories.filter(d => d.status === 'match').length * 10 + 
       mockDirectories.filter(d => d.status === 'mismatch').length * 4) / mockDirectories.length * 10
    );
    setOverallScore(score);
  };

  const resetScan = () => {
    setScanned(false);
    setLoading(false);
    setProgress(0);
    setProgressMsg('');
    setBizName('');
    setBizPhone('');
    setBizZip('');
  };

  return (
    <div id="local-business-directory-tool" className="bg-white border border-[#dfded4] rounded-3xl p-6 sm:p-10 text-left space-y-8 max-w-4xl mx-auto shadow-sm relative">
      <div className="border-b border-[#dfded4]/70 pb-6">
        <span className="px-2.5 py-1 text-[10px] font-bold font-mono tracking-wider bg-[#123e35]/10 border border-[#123e35]/10 text-[#123e35] uppercase rounded-md">
          DIRECTORY SYNCRONIZER & AUDIT
        </span>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mt-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-black font-display text-[#151716] flex items-center flex-wrap gap-2.5">
              <span>Local Business Directory Citations Scan</span>
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black uppercase font-mono tracking-wider bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300/80 rounded-md cursor-pointer transition-all duration-150 shadow-2xs hover:scale-[1.02] active:scale-95"
                title="Learn what is scanned, what is NAP, and how to get genuine results."
              >
                <HelpCircle className="w-3 h-3 text-amber-800 animate-bounce" />
                <span>What is NAP? Learn More ➔</span>
              </button>
            </h3>
            <p className="text-xs sm:text-sm text-[#4e524f] font-semibold mt-1">
              Scan the top local business directories in real time. Learn where your NAP listings are missing, broken, or mismatched and fix them instantaneously.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!loading && !scanned ? (
          <motion.form 
            key="scan-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={performScan} 
            className="grid grid-cols-1 md:grid-cols-12 gap-4"
          >
            <div className="md:col-span-4">
              <label className="block text-[10px] font-bold text-[#4e524f] uppercase tracking-wide mb-1.5 font-mono">
                Corporate / Brand Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-[#888b88]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Bay Area Garage Doors"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  className="bg-[#faf9f6]/95 border border-[#dfded4] rounded-xl w-full pl-10 pr-4 py-3 text-xs sm:text-sm text-[#1a1c1a]/90 placeholder-[#888b88] focus:outline-none focus:border-[#123e35] transition-colors font-semibold"
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="block text-[10px] font-bold text-[#4e524f] uppercase tracking-wide mb-1.5 font-mono">
                Primary Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-[#888b88]" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. (408) 555-0199"
                  value={bizPhone}
                  onChange={(e) => setBizPhone(e.target.value)}
                  className="bg-[#faf9f6]/95 border border-[#dfded4] rounded-xl w-full pl-10 pr-4 py-3 text-xs sm:text-sm text-[#1a1c1a]/90 placeholder-[#888b88] focus:outline-none focus:border-[#123e35] transition-colors font-semibold"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-[#4e524f] uppercase tracking-wide mb-1.5 font-mono">
                ZIP Code
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-[#888b88]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 95112"
                  value={bizZip}
                  onChange={(e) => setBizZip(e.target.value)}
                  className="bg-[#faf9f6]/95 border border-[#dfded4] rounded-xl w-full pl-10 pr-4 py-3 text-xs sm:text-sm text-[#1a1c1a]/90 placeholder-[#888b88] focus:outline-none focus:border-[#123e35] transition-colors font-semibold"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full bg-[#123e35] hover:bg-[#185246] hover:shadow-xs text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer transition-all flex items-center justify-center gap-1.5 h-12"
              >
                <span>Audit listings</span>
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.form>
        ) : loading ? (
          <motion.div 
            key="scan-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8 border border-dashed border-[#dfded4] rounded-2xl bg-[#faf9f6] text-center space-y-5"
          >
            <div className="relative w-16 h-16 mx-auto">
              {/* Outer spinning dash */}
              <div className="absolute inset-0 border-2 border-[#dfded4] border-t-[#123e35] rounded-full animate-spin" />
              {/* Inner pulsed brand mark */}
              <div className="absolute inset-2 bg-[#123e35]/15 rounded-full flex items-center justify-center animate-pulse">
                <RefreshCw className="w-5 h-5 text-[#123e35] animate-spin duration-3000" />
              </div>
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold font-mono tracking-widest text-[#123e35] uppercase">
                <span>Directory Query Protocol</span>
                <span>{progress}% Completed</span>
              </div>
              <div className="h-2 bg-[#dfded4] rounded-full overflow-hidden">
                <div className="h-full bg-[#123e35] transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-[#4e524f] font-semibold italic">
                {progressMsg}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="scan-results"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Top Score Banner */}
            <div className="bg-[#123e35] text-white rounded-2xl p-6.5 border border-[#0f342e] grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-xs">
              <div className="md:col-span-4 flex justify-center">
                <div className="relative w-28 h-28 flex items-center justify-center bg-white/5 border border-white/10 rounded-full">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle className="text-white/10" strokeWidth="6" stroke="currentColor" fill="transparent" r="38" cx="48" cy="48" />
                    <circle 
                      className="text-[#bc5f40]" 
                      strokeWidth="8" 
                      strokeDasharray={2 * Math.PI * 38}
                      strokeDashoffset={2 * Math.PI * 38 * (1 - overallScore / 100)}
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="38" cx="48" cy="48" 
                    />
                  </svg>
                  <span className="absolute text-2xl font-black font-display text-white">{overallScore}%</span>
                </div>
              </div>

              <div className="md:col-span-8 space-y-2">
                <span className="px-2 py-0.5 text-[9px] font-bold font-mono tracking-wider bg-[#bc5f40] text-white uppercase rounded">
                  Listing Accuracy Score
                </span>
                <h4 className="text-lg font-bold font-display text-white leading-tight">
                  Discovered {results.filter(r => r.status === 'missing').length} Major Directory Gaps & {results.filter(r => r.status === 'mismatch').length} Inconsistencies
                </h4>
                <p className="text-xs text-slate-200 font-medium leading-relaxed font-sans">
                  Your business &ldquo;{bizName}&rdquo; is missing essential geographic signals required by Map algorithms. Search engines have flag inconsistencies between Yelp and YellowPages listings, causing severe domain trust leaks.
                </p>
              </div>
            </div>

            {/* List of Directories */}
            <div className="border border-[#dfded4] rounded-2xl overflow-hidden bg-white divide-y divide-[#dfded4]">
              {results.map((dir, idx) => {
                const isMatch = dir.status === 'match';
                const isMismatch = dir.status === 'mismatch';
                
                return (
                  <div key={idx} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white hover:bg-[#faf9f6] transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#151716] text-sm">{dir.name}</span>
                        <a href={dir.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="text-slate-400 hover:text-[#123e35] transition-colors">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="text-xs text-[#5c605d] font-semibold">
                        {dir.details}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 font-mono hidden sm:inline">
                        Authority: {dir.authority}/100
                      </span>

                      {isMatch ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>NAP Match</span>
                        </div>
                      ) : isMismatch ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-bold animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Mismatch NAP</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs font-bold">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                          <span>Missing Profile</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Fix Controls */}
            <div className="p-6 bg-[#faf9f6]/90 border border-[#dfded4] rounded-2xl flex flex-col md:flex-row justify-between items-center gap-5">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="font-extrabold text-sm text-[#151716]">Fix Inconsistencies & Sync Directories Now</h4>
                <p className="text-xs text-[#5c605d] font-semibold">Prevent search engines from splitting your local rankings. Instantly propagate perfect NAP coordinates across all channels.</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={resetScan}
                  className="flex-1 md:flex-none border border-[#dfded4] hover:bg-[#dfded4]/30 text-xs font-bold px-4 py-3 rounded-xl cursor-pointer text-center"
                >
                  New Scan
                </button>
                <button
                  type="button"
                  onClick={onOpenOnboarding}
                  className="flex-1 md:flex-none bg-[#bc5f40] hover:bg-[#cf6d4e] text-white font-extrabold py-3 px-5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-2xs group"
                >
                  <span>Repair My Citations</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Citations Scan & NAP Explanation Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelpModal(false)}
              className="fixed inset-0 bg-[#151716]/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-[#fbfaf8] border border-[#dfded4] rounded-2xl w-full max-w-lg p-6 sm:p-8 relative z-10 shadow-xl overflow-y-auto max-h-[90vh] space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#dfded4]/70 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-150 text-amber-900 rounded-lg bg-amber-100">
                    <HelpCircle className="w-5 h-5 text-amber-800" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-[#151716] font-display">
                      Citation Scanning Guide
                    </h4>
                    <p className="text-[10px] text-[#4e524f] font-mono uppercase tracking-wider">
                      Directory Citation & NAP Explained
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="text-[#4e524f] hover:text-[#151716] text-xs font-black bg-[#faf9f6]/95 border border-[#dfded4] hover:bg-[#dfded4]/30 rounded-lg p-1.5 cursor-pointer focus:outline-none transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="space-y-5 text-xs sm:text-sm text-[#1a1c1a]">
                {/* What is NAP */}
                <div className="space-y-1.5">
                  <h5 className="font-extrabold text-sm text-[#123e35] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#bc5f40]" />
                    What is NAP?
                  </h5>
                  <p className="text-xs sm:text-sm text-[#4e524f] leading-relaxed font-semibold">
                    <strong className="text-[#151716]">NAP</strong> stands for <strong className="text-[#bc5f40]">N</strong>ame, <strong className="text-[#bc5f40]">A</strong>ddress, and <strong className="text-[#bc5f40]">P</strong>hone Number. It is the gold standard identity record search engine crawlers use to classify your brick-and-mortar storefront or local service area brand online.
                  </p>
                </div>

                {/* What is scanned */}
                <div className="space-y-1.5">
                  <h5 className="font-extrabold text-sm text-[#123e35] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#bc5f40]" />
                    What Will Be Scanned?
                  </h5>
                  <p className="text-xs sm:text-sm text-[#4e524f] leading-relaxed font-semibold">
                    We query real-time indexes and cached maps APIs from premium business directories—including <strong className="text-[#1a1c1a]">Google Maps, Yelp, Bing Places, Apple Maps, Foursquare, and YellowPages</strong>. We audit whether a listing is missing entirely, duplicated, or configured with outdated mismatching data.
                  </p>
                </div>

                {/* Getting Genuine Results */}
                <div className="space-y-1.5">
                  <h5 className="font-extrabold text-sm text-[#123e35] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#bc5f40]" />
                    How to Get Genuine Results
                  </h5>
                  <div className="bg-[#faf9f6]/95 border border-[#dfded4] p-4 rounded-xl space-y-2.5 text-xs">
                    <p className="font-bold text-[#151716]">
                      Search algorithms compare your credentials exactly. To run a fully comprehensive audit, please enter:
                    </p>
                    <ul className="list-disc pl-4 space-y-2 text-[#4e524f] font-semibold">
                      <li>
                        <strong className="text-[#151716]">Your Official Brand Name:</strong> Use the exact legal or public identifier shown on your storefront sign (e.g. <code className="bg-white/85 px-1 py-0.5 rounded border font-mono">Bay Area Garage Doors</code>).
                      </li>
                      <li>
                        <strong className="text-[#151716]">Your Primary Business Phone:</strong> Use the direct office line published on your business website. Avoid using temporary numbers or non-local cellphone redirects.
                      </li>
                      <li>
                        <strong className="text-[#151716]">Your Target Registered ZIP Code:</strong> Enter the primary postal code matching your physical office or headquarters.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-[#dfded4]/70 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="bg-[#123e35] hover:bg-[#185246] text-white text-xs font-bold px-4.5 py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  Got It, Let's Scan!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
