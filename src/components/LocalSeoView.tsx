import React, { useState } from 'react';
import { 
  Compass, Map, Award, Star, MessageSquareCode, Share2, Clipboard, 
  Check, Sliders, CheckSquare, Zap, Target, BookOpen, ShieldCheck, Copy,
  Sparkles, HelpCircle, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LocalDirectoryTool from './LocalDirectoryTool';

interface LocalSeoViewProps {
  onOpenOnboarding: () => void;
  onGetFreeStrategy?: () => void;
  setCurrentPage: (page: any) => void;
}

export default function LocalSeoView({ onOpenOnboarding, onGetFreeStrategy, setCurrentPage }: LocalSeoViewProps) {
  // Local Schema Generator states
  const [bizType, setBizType] = useState('LocalBusiness');
  const [bizName, setBizName] = useState('Bay Area Contractors');
  const [address, setAddress] = useState('780 North First St, Suite 210');
  const [city, setCity] = useState('San Jose');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('95112');
  const [phone, setPhone] = useState('(408) 555-0199');
  const [website, setWebsite] = useState('https://bayareaconstructors.local');
  const [lat, setLat] = useState('37.3522');
  const [lng, setLng] = useState('-121.8941');
  const [copied, setCopied] = useState(false);

  // AI Explorer states
  const [activeTab, setActiveTab] = useState<'ai-prompts' | 'people-also-ask'>('ai-prompts');
  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null);
  const [activePaaIdx, setActivePaaIdx] = useState<number | null>(null);

  // Generate real structured JSON-LD data
  const jsonLd = `{
  "@context": "https://schema.org",
  "@type": "${bizType}",
  "name": "${bizName}",
  "image": "https://localsurgeseo.com/assets/photos/service-profile.jpg",
  "@id": "${website}/#id",
  "url": "${website}",
  "telephone": "${phone}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "${address}",
    "addressLocality": "${city}",
    "addressRegion": "${state}",
    "postalCode": "${zip}",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": ${lat || '37.3382'},
    "longitude": ${lng || '-121.8863'}
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ],
    "opens": "09:00",
    "closes": "18:00"
  },
  "sameAs": [
    "https://facebook.com/localbrand",
    "https://yelp.com/biz/localbrand"
  ]
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonLd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-16">
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden bg-[#123e35] text-white py-16 sm:py-24 rounded-3xl border border-[#0f342e] shadow-sm max-w-7xl mx-auto px-6 sm:px-12">
        <div className="absolute inset-0 bg-radial-at-t from-[#1d5b4e] to-[#123e35] opacity-85" />
        
        {/* Subtle grid accent backgrounds */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#bc5f40] to-[#f7f6f2] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.187rem]" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <span className="px-3.5 py-1 text-[10px] font-bold font-mono tracking-widest bg-white/10 border border-white/15 text-slate-100 uppercase rounded-full">
            DOMINATE NEIGHBORHOOD MAP SEARCHES
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-none">
            Local SEO Optimization Services
          </h1>
          <p className="text-sm sm:text-base text-slate-100 font-medium max-w-2xl mx-auto leading-relaxed">
            The neighborhood map packs capture 68% of commercial search clicks. If your business doesn&rsquo;t show in Yahoo, Google Maps, or local directories, you are losing cash-in-hand contractors leads to under-qualified alternatives.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3.5 pt-4">
            <button
              onClick={onGetFreeStrategy || onOpenOnboarding}
              className="bg-[#bc5f40] hover:bg-[#cf6d4e] hover:shadow-md text-white font-extrabold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all duration-200"
            >
              Get Free Strategy
            </button>
            <a
              href="#local-business-directory-tool"
              className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider text-center transition-all duration-200"
            >
              Scan Citations Now
            </a>
          </div>
        </div>
      </section>

      {/* 2. CORE STRATEGY PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3.5 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#151716] tracking-tight">
            How We Propel Your Business to No. 1
          </h2>
          <p className="text-xs sm:text-sm text-[#4e524f] font-semibold">
            We don&rsquo;t just build links; we install permanent digital infrastructure that makes your local entity highly trustworthy to search algorithms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Pillar 1 */}
          <div className="bg-white border border-[#dfded4] rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xs hover:border-[#123e35] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#123e35]/10 flex items-center justify-center text-[#123e35]">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#151716]">
              Google Business Profile Sync
            </h3>
            <p className="text-xs text-[#5c605d] font-semibold leading-relaxed">
              We execute meticulous listing setup: category prioritization, service territory coordinates tuning, review acquisition funnels, and high-resolution geotagged image uploads.
            </p>
            <ul className="space-y-2 text-xs font-bold text-[#2d2f2d] pt-2 border-t border-[#dfded4]/60">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Primary Categories Tuning</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Geotagged Photo Stacking</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Q&A Authority Pre-seeding</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white border border-[#dfded4] rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xs hover:border-[#123e35] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#123e35]/10 flex items-center justify-center text-[#123e35]">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#151716]">
              Citation NAP Orchestration
            </h3>
            <p className="text-xs text-[#5c605d] font-semibold leading-relaxed">
              Search engines examine consistency. If Yelp, Bing, Apple Maps, or Hotfrog list mismatched phone numbers, your domain is downranked. We align coordinates perfectly across 100+ indexes.
            </p>
            <ul className="space-y-2 text-xs font-bold text-[#2d2f2d] pt-2 border-t border-[#dfded4]/60">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Name-Address-Phone Alignment</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Duplicate Listing Merges</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>High-DA Local Citation Builds</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white border border-[#dfded4] rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xs hover:border-[#123e35] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#123e35]/10 flex items-center justify-center text-[#123e35]">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#151716]">
              Review Velocity Booster
            </h3>
            <p className="text-xs text-[#5c605d] font-semibold leading-relaxed">
              More reviews equals higher geographic reach. We install automated review-collection flows post-transaction via SMS and email, directly amplifying positive maps rank triggers.
            </p>
            <ul className="space-y-2 text-xs font-bold text-[#2d2f2d] pt-2 border-t border-[#dfded4]/60">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Automated SMS Invites</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Negative Review Filters</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Consistent Response Posting</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* AI PROMPT & SEARCH INTENT EXPLORER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-3.5 max-w-2xl mx-auto">
          <span className="px-3.5 py-1 text-[10px] font-bold font-mono tracking-widest bg-[#bc5f40]/10 text-[#bc5f40] border border-[#bc5f40]/25 uppercase rounded-full">
            AI Prompts & Search Intent Explorer
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#151716] tracking-tight">
            Dominate Conversational AI & Search Modifiers
          </h2>
          <p className="text-xs sm:text-sm text-[#4e524f] font-semibold">
            In 2026, customers don't just type keywords—they ask complex questions to AI search assistants. Explore real-world queries and copy optimized prompts to test your local relevance.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center border-b border-[#dfded4] max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('ai-prompts')}
            className={`flex-1 pb-3 text-xs font-mono font-black uppercase tracking-wider transition-all duration-200 border-b-2 cursor-pointer ${
              activeTab === 'ai-prompts'
                ? 'border-[#123e35] text-[#123e35]'
                : 'border-transparent text-[#888b88] hover:text-[#1a1c1a]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1.5 align-text-bottom" />
            AI Prompts Vault
          </button>
          <button
            onClick={() => setActiveTab('people-also-ask')}
            className={`flex-1 pb-3 text-xs font-mono font-black uppercase tracking-wider transition-all duration-200 border-b-2 cursor-pointer ${
              activeTab === 'people-also-ask'
                ? 'border-[#123e35] text-[#123e35]'
                : 'border-transparent text-[#888b88] hover:text-[#1a1c1a]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 inline mr-1.5 align-text-bottom" />
            People Also Ask
          </button>
        </div>

        <div className="bg-[#faf9f6]/95 border border-[#dfded4] rounded-3xl p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'ai-prompts' ? (
              <motion.div
                key="ai-prompts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Small Business Strategy",
                      title: "Best local SEO services for small businesses near me",
                      prompt: "Act as an expert local SEO consultant. What factors should a small business look for when selecting a local SEO services agency near them to optimize their Google Business Profile and local maps citations in 2026?"
                    },
                    {
                      label: "Value Proposition",
                      title: "How do local SEO agencies help small businesses?",
                      prompt: "Explain the core deliverables of a local SEO agency. How do Name-Address-Phone (NAP) consistency audits, coordinates alignment, and Google Business Profile sync directly drive phone calls and leads for service-area contractors?"
                    },
                    {
                      label: "Provider Assessment",
                      title: "What should I look for in a reputable local SEO provider?",
                      prompt: "Create an audit checklist of questions to ask a potential local SEO provider. How do I verify if their citations building, local structured schema generators, and Google Maps rankings strategies are compliant with recent 2026 guidelines?"
                    },
                    {
                      label: "Optimization Checklist",
                      title: "Steps to improve my business's visibility in local search results.",
                      prompt: "Outline a step-by-step roadmap to maximize a service business's local search presence in Google Maps. Include GBP primary category tuning, geotagged media updates, and reviews velocity triggers."
                    },
                    {
                      label: "Platform Tuning",
                      title: "Local SEO services with Google My Business optimization",
                      prompt: "How does comprehensive Google Business Profile (formerly GMB) optimization influence local map pack rankings? Detail the importance of coordinates syncing, Q&A seeding, and active review response velocity."
                    },
                    {
                      label: "Service Comparison",
                      title: "Compare different types of local SEO packages available.",
                      prompt: "Analyze and compare the typical local SEO services packages (starter citation sync, premium maps pack dominance, custom multi-city expansion campaigns). Detail the ROI and deliverables of each tier."
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white border border-[#dfded4] p-5 rounded-2xl flex flex-col justify-between hover:border-[#123e35]/30 transition-all duration-300 shadow-2xs">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[8px] font-black uppercase font-mono tracking-wider bg-[#123e35]/5 text-[#123e35] border border-[#123e35]/15 rounded">
                            {item.label}
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-[#151716] font-mono leading-relaxed">
                          "{item.title}"
                        </h4>
                        <div className="bg-[#faf9f6] border border-[#dfded4]/60 p-3 rounded-xl text-[11px] text-[#4e524f] font-mono leading-relaxed select-all">
                          {item.prompt}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.prompt);
                          setCopiedPromptIdx(idx);
                          setTimeout(() => setCopiedPromptIdx(null), 2000);
                        }}
                        className="mt-4 flex items-center justify-center gap-1.5 w-full bg-[#123e35] hover:bg-[#185246] text-white text-[10px] font-black py-2.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider font-mono shadow-2xs"
                      >
                        {copiedPromptIdx === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Prompt Template</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="people-also-ask"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 max-w-3xl mx-auto"
              >
                {[
                  {
                    q: "Is SEO dead or evolving in 2026?",
                    a: "No, SEO is not dead—it has transitioned into Generative Engine Optimization (GEO). Search platforms (like ChatGPT, Gemini, and Perplexity) rely on the same coordinates, structured schemas, and verified citations to answer local queries. If your structured data is missing, AI will ignore your business."
                  },
                  {
                    q: "Will SEO be replaced by AI?",
                    a: "AI is augmenting search behaviors, but it is not replacing the need for local rankings. Instead of links, AI provides single direct recommendations. Winning that sole recommendation requires an even stronger local authority signal, perfect citation mapping, and high review trust."
                  },
                  {
                    q: "Does local SEO still work and is it worth it?",
                    a: "Local SEO delivers the highest ROI of any digital channel because it targets buyers at the exact moment they require emergency assistance or specialized local services near them. Unlike temporary pay-per-click ads, local SEO builds permanent authority."
                  },
                  {
                    q: "What is the 80/20 rule of SEO?",
                    a: "80% of local SEO map pack conversions come from 20% of your optimization actions. Focus on Name-Address-Phone (NAP) alignment, matching category selections, and local structured JSON-LD schema coordination rather than vanity backlinks."
                  },
                  {
                    q: "How much do local SEO services cost?",
                    a: "Professional local SEO services run between $500 and $2,000 monthly, depending on competitive density. Valid campaigns pay for themselves rapidly as local listings generate organic customer phone calls."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white border border-[#dfded4] rounded-2xl overflow-hidden shadow-2xs">
                    <button
                      onClick={() => setActivePaaIdx(activePaaIdx === idx ? null : idx)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-[#faf9f6]/40 transition-colors focus:outline-none"
                    >
                      <span className="font-extrabold text-[#151716] text-xs sm:text-sm tracking-tight">
                        {item.q}
                      </span>
                      <motion.div
                        animate={{ rotate: activePaaIdx === idx ? 180 : 0 }}
                        className="w-5 h-5 rounded-full bg-[#123e35]/5 flex items-center justify-center text-[#123e35]"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {activePaaIdx === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-[#dfded4]/40"
                        >
                          <p className="px-5 pb-4 pt-3 text-xs sm:text-sm text-[#4e524f] font-semibold leading-relaxed">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 3. INTERACTIVE CORNER: LOCAL SCHEMA BUILDER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#faf9f6]/95 border border-[#dfded4] rounded-3xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
            <span className="text-[10px] font-bold font-mono tracking-widest text-[#bc5f40] uppercase block">
              FREE TECHNICAL HELPER
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-display text-[#151716] tracking-tight leading-tight">
              Local SEO Schema Markup JSON-LD Builder
            </h3>
            <p className="text-xs text-[#5c605d] font-semibold leading-relaxed">
              Structured JSON-LD schema is a secret weapon that tells search engines exactly which category, latitude, longitude, and market territory belongs to your business. Fill in the data to compile a perfect markup schema you can instantly copy!
            </p>
            
            <div className="space-y-3 pt-3 border-t border-[#dfded4]">
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs text-[#2c2d2c] font-bold">Instantly tells Google your exact maps coordinates</span>
              </div>
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs text-[#2c2d2c] font-bold">Guarantees zero confusion between multi-unit coordinates</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border border-[#dfded4] p-5 sm:p-6 rounded-2xl shadow-2xs">
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold font-mono text-[#123e35] uppercase tracking-wider border-b border-[#dfded4]/70 pb-1.5">Business Parameters</h4>
              
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-[#4e524f] uppercase tracking-wide font-mono">Category</label>
                <select 
                  value={bizType} 
                  onChange={(e) => setBizType(e.target.value)}
                  className="bg-[#faf9f6] border border-[#dfded4] rounded-lg w-full px-2.5 py-1.5 text-xs text-[#1a1c1a]/95 font-semibold focus:outline-none focus:border-[#bc5f40]"
                >
                  <option value="LocalBusiness">LocalBusiness (General)</option>
                  <option value="HomeAndConstructionBusiness">Home & Construction</option>
                  <option value="PlumbingService">PlumbingService</option>
                  <option value="HVACBusiness">HVACBusiness</option>
                  <option value="Electrician">Electrician</option>
                  <option value="ProfessionalService">Legal / Accounting</option>
                  <option value="Dentist">Dentist / Medical</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-[#4e524f] uppercase tracking-wide font-mono">Business Name</label>
                <input 
                  type="text" 
                  value={bizName} 
                  onChange={(e) => setBizName(e.target.value)}
                  className="bg-[#faf9f6] border border-[#dfded4] rounded-lg w-full px-2.5 py-1.5 text-xs text-[#1a1c1a]/95 font-semibold focus:outline-none focus:border-[#bc5f40]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-[#4e524f] uppercase tracking-wide font-mono">Street Address</label>
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-[#faf9f6] border border-[#dfded4] rounded-lg w-full px-2.5 py-1.5 text-xs text-[#1a1c1a]/95 font-semibold focus:outline-none focus:border-[#bc5f40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-[#4e524f] uppercase tracking-wide font-mono">City</label>
                  <input 
                    type="text" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-[#faf9f6] border border-[#dfded4] rounded-lg w-full px-2.5 py-1.5 text-xs text-[#1a1c1a]/95 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-[#4e524f] uppercase tracking-wide font-mono">Zip Code</label>
                  <input 
                    type="text" 
                    value={zip} 
                    onChange={(e) => setZip(e.target.value)}
                    className="bg-[#faf9f6] border border-[#dfded4] rounded-lg w-full px-2.5 py-1.5 text-xs text-[#1a1c1a]/95 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-[#4e524f] uppercase tracking-wide font-mono">Latitude Coordinates</label>
                  <input 
                    type="text" 
                    value={lat} 
                    onChange={(e) => setLat(e.target.value)}
                    className="bg-[#faf9f6] border border-[#dfded4] rounded-lg w-full px-2.5 py-1.5 text-xs text-[#1a1c1a]/95 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-[#4e524f] uppercase tracking-wide font-mono">Longitude Coordinates</label>
                  <input 
                    type="text" 
                    value={lng} 
                    onChange={(e) => setLng(e.target.value)}
                    className="bg-[#faf9f6] border border-[#dfded4] rounded-lg w-full px-2.5 py-1.5 text-xs text-[#1a1c1a]/95 font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3.5 flex flex-col">
              <div className="flex justify-between items-center border-b border-[#dfded4]/70 pb-1.5">
                <h4 className="text-xs font-bold font-mono text-[#bc5f40] uppercase tracking-wider">Output JSON-LD Code</h4>
                <button 
                  type="button" 
                  onClick={copyToClipboard}
                  className="text-[#123e35] hover:text-[#185246] transition-colors flex items-center gap-1 text-[10px] font-bold font-mono bg-[#123e35]/5 px-2 py-0.5 rounded border border-[#123e35]/15 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="flex-1 bg-[#151716]/95 text-[#fbfaf8] border border-[#2d2f2d] rounded-xl p-3 text-[10px] font-mono leading-relaxed overflow-x-auto overflow-y-auto max-h-[240px] whitespace-pre-wrap select-all">
                {jsonLd}
              </pre>
            </div>

          </div>

        </div>
      </section>

      {/* 4. LOCAL BUSINESS DIRECTORY (SCANNER COMPONENT PLACED RIGHT ABOVE FOOTER BLOCK ZONE AS AN ANCHORED SECTION) */}
      <section id="local-business-directory-section" className="max-w-7xl mx-auto px-4 sm:px-6">
        <LocalDirectoryTool onOpenOnboarding={onOpenOnboarding} />
      </section>

    </div>
  );
}
