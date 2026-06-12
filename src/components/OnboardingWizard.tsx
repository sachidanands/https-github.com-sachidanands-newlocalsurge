import React, { useState, useEffect } from 'react';
import { Plan, LeadInput, SEOAuditResult, Lead } from '../types';
import { 
  X, Check, AlertCircle, RefreshCw, BarChart2, ShieldCheck, Mail, Phone, Globe, MapPin, 
  Search, Shield, ChevronLeft, ChevronRight, FileText, CheckSquare, Sparkles, Building2, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPlan: Plan | null;
  onLeadSubmitted?: (lead: Lead) => void;
}

const NICHES = [
  'HVAC & Air Conditioning',
  'Dentistry & Orthodontics',
  'Plumbing Services',
  'Roofing & Siding',
  'Home Contracting & Remodeling',
  'Legal & Attorneys',
  'Real Estate Agency',
  'Medical Clinic & Chiropractor',
  'Hair Salon & Spa',
  'SaaS & Tech Services',
  'Local Retail Boutique',
  'Other Local Business'
];

export default function OnboardingWizard({ isOpen, onClose, preselectedPlan, onLeadSubmitted }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hasWebsite, setHasWebsite] = useState(true);
  const [website, setWebsite] = useState('');
  const [hasGBP, setHasGBP] = useState(true);
  const [gbpLink, setGbpLink] = useState('');
  const [industry, setIndustry] = useState(NICHES[0]);
  const [location, setLocation] = useState('');
  const [keywords, setKeywords] = useState('');

  // Results
  const [submittedLead, setSubmittedLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError(null);
      setSubmittedLead(null);
      setLoading(false);
    }
  }, [isOpen]);

  // Loading messages rotation
  useEffect(() => {
    if (!loading) return;
    const messages = [
      'Establishing geo-targeting matrix...',
      'Analyzing competitor search authority in your region...',
      'Scanning local Google Business Profile citations...',
      'Executing keyword opportunity mapping with Gemini...',
      'Synthesizing personalized Local Surge Roadmap...'
    ];
    let i = 0;
    setLoadingMessage(messages[0]);
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingMessage(messages[i]);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  if (!isOpen) return null;

  const validateStep1 = () => {
    if (!businessName.trim()) return 'Business name is required.';
    if (!contactName.trim()) return 'Contact person name is required.';
    if (!email.trim() || !email.includes('@')) return 'Please provide a valid email.';
    if (!phone.trim()) return 'Phone number is required.';
    return null;
  };

  const validateStep2 = () => {
    if (hasWebsite && !website.trim()) return 'Please provide your current website URL or check "No Website".';
    if (hasGBP && !gbpLink.trim()) return 'Please enter your Google Business profile search query or link, or specify "We need help setting it up".';
    return null;
  };

  const validateStep3 = () => {
    if (!location.trim()) return 'Please specify your target city/metropolitan location.';
    if (!keywords.trim()) return 'Please share at least 2 primary keywords or services.';
    return null;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      const stepError = validateStep1();
      if (stepError) {
        setError(stepError);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const stepError = validateStep2();
      if (stepError) {
        setError(stepError);
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);
    const stepError = validateStep3();
    if (stepError) {
      setError(stepError);
      return;
    }

    setLoading(true);

    const leadInput: LeadInput = {
      planId: preselectedPlan?.id || 'custom-inquiry',
      planName: preselectedPlan?.name || 'Custom SEO Inquiry',
      businessName,
      contactName,
      email,
      phone,
      website: hasWebsite ? website : '',
      hasWebsite,
      industry,
      location,
      keywords,
      hasGBP,
      gbpLink: hasGBP ? gbpLink : ''
    };

    try {
      const response = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadInput),
      });

      if (!response.ok) {
        throw new Error('Onboarding data submission failed. Please try again.');
      }

      const result = await response.json();
      if (result.success && result.lead) {
        setSubmittedLead(result.lead);
        if (onLeadSubmitted) {
          onLeadSubmitted(result.lead);
        }
        setStep(4); // Advance to results!
      } else {
        throw new Error(result.error || 'Unknown server error.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed connecting to onboarding server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-[#1a1c1a]/60 backdrop-blur-md transition-opacity" onClick={loading ? undefined : onClose} aria-hidden="true" />

        {/* Trick to center modal in browser */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-[#f7f6f2] text-[#1a1c1a] rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-[#dfded4]">
          
          {/* Header */}
          <div className="bg-[#faf9f6] px-6 py-5 border-b border-[#dfded4] flex justify-between items-center mutual-modal-header">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 text-[10px] font-bold font-mono tracking-wider bg-[#bc5f40]/10 text-[#bc5f40] border border-[#bc5f40]/20 rounded uppercase">
                  {preselectedPlan ? `${preselectedPlan.name} Setup` : 'Instant Local Strategy'}
                </span>
                {step < 4 && (
                  <span className="text-xs font-bold text-[#4e524f] font-mono">
                    Step {step} of 3
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold font-display text-[#151716] mt-2 tracking-tight">
                {step === 1 && "Business & Contact Information"}
                {step === 2 && "Digital Presence Footprint"}
                {step === 3 && "Market Focus & Targets"}
                {step === 4 && "⭐ Custom Local SEO Roadmap"}
              </h3>
            </div>
            {!loading && (
              <button
                type="button"
                className="bg-white hover:bg-[#dfded4] text-[#4e524f] hover:text-[#1a1c1a] rounded-full p-1.5 transition-all cursor-pointer border border-[#dfded4]"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="px-6 py-6 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-800 border-l-4 border-[#bc5f40] text-xs font-semibold rounded-r-lg flex gap-3 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#bc5f40] mt-0.5" />
                <div>
                  <span className="font-bold">Notice:</span> {error}
                </div>
              </div>
            )}

            {loading ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div id="loader-spinner" className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-[#dfded4]" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#123e35] animate-spin" />
                  <Sparkles className="w-5 h-5 text-[#bc5f40] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h4 className="text-lg font-bold font-display text-[#151716]">Building Your SEO Strategy</h4>
                <p className="text-sm font-semibold text-[#4e524f] mt-2 animate-pulse">{loadingMessage}</p>
                <div className="w-48 bg-[#dfded4] h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-[#bc5f40] h-full w-2/3 rounded-full animate-pulse" />
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {/* STEP 1: CONTACT INFO */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <p className="text-sm text-[#4e524f] font-semibold leading-relaxed">
                      We gather all initial lead insights ahead of onboarding. This aligns our manual verification process and keeps everything custom for your specific location.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4e524f] mb-1.5 font-mono">
                          Business Name *
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 absolute left-3.5 top-3.5 text-[#888b88]" />
                          <input
                            type="text"
                            placeholder="e.g. Apex Dental Wellness"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="bg-[#faf9f6] border border-[#dfded4] rounded-xl w-full pl-10 pr-4 py-2.5 text-xs text-[#1a1c1a] placeholder-[#888b88] focus:outline-none focus:border-[#bc5f40] transition-all font-semibold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4e524f] mb-1.5 font-mono">
                          Contact Name *
                        </label>
                        <div className="relative">
                          <FileText className="w-4 h-4 absolute left-3.5 top-3.5 text-[#888b88]" />
                          <input
                            type="text"
                            placeholder="e.g. Dr. Arthur Miller"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="bg-[#faf9f6] border border-[#dfded4] rounded-xl w-full pl-10 pr-4 py-2.5 text-xs text-[#1a1c1a] placeholder-[#888b88] focus:outline-none focus:border-[#bc5f40] transition-all font-semibold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4e524f] mb-1.5 font-mono">
                          Business Email *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#888b88]" />
                          <input
                            type="email"
                            placeholder="e.g. contact@apexdental.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-[#faf9f6] border border-[#dfded4] rounded-xl w-full pl-10 pr-4 py-2.5 text-xs text-[#1a1c1a] placeholder-[#888b88] focus:outline-none focus:border-[#bc5f40] transition-all font-semibold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4e524f] mb-1.5 font-mono">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-[#888b88]" />
                          <input
                            type="tel"
                            placeholder="e.g. (415) 555-0192"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="bg-[#faf9f6] border border-[#dfded4] rounded-xl w-full pl-10 pr-4 py-2.5 text-xs text-[#1a1c1a] placeholder-[#888b88] focus:outline-none focus:border-[#bc5f40] transition-all font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: DIGITAL STANDING */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#4e524f] mb-2 font-mono">
                        Do you currently have a live website?
                      </span>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setHasWebsite(true)}
                          className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            hasWebsite
                              ? 'bg-[#123e35]/10 border-[#123e35] text-[#123e35] shadow-xs'
                              : 'bg-white border-[#dfded4] text-[#4e524f] hover:bg-[#faf9f6]'
                          }`}
                        >
                          <Check className={`w-3.5 h-3.5 ${hasWebsite ? 'opacity-100' : 'opacity-0'}`} />
                          Yes, we do
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHasWebsite(false);
                            setWebsite('');
                          }}
                          className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            !hasWebsite
                              ? 'bg-[#123e35]/10 border-[#123e35] text-[#123e35] shadow-xs'
                              : 'bg-white border-[#dfded4] text-[#4e524f] hover:bg-[#faf9f6]'
                          }`}
                        >
                          <Check className={`w-3.5 h-3.5 ${!hasWebsite ? 'opacity-100' : 'opacity-0'}`} />
                          No, we need one built
                        </button>
                      </div>
                    </div>

                    {hasWebsite && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4e524f] mb-1 font-mono">
                          Website URL Address
                        </label>
                        <div className="relative">
                          <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-[#888b88]" />
                          <input
                            type="text"
                            placeholder="e.g. www.apexdentalwellness.com"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="bg-[#faf9f6] border border-[#dfded4] rounded-xl w-full pl-10 pr-4 py-2.5 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#bc5f40] transition-all font-semibold"
                          />
                        </div>
                      </motion.div>
                    )}

                    <div className="border-t border-[#dfded4] pt-5">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#4e524f] mb-3 font-mono">
                        Do you have an active Google Business Profile (GBP)?
                      </span>
                      <div className="flex gap-4 mb-4">
                        <button
                          type="button"
                          onClick={() => setHasGBP(true)}
                          className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            hasGBP
                              ? 'bg-[#123e35]/10 border-[#123e35] text-[#123e35] shadow-xs'
                              : 'bg-white border-[#dfded4] text-[#4e524f] hover:bg-[#faf9f6]'
                          }`}
                        >
                          <Check className={`w-3.5 h-3.5 ${hasGBP ? 'opacity-100' : 'opacity-0'}`} />
                          Yes, profile is active
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHasGBP(false);
                            setGbpLink('');
                          }}
                          className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            !hasGBP
                              ? 'bg-[#123e35]/10 border-[#123e35] text-[#123e35] shadow-xs'
                              : 'bg-white border-[#dfded4] text-[#4e524f] hover:bg-[#faf9f6]'
                          }`}
                        >
                          <Check className={`w-3.5 h-3.5 ${!hasGBP ? 'opacity-100' : 'opacity-0'}`} />
                          No active profile
                        </button>
                      </div>

                      {hasGBP && (
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4e524f] mb-1 font-mono">
                            Business Profile Name or Map Link
                          </label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-[#888b88]" />
                            <input
                              type="text"
                              placeholder="e.g. Apex Dental, San Jose CA (or direct maps link)"
                              value={gbpLink}
                              onChange={(e) => setGbpLink(e.target.value)}
                              className="bg-[#faf9f6] border border-[#dfded4] rounded-xl w-full pl-10 pr-4 py-2.5 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#bc5f40] transition-all font-semibold"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: INDUSTRY & GOALS */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4e524f] mb-1.5 font-mono">
                        Business industry / Niche Focus
                      </label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="bg-white border border-[#dfded4] rounded-xl w-full px-4 py-2.5 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#bc5f40] transition-all font-semibold cursor-pointer"
                      >
                        {NICHES.map((n) => (
                          <option key={n} value={n} className="bg-white text-[#1a1c1a]">{n}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4e524f] mb-1.5 font-mono">
                          Target Location / Cities to Dominate *
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-[#888b88]" />
                          <input
                            type="text"
                            placeholder="e.g. San Jose, CA (or North San Jose, Milpitas)"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="bg-[#faf9f6] border border-[#dfded4] rounded-xl w-full pl-10 pr-4 py-2.5 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#bc5f40] transition-all font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4e524f] mb-1.5 font-mono">
                        Target keywords / Core Services *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="What keywords do you want to rank for? (e.g. 'root canal san jose', 'best cosmetic dentist', 'emergency tooth pain clinic')"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        className="bg-[#faf9f6] border border-[#dfded4] rounded-xl w-full px-4 py-2.5 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#bc5f40] transition-all font-semibold"
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: ROADMAP DISPLAY */}
                {step === 4 && submittedLead && submittedLead.aiAudit && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6 text-[#1a1c1a]"
                  >
                    {/* Progress Score Header */}
                    <div className="flex flex-col md:flex-row items-center gap-6 p-5 bg-[#123e35] text-white rounded-2xl relative overflow-hidden shadow-xs border border-[#0f342e]">
                      
                      {/* Circle progress overlay */}
                      <div className="relative shrink-0 flex items-center justify-center">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle className="text-white/10" strokeWidth="6" stroke="currentColor" fill="transparent" r="40" cx="48" cy="48" />
                          <circle 
                            className="text-[#bc5f40] transition-all duration-1000 ease-out" 
                            strokeWidth="8" 
                            strokeDasharray={2 * Math.PI * 40}
                            strokeDashoffset={2 * Math.PI * 40 * (1 - submittedLead.aiAudit.overallScore / 100)}
                            strokeLinecap="round" 
                            stroke="currentColor" 
                            fill="transparent" 
                            r="40" cx="48" cy="48" 
                          />
                        </svg>
                        <span className="absolute text-2xl font-black font-display text-white">
                          {submittedLead.aiAudit.overallScore}%
                        </span>
                      </div>

                      <div className="text-center md:text-left">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#bc5f40] font-mono flex items-center justify-center md:justify-start gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#bc5f40] shrink-0" />
                          LOCAL SEED AUDIT SECURED
                        </h4>
                        <h3 className="text-xl font-bold font-display text-white mt-1 leading-tight">
                          Calculated Marketing Standing for {submittedLead.input.businessName}
                        </h3>
                        <p className="text-xs text-slate-205 mt-2 font-mono">
                          Target Location: <span className="text-white font-semibold">{submittedLead.aiAudit.location}</span> • Domain: <span className="text-white font-semibold">{submittedLead.aiAudit.domainName || 'new-domain.local'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Executive Summary */}
                    <div className="p-4.5 bg-white border border-[#dfded4] rounded-xl shadow-xs">
                      <h5 className="text-[10px] font-bold text-[#bc5f40] uppercase tracking-wider font-mono mb-1.5">Executive Market Summary</h5>
                      <p className="text-xs text-[#4e524f] leading-relaxed font-semibold">
                        {submittedLead.aiAudit.executiveSummary}
                      </p>
                    </div>

                    {/* Core Pillars Grid */}
                    <div>
                      <h5 className="text-[10px] font-bold text-[#4e524f] uppercase tracking-wider font-mono mb-3">Audited Search Pillars</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {submittedLead.aiAudit.analysis.map((pillar, i) => (
                          <div key={i} className="bg-white border border-[#dfded4] p-4 rounded-xl flex flex-col justify-between hover:shadow-xs transition-all">
                            <div>
                              <div className="flex justify-between items-start">
                                <h6 className="font-extrabold text-sm text-[#111311] pr-2 font-display">{pillar.title}</h6>
                                <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                                  pillar.score >= 75 
                                    ? 'bg-[#123e35]/10 text-[#123e35] border-[#123e35]/20' 
                                    : pillar.score >= 50 
                                      ? 'bg-[#bc5f40]/10 text-[#bc5f40] border-[#bc5f40]/20' 
                                      : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {pillar.score}/100
                                </span>
                              </div>
                              <p className="text-xs text-[#4e524f] font-semibold leading-relaxed mt-2.5">
                                {pillar.description}
                              </p>
                            </div>
                            <div className="mt-4 border-t border-[#dfded4] pt-3">
                              <span className="text-[10px] font-bold text-[#bc5f40] font-mono tracking-wider uppercase block mb-1.5">Action Checklist</span>
                              <ul className="space-y-1">
                                {pillar.recommendations.map((rec, k) => (
                                  <li key={k} className="flex gap-1.5 text-xs text-[#2c2d2c] font-semibold">
                                    <span className="text-[#123e35] shrink-0 font-bold">•</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Onboarding Service Roadmap */}
                    <div className="bg-[#123e35]/5 text-[#123e35] rounded-xl p-5 border border-[#123e35]/15">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckSquare className="w-4 h-4 text-[#bc5f40]" />
                        <h5 className="text-xs font-bold font-display uppercase tracking-wider text-[#123e35]">Local Surge Onboarding Flow - Next Steps We Take</h5>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {submittedLead.aiAudit.actionPlan.map((action, idx) => (
                          <div key={idx} className="flex gap-3 bg-white p-3 rounded-lg border border-[#dfded4]">
                            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#123e35] text-white text-xs font-bold shrink-0 font-mono">
                              0{idx+1}
                            </span>
                            <span className="text-xs font-bold text-[#2d2f2d] self-center">
                              {action}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Manual Verification Info */}
                    <div className="p-4 bg-[#123e35]/10 text-[#123e35] border border-[#123e35]/25 rounded-xl flex gap-3 items-center">
                      <ShieldCheck className="w-8 h-8 text-[#123e35] shrink-0" />
                      <div className="text-xs">
                        <p className="font-bold text-[#123e35]">Next Step: Lead Verification Initiated</p>
                        <p className="mt-0.5 text-[#4e524f] font-semibold leading-normal">
                          We've stored your Local Strategy Roadmap safely. To safeguard the manual verification of leads and select the absolute best domains, our Lead Strategist will examine your submittal manually and reach out at <span className="font-bold text-[#1a1c1a]">{submittedLead.input.email}</span>. No upfront payment has been authorized.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Action Buttons Footer */}
          <div className="bg-[#faf9f6] px-6 py-4.5 border-t border-[#dfded4] flex justify-between gap-3 flex-wrap">
            {step < 4 && !loading ? (
              <>
                <button
                  type="button"
                  disabled={step === 1}
                  onClick={handleBack}
                  className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl transition-all border border-[#dfded4] bg-white text-[#4e524f] hover:bg-[#faf9f6] hover:text-[#1a1c1a] cursor-pointer ${
                    step === 1 ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#888b88] font-semibold font-mono hidden sm:inline">
                    Complete fields to proceed
                  </span>
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-[#123e35] hover:bg-[#185246] hover:shadow-xs text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer flex items-center gap-1 transition-all"
                    >
                      Continue
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="bg-[#123e35] hover:bg-[#185246] hover:shadow-xs font-bold text-white text-xs px-6 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all font-mono"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#bc5f40]" />
                      Analyze & Submit Free
                    </button>
                  )}
                </div>
              </>
            ) : null}

            {step === 4 && (
              <div className="w-full flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-[#bc5f40] hover:bg-[#cf6d4e] text-white font-bold px-7 py-3 rounded-xl cursor-pointer transition-all text-xs uppercase font-mono"
                >
                  Done, Return to Site
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
