import React from 'react';
import { Page } from '../types';
import { 
  Rocket, MapPin, Globe, Star, Mail, CheckCircle, ShieldCheck, 
  ArrowRight, Landmark, Zap, Compass, Users, TrendingUp, HelpCircle,
  AlertCircle, BarChart3
} from 'lucide-react';
import { motion } from 'motion/react';
import LocalDirectoryTool from './LocalDirectoryTool';

interface CaliforniaViewProps {
  setCurrentPage: (page: Page) => void;
  onOpenOnboarding: () => void;
  onGetFreeStrategy: () => void;
  setActiveStateSlug?: (slug: string | null) => void;
  setActiveCitySlug?: (slug: string | null) => void;
}

export default function CaliforniaView({ 
  setCurrentPage, 
  onOpenOnboarding, 
  onGetFreeStrategy,
  setActiveStateSlug,
  setActiveCitySlug
}: CaliforniaViewProps) {
  
  const handleNavCity = (citySlug: string) => {
    if (setActiveStateSlug) setActiveStateSlug('california');
    if (setActiveCitySlug) setActiveCitySlug(citySlug);
    setCurrentPage('city-seo' as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleGetStarted = () => {
    onGetFreeStrategy();
  };

  return (
    <div id="california-state-seo-page" className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-[#f7f6f2]">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* State Page Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-[#4e524f] uppercase tracking-wider">
          <span className="hover:text-[#bc5f40] cursor-pointer" onClick={() => setCurrentPage('home')}>Home</span>
          <span>/</span>
          <span className="hover:text-[#bc5f40] cursor-pointer" onClick={() => setCurrentPage('site-map')}>Sitemap</span>
          <span>/</span>
          <span className="text-[#123e35]">California Directory</span>
        </div>

        {/* Hero Section */}
        <div className="bg-white border border-[#dfded4] rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xs">
          {/* Subtle design accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#123e35]/5 rounded-full blur-3xl -z-1" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#bc5f40]/5 rounded-full blur-2xl -z-1" />

          <div className="space-y-6 max-w-3xl">
            <span className="px-3 py-1 text-[10px] font-black font-mono tracking-widest bg-amber-100/80 text-amber-900 border border-amber-200 uppercase rounded-md inline-block">
              Statewide SEO Directory Index
            </span>
            <h1 className="text-3xl sm:text-5xl font-black font-display text-[#151716] tracking-tight leading-none">
              California Local SEO Services & Directory Domination 🐻
            </h1>
            <p className="text-sm sm:text-base font-semibold text-[#4e524f] leading-relaxed">
              California is the largest digital economy in the United States. To win search visibility from San Diego to the Silicon Valley, standard blanket SEO does not work. You need localized node authority, absolute NAP precision, and directory citations that signal relevance to crawler bots.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <button
                onClick={handleGetStarted}
                className="bg-[#bc5f40] hover:bg-[#cf6d4e] active:scale-95 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-2xs"
              >
                <span>Get Free Strategy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <a
                href="#ca-cities"
                className="border border-[#dfded4] hover:bg-[#dfded4]/30 text-[#151716] font-bold py-3.5 px-6 rounded-xl text-xs text-center cursor-pointer transition-colors"
              >
                Browse CA Metro Areas
              </a>
            </div>
          </div>
        </div>

        {/* Core Metrics & Market Complexity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#123e35]/15 flex items-center justify-center text-[#123e35]">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-[#151716] font-display uppercase tracking-wide">Hyper-Local Geotargeting</h3>
            <p className="text-xs text-[#4e524f] font-semibold leading-relaxed">
              California search results are heavily partitioned. A service business in Oakland will not rank in San Francisco unless regional semantic linkages are deliberately established.
            </p>
          </div>

          <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#bc5f40]/15 flex items-center justify-center text-[#bc5f40]">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-[#151716] font-display uppercase tracking-wide">High Competition Markets</h3>
            <p className="text-xs text-[#4e524f] font-semibold leading-relaxed">
              With thousands of registered contractors and agencies, local listings require flawless directory alignment (NAP) to surpass the base authority threshold.
            </p>
          </div>

          <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#123e35]/15 flex items-center justify-center text-[#123e35]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-[#151716] font-display uppercase tracking-wide">Mobile Local Pack Dominance</h3>
            <p className="text-xs text-[#4e524f] font-semibold leading-relaxed">
              Over 78% of local service queries are conducted on smartphones. We focus directly on Google Local 3-Pack alignment and native map routing APIs.
            </p>
          </div>
        </div>

        {/* SECTION 1: California Small Businesses: Your Digital Opportunity Awaits */}
        <div id="ca-opportunity" className="bg-[#faf9f6] border border-[#dfded4] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Content Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl font-black font-display text-[#151716] tracking-tight leading-tight">
                  California Small Businesses: Your Digital Opportunity Awaits
                </h2>
                <h4 className="text-sm sm:text-base font-extrabold text-[#bc5f40] font-sans">
                  Join 2.5 million California businesses already thriving online
                </h4>
              </div>
              
              <p className="text-xs sm:text-sm font-semibold text-[#4e524f] leading-relaxed font-sans">
                California's 4.2 million small businesses generate massive economic impact, but 29% still lack a proper online presence. Don't let your competitors capture customers searching for your services.
              </p>

              <div>
                <button
                  onClick={handleGetStarted}
                  className="bg-[#123e35] hover:bg-[#1a554a] active:scale-95 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-2xs w-full sm:w-auto"
                >
                  <span>Get Your Free California Business Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Cards Column */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {/* Card 1: The Digital Reality */}
              <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-sm font-black font-display text-[#151716] uppercase tracking-wider border-b border-[#dfded4]/60 pb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#123e35]"></span>
                  The Digital Reality
                </h3>
                <ul className="space-y-3">
                  {[
                    "77% of consumers use Google Maps to find local businesses",
                    "56.5% of California residents shop online regularly",
                    "81% of shopping journeys begin with online research",
                    "Mobile searches drive 76% of local business visits",
                    "$297 billion revenue generated by CA online businesses"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs font-semibold text-[#4e524f] leading-relaxed">
                      <CheckCircle className="w-4 h-4 text-[#123e35] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card 2: The Cost of Being Invisible */}
              <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-sm font-black font-display text-[#151716] uppercase tracking-wider border-b border-[#dfded4]/60 pb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#bc5f40]"></span>
                  The Cost of Being Invisible
                </h3>
                <ul className="space-y-3">
                  {[
                    "1.2 million CA businesses missing online opportunities",
                    "Local competitors capturing your potential customers",
                    "88% of consumers research businesses online before visiting",
                    "No Google presence = No credibility for modern consumers",
                    "Lost revenue averaging $50,000+ annually per business"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs font-semibold text-[#4e524f] leading-relaxed">
                      <AlertCircle className="w-4 h-4 text-[#bc5f40] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 2: California Small Business Landscape: The Numbers Tell the Story */}
        <div id="ca-landscape" className="bg-[#faf9f6]/50 border border-[#dfded4] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xs space-y-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black font-display text-[#151716] tracking-tight leading-none">
              California Small Business Landscape: The Numbers Tell the Story
            </h2>
            <p className="text-xs sm:text-sm text-[#4e524f] font-semibold leading-relaxed">
              Understanding your market is the first step to dominating it. Here's what successful California business owners know.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
            {/* Key Statistics Column */}
            <div className="lg:col-span-6 space-y-4 flex flex-col justify-center">
              <h3 className="text-sm font-black font-display text-[#151716] uppercase tracking-wider pb-1.5 border-b border-[#dfded4]/40 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#123e35]" />
                Key Statistics
              </h3>
              <ul className="space-y-3.5">
                {[
                  "4.2 million small businesses call California home",
                  "99.9% of all California businesses are small businesses",
                  "7.0 million Californians employed by small businesses",
                  "47.1% of state's workforce powered by small companies",
                  "$414 billion economic impact from diverse small businesses",
                  "2.5+ million CA businesses already selling online successfully",
                  "Professional services lead with 689,597 businesses",
                  "Transportation/warehousing: 525,288 businesses",
                  "Real estate: 400,958 businesses",
                  "Healthcare: 393,955 businesses"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-xs font-semibold text-[#4e524f]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#bc5f40]"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual Bar Chart Card Column */}
            <div className="lg:col-span-6 flex items-center">
              <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-5 w-full">
                <div className="space-y-1">
                  <h4 className="text-xs font-black font-display text-[#151716] uppercase tracking-wider">
                    California vs. Other States - Small Business Count
                  </h4>
                  <p className="text-[10px] font-bold text-[#bc5f40] uppercase tracking-wider font-mono">
                    California leads the nation in small business opportunity
                  </p>
                </div>

                {/* Horizontal Bar Chart representation */}
                <div className="space-y-4 pt-2">
                  {[
                    { state: 'California', count: '4.2M', width: '100%', active: true },
                    { state: 'Texas', count: '2.7M', width: '64.2%', active: false },
                    { state: 'Florida', count: '2.5M', width: '59.5%', active: false },
                    { state: 'New York', count: '2.1M', width: '50%', active: false },
                    { state: 'Georgia', count: '1.1M', width: '26.2%', active: false }
                  ].map((bar, idx) => (
                    <div key={idx} className="space-y-1.5 font-sans">
                      <div className="flex justify-between text-[11px] font-bold text-[#4e524f]">
                        <span className={bar.active ? 'text-[#123e35] font-extrabold font-display' : ''}>{bar.state}</span>
                        <span className="font-mono text-[10px]">{bar.count}</span>
                      </div>
                      <div className="w-full bg-[#faf9f6] h-6.5 rounded-lg overflow-hidden border border-[#dfded4]/60">
                        <div 
                          className={`h-full rounded-lg transition-all duration-500 flex items-center justify-end px-2.5 ${
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
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* California Directory Scan & Tool Embedding */}
        <div className="space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black font-display text-[#151716]">
              Scan Your California Citation Score
            </h2>
            <p className="text-xs text-[#4e524f] font-semibold">
              Input your official registered brand credentials below to evaluate where your citations stand on top directories across CA.
            </p>
          </div>
          <LocalDirectoryTool onOpenOnboarding={handleGetStarted} />
        </div>

        {/* Metropolitan Area Directory Hubs */}
        <div id="ca-cities" className="bg-white border border-[#dfded4] rounded-3xl p-6 sm:p-10 space-y-8 shadow-xs">
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-[#151716] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#bc5f40]" />
              California Key Metropolitan Hubs We Optimize
            </h2>
            <p className="text-xs sm:text-sm text-[#4e524f] font-semibold mt-1">
              Deep-dive metrics and local crawler entry points we optimize for our California partners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bay Area */}
            <div className="border border-[#dfded4] bg-[#faf9f6]/40 p-5 rounded-2xl space-y-4">
              <div className="border-b border-[#dfded4] pb-2">
                <span className="text-[10px] font-mono text-[#bc5f40] font-black uppercase tracking-wider">Region 01</span>
                <h4 className="text-sm font-extrabold text-[#151716] font-display">SF Bay Area & Silicon Valley</h4>
              </div>
              <p className="text-[11px] text-[#4e524f] font-semibold leading-relaxed">
                Includes <strong className="text-[#151716]">San Jose, Oakland, and San Francisco</strong>. Extremely dense and tech-saturated. Standard optimization fails; requires advanced JSON-LD LocalBusiness schemas and custom citation arrays.
              </p>
              <div className="space-y-1.5 pt-2">
                <div className="text-[10px] font-bold text-[#123e35] uppercase tracking-wide">Target Cities:</div>
                <div className="flex flex-wrap gap-1.5">
                  {['San Jose', 'Oakland', 'San Francisco', 'Sacramento'].map(city => {
                    const slug = city.toLowerCase().replace(/ /g, '-') + '-seo';
                    return (
                      <button 
                        key={city} 
                        onClick={() => handleNavCity(slug)}
                        className="bg-white hover:bg-[#bc5f40]/10 hover:text-[#bc5f40] border border-[#dfded4] text-[9px] font-mono font-bold px-2 py-0.5 rounded text-[#123e35] cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <span>{city} SEO</span>
                        <span className="text-[8px] text-[#bc5f40]">➔</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Southern California */}
            <div className="border border-[#dfded4] bg-[#faf9f6]/40 p-5 rounded-2xl space-y-4">
              <div className="border-b border-[#dfded4] pb-2">
                <span className="text-[10px] font-mono text-[#bc5f40] font-black uppercase tracking-wider">Region 02</span>
                <h4 className="text-sm font-extrabold text-[#151716] font-display">Greater Southern California</h4>
              </div>
              <p className="text-[11px] text-[#4e524f] font-semibold leading-relaxed">
                Includes <strong className="text-[#151716]">Los Angeles and San Diego</strong>. Characterized by high geographical sprawl. Focuses heavily on service area boundary schemas (SABP) and mapping coordinate alignments.
              </p>
              <div className="space-y-1.5 pt-2">
                <div className="text-[10px] font-bold text-[#123e35] uppercase tracking-wide">Target Cities:</div>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {['Los Angeles', 'San Diego'].map(city => {
                    const isLA = city === 'Los Angeles';
                    const slug = city.toLowerCase().replace(/ /g, '-') + '-seo';
                    return (
                      <button 
                        key={city} 
                        onClick={() => {
                          if (isLA) {
                            setCurrentPage('los-angeles-seo');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          } else {
                            handleNavCity(slug);
                          }
                        }}
                        className="bg-white hover:bg-[#bc5f40]/10 hover:text-[#bc5f40] border border-[#dfded4] text-[9px] font-mono font-bold px-2 py-0.5 rounded text-[#123e35] cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <span>{city} SEO</span>
                        <span className="text-[8px] text-[#bc5f40]">➔</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Central Valley */}
            <div className="border border-[#dfded4] bg-[#faf9f6]/40 p-5 rounded-2xl space-y-4">
              <div className="border-b border-[#dfded4] pb-2">
                <span className="text-[10px] font-mono text-[#bc5f40] font-black uppercase tracking-wider">Region 03</span>
                <h4 className="text-sm font-extrabold text-[#151716] font-display">Central Valley & Inland Cities</h4>
              </div>
              <p className="text-[11px] text-[#4e524f] font-semibold leading-relaxed">
                Includes agriculture hubs and expanding secondary metros like Fresno and Bakersfield. Local search queries here have higher intent and less legacy authority blockade—excellent for rapid top ranks.
              </p>
              <div className="space-y-1.5 pt-2">
                <div className="text-[10px] font-bold text-[#123e35] uppercase tracking-wide">Target Cities:</div>
                <div className="flex flex-wrap gap-1.5">
                  {['Sacramento', 'Fresno', 'Bakersfield', 'Stockton'].map(city => (
                    <span key={city} className="bg-white border border-[#dfded4] text-[9px] font-mono font-bold px-2 py-0.5 rounded text-[#4e524f]">
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* California SEO Blueprint Strategy & Best Practices */}
        <div className="bg-[#123e35] text-white rounded-3xl p-8 sm:p-12 space-y-6">
          <span className="px-2.5 py-1 text-[9px] font-bold font-mono tracking-wider bg-white/10 border border-white/20 uppercase rounded-md text-white">
            Domination Checklist
          </span>
          <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight leading-none">
            Our 3-Step California Local SERPs Playbook
          </h3>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-semibold max-w-2xl">
            Winning top search positions requires structured directory deployment. Our automatic pipelines and manual schemas ensure your brand parameters are perfectly understood.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2 bg-white/5 p-5 rounded-2xl border border-white/10">
              <div className="text-base font-black text-amber-300 font-mono">01 /</div>
              <h4 className="font-bold text-sm">NAP Standardization</h4>
              <p className="text-[11px] text-gray-300 font-semibold leading-normal">
                Standardize your business name, corporate address, and local dialing prefix across 50+ tier-1 networks to remove search listing duplication.
              </p>
            </div>

            <div className="space-y-2 bg-white/5 p-5 rounded-2xl border border-white/10">
              <div className="text-base font-black text-amber-300 font-mono">02 /</div>
              <h4 className="font-bold text-sm">Localized Schema Markup</h4>
              <p className="text-[11px] text-gray-300 font-semibold leading-normal">
                Implement custom JSON-LD scripts on your digital assets to declare exact latitude/longitude coordinates and market territory bounds explicitly of CA.
              </p>
            </div>

            <div className="space-y-2 bg-white/5 p-5 rounded-2xl border border-white/10">
              <div className="text-base font-black text-amber-300 font-mono">03 /</div>
              <h4 className="font-bold text-sm">GBP Spatial Auditing</h4>
              <p className="text-[11px] text-gray-300 font-semibold leading-normal">
                Align maps coordinates with actual public transit hubs, high traffic zip codes, and municipal centerpoints to increase close-proximity visibility.
              </p>
            </div>
          </div>
        </div>

        {/* Strategic Call to Action Banner */}
        <div className="bg-amber-50 border border-amber-300/60 rounded-3xl p-8 text-center space-y-5">
          <h3 className="text-xl sm:text-2xl font-black font-display text-amber-950">
            Ready to Surge Your California Google Map Pack Rankings?
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-amber-800/95 max-w-2xl mx-auto leading-relaxed">
            Let us design a custom directory domination strategy for your brand. Claim your single-page setup or request a comprehensive local competitor audit perfectly matched to California search landscapes.
          </p>
          <div className="pt-2">
            <button
              onClick={handleGetStarted}
              className="bg-[#123e35] hover:bg-[#185246] text-white font-extrabold py-3.5 px-8 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all inline-flex items-center gap-2 shadow-xs"
            >
              <span>Get Free Strategy Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
