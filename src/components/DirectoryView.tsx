import React from 'react';
import { Page } from '../types';
import { 
  Rocket, MapPin, Globe, Star, Mail, CheckCircle, ShieldCheck, 
  ArrowRight, Landmark, Zap, Compass, Users, TrendingUp, HelpCircle,
  AlertCircle, BarChart3, Sparkles, Sliders, Play, Award, ExternalLink,
  Navigation, Search
} from 'lucide-react';
import { motion } from 'motion/react';
import LocalDirectoryTool from './LocalDirectoryTool';
import { STATE_DIRECTORY, CITY_DIRECTORY, StateData, CityData } from '../data/directoryData';

interface DirectoryViewProps {
  setCurrentPage: (page: Page) => void;
  stateSlug: string | null;
  citySlug: string | null;
  onOpenOnboarding: () => void;
  onGetFreeStrategy: () => void;
  // Fallbacks to set slugs if we route internally
  setActiveStateSlug?: (slug: string | null) => void;
  setActiveCitySlug?: (slug: string | null) => void;
}

export default function DirectoryView({ 
  setCurrentPage, 
  stateSlug, 
  citySlug, 
  onOpenOnboarding, 
  onGetFreeStrategy,
  setActiveStateSlug,
  setActiveCitySlug
}: DirectoryViewProps) {
  
  const handleGetStarted = () => {
    onGetFreeStrategy();
  };

  // 1. Resolve State & City data
  let stateData: StateData | null = null;
  let cityData: CityData | null = null;

  if (citySlug) {
    cityData = CITY_DIRECTORY[citySlug] || null;
    if (cityData) {
      stateData = STATE_DIRECTORY[cityData.stateSlug] || null;
    }
  } else if (stateSlug) {
    stateData = STATE_DIRECTORY[stateSlug] || null;
  }

  // Handle click on other states/cities internally
  const handleNavigateToState = (slug: string) => {
    if (setActiveStateSlug) setActiveStateSlug(slug);
    if (setActiveCitySlug) setActiveCitySlug(null);
    setCurrentPage('state-seo' as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToCity = (sSlug: string, cSlug: string) => {
    if (setActiveStateSlug) setActiveStateSlug(sSlug);
    if (setActiveCitySlug) setActiveCitySlug(cSlug);
    setCurrentPage('city-seo' as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If no data resolved, render fallback empty state or redirect
  if (!stateData && !cityData) {
    return (
      <div className="min-h-screen py-24 bg-[#f7f6f2] flex items-center justify-center">
        <div className="bg-white border border-[#dfded4] rounded-3xl p-10 max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#bc5f40] mx-auto" />
          <h2 className="text-xl font-bold text-[#151716] font-display">Directory Node Not Located</h2>
          <p className="text-xs text-[#4e524f] leading-relaxed">
            The target geographic SEO index was not resolved. Ensure the requested path corresponds to one of our mapped local directories.
          </p>
          <button 
            onClick={() => setCurrentPage('site-map')}
            className="bg-[#123e35] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase cursor-pointer"
          >
            Return to Sitemap
          </button>
        </div>
      </div>
    );
  }

  // Determine standard variables based on state or city focus
  const isCity = !!cityData;
  const name = isCity ? cityData!.name : `${stateData!.name} Local SEO Guide`;
  const code = isCity ? cityData!.stateCode : stateData!.code;
  const emoji = isCity ? cityData!.emoji : stateData!.emoji;
  const intro = isCity ? cityData!.intro : stateData!.intro;

  // Key stats
  const keyStats = isCity ? cityData!.keyStatsList : stateData!.keyStatsList;
  const realityPoints = isCity ? cityData!.realityPoints : stateData!.realityPoints;
  const advantagePoints = isCity ? cityData!.advantagePoints : stateData!.advantagePoints;

  return (
    <div id="directory-seo-page" className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-[#f7f6f2]">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Dynamic Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold font-mono text-[#4e524f] uppercase tracking-wider">
          <span className="hover:text-[#bc5f40] cursor-pointer" onClick={() => setCurrentPage('home')}>Home</span>
          <span>/</span>
          <span className="hover:text-[#bc5f40] cursor-pointer" onClick={() => setCurrentPage('site-map')}>Sitemap</span>
          
          {isCity ? (
            <>
              <span>/</span>
              <button 
                className="hover:text-[#bc5f40] cursor-pointer text-[10px] font-bold font-mono uppercase"
                onClick={() => handleNavigateToState(cityData!.stateSlug)}
              >
                {cityData!.stateName}
              </button>
              <span>/</span>
              <span className="text-[#123e35]">{cityData!.name}</span>
            </>
          ) : (
            <>
              <span>/</span>
              <span className="text-[#123e35]">{stateData!.name}</span>
            </>
          )}
        </div>

        {/* Hero Section */}
        <div className="bg-white border border-[#dfded4] rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xs">
          {/* Design accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#123e35]/5 rounded-full blur-3xl -z-1" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#bc5f40]/5 rounded-full blur-2xl -z-1" />

          <div className="space-y-6 max-w-3xl">
            <span className="px-3 py-1 text-[10px] font-black font-mono tracking-widest bg-amber-100/80 text-amber-900 border border-amber-200 uppercase rounded-md inline-block">
              {isCity ? `${cityData!.name} ranking cluster` : `${stateData!.name} Enterprise Directory`}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black font-display text-[#151716] tracking-tight leading-none">
              {name} {emoji}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-[#4e524f] leading-relaxed">
              {intro}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <button
                onClick={handleGetStarted}
                className="bg-[#123e35] hover:bg-[#1a554a] active:scale-95 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-2xs"
              >
                <span>Request Free {isCity ? cityData!.name.split(' ')[0] : stateData!.name} Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <a
                href="#local-battlefield"
                className="border border-[#dfded4] hover:bg-[#dfded4]/35 text-[#151716] font-bold py-3.5 px-6 rounded-xl text-xs text-center cursor-pointer transition-colors"
              >
                View Battlefield Analysis
              </a>
            </div>
          </div>
        </div>

        {/* COMPONENT 1: LOCAL BUSINESS SEO: DOMINATING REGIONAL MARKETS */}
        <div className="bg-[#faf9f6]/75 border border-[#dfded4] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xs space-y-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black font-display text-[#151716] tracking-tight leading-none text-balance">
              {isCity 
                ? `${cityData!.name}: Dominating America's High-Velocity Markets`
                : `${stateData!.name} Small Businesses: Your Digital Opportunity Awaits`
              }
            </h2>
            <p className="text-xs sm:text-sm text-[#4e524f] font-semibold leading-relaxed">
              {isCity 
                ? `Securing early search authorization coordinates inside ${cityData!.name} requires local schemas tailored directly around dense population hotspots.`
                : `Join the thousands of ${stateData!.name} small businesses already commanding top rankings and claiming customers before the competition does.`
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
            
            {/* Left Column: Metric progress chart */}
            <div className="lg:col-span-6 flex items-center">
              <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-5 w-full">
                <div className="space-y-1">
                  <h4 className="text-sm font-black font-display text-[#151716] uppercase tracking-wide">
                    {isCity ? `${cityData!.name.split(' ')[0]} Economic Projections` : `${stateData!.name} Business Density`}
                  </h4>
                  <p className="text-[10px] font-bold text-[#bc5f40] uppercase tracking-wider font-mono">
                    {isCity ? 'Evaluating localized opportunities' : 'Leads the nation in commerce indicators'}
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {isCity ? (
                    cityData!.compareMetrics.map((bar, idx) => (
                      <div key={idx} className="space-y-1 font-sans">
                        <div className="flex justify-between items-center text-xs font-bold text-[#4e524f]">
                          <span className={bar.active ? 'text-[#123e35] font-extrabold font-display' : ''}>{bar.metric}</span>
                          <span className="font-mono text-[11px] text-[#151716]">{bar.count}</span>
                        </div>
                        <div className="w-full bg-[#faf9f6] h-6 rounded-lg overflow-hidden border border-[#dfded4]/60">
                          <div 
                            className={`h-full rounded-lg transition-all duration-500 flex items-center justify-end px-3 ${
                              bar.active 
                                ? 'bg-[#123e35] text-white font-mono text-[9px] font-black' 
                                : 'bg-[#bc5f40]/20 text-[#bc5f40] font-mono text-[9px] font-black'
                            }`}
                            style={{ width: bar.width }}
                          >
                            {bar.count}
                          </div>
                        </div>
                        <p className="text-[8.5px] text-[#888b88] font-semibold tracking-wide uppercase font-mono">{bar.desc}</p>
                      </div>
                    ))
                  ) : (
                    stateData!.compareStates.map((bar, idx) => (
                      <div key={idx} className="space-y-1 font-sans">
                        <div className="flex justify-between items-center text-xs font-bold text-[#4e524f]">
                          <span className={bar.active ? 'text-[#123e35] font-extrabold font-display' : ''}>{bar.state}</span>
                          <span className="font-mono text-[11px] text-[#151716]">{bar.count}</span>
                        </div>
                        <div className="w-full bg-[#faf9f6] h-6 rounded-lg overflow-hidden border border-[#dfded4]/60">
                          <div 
                            className={`h-full rounded-lg transition-all duration-500 flex items-center justify-end px-3 ${
                              bar.active 
                                ? 'bg-[#123e35] text-white font-mono text-[9px] font-black' 
                                : 'bg-[#dfded4]/40 text-[#4e524f] font-mono text-[9px] font-bold'
                            }`}
                            style={{ width: bar.width }}
                          >
                            {bar.count}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Key Statistics List */}
            <div className="lg:col-span-6 space-y-4 flex flex-col justify-center bg-white border border-[#dfded4] p-6 rounded-2xl">
              <h3 className="text-xs font-black font-display text-[#151716] uppercase tracking-wider pb-2 border-b border-[#dfded4]/40 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#bc5f40]" />
                {isCity ? `${cityData!.name.split(' ')[0]} Local Stats` : `${stateData!.name} Landscape Analysis`}
              </h3>
              <ul className="space-y-3">
                {keyStats.slice(0, 9).map((item, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs font-semibold text-[#4e524f] leading-normal font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#123e35] shrink-0 mt-1.5"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* COMPONENT 2: BEAT YOUR COMPETITION: THE LOCAL SEO BATTLEFIELD */}
        <div id="local-battlefield" className="bg-[#faf9f6] border border-[#dfded4] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xs space-y-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black font-display text-[#151716] tracking-tight leading-none">
              Beat Your {isCity ? cityData!.name.split(' ')[0] : stateData!.name} Competition: The Local SEO Battlefield Analysis
            </h2>
            <p className="text-xs sm:text-sm text-[#4e524f] font-semibold leading-relaxed">
              In {isCity ? cityData!.name.split(' ')[0] : stateData!.name}, you are not just competing locally—you're up against some of the most sophisticated marketing operations in the country. Here's how to win.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Card 1: Your Competition Reality */}
            <div className="bg-white border border-[#dfded4] p-6 sm:p-8 rounded-2xl shadow-2xs space-y-5">
              <h3 className="text-sm font-black font-display text-[#151716] uppercase tracking-wider border-b border-[#dfded4]/60 pb-2.5 flex items-center justify-between">
                <span>{isCity ? cityData!.name.split(' ')[0] : stateData!.name} Competition Reality</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#bc5f40] animate-pulse"></span>
              </h3>
              <ul className="space-y-4">
                {realityPoints.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-xs font-semibold text-[#4e524f] leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-[#bc5f40] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 2: Your Competitive Advantages */}
            <div className="bg-white border border-[#dfded4] p-6 sm:p-8 rounded-2xl shadow-2xs space-y-5">
              <h3 className="text-sm font-black font-display text-[#151716] uppercase tracking-wider border-b border-[#dfded4]/60 pb-2.5 flex items-center justify-between">
                <span>Your Competitive Advantages</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#123e35] animate-pulse"></span>
              </h3>
              <ul className="space-y-4">
                {advantagePoints.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-xs font-semibold text-[#4e524f] leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-[#123e35] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <div className="text-center pt-4">
            <button
              onClick={handleGetStarted}
              className="group text-xs font-black font-display uppercase tracking-widest text-[#bc5f40] hover:text-[#123e35] transition-all duration-300 flex items-center gap-1 mx-auto cursor-pointer"
            >
              <span className="group-hover:underline">Outrank {isCity ? `${cityData!.name.split(' ')[0]} Traders` : `${stateData!.name} Competitors`} Now</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Citation Scanner Widget integration */}
        <div className="space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black font-display text-[#151716]">
              Scan Your {isCity ? cityData!.name.split(' ')[0] : stateData!.name} Citation Alignment
            </h2>
            <p className="text-xs text-[#4e524f] font-semibold">
              Evaluate how your brand coordinates are broadcasted compared to reigning local pack directory leaders.
            </p>
          </div>
          <LocalDirectoryTool onOpenOnboarding={handleGetStarted} />
        </div>

        {/* Neighborhood / Hub Target Grid */}
        <div className="bg-white border border-[#dfded4] rounded-3xl p-6 sm:p-10 space-y-8 shadow-xs">
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-[#151716] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#bc5f40]" />
              {isCity ? `${cityData!.name.split(' ')[0]} Neighborhood Targeting Nodes` : `${stateData!.name} Metropolitan Nodes We Target`}
            </h2>
            <p className="text-xs sm:text-sm text-[#4e524f] font-semibold mt-1">
              Commanding regional organic results requires segmented regional listings. We set up isolated schemas for:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isCity ? (
              cityData!.neighborhoods.map((col, idx) => (
                <div key={idx} className="border border-[#dfded4] bg-[#faf9f6]/40 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="bg-[#bc5f40]/10 text-[#bc5f40] px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-wider w-fit block">{col.tag}</span>
                    <h4 className="text-xs font-black font-display text-[#151716]">{col.name}</h4>
                    <p className="text-[10px] font-semibold text-[#4e524f]">Optimizing local authority grids geared around {col.focus}.</p>
                  </div>
                  <div className="text-[9px] font-mono text-[#123e35] font-bold">Schema Status: Verified ✓</div>
                </div>
              ))
            ) : (
              stateData!.hubs.map((col, idx) => (
                <div key={idx} className="border border-[#dfded4] bg-[#faf9f6]/40 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="bg-[#123e35]/15 text-[#123e35] px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-wider w-fit block">{col.tag}</span>
                    <h4 className="text-xs font-black font-display text-[#151716]">{col.name}</h4>
                    <p className="text-[10px] font-semibold text-[#4e524f]">Declaring structured delivery ranges spanning {col.focus}.</p>
                  </div>
                  <div className="text-[9px] font-mono text-[#bc5f40] font-bold">Coord Synced: Active ✓</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Playbook blueprint summary */}
        <div className="bg-[#123e35] text-white rounded-3xl p-8 sm:p-12 space-y-6">
          <span className="px-2.5 py-1 text-[9px] font-bold font-mono tracking-wider bg-white/10 border border-white/20 uppercase rounded-md text-white">
            Specialized Regional Blueprint
          </span>
          <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight leading-none">
            Our 3-Step {isCity ? cityData!.name.split(' ')[0] : stateData!.name} Local Domination Playbook
          </h3>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-semibold max-w-2xl">
            Google weights geographic proximity and absolute local authority above generalized SEO factors. We implement these targets directly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2 bg-white/5 p-5 rounded-2xl border border-white/10">
              <div className="text-base font-black text-amber-300 font-mono">01 /</div>
              <h4 className="font-bold text-sm">Spatial Coordinate Alignment</h4>
              <p className="text-[11px] text-gray-300 font-semibold leading-normal">
                Avoid broad-city targeting. We synchronize targeted latitude/longitude structures to maximize local pack vicinity scores.
              </p>
            </div>

            <div className="space-y-2 bg-white/5 p-5 rounded-2xl border border-white/10">
              <div className="text-base font-black text-amber-300 font-mono">02 /</div>
              <h4 className="font-bold text-sm">High-density Schema Embeds</h4>
              <p className="text-[11px] text-gray-300 font-semibold leading-normal">
                Segmented LocalBusiness arrays declare specific service delivery parameters, bypassing generic search boundaries safely.
              </p>
            </div>

            <div className="space-y-2 bg-white/5 p-5 rounded-2xl border border-white/10">
              <div className="text-base font-black text-amber-300 font-mono">03 /</div>
              <h4 className="font-bold text-sm">Review Synchronization Rings</h4>
              <p className="text-[11px] text-gray-300 font-semibold leading-normal">
                Continuous geo-coded reviews combined with neighborhood citation coordinates create persistent organic shielding.
              </p>
            </div>
          </div>
        </div>

        {/* CTA banner card */}
        <div className="bg-amber-50 border border-amber-300/60 rounded-3xl p-8 text-center space-y-5">
          <h3 className="text-xl sm:text-2xl font-black font-display text-amber-950">
            Outrank Your {isCity ? cityData!.name.split(' ')[0] : stateData!.name} Competition Instantly
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-amber-800/95 max-w-2xl mx-auto leading-relaxed font-sans">
            Ready to secure top map stack spots? Request your free {isCity ? `${cityData!.name.split(' ')[0]} SEO competitor` : `${stateData!.name} local`} analysis prepared directly by our core engine metrics.
          </p>
          <div className="pt-2">
            <button
              onClick={handleGetStarted}
              className="bg-[#123e35] hover:bg-[#185246] text-white font-extrabold py-3.5 px-8 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all inline-flex items-center gap-2 shadow-xs"
            >
              <span>Activate Your Free Audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
