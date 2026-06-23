import React from 'react';
import { Page } from '../types';
import { 
  ArrowRight, Star, TrendingUp, CheckCircle, BarChart3, AlertCircle, 
  FileText, ChevronRight, Award, Compass, HeartHandshake, ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';

interface CaseStudiesViewProps {
  setCurrentPage: (page: Page) => void;
  onOpenOnboarding: () => void;
}

export default function CaseStudiesView({ setCurrentPage, onOpenOnboarding }: CaseStudiesViewProps) {
  
  const handleGetStarted = () => {
    onOpenOnboarding();
  };

  const caseStudiesData = [
    {
      slug: 'nyc-plumbing-case-study',
      title: 'NYC Plumber Achieves a 300% Boost in Local Map Ranking',
      tag: 'US Case Study',
      location: 'New York City, NY',
      niche: 'Residential & Emergency Plumbing',
      metric: '300% Map Visibility',
      metricsList: [
        { label: 'Map Pack Visibility', value: '+300%', color: 'text-emerald-600 bg-emerald-50' },
        { label: 'Monthly Inbound Leads', value: '65+ calls', color: 'text-amber-700 bg-amber-50' },
        { label: 'Citations Aligned', value: '140+ nodes', color: 'text-blue-600 bg-blue-50' }
      ],
      problem: 'The client was practically invisible on Google Maps outside of their immediate office zip code in Queens. They were paying over $80 per click on Google Ads to compete with large national franchises, severely squeezing their profit margins.',
      strategy: 'We performed a comprehensive name address phone consistency audit to eliminate duplicate listings. Next, we synchronized their Name-Address-Phone (NAP) coordinates across 100+ tier-1 directories. Finally, we deployed customized SAB (Service Area Business) schema markup to tell search engine crawl bots exactly which neighborhood coordinates they served.',
      results: 'Secured dominant positioning in the Local 3-Pack across 12 competitive Manhattan and Brooklyn suburbs, generating a 300% organic increase in inbound phone calls without paid ads.',
      badge: 'Map Pack Success Story'
    },
    {
      slug: 'toronto-dental-case-study',
      title: 'Toronto Dentist Dominates Google Map Pack Optimization',
      tag: 'Canada Case Study',
      location: 'Toronto, ON',
      niche: 'Cosmetic & Family Dentistry',
      metric: 'No. 1 Map Pack Rank',
      metricsList: [
        { label: 'Local Pack Rank', value: 'Top 3 (Avg. #1.2)', color: 'text-emerald-600 bg-emerald-50' },
        { label: 'Organic Booking Growth', value: '+140%', color: 'text-amber-700 bg-amber-50' },
        { label: 'Google Review Score', value: '4.9 Stars', color: 'text-blue-600 bg-blue-50' }
      ],
      problem: 'Despite a beautiful website, this newly established downtown Toronto clinic was not receiving any patient bookings from Google. High search saturation in the Greater Toronto Area (GTA) made standard search positioning impossible.',
      strategy: 'We executed a full-scale google map pack optimization project. We restructured their Google Business Profile categories, optimized their primary services tag, and introduced an automated review collection ring. We also injected structured local schema files matching their exact latitudes/longitudes.',
      results: 'Captured average #1.2 ranking in local map packs across Liberty Village, the Annex, and North York, leading to a 140% spike in monthly patient appointments.',
      badge: 'Local SEO Case Study'
    }
  ];

  return (
    <div id="case-studies-hub-page" className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-[#f7f6f2]">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Dynamic Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold font-mono text-[#4e524f] uppercase tracking-wider">
          <span className="hover:text-[#bc5f40] cursor-pointer" onClick={() => { setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</span>
          <span>/</span>
          <span className="hover:text-[#bc5f40] cursor-pointer" onClick={() => { setCurrentPage('site-map'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Sitemap</span>
          <span>/</span>
          <span className="text-[#123e35]">Case Studies</span>
        </div>

        {/* Banner Intro */}
        <div className="text-center space-y-3.5 max-w-2xl mx-auto">
          <span className="px-2.5 py-1 text-[10px] font-bold font-mono tracking-widest bg-[#123e35]/10 text-[#123e35] border border-[#123e35]/20 uppercase rounded">
            Proof & Results
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-[#151716] tracking-tight leading-none">
            Local SEO Case Studies & Success Stories 📊
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[#4e524f] leading-relaxed">
            Discover how real local businesses across the United States and Canada leverage our coordinate mapping, Google Business Profile setups, and dynamic citation management systems to achieve dominant local rankings.
          </p>
        </div>

        {/* Trust Alert Callout */}
        <div className="p-5 bg-white border border-[#dfded4] rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-xs font-semibold text-[#4e524f] shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-[#bc5f40]/10 flex items-center justify-center text-[#bc5f40] shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[#1a1c1a] font-bold text-sm">Verified Search Audit Results</p>
            <p className="text-[11px] leading-relaxed text-[#5c605d] mt-0.5">
              These case studies detail the real problem, strategy, and results mapped from our tracking pixels. To safeguard client privacy, some business names have been generalized, but the metric performance scores are 100% verified.
            </p>
          </div>
        </div>

        {/* Case Studies Loop */}
        <div className="space-y-12">
          {caseStudiesData.map((cs, idx) => (
            <motion.div 
              key={cs.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-white border border-[#dfded4] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
            >
              {/* Left Column: Info & Metrics */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="px-2 py-0.5 text-[8.5px] font-black uppercase font-mono tracking-wider bg-[#123e35]/10 text-[#123e35] rounded-md border border-[#123e35]/15">
                      {cs.tag}
                    </span>
                    <span className="px-2 py-0.5 text-[8.5px] font-black uppercase font-mono tracking-wider bg-amber-100/80 text-amber-900 rounded-md border border-amber-200">
                      {cs.badge}
                    </span>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-black font-display text-[#151716] leading-tight">
                    {cs.title}
                  </h3>
                  
                  <p className="text-xs font-mono text-[#888b88] font-bold uppercase tracking-wider">
                    📍 Location: {cs.location} • Niche: {cs.niche}
                  </p>
                </div>

                {/* Score Slabs */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#dfded4]/65">
                  {cs.metricsList.map((m, k) => (
                    <div key={k} className="p-3 bg-[#faf9f6] border border-[#dfded4] rounded-xl text-center space-y-1">
                      <span className="block text-[10px] font-bold text-[#888b88] uppercase tracking-wide truncate">{m.label}</span>
                      <span className={`block text-xs sm:text-sm font-black font-mono px-1 py-0.5 rounded ${m.color}`}>
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Case study breakdown */}
              <div className="lg:col-span-7 flex flex-col justify-between bg-[#faf9f6]/95 border border-[#dfded4] p-5 sm:p-6.5 rounded-2xl shadow-2xs space-y-5">
                
                {/* Problem */}
                <div className="space-y-1.5 font-sans">
                  <h4 className="text-xs font-black font-display text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    The Problem
                  </h4>
                  <p className="text-[11.5px] font-medium text-[#4e524f] leading-relaxed">
                    {cs.problem}
                  </p>
                </div>

                {/* Strategy */}
                <div className="space-y-1.5 font-sans border-t border-[#dfded4]/65 pt-4">
                  <h4 className="text-xs font-black font-display text-[#123e35] uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 shrink-0" />
                    The Strategy
                  </h4>
                  <p className="text-[11.5px] font-medium text-[#4e524f] leading-relaxed">
                    {cs.strategy}
                  </p>
                </div>

                {/* Results */}
                <div className="space-y-1.5 font-sans border-t border-[#dfded4]/65 pt-4">
                  <h4 className="text-xs font-black font-display text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                    The Results
                  </h4>
                  <p className="text-[11.5px] font-extrabold text-[#1a1c1a] leading-relaxed">
                    {cs.results}
                  </p>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA banner card */}
        <div className="bg-[#123e35] text-white rounded-3xl p-8 sm:p-12 text-center space-y-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -z-1" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#bc5f40]/10 rounded-full blur-3xl -z-1" />
          
          <span className="px-2.5 py-1 text-[9px] font-bold font-mono tracking-wider bg-white/10 border border-white/20 uppercase rounded-md text-white">
            Secure Your Map Pack Domination
          </span>
          <h3 className="text-2xl sm:text-3xl font-black font-display text-white">
            Ready to Build Your Own Success Story?
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-gray-200 max-w-2xl mx-auto leading-relaxed font-sans">
            Don't leave your local ranking coordinates to chance. Request your free competitor local SEO analysis prepared directly by our search experts to discover untapped neighborhood keyword opportunities.
          </p>
          <div className="pt-2">
            <button
              onClick={handleGetStarted}
              className="bg-[#bc5f40] hover:bg-[#cf6d4e] active:scale-95 text-white font-extrabold py-3.5 px-8 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all inline-flex items-center gap-2 shadow-xs"
            >
              <span>Launch Your Free Strategy Setup</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
