import React, { useState } from 'react';
import {
  Bot, Sparkles, Zap, ShieldCheck, Camera, Phone, Mail, MapPin,
  CheckCircle2, ArrowRight, Clock, AlertTriangle, Cpu, Copy, Check,
  ChevronDown, HelpCircle, Star, Sliders, RefreshCw, MessageSquare,
  Globe, Building2, User, Code2, Calendar, Loader2, BarChart3, ExternalLink, Palette, Webhook
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MagneticButton } from './MagneticButton';

interface AiFrontdeskViewProps {
  onOpenOnboarding: () => void;
  onGetFreeStrategy?: () => void;
  setCurrentPage: (page: any) => void;
}

export default function AiFrontdeskView({ onOpenOnboarding, onGetFreeStrategy, setCurrentPage }: AiFrontdeskViewProps) {
  // 30-Day Free Trial Builder State
  const [trialDomain, setTrialDomain] = useState('');
  const [trialName, setTrialName] = useState('');
  const [trialEmail, setTrialEmail] = useState('');
  const [trialBusinessName, setTrialBusinessName] = useState('');
  const [trialPhone, setTrialPhone] = useState('');
  const [isSubmittingTrial, setIsSubmittingTrial] = useState(false);
  const [trialError, setTrialError] = useState<string | null>(null);
  const [trialResult, setTrialResult] = useState<any | null>(null);
  const [trialCopied, setTrialCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'wordpress' | 'gtm' | 'wix' | 'squarespace' | 'html'>('wordpress');

  // Magic-link account recovery state ("Already have a chatbot? Log in")
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryFeedback, setRecoveryFeedback] = useState<{
    found?: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const handleRequestRecoveryLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = recoveryEmail.trim();
    if (!email) return;
    setRecoveryLoading(true);
    setRecoveryFeedback(null);
    try {
      const resp = await fetch('/api/frontdesk/portal/auth/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await resp.json();
      if (!resp.ok || !data?.ok) {
        setRecoveryFeedback({ error: data?.error || 'Could not look up that email address.' });
      } else {
        setRecoveryFeedback({
          found: data.found,
          message: data.message
        });
      }
    } catch {
      setRecoveryFeedback({ error: 'Network error sending login link. Please try again.' });
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleGenerateTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrialError(null);

    if (!trialDomain.trim() || !trialEmail.trim() || !trialBusinessName.trim() || !trialName.trim()) {
      setTrialError('Please provide your Website Domain, Your Name, Business Email, and Business Name.');
      return;
    }

    setIsSubmittingTrial(true);

    try {
      const resp = await fetch('/api/frontdesk/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: trialDomain.trim(),
          contactEmail: trialEmail.trim(),
          contactName: trialName.trim(),
          businessName: trialBusinessName.trim(),
          phone: trialPhone.trim() || undefined
        })
      });

      const text = await resp.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        // Response was not JSON (e.g. serverless HTML/text error)
      }

      if (resp.status === 409 && data?.existingAccount) {
        setRecoveryOpen(true);
        setRecoveryEmail(trialEmail.trim());
        setRecoveryFeedback({
          found: true,
          message:
            data.error ||
            'An AI FrontDesk account already exists for that email or domain. Request a fresh login link below.'
        });
        setTrialError(
          data.error ||
            'An AI FrontDesk account already exists for that email or website. Use the login recovery box below to open your dashboard.'
        );
        return;
      }

      if (!resp.ok || !data?.success) {
        const errorMsg = data?.error || (text && text.length < 150 && !text.includes("<html") ? text.trim() : `Server error (${resp.status}). Please try again.`);
        throw new Error(errorMsg);
      }

      setTrialResult(data);
      if (data.pathPrefix) {
        setActiveTab('gtm');
      } else {
        setActiveTab('wordpress');
      }
      
      // Smooth scroll to result
      setTimeout(() => {
        const el = document.getElementById('trial-embed-result');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setTrialError(err.message || 'Something went wrong while setting up your trial. Please try again.');
    } finally {
      setIsSubmittingTrial(false);
    }
  };

  const handleCopyTrialScript = () => {
    if (!trialResult?.scriptTag) return;
    navigator.clipboard.writeText(trialResult.scriptTag);
    setTrialCopied(true);
    setTimeout(() => setTrialCopied(false), 3000);
  };

  // Custom Plan Inquiry State
  const [customBusinessName, setCustomBusinessName] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customFleetNotes, setCustomFleetNotes] = useState('');
  const [customFeaturePhoto, setCustomFeaturePhoto] = useState(true);
  const [customFeatureEmail, setCustomFeatureEmail] = useState(true);
  const [customFeaturePhone, setCustomFeaturePhone] = useState(true);
  const [customFeatureCrm, setCustomFeatureCrm] = useState(false);
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
  const [customSubmitted, setCustomSubmitted] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const handleCustomInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    if (!customBusinessName.trim() || !customEmail.trim() || !customName.trim() || !customPhone.trim()) {
      setCustomError('Please provide your Business Name, Contact Name, Work Email, and Direct Phone Number.');
      return;
    }

    setIsSubmittingCustom(true);
    try {
      const resp = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: customBusinessName.trim(),
          websiteUrl: customDomain.trim() || undefined,
          fullName: customName.trim(),
          email: customEmail.trim(),
          phone: customPhone.trim(),
          strategyNotes: `Custom AI FrontDesk Setup Inquiry:
- Features Requested:
  * Multimodal Photo Vision: ${customFeaturePhoto ? 'YES' : 'NO'}
  * Instant Email Dispatches: ${customFeatureEmail ? 'YES' : 'NO'}
  * Phone & SMS Alerts: ${customFeaturePhone ? 'YES' : 'NO'}
  * CRM Integration: ${customFeatureCrm ? 'YES' : 'NO'}
- Fleet / Special Requirements: ${customFleetNotes.trim() || 'None provided'}`,
          serviceType: 'Custom AI FrontDesk Setup',
          source: 'ai_frontdesk_custom_inquiry'
        })
      });

      if (!resp.ok) {
        throw new Error('Failed to submit custom inquiry');
      }

      setCustomSubmitted(true);
    } catch (err: any) {
      setCustomError(err.message || 'Something went wrong submitting your request. Please try again or contact us directly.');
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  // FAQ Accordion State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How is AI FrontDesk different from complex live-chat software?',
      a: 'Most chat tools pack in bloated agent seats, ticketing queues, and complex flow builders you never use. AI FrontDesk stays intentionally simple: enter your URL, let it scan your pages, answer customer questions 24/7, capture visitor leads, and route them where you want.'
    },
    {
      q: 'Will the AI hallucinate fake prices or promise services my business cannot perform?',
      a: 'Never. Your chatbot only answers from your scanned website pages plus any extra notes or FAQs you add in your dashboard. If a visitor asks about something unverified, it answers carefully and captures their contact info for a callback.'
    },
    {
      q: 'How fast is installation on WordPress, Wix, Shopify, Squarespace, or custom HTML?',
      a: 'Under 60 seconds. Paste our 1-line <script> tag into your site footer or Google Tag Manager. It runs inside an isolated Shadow DOM container so it never breaks your theme fonts or layout CSS.'
    },
    {
      q: 'How do captured leads get submitted to my business?',
      a: 'You choose inside your dashboard: (1) Instant Email alerts + CSV export, (2) Custom Endpoint webhook POST (JSON or form-encoded) to your API, Zapier, or Make, or (3) In-Browser Contact Form Auto-Fill on your existing website form.'
    },
    {
      q: 'Is AI FrontDesk separate from Local Surge SEO plans, and what happens after the 30-day trial?',
      a: 'Yes — AI FrontDesk is completely standalone from our monthly SEO retainers. You get 30 days completely free with no credit card upfront. Keep it live afterward for $5/month via PayPal, or let the chat widget pause cleanly when the trial expires.'
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#123e35] text-white py-20 sm:py-28 rounded-3xl border border-[#0f342e] shadow-xl max-w-7xl mx-auto px-6 sm:px-12">
        <div className="absolute inset-0 bg-radial-at-t from-[#1d5b4e] to-[#123e35] opacity-90" />
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#bc5f40] to-[#f7f6f2] opacity-25 sm:left-[calc(50%-30rem)] sm:w-[72.187rem]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-xs font-bold font-mono tracking-wider uppercase backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>24/7 AI RECEPTIONIST FOR LOCAL CONTRACTORS</span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-black font-display tracking-tight text-white leading-tight">
            Stop Losing After-Hours Leads to Voicemail.
          </h1>

          <p className="text-base sm:text-xl text-slate-100 font-medium max-w-3xl mx-auto leading-relaxed">
            LocalSurge AI FrontDesk reads your website in 60 seconds, qualifies urgent customer emergencies, inspects damage photos, and dispatches high-paying job leads to your phone in under 5 minutes.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <MagneticButton
              id="hero-get-frontdesk"
              onClick={() => {
                const el = document.getElementById('try-free-trial');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#bc5f40] hover:bg-[#a34f34] text-white text-sm font-black px-7 py-4 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 duration-200"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Start 30-Day Free Trial ($5/mo after)</span>
            </MagneticButton>

            <MagneticButton
              id="hero-login-dashboard"
              onClick={() => setCurrentPage('ai-frontdesk-dashboard')}
              className="bg-white text-[#123e35] hover:bg-[#f7f6f2] text-sm font-black px-7 py-4 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 duration-200"
            >
              <Mail className="w-4 h-4 text-[#123e35]" />
              <span>Customer Dashboard Login</span>
              <ArrowRight className="w-4 h-4 text-[#bc5f40]" />
            </MagneticButton>
          </div>

          {/* Social Proof Trust Badges */}
          <div className="pt-8 border-t border-white/15 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Shadow DOM Isolation</span>
            <span className="flex items-center gap-1.5"><Webhook className="w-4 h-4 text-sky-400" /> Email, Webhook &amp; Form Auto-Fill</span>
            <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-amber-400" /> Live Engagement Analytics</span>
            <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-purple-400" /> 30 Days Free · Then $5/mo</span>
          </div>
        </div>
      </section>

      {/* 2. 6 CONTRACTOR SUPERPOWERS */}
      <section id="contractor-features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="text-xs font-bold font-mono tracking-widest text-[#bc5f40] uppercase bg-[#bc5f40]/10 px-3 py-1 rounded-md">
            TRADE-FIRST ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-display text-[#151716]">
            Why Generic Chatbots Fail Local Contractors
          </h2>
          <p className="text-sm sm:text-base text-[#4e524f]">
            Standard chatbots are designed to sell software subscriptions. SurgeBot is engineered for dirty boots, flooded basements, and emergency truck rollouts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="bg-white border border-[#dfded4] p-7 rounded-2xl shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-[#123e35] flex items-center justify-center font-bold">
              <Zap className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-black text-[#151716]">1-Tap Mobile Service Chips</h3>
            <p className="text-xs sm:text-sm text-[#4e524f] leading-relaxed">
              Homeowners standing in a flooded basement do not want to type 50 words on a wet phone screen. 1-tap chips let them report pipe bursts, AC outages, or hail leaks in a single second.
            </p>
          </div>

          <div className="bg-white border border-[#dfded4] p-7 rounded-2xl shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center font-bold">
              <Globe className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="text-lg font-black text-[#151716]">Website Scan &amp; Extra Business Notes</h3>
            <p className="text-xs sm:text-sm text-[#4e524f] leading-relaxed">
              Automatically crawls your pages to learn your services, areas, and FAQs. Need extra details like pricing cues or holiday hours? Add custom notes or re-scan daily in your portal.
            </p>
          </div>

          <div className="bg-white border border-[#dfded4] p-7 rounded-2xl shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
              <BarChart3 className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-black text-[#151716]">Real-Time Analytics &amp; Top Questions</h3>
            <p className="text-xs sm:text-sm text-[#4e524f] leading-relaxed">
              Watch daily conversations, captured leads, average chat time, and peak hours on interactive 7, 30, and 90-day charts so you see ROI clearly.
            </p>
          </div>

          <div className="bg-white border border-[#dfded4] p-7 rounded-2xl shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-center font-bold">
              <Palette className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-black text-[#151716]">Brand Color, 8 Icons &amp; On/Off Switch</h3>
            <p className="text-xs sm:text-sm text-[#4e524f] leading-relaxed">
              Match your brand palette, pick from 8 vector launcher icons or upload your logo URL, choose bottom-left or bottom-right placement, and pause or resume the widget anytime.
            </p>
          </div>

          <div className="bg-white border border-[#dfded4] p-7 rounded-2xl shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold">
              <Webhook className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-black text-[#151716]">Email, Webhook, or Site Form Auto-Fill</h3>
            <p className="text-xs sm:text-sm text-[#4e524f] leading-relaxed">
              Get instant lead emails with CSV export, POST JSON/form payloads straight to your webhook endpoint, or auto-fill your existing website contact form in the visitor&apos;s browser.
            </p>
          </div>

          <div className="bg-white border border-[#dfded4] p-7 rounded-2xl shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-[#123e35] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-black text-[#151716]">Zero CSS Conflict Shadow DOM</h3>
            <p className="text-xs sm:text-sm text-[#4e524f] leading-relaxed">
              Runs inside an isolated Shadow Root (<code className="bg-emerald-100/60 px-1 py-0.5 rounded text-[11px]">attachShadow</code>). WordPress themes, Divi, Elementor, and Wix stylesheets can never distort or break the widget.
            </p>
          </div>

        </div>
      </section>

      {/* 4. COMPARISON MATRIX: SURGEBOT VS GENERIC BOTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-[#dfded4] rounded-3xl p-6 sm:p-10 shadow-sm overflow-hidden">
          <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
            <h3 className="text-xl sm:text-3xl font-black font-display text-[#151716]">
              How LocalSurge AI FrontDesk Compares
            </h3>
            <p className="text-xs sm:text-sm text-[#4e524f]">
              Compare our purpose-built trade AI with generic corporate chat tools.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-[#123e35] bg-[#f7f6f2]">
                  <th className="py-3.5 px-4 font-black text-[#151716]">Feature Capability</th>
                  <th className="py-3.5 px-4 font-black text-[#123e35] bg-emerald-50/80">⚡ LocalSurge SurgeBot</th>
                  <th className="py-3.5 px-4 font-bold text-[#64748b]">Generic Bot (Intercom / Zendesk)</th>
                  <th className="py-3.5 px-4 font-bold text-[#64748b]">Answering Service Call Center</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e4dc]">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#151716]">Response Time</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-800 bg-emerald-50/50">Instant (&lt;2 seconds)</td>
                  <td className="py-3.5 px-4 text-[#64748b]">1 - 5 minutes</td>
                  <td className="py-3.5 px-4 text-[#64748b]">3 - 8 rings hold time</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#151716]">Lead Routing &amp; Form Auto-Fill</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-800 bg-emerald-50/50">✅ Email, Webhook, or Site Form Auto-Fill</td>
                  <td className="py-3.5 px-4 text-red-600">❌ Basic Inbox Only</td>
                  <td className="py-3.5 px-4 text-red-600">❌ Manual Email Notes</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#151716]">Brand Color &amp; Icon Controls</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-800 bg-emerald-50/50">✅ Hex Color, 8 Icons, Custom URL &amp; Position</td>
                  <td className="py-3.5 px-4 text-[#64748b]">⚠️ Paid Add-On Tier</td>
                  <td className="py-3.5 px-4 text-red-600">❌ N/A</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#151716]">Service Radius / Zip Boundaries</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-800 bg-emerald-50/50">✅ Strictly Enforced</td>
                  <td className="py-3.5 px-4 text-red-600">❌ Accepts Anyone</td>
                  <td className="py-3.5 px-4 text-[#64748b]">⚠️ Often Books Out-of-Area</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#151716]">Website Setup Time</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-800 bg-emerald-50/50">60 Seconds (AI Crawl)</td>
                  <td className="py-3.5 px-4 text-[#64748b]">2 - 4 Weeks Setup</td>
                  <td className="py-3.5 px-4 text-[#64748b]">1 - 2 Weeks Training</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-[#151716]">Monthly Price</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-800 bg-emerald-50/50">$5/mo after 30-day free trial</td>
                  <td className="py-3.5 px-4 text-[#64748b]">$150 - $450/mo + seat fees</td>
                  <td className="py-3.5 px-4 text-[#64748b]">$350 - $800/mo + per-minute fees</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. PRICING: TWO SIMPLE CONTRACTOR OPTIONS */}
      <section id="pricing-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="text-xs font-bold font-mono tracking-widest text-[#bc5f40] uppercase bg-[#bc5f40]/10 px-3 py-1 rounded-md">
            TRANSPARENT CONTRACTOR PRICING
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-display text-[#151716]">
            Two Simple Options. Zero Lead Leakage.
          </h2>
          <p className="text-sm sm:text-base text-[#4e524f]">
            Start completely free for 30 days, continue for $5/mo via PayPal with zero bloat, or request a custom enterprise build if you need advanced workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* OPTION 1: $5/MO STANDARD PLAN */}
          <div className="bg-white border-2 border-[#123e35]/20 rounded-3xl p-8 flex flex-col justify-between shadow-md hover:shadow-xl transition-shadow relative">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-[#123e35] uppercase bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Standard Plan
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-md">
                  30 Days Free · No Card Upfront
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-[#151716]">AI FrontDesk</h3>
                <p className="text-xs text-[#4e524f] mt-1">
                  Simple website scanning, instant Q&amp;A, lead capture, analytics dashboard, and custom branding — built cleanly for any website.
                </p>
              </div>

              <div className="flex items-baseline gap-1.5 pt-2 border-t border-[#e2e8f0]">
                <span className="text-4xl font-black text-[#151716]">$5</span>
                <span className="text-sm font-semibold text-[#64748b]">/ month via PayPal (after 30-day trial)</span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-[#151716] pt-3">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#123e35]">Auto Website Scan &amp; Extra Notes:</strong> Crawls your pages in 60 seconds and answers customer questions accurately 24/7.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>3 Flexible Lead Delivery Modes:</strong> Instant Email + CSV export, Custom Endpoint Webhook POST, or In-Browser Website Form Auto-Fill.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Engagement &amp; Lead Analytics:</strong> 7/30/90-day interactive charts for chats, leads, time spent, top questions, plus 1-click On/Off switch.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Brand Color, 8 Icons &amp; Placement:</strong> Match your hex color, pick from 8 launcher icons or use your logo URL, place left or right.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero-CSS Conflict Shadow DOM:</strong> Works cleanly on WordPress, Wix, Squarespace, Webflow, Shopify, or plain HTML.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-[#64748b]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Full feature parity during your 30-day free trial — widget auto-pauses cleanly if unsubscribed.</span>
                </li>
              </ul>
            </div>

            <div className="pt-8 mt-auto">
              <button
                onClick={() => {
                  const el = document.getElementById('try-free-trial');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-3.5 rounded-xl bg-[#123e35] text-white font-black text-xs sm:text-sm hover:bg-[#185246] transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Start 30-Day Free Trial</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
              <p className="text-[11px] text-center text-[#64748b] mt-2">
                No credit card required. Free for 30 days, then $5/mo via PayPal.
              </p>
            </div>
          </div>

          {/* OPTION 2: CUSTOM CONTRACTOR & FLEET SUITE */}
          <div className="bg-[#123e35] text-white border-2 border-[#bc5f40] rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#bc5f40] text-white text-[11px] font-black uppercase px-4 py-1 rounded-full tracking-wider shadow-md">
              TAILORED CONTRACTOR SETUP
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-emerald-300 uppercase bg-white/10 px-3 py-1 rounded-full">
                  Bespoke Enterprise
                </span>
                <span className="text-xs font-bold text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-md">
                  Full Dispatch Suite
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Custom Trade Plan</h3>
                <p className="text-xs text-slate-200 mt-1">
                  We work hand-in-hand with your business to configure damage photo analysis, direct email dispatches, and phone/SMS alerts.
                </p>
              </div>

              <div className="flex items-baseline gap-1.5 pt-2 border-t border-white/20">
                <span className="text-4xl font-black text-white">Custom</span>
                <span className="text-sm font-semibold text-slate-300">/ tailored to fleet</span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-100 pt-3">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-emerald-300">Multimodal Damage Photo Uploads:</strong> Customers snap photos of leaking water heaters, furnace error codes, or storm-damaged roof shingles; AI vision inspects them directly.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-emerald-300">Instant High-Priority Email Dispatches:</strong> Leads land in your inbox with 1-click <span className="underline decoration-emerald-400">"Call Customer"</span> and <span className="underline decoration-emerald-400">"Open in Google Maps"</span> routing buttons.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-emerald-300">Phone &amp; SMS Technician Alerts:</strong> Emergency text notifications sent directly to on-call technicians' mobile phones for after-hours jobs.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Emergency Shutoff Protocols:</strong> Custom safety directives for active flooding, gas smells, or electrical sparking.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Custom CRM Integration:</strong> Direct webhook connections into ServiceTitan, Housecall Pro, Jobber, or Zapier.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>White-Label Branding:</strong> Remove all LocalSurge badges, match brand colors, and configure custom trade personas.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Dedicated AI Engineer:</strong> White-glove setup, prompt tuning, and continuous knowledge base re-sync.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-8 mt-auto">
              <button
                id="pricing-custom-inquire"
                onClick={() => {
                  const el = document.getElementById('custom-setup-inquiry');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-3.5 rounded-xl bg-[#bc5f40] hover:bg-[#a34f34] text-white font-black text-xs sm:text-sm transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Configure Custom Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-300 mt-2">
                We'll tailor photo, email, and phone alert settings for your team.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 5b. 30-DAY FREE TRIAL GENERATOR SECTION */}
      <section id="try-free-trial" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-20">
        <div className="bg-gradient-to-br from-[#123e35] via-[#0f342e] to-[#0a231f] text-white border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#bc5f40]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 relative z-10">
            <span className="text-xs font-bold font-mono tracking-widest text-emerald-300 uppercase bg-emerald-900/60 border border-emerald-400/30 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              30-DAY RISK-FREE TRIAL ON YOUR SITE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-display text-white">
              Try SurgeBot on Your Website for 30 Days
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Enter your domain, email, and business name below. We will generate your custom 1-line embed script with step-by-step instructions. 
              <strong> The chat box automatically disables after 30 days unless you choose to continue — zero risk, no credit card required.</strong>
            </p>
          </div>

          {/* Form / Output Container */}
          <div className="relative z-10 max-w-3xl mx-auto space-y-5">
            {!trialResult ? (
              <>
                <form onSubmit={handleGenerateTrial} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 sm:p-8 space-y-5">
                  {trialError && (
                    <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-400/40 text-red-200 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-300 shrink-0" />
                      <span>{trialError}</span>
                    </div>
                  )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Website Domain */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      Website Domain / URL *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. apexplumbingaustin.com"
                      value={trialDomain}
                      onChange={(e) => setTrialDomain(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>

                  {/* Business Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      Business Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apex 24/7 Plumbing"
                      value={trialBusinessName}
                      onChange={(e) => setTrialBusinessName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>

                  {/* Contact Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Your Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={trialName}
                      onChange={(e) => setTrialName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>

                  {/* Work Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      Your Email (We will email your script) *
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. john@apexplumbing.com"
                      value={trialEmail}
                      onChange={(e) => setTrialEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Optional Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Business Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. (512) 555-0199"
                    value={trialPhone}
                    onChange={(e) => setTrialPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingTrial}
                  className="w-full py-4 rounded-xl bg-[#bc5f40] hover:bg-[#a34f34] text-white font-black text-sm transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingTrial ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                      <span>Generating Custom Trial Script &amp; Crawling Domain...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      <span>Generate My 30-Day Free Trial Script</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No Credit Card Required</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Auto-Disables in 30 Days</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Step-by-Step Instructions Emailed</span>
                </div>
              </form>
                <div className="bg-white/5 border border-white/15 rounded-2xl p-5 sm:p-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-extrabold text-emerald-200">
                        Already have an AI FrontDesk chatbot or lost your welcome email?
                      </p>
                      <p className="text-[11px] text-slate-300">
                        Enter your email and we&apos;ll check your subscription and send a fresh magic login link.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRecoveryOpen((v) => !v)}
                      className="text-xs font-bold text-white bg-white/15 hover:bg-white/25 px-3.5 py-2 rounded-xl cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      {recoveryOpen ? 'Hide Login Recovery' : 'Already subscribed? Log in'}
                    </button>
                  </div>

                  {recoveryOpen && (
                    <form onSubmit={handleRequestRecoveryLink} className="space-y-3 pt-2 border-t border-white/10">
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                          type="email"
                          required
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          placeholder="Enter the email on your AI FrontDesk account"
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-400"
                        />
                        <button
                          type="submit"
                          disabled={recoveryLoading}
                          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0a231f] font-extrabold text-xs sm:text-sm cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-1.5"
                        >
                          <Mail className="w-4 h-4" />
                          {recoveryLoading ? 'Checking...' : 'Send Magic Login Link'}
                        </button>
                      </div>
                      {recoveryFeedback && (
                        <div
                          className={`p-3 rounded-xl text-xs font-semibold border ${
                            recoveryFeedback.error || recoveryFeedback.found === false
                              ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                              : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
                          }`}
                        >
                          {recoveryFeedback.error || recoveryFeedback.message}
                        </div>
                      )}
                    </form>
                  )}
                </div>
              </>
            ) : (
              /* TRIAL GENERATED SUCCESS VIEW */
              <div id="trial-embed-result" className="bg-white/10 backdrop-blur-md border border-emerald-400/40 rounded-2xl p-6 sm:p-8 space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/15">
                  <div>
                    <span className="text-[11px] font-black font-mono uppercase text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      TRIAL ACTIVE
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                      SurgeBot is Ready for {trialResult.site?.business_name || trialBusinessName}!
                    </h3>
                  </div>

                  <div className="bg-emerald-950/80 border border-emerald-500/40 px-3.5 py-2 rounded-xl text-left sm:text-right">
                    <div className="text-[10px] font-mono uppercase text-emerald-300 font-bold">30-Day Expiry Window</div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 sm:justify-end">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      <span>
                        Valid until {new Date(trialResult.trialEndsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Script Display */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-emerald-400" />
                      Your 1-Line Embed Code
                    </label>
                    <button
                      onClick={handleCopyTrialScript}
                      className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      {trialCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Script Tag</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-[#0b1b16] border border-emerald-500/30 rounded-xl p-4 font-mono text-xs text-emerald-300 break-all select-all leading-relaxed">
                    {trialResult.scriptTag}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    ℹ️ This script tag connects directly to your custom knowledge profile. It operates in an isolated Shadow DOM and will automatically disable from your site after 30 days.
                  </p>
                </div>

                  {/* Franchise Location Path Detection Notice */}
                  {trialResult.pathPrefix && (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-400/40 rounded-xl text-xs text-emerald-200 flex items-start gap-2">
                      <span className="text-base leading-none">📍</span>
                      <div>
                        <strong className="text-emerald-100">Franchise / Location Sub-Path Detected: <code>{trialResult.pathPrefix}</code></strong>
                        <p className="text-[11px] text-emerald-300/90 mt-0.5">
                          SurgeBot is configured for this specific location. It will automatically sleep on other franchise pages and maintain session persistence when visitors click through to national service pages.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Platform Installation Tabs */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-black uppercase font-mono tracking-wider text-emerald-200">
                      Where to Add It on Your Website
                    </h4>

                    <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
                      {[
                        { id: 'wordpress', name: 'WordPress' },
                        { id: 'wix', name: 'Wix' },
                        { id: 'squarespace', name: 'Squarespace' },
                        { id: 'html', name: 'Shopify / Custom HTML' },
                        { id: 'gtm', name: 'Google Tag Manager (GTM)' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                            activeTab === tab.id
                              ? 'bg-emerald-500 text-black shadow-xs'
                              : 'bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {tab.name}
                        </button>
                      ))}
                    </div>

                    <div className="bg-black/30 border border-white/10 rounded-xl p-4 text-xs text-slate-200 leading-relaxed">
                      {activeTab === 'gtm' && (
                        <div className="space-y-3.5">
                          <div className="p-2.5 bg-emerald-500/10 border border-emerald-400/25 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-emerald-300">
                            <span>⭐ <strong>Zero-Code Injection:</strong> Ideal for franchises, marketing managers, and sites where you don't have direct theme code access.</span>
                            <span className="font-mono text-[10px] bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded text-emerald-300 font-bold uppercase tracking-wider self-start sm:self-auto">Google Tag Manager</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Step 1 */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2">
                              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                                <span>Create Custom Tag</span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-snug">
                                In your GTM Container, click <strong>Tags &rarr; New</strong>. Name it <code className="text-emerald-300 text-[10px]">SurgeBot AI FrontDesk</code>. Choose <strong>Custom HTML</strong> as the Tag Configuration.
                              </p>
                              <div className="text-[10px] text-slate-400 bg-black/40 rounded p-1.5 border border-white/5 font-mono break-all">
                                Paste your 1-line script tag into the HTML box.
                              </div>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2">
                              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                                <span>Set Firing Trigger</span>
                              </div>
                              {trialResult.pathPrefix ? (
                                <div className="space-y-1.5">
                                  <p className="text-[11px] text-slate-300 leading-snug">
                                    Click <strong>Triggering &rarr; (+)</strong> &rarr; select <strong>Page View</strong>. Choose <strong>Some Page Views</strong>:
                                  </p>
                                  <div className="text-[10px] font-mono text-emerald-300 bg-black/40 rounded p-1.5 border border-emerald-500/20">
                                    Page Path &bull; contains &bull; <strong className="text-white">{trialResult.pathPrefix}</strong>
                                  </div>
                                  <p className="text-[10px] text-slate-400 leading-tight">
                                    SurgeBot's session persistence keeps the bot active even when visitors click to general corporate service pages!
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  <p className="text-[11px] text-slate-300 leading-snug">
                                    Click <strong>Triggering</strong> and select <strong>All Pages &mdash; Page View (Window Loaded)</strong>.
                                  </p>
                                  <div className="text-[10px] font-mono text-emerald-300 bg-black/40 rounded p-1.5 border border-emerald-500/20">
                                    Trigger: All Pages (Window Loaded)
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Step 3 */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2">
                              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                                <span>Submit &amp; Publish</span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-snug">
                                Click <strong>Save</strong> on the tag. In the top right of GTM, click <strong>Submit</strong>, enter a version name (e.g. <em>Add SurgeBot</em>), and click <strong>Publish</strong>.
                              </p>
                              <div className="text-[10px] text-emerald-300 bg-emerald-950/40 rounded p-1.5 border border-emerald-500/20 flex items-center gap-1.5">
                                <span>🚀</span>
                                <span>SurgeBot goes live instantly with 0 code deployments!</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {activeTab === 'wordpress' && (
                        <ol className="list-decimal pl-4 space-y-1.5">
                          <li>In your WordPress dashboard, install and activate the free <strong>WPCode</strong> (or <em>Insert Headers and Footers</em>) plugin.</li>
                          <li>Navigate to <strong>Code Snippets &rarr; Header &amp; Footer</strong>.</li>
                          <li>Paste your script snippet into the <strong>Footer</strong> box.</li>
                          <li>Click <strong>Save Changes</strong>. SurgeBot will now appear on your live site!</li>
                        </ol>
                      )}
                      {activeTab === 'wix' && (
                        <ol className="list-decimal pl-4 space-y-1.5">
                          <li>In your Wix Dashboard, go to <strong>Settings &rarr; Custom Code</strong>.</li>
                          <li>Click <strong>+ Add Custom Code</strong> in the top right corner.</li>
                          <li>Paste your script tag into the code input box.</li>
                          <li>Under "Place Code in", select <strong>Body - End</strong>.</li>
                          <li>Under "Add Code to Pages", choose <strong>All Pages</strong> and click <strong>Apply</strong>.</li>
                        </ol>
                      )}
                      {activeTab === 'squarespace' && (
                        <ol className="list-decimal pl-4 space-y-1.5">
                          <li>In your Squarespace menu, go to <strong>Website &rarr; Website Tools &rarr; Code Injection</strong>.</li>
                          <li>Scroll down to the <strong>Footer</strong> field.</li>
                          <li>Paste your script tag into the field.</li>
                          <li>Click <strong>Save</strong> at the top left. Your bot is immediately live!</li>
                        </ol>
                      )}
                      {activeTab === 'html' && (
                        <ol className="list-decimal pl-4 space-y-1.5">
                          <li>Open your website's main HTML template or theme file (such as <code>theme.liquid</code> in Shopify).</li>
                          <li>Scroll to the bottom of the template before the closing <code>&lt;/body&gt;</code> tag.</li>
                          <li>Paste your script tag right above <code>&lt;/body&gt;</code>.</li>
                          <li>Save and publish changes.</li>
                        </ol>
                      )}
                    </div>
                  </div>

                {/* Email notice & Action buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-emerald-200 flex items-center gap-1.5">
                    {trialResult.emailDispatched === false ? (
                      <div className="text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Could not dispatch email ({trialResult.emailError || 'mail service issue'}). Your script is ready above!</span>
                      </div>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>A copy has been sent to <strong>{trialEmail}</strong>.</span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {trialResult.dashboardUrl && (
                      <a
                        href={trialResult.dashboardUrl}
                        className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-[#bc5f40] hover:bg-[#a34f34] text-white text-xs font-extrabold transition-colors inline-flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <span>Open AI FrontDesk Dashboard</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => setTrialResult(null)}
                      className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Set Up Another Site
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </section>

      {/* 5c. CUSTOM PLAN SETUP INQUIRY SECTION */}
      <section id="custom-setup-inquiry" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-20">
        <div className="bg-white border-2 border-[#123e35]/25 rounded-3xl p-6 sm:p-12 shadow-xl relative overflow-hidden">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="text-xs font-bold font-mono tracking-widest text-[#bc5f40] uppercase bg-[#bc5f40]/10 border border-[#bc5f40]/20 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#bc5f40]" />
              BESPOKE CONTRACTOR & FLEET SETUP
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-display text-[#151716]">
              Configure Your Custom AI FrontDesk
            </h2>
            <p className="text-xs sm:text-sm text-[#4e524f] leading-relaxed">
              Select which trade capabilities you need enabled. Our AI engineering team will customize your prompt, hook up your dispatch channels, and ensure 100% accurate customer quoting.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {!customSubmitted ? (
              <form onSubmit={handleCustomInquirySubmit} className="space-y-6">
                {customError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{customError}</span>
                  </div>
                )}

                {/* Interactive Feature Checkboxes */}
                <div className="bg-[#f7f6f2] border border-[#dfded4] rounded-2xl p-5 sm:p-6 space-y-3">
                  <h4 className="text-xs font-black uppercase font-mono tracking-wider text-[#123e35] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Select Trade Features to Enable
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${customFeaturePhoto ? 'bg-white border-emerald-500 shadow-xs ring-1 ring-emerald-500/20' : 'bg-white/60 border-slate-200'}`}>
                      <input
                        type="checkbox"
                        checked={customFeaturePhoto}
                        onChange={(e) => setCustomFeaturePhoto(e.target.checked)}
                        className="w-4 h-4 rounded text-[#123e35] focus:ring-[#123e35] mt-0.5 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#151716] flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-sky-600" />
                          <span>Multimodal Damage Photos</span>
                        </div>
                        <p className="text-[11px] text-[#64748b] mt-0.5">AI vision inspects leaks, AC error codes, and storm damage.</p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${customFeatureEmail ? 'bg-white border-emerald-500 shadow-xs ring-1 ring-emerald-500/20' : 'bg-white/60 border-slate-200'}`}>
                      <input
                        type="checkbox"
                        checked={customFeatureEmail}
                        onChange={(e) => setCustomFeatureEmail(e.target.checked)}
                        className="w-4 h-4 rounded text-[#123e35] focus:ring-[#123e35] mt-0.5 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#151716] flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-emerald-600" />
                          <span>High-Priority Email Dispatch</span>
                        </div>
                        <p className="text-[11px] text-[#64748b] mt-0.5">1-click "Call Customer" &amp; 1-click Google Maps in every lead email.</p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${customFeaturePhone ? 'bg-white border-emerald-500 shadow-xs ring-1 ring-emerald-500/20' : 'bg-white/60 border-slate-200'}`}>
                      <input
                        type="checkbox"
                        checked={customFeaturePhone}
                        onChange={(e) => setCustomFeaturePhone(e.target.checked)}
                        className="w-4 h-4 rounded text-[#123e35] focus:ring-[#123e35] mt-0.5 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#151716] flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-purple-600" />
                          <span>Phone &amp; SMS Technician Alerts</span>
                        </div>
                        <p className="text-[11px] text-[#64748b] mt-0.5">Emergency text alerts routed straight to on-call technicians.</p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${customFeatureCrm ? 'bg-white border-emerald-500 shadow-xs ring-1 ring-emerald-500/20' : 'bg-white/60 border-slate-200'}`}>
                      <input
                        type="checkbox"
                        checked={customFeatureCrm}
                        onChange={(e) => setCustomFeatureCrm(e.target.checked)}
                        className="w-4 h-4 rounded text-[#123e35] focus:ring-[#123e35] mt-0.5 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#151716] flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                          <span>Custom CRM Integration</span>
                        </div>
                        <p className="text-[11px] text-[#64748b] mt-0.5">Direct sync with ServiceTitan, Jobber, Housecall Pro, or Zapier.</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Contact Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#151716] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#123e35]" />
                      Business / Company Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Plumbing & HVAC"
                      value={customBusinessName}
                      onChange={(e) => setCustomBusinessName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#dfded4] text-[#151716] placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#123e35] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#151716] flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#123e35]" />
                      Website Domain (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. apexplumbingaustin.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#dfded4] text-[#151716] placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#123e35] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#151716] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#123e35]" />
                      Your Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mark Johnson"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#dfded4] text-[#151716] placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#123e35] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#151716] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#123e35]" />
                      Work Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. mark@apexplumbingaustin.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#dfded4] text-[#151716] placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#123e35] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#151716] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#123e35]" />
                      Direct Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. (512) 555-0199"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#dfded4] text-[#151716] placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#123e35] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#151716]">
                      Fleet Size / Monthly Lead Volume
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5 vans, ~80 inquiries/month"
                      value={customFleetNotes}
                      onChange={(e) => setCustomFleetNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#dfded4] text-[#151716] placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#123e35] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingCustom}
                  className="w-full py-4 rounded-xl bg-[#123e35] hover:bg-[#185246] text-white font-black text-sm transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingCustom ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                      <span>Submitting Custom Setup Request...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Submit Custom Setup Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-[#64748b]">
                  🔒 Your details are 100% private. An engineer from LocalSurge will review your requirements and reach out within 2 hours.
                </p>
              </form>
            ) : (
              /* CONFIRMATION STATE */
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#123e35]">
                  Custom Plan Request Received!
                </h3>
                <p className="text-xs sm:text-sm text-[#4e524f] max-w-lg mx-auto leading-relaxed">
                  Thank you, <strong>{customName}</strong>! Our engineering team has received your custom requirements for <strong>{customBusinessName}</strong> (with Photo: {customFeaturePhoto ? 'Yes' : 'No'}, Email: {customFeatureEmail ? 'Yes' : 'No'}, Phone: {customFeaturePhone ? 'Yes' : 'No'}). We will reach out to <strong>{customEmail}</strong> shortly.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => setCustomSubmitted(false)}
                    className="py-2.5 px-5 rounded-xl border border-[#123e35] text-[#123e35] font-bold text-xs hover:bg-[#123e35] hover:text-white transition-colors cursor-pointer"
                  >
                    Edit Requirements
                  </button>
                  <button
                    onClick={onOpenOnboarding}
                    className="py-2.5 px-5 rounded-xl bg-[#123e35] text-white font-bold text-xs hover:bg-[#185246] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Strategy Call Now</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 6. 4-STEP ONBOARDING WALKTHROUGH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-[#f7f6f2] border border-[#dfded4] rounded-3xl p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="text-xs font-bold font-mono tracking-widest text-[#bc5f40] uppercase">
              ZERO HEADACHE ONBOARDING
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-display text-[#151716]">
              Live On Your Website in 4 Simple Steps
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-xl border border-[#dfded4] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#123e35] text-white flex items-center justify-center font-bold text-xs">1</div>
              <h4 className="font-bold text-sm text-[#151716]">Enter Website URL</h4>
              <p className="text-xs text-[#4e524f]">Provide your business website address. Our crawler reads your pages in 60s.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#dfded4] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#123e35] text-white flex items-center justify-center font-bold text-xs">2</div>
              <h4 className="font-bold text-sm text-[#151716]">AI Knowledge Sync</h4>
              <p className="text-xs text-[#4e524f]">Services, emergency policies, trip fees, and zip codes are extracted automatically.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#dfded4] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#123e35] text-white flex items-center justify-center font-bold text-xs">3</div>
              <h4 className="font-bold text-sm text-[#151716]">Paste 1-Line Script</h4>
              <p className="text-xs text-[#4e524f]">Copy our lightweight snippet into WordPress, Wix, Squarespace, or Webflow.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#dfded4] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">4</div>
              <h4 className="font-bold text-sm text-[#151716]">Capture 24/7 Leads</h4>
              <p className="text-xs text-[#4e524f]">Qualified emergencies & customer photos land straight on your smartphone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold font-mono tracking-widest text-[#bc5f40] uppercase">
            CLEAR ANSWERS
          </span>
          <h3 className="text-2xl sm:text-3xl font-black font-display text-[#151716]">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#dfded4] rounded-xl overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between font-bold text-xs sm:text-sm text-[#151716] hover:bg-[#f7f6f2] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-[#64748b] transition-transform duration-200 ${openFaqIdx === idx ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openFaqIdx === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-[#4e524f] leading-relaxed border-t border-[#f1f5f9]">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FINAL MAGNETIC CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#123e35] text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 relative overflow-hidden border border-[#0f342e] shadow-xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-4xl font-black font-display">
              Ready to Capture Every High-Ticket Emergency Lead?
            </h3>
            <p className="text-xs sm:text-base text-slate-200">
              Join local plumbers, HVAC pros, and roofers stopping after-hours lead leakage. Ingest your website in 60 seconds.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <MagneticButton
              id="cta-get-frontdesk"
              onClick={onOpenOnboarding}
              className="bg-[#bc5f40] hover:bg-[#a34f34] text-white font-black text-sm px-8 py-4 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 duration-200"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Launch SurgeBot for My Business</span>
              <ArrowRight className="w-4 h-4" />
            </MagneticButton>
          </div>
        </div>
      </section>

    </div>
  );
}
