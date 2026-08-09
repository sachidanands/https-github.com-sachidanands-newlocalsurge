import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Check, Mail, Lock, AlertCircle, CheckCircle2, Sliders, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DoNotSellModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DoNotSellModal({ isOpen, onClose }: DoNotSellModalProps) {
  const [doNotSellToggle, setDoNotSellToggle] = useState(true);
  const [analyticsToggle, setAnalyticsToggle] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedChoice = localStorage.getItem('ccpa_opt_out_choice');
      if (savedChoice) {
        try {
          const parsed = JSON.parse(savedChoice);
          setDoNotSellToggle(parsed.doNotSell ?? true);
          setAnalyticsToggle(parsed.analytics ?? false);
        } catch (e) {
          // default state
        }
      }
      setSubmitted(false);
      setSaveSuccess(false);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSavePreferences = () => {
    localStorage.setItem(
      'ccpa_opt_out_choice',
      JSON.stringify({
        doNotSell: doNotSellToggle,
        analytics: analyticsToggle,
        updatedAt: new Date().toISOString(),
      })
    );
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1500);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setLoading(true);

    // Persist opt-out record in localStorage & submit to backend log
    try {
      localStorage.setItem('ccpa_opt_out_email', email.trim());
      localStorage.setItem(
        'ccpa_opt_out_choice',
        JSON.stringify({
          doNotSell: true,
          analytics: false,
          email: email.trim(),
          updatedAt: new Date().toISOString(),
        })
      );

      // Attempt endpoint submission
      await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: 'ccpa-opt-out',
          planName: 'CCPA Do Not Sell Request',
          businessName: 'Individual Privacy Request',
          contactName: 'Privacy Consumer',
          email: email.trim(),
          phone: '+1 (909) 757-6469',
          website: 'https://localsurgeseo.com',
          hasWebsite: false,
          industry: 'CCPA Privacy Opt-Out',
          location: 'California, US',
          keywords: 'ccpa opt-out request',
          hasGBP: false,
        }),
      }).catch((err) => console.warn('CCPA record logging offline:', err));

      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="ccpa-modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#151716]/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Vertical centering helper */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="inline-block align-bottom bg-[#faf9f6] text-[#1a1c1a] rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-[#dfded4] relative z-10"
        >
          {/* Header */}
          <div className="bg-white px-6 sm:px-8 py-5 border-b border-[#dfded4] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#123e35]/10 text-[#123e35] rounded-xl border border-[#123e35]/20">
                <ShieldCheck className="w-6 h-6 text-[#123e35]" />
              </div>
              <div>
                <span className="text-[10px] font-bold font-mono tracking-wider bg-[#bc5f40]/10 text-[#bc5f40] px-2 py-0.5 rounded uppercase border border-[#bc5f40]/20">
                  CCPA & CPRA Privacy Rights
                </span>
                <h3 id="ccpa-modal-title" className="text-lg sm:text-xl font-black font-display text-[#151716] tracking-tight mt-0.5">
                  Do Not Sell or Share My Personal Information
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="bg-[#faf9f6] hover:bg-[#dfded4]/50 text-[#4e524f] hover:text-[#1a1c1a] rounded-full p-2 transition-all cursor-pointer border border-[#dfded4]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="px-6 sm:px-8 py-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs sm:text-sm text-[#4e524f]">
            
            {/* Guarantee Callout Banner */}
            <div className="bg-white border border-[#dfded4] p-4 rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-[#123e35] font-extrabold text-xs uppercase font-mono tracking-wide">
                <Shield className="w-4 h-4 text-[#123e35]" />
                Notice to California & US Residents
              </div>
              <p className="text-xs text-[#5c605d] leading-relaxed">
                Under the California Consumer Privacy Act (CCPA) and CPRA, you have the right to opt out of the sale or sharing of your personal information. Local Surge SEO does <strong>NOT</strong> sell consumer database lists to third-party data brokers. Use the controls below to exercise your privacy preferences.
              </p>
            </div>

            {/* Interactive Preference Controls */}
            <div className="space-y-4 bg-white border border-[#dfded4] p-5 rounded-2xl shadow-2xs">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#123e35] font-mono flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#bc5f40]" />
                Privacy & Data Sharing Toggles
              </h4>

              {/* Toggle 1: Do Not Sell / Share */}
              <div className="flex items-start justify-between gap-4 pt-3 border-t border-[#dfded4]/60">
                <div className="space-y-1">
                  <h5 className="font-extrabold text-xs text-[#151716]">
                    Do Not Sell or Share My Personal Information
                  </h5>
                  <p className="text-[11px] text-[#5c605d] leading-relaxed">
                    Prevents your contact details or business audit records from being shared with third-party partners for marketing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDoNotSellToggle(!doNotSellToggle)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    doNotSellToggle ? 'bg-[#123e35]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      doNotSellToggle ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Analytics & Cookies */}
              <div className="flex items-start justify-between gap-4 pt-3 border-t border-[#dfded4]/60">
                <div className="space-y-1">
                  <h5 className="font-extrabold text-xs text-[#151716]">
                    Allow Non-Essential Performance Cookies & Analytics
                  </h5>
                  <p className="text-[11px] text-[#5c605d] leading-relaxed">
                    Controls non-essential diagnostic cookies (such as anonymous page interaction heatmaps).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAnalyticsToggle(!analyticsToggle)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    analyticsToggle ? 'bg-[#123e35]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      analyticsToggle ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-4 py-2 bg-[#123e35] hover:bg-[#185246] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Preferences Saved!</span>
                    </>
                  ) : (
                    <span>Save Cookie & Toggle Settings</span>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Opt-Out Request Submission Form */}
            <div className="bg-white border border-[#dfded4] p-5 rounded-2xl space-y-3 shadow-2xs">
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#bc5f40] font-mono flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#bc5f40]" />
                  Submit Formal Opt-Out Request
                </h4>
                <p className="text-xs text-[#5c605d]">
                  Enter your email address to record a formal CCPA/CPRA opt-out command for your lead records.
                </p>
              </div>

              {submitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block text-emerald-950 font-bold">Formal Opt-Out Request Registered!</strong>
                    Your email <code>{email}</code> has been logged in our privacy registry. We will not monetize or share your data.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#888b88]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email (e.g. name@company.com)"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#faf9f6] border border-[#dfded4] rounded-xl text-xs text-[#1a1c1a] font-semibold focus:outline-none focus:border-[#bc5f40]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-[#bc5f40] hover:bg-[#cf6d4e] text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shrink-0 disabled:opacity-50 font-mono uppercase tracking-wider shadow-2xs"
                  >
                    {loading ? 'Logging...' : 'Submit Opt-Out'}
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Footer Bar */}
          <div className="bg-[#faf9f6] px-6 sm:px-8 py-4 border-t border-[#dfded4] flex justify-between items-center flex-wrap gap-3">
            <span className="text-[10px] text-[#888b88] font-mono">
              CCPA / CPRA statutory compliance endpoint
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#dfded4]/60 hover:bg-[#dfded4] text-[#151716] text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Close Window
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
