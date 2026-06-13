import React from 'react';
import { Page } from '../types';
import { 
  Rocket, MapPin, Globe, Star, Mail, CheckCircle, ShieldCheck, 
  ArrowRight, Landmark, Zap, Compass, Users, TrendingUp, HelpCircle,
  AlertCircle, BarChart3, Sparkles, Sliders, Play, Award, ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import LocalDirectoryTool from './LocalDirectoryTool';

interface LosAngelesSeoViewProps {
  setCurrentPage: (page: Page) => void;
  onOpenOnboarding: () => void;
  onGetFreeStrategy: () => void;
}

export default function LosAngelesSeoView({ setCurrentPage, onOpenOnboarding, onGetFreeStrategy }: LosAngelesSeoViewProps) {
  
  const handleGetStarted = () => {
    onGetFreeStrategy();
  };

  return (
    <div id="los-angeles-seo-page" className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-[#f7f6f2]">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* State Page Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-[#4e524f] uppercase tracking-wider">
          <span className="hover:text-[#bc5f40] cursor-pointer" onClick={() => setCurrentPage('home')}>Home</span>
          <span>/</span>
          <span className="hover:text-[#bc5f40] cursor-pointer" onClick={() => setCurrentPage('site-map')}>Sitemap</span>
          <span>/</span>
          <span className="hover:text-[#bc5f40] cursor-pointer" onClick={() => setCurrentPage('california')}>California</span>
          <span>/</span>
          <span className="text-[#123e35]">Los Angeles SEO</span>
        </div>

        {/* Hero Section */}
        <div className="bg-white border border-[#dfded4] rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xs">
          {/* Subtle design accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#123e35]/5 rounded-full blur-3xl -z-1" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#bc5f40]/5 rounded-full blur-2xl -z-1" />

          <div className="space-y-6 max-w-3xl">
            <span className="px-3 py-1 text-[10px] font-black font-mono tracking-widest bg-amber-100/80 text-amber-900 border border-amber-200 uppercase rounded-md inline-block">
              Los Angeles Local SEO Leaderboard
            </span>
            <h1 className="text-3xl sm:text-5xl font-black font-display text-[#151716] tracking-tight leading-none">
              Los Angeles SEO Services & Hyper-Local Ranking Systems 🎬
            </h1>
            <p className="text-sm sm:text-base font-semibold text-[#4e524f] leading-relaxed">
              Los Angeles County is an economic titan. To cut through the high-density search landscape between Silicon Beach, the Westside, DTLA, and the Valley, national SEO playbooks fail. You require structured geographic coordinates, specific schema networks, and precise neighborhood listing node authorization.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <button
                onClick={handleGetStarted}
                className="bg-[#123e35] hover:bg-[#1a554a] active:scale-95 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-2xs"
              >
                <span>Get Free LA Strategy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <a
                href="#la-battlefield"
                className="border border-[#dfded4] hover:bg-[#dfded4]/35 text-[#151716] font-bold py-3.5 px-6 rounded-xl text-xs text-center cursor-pointer transition-colors"
              >
                View Battlefield Analysis
              </a>
            </div>
          </div>
        </div>

        {/* COMPONENT 1: Los Angeles Small Business SEO: Dominating America's Second-Largest Market */}
        <div className="bg-[#faf9f6]/75 border border-[#dfded4] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xs space-y-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black font-display text-[#151716] tracking-tight leading-none">
              Los Angeles Small Business SEO: Dominating America's Second-Largest Market
            </h2>
            <p className="text-xs sm:text-sm text-[#4e524f] font-semibold leading-relaxed">
              With 296,746 small businesses across LA County generating massive economic impact, your business needs strategic local SEO to capture attention in the world's entertainment capital.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
            
            {/* Left Column: LA Metro Small Business Dominance (Chart Visual representation) */}
            <div className="lg:col-span-6 flex items-center">
              <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-5 w-full">
                <div className="space-y-1">
                  <h4 className="text-sm font-black font-display text-[#151716] uppercase tracking-wide">
                    LA Metro Small Business Dominance
                  </h4>
                  <p className="text-[10px] font-bold text-[#bc5f40] uppercase tracking-wider font-mono">
                    LA: America's Most Diverse Small Business Ecosystem
                  </p>
                </div>

                {/* Vertical styling & metric progress bars */}
                <div className="space-y-4 pt-2">
                  {[
                    { metric: 'Annual Revenue', count: '$487B', width: '100%', active: true, desc: 'Total economic output of LA county small businesses' },
                    { metric: 'Metro Population', count: '13.2M', width: '75%', active: false, desc: 'Estimated consumers in Greater Los Angeles Area' },
                    { metric: 'Small Businesses', count: '297k', width: '58%', active: false, desc: 'Registered small businesses operating inside LA County' },
                    { metric: 'Digital Opportunity', count: '89k', width: '38%', active: false, desc: 'Enterprises currently missing professional SEO' },
                    { metric: 'Entertainment Biz', count: '68k', width: '22%', active: false, desc: 'Creative, agency, and media sector enterprises' }
                  ].map((bar, idx) => (
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
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Key Statistics List */}
            <div className="lg:col-span-6 space-y-4 flex flex-col justify-center bg-white border border-[#dfded4] p-6 rounded-2xl">
              <h3 className="text-xs font-black font-display text-[#151716] uppercase tracking-wider pb-2 border-b border-[#dfded4]/40 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#bc5f40]" />
                LA Economic Power Statistics
              </h3>
              <ul className="space-y-3">
                {[
                  "296,746 small businesses fuel LA's $487 billion economy",
                  "30.2 businesses per 1,000 residents (above US average)",
                  "13.2 million people in greater LA metropolitan area",
                  "$85.7 e-commerce market opportunity annually",
                  "89,024 LA businesses still lack professional SEO optimization",
                  "Entertainment sector: 67,892 creative businesses seeking visibility",
                  "Professional services: 89,234 high-value service providers",
                  "Retail/hospitality: 124,567 businesses serving tourists and locals",
                  "Manufacturing: 45,789 companies requiring B2B lead generation",
                  "Healthcare: 78,456 practices needing patient acquisition"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2.5 text-xs font-semibold text-[#4e524f] leading-normal font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#123e35] shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* COMPONENT 2: Beat Your LA Competition: The Local SEO Battlefield Analysis */}
        <div id="la-battlefield" className="bg-[#faf9f6] border border-[#dfded4] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xs space-y-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black font-display text-[#151716] tracking-tight leading-none">
              Beat Your LA Competition: The Local SEO Battlefield Analysis
            </h2>
            <p className="text-xs sm:text-sm text-[#4e524f] font-semibold leading-relaxed">
              In Los Angeles, you're not just competing locally—you're up against some of the most sophisticated marketing operations in the world. Here's how to win.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Card 1: Your LA Competition Reality */}
            <div className="bg-white border border-[#dfded4] p-6 sm:p-8 rounded-2xl shadow-2xs space-y-5">
              <h3 className="text-sm font-black font-display text-[#151716] uppercase tracking-wider border-b border-[#dfded4]/60 pb-2.5 flex items-center justify-between">
                <span>Your LA Competition Reality</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#bc5f40] animate-pulse"></span>
              </h3>
              <ul className="space-y-4">
                {[
                  "296,746 businesses fighting for local search visibility",
                  "Hollywood marketing agencies setting high SEO standards",
                  "Tech companies from Silicon Beach raising the bar",
                  "National chains with unlimited marketing budgets",
                  "78% of LA consumers research online before purchasing",
                  "Average 43 competitors per local search query"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-xs font-semibold text-[#4e524f] leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-[#bc5f40] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 2: Your LA Competitive Advantages */}
            <div className="bg-white border border-[#dfded4] p-6 sm:p-8 rounded-2xl shadow-2xs space-y-5">
              <h3 className="text-sm font-black font-display text-[#151716] uppercase tracking-wider border-b border-[#dfded4]/60 pb-2.5 flex items-center justify-between">
                <span>Your LA Competitive Advantages</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#123e35] animate-pulse"></span>
              </h3>
              <ul className="space-y-4">
                {[
                  "89,024 businesses still lack professional SEO optimization",
                  "Local LA knowledge beats generic national strategies",
                  "Neighborhood specialization creates defensible market positions",
                  "Entertainment industry connections provide unique opportunities",
                  "Hispanic market (48% of population) underserved by many competitors",
                  "Tourism seasonality creates predictable traffic spikes"
                ].map((item, index) => (
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
              <span className="group-hover:underline">Outrank LA Competition Now</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Directory Scan widget integration */}
        <div className="space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black font-display text-[#151716]">
              Scan Your Los Angeles Citation Alignment
            </h2>
            <p className="text-xs text-[#4e524f] font-semibold">
              Evaluate how your brand coordinates are broadcasted to index bots compared to the reigning LA 3-Pack leaders.
            </p>
          </div>
          <LocalDirectoryTool onOpenOnboarding={handleGetStarted} />
        </div>

        {/* Neighborhood Level Targeting Matrix */}
        <div className="bg-white border border-[#dfded4] rounded-3xl p-6 sm:p-10 space-y-8 shadow-xs">
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-[#151716] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#bc5f40]" />
              Los Angeles Neighborhood Nodes We Target
            </h2>
            <p className="text-xs sm:text-sm text-[#4e524f] font-semibold mt-1">
              LA is not a single metropolitan grid—it is an archipelago of distinctive neighborhoods. We build coordinate clusters for each.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'westside', label: 'Santa Monica & Venice', focus: 'Tech / Silicon Beach', tag: 'High Competition' },
              { id: 'dtla', label: 'Downtown LA (DTLA)', focus: 'Corporate / Finance', tag: 'Densely Formatted' },
              { id: 'valley', label: 'San Fernando Valley', focus: 'Local Home Trades', tag: 'High Search Volume' },
              { id: 'hollywood', label: 'Hollywood & Beverly Hills', focus: 'Boutiques / Hospitality', tag: 'Creative Nodes' }
            ].map(col => (
              <div key={col.id} className="border border-[#dfded4] bg-[#faf9f6]/40 p-4.5 rounded-2xl space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="bg-[#bc5f40]/10 text-[#bc5f40] px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-wider w-fit block">{col.tag}</span>
                  <h4 className="text-xs font-black font-display text-[#151716]">{col.label}</h4>
                  <p className="text-[10px] font-semibold text-[#4e524f]">Optimizing local authority grids geared primarily around {col.focus}.</p>
                </div>
                <div className="text-[9px] font-mono text-[#123e35] font-bold">Schema Status: Verified ✓</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical Domination Plan */}
        <div className="bg-[#123e35] text-white rounded-3xl p-8 sm:p-12 space-y-6">
          <span className="px-2.5 py-1 text-[9px] font-bold font-mono tracking-wider bg-white/10 border border-white/20 uppercase rounded-md text-white">
            Specialized LA Blueprint
          </span>
          <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight leading-none">
            Our 3-Step Los Angeles SEO Playbook
          </h3>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-semibold max-w-2xl">
            Google weights spatial distance heavily in LA due to traffic constraints. We set up neighborhood boundaries using custom semantic schema markers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2 bg-white/5 p-5 rounded-2xl border border-white/10">
              <div className="text-base font-black text-amber-300 font-mono">01 /</div>
              <h4 className="font-bold text-sm">Coordinate Pinpointing</h4>
              <p className="text-[11px] text-gray-300 font-semibold leading-normal">
                Avoid generic city definitions. We align absolute coordinates with actual traffic signals to register maximum localized map pack proximity.
              </p>
            </div>

            <div className="space-y-2 bg-white/5 p-5 rounded-2xl border border-white/10">
              <div className="text-base font-black text-amber-300 font-mono">02 /</div>
              <h4 className="font-bold text-sm">Valley & Westside Schemas</h4>
              <p className="text-[11px] text-gray-300 font-semibold leading-normal">
                Segmented LocalBusiness arrays declare specific service delivery parameters, bypassing generic search boundaries safely.
              </p>
            </div>

            <div className="space-y-2 bg-white/5 p-5 rounded-2xl border border-white/10">
              <div className="text-base font-black text-amber-300 font-mono">03 /</div>
              <h4 className="font-bold text-sm">Creative Industry Schema</h4>
              <p className="text-[11px] text-gray-300 font-semibold leading-normal">
                Deep structured markup matching the entertainment and agency networks to cement regional relevance thresholds.
              </p>
            </div>
          </div>
        </div>

        {/* Strategic Call to Action Banner */}
        <div className="bg-amber-50 border border-amber-300/60 rounded-3xl p-8 text-center space-y-5">
          <h3 className="text-xl sm:text-2xl font-black font-display text-amber-950">
            Outrank Your Los Angeles Competition Instantly
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-amber-800/95 max-w-2xl mx-auto leading-relaxed">
            Ready to claim the Local 3-Pack? Request your free LA citation alignment scan and a customized competitor analysis prepared directly by our core engine.
          </p>
          <div className="pt-2">
            <button
              onClick={handleGetStarted}
              className="bg-[#123e35] hover:bg-[#185246] text-white font-extrabold py-3.5 px-8 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all inline-flex items-center gap-2 shadow-xs"
            >
              <span>Request Free Action Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
