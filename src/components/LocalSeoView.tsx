import React, { useState } from 'react';
import { 
  Compass, Map, Award, Star, MessageSquareCode, Share2, Clipboard, 
  Check, Sliders, CheckSquare, Zap, Target, BookOpen, ShieldCheck, Copy
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
