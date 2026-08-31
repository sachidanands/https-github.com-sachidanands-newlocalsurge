import React, { useState, useMemo } from 'react';
import { Page } from '../types';
import { 
  Rocket, MapPin, Globe, Star, Mail, CheckCircle, ShieldCheck, 
  ArrowRight, Landmark, Zap, Compass, Users, TrendingUp, HelpCircle,
  AlertCircle, BarChart3, ExternalLink, ChevronRight, Search, X
} from 'lucide-react';
import InteractiveLocationsMap from './InteractiveLocationsMap';
import { getAllMappedStates, getAllMappedDistricts, DISTRICTS_REGISTRY } from '../data/locationsData';

interface LocationsIndexViewProps {
  setCurrentPage: (page: Page) => void;
  onOpenOnboarding: () => void;
  onGetFreeStrategy: () => void;
  onNavigateToLocation: (path: string) => void;
}

export default function LocationsIndexView({
  setCurrentPage,
  onOpenOnboarding,
  onGetFreeStrategy,
  onNavigateToLocation
}: LocationsIndexViewProps) {
  const states = getAllMappedStates();
  const districts = getAllMappedDistricts();
  const [selectedStateSlug, setSelectedStateSlug] = useState<string | null>('california');
  const [searchQuery, setSearchQuery] = useState('');
  const selectedState = selectedStateSlug ? states.find(s => s.slug === selectedStateSlug) : null;

  // Filtered districts matching search query
  const matchingDistricts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return districts.filter(d => 
      d.name.toLowerCase().includes(q) ||
      d.stateName.toLowerCase().includes(q) ||
      d.stateCode.toLowerCase().includes(q) ||
      d.municipalCities.some(c => c.toLowerCase().includes(q))
    );
  }, [districts, searchQuery]);

  // Filtered states matching search query
  const matchingStates = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return states.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q)
    );
  }, [states, searchQuery]);

  // Structured Data (Schema.org) for Directory Index & FAQ
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://localsurgeseo.com/'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Locations & Market Research',
            'item': 'https://localsurgeseo.com/locations'
          }
        ]
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How does Local Surge analyze local consumer search behavior?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'We aggregate empirical data from the U.S. Census Bureau, Small Business Administration (SBA), and local Google Map Pack query volumes to measure how local consumers discover and select neighborhood service providers.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Why is district-level SEO critical for small business owners?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Over 84% of local service searches occur on mobile devices within a narrow geographic radius. Winning the Google Local 3-Pack requires localized citations, coordinate anchoring, and structured schema markup rather than generic nationwide campaigns.'
            }
          }
        ]
      }
    ]
  };

  return (
    <main id="main-content" className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#f7f6f2]">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Breadcrumb Navigation (ADA Compliant) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold font-mono text-[#4e524f] uppercase tracking-wider">
          <button 
            type="button" 
            className="hover:text-[#bc5f40] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#123e35]" 
            onClick={() => setCurrentPage('home')}
          >
            Home
          </button>
          <span aria-hidden="true" className="text-[#8c918d]">/</span>
          <span className="text-[#123e35]" aria-current="page">Locations Directory</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-white border border-[#dfded4] rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xs">
          <div className="space-y-5 max-w-3xl">
            <span className="px-3.5 py-1 text-[10px] font-black font-mono tracking-widest bg-amber-100/90 text-amber-900 border border-amber-200 uppercase rounded-md inline-block">
              U.S. National Local Search Index
            </span>
            <h1 className="text-3xl sm:text-5xl font-black font-display text-[#151716] tracking-tight leading-tight">
              United States Local Search Markets & Consumer Behavior Studies 🗺️
            </h1>
            <p className="text-sm sm:text-base font-semibold text-[#4e524f] leading-relaxed">
              Explore hyper-local market intelligence across the United States. Click on any mapped district or state pin to examine empirical consumer search habits, web adoption percentages, and the strategic SEO playbooks required to dominate Google Maps.
            </p>
            
            <div className="flex flex-wrap gap-3.5 pt-2">
              <button
                type="button"
                onClick={onGetFreeStrategy}
                className="bg-[#123e35] hover:bg-[#195246] active:scale-95 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#123e35]"
              >
                <span>Get Free Market Strategy</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <a
                href="#mapped-districts"
                className="border border-[#dfded4] hover:bg-[#f7f6f2] text-[#151716] font-bold py-3.5 px-6 rounded-xl text-xs flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-[#123e35]"
              >
                Browse All Districts ({districts.length})
              </a>
            </div>
          </div>
        </div>

        {/* FULL WIDTH INTERACTIVE MAP */}
        <section aria-label="United States Locations Interactive Map">
          <div className="space-y-3 mb-4">
            <h2 className="text-xl sm:text-2xl font-black font-display text-[#151716]">
              Interactive Contiguous U.S. Market Map
            </h2>
            <p className="text-xs text-[#4e524f] font-semibold">
              Map view is clamped to district level (no street zoom) for clean representational research. Pins indicate published local market studies.
            </p>
          </div>

          <InteractiveLocationsMap
            currentLevel="national"
            onNavigateToLocation={onNavigateToLocation}
          />
        </section>

        {/* National Macro Benchmarks */}
        <section aria-labelledby="benchmarks-heading" className="space-y-6">
          <h2 id="benchmarks-heading" className="text-xl sm:text-2xl font-black font-display text-[#151716]">
            National Consumer Local Search Benchmarks
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-2">
              <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider">Web Utilization</span>
              <div className="text-3xl sm:text-4xl font-black font-display text-[#123e35]">87%</div>
              <p className="text-xs text-[#4e524f] font-semibold">
                Of consumers utilize search engines to discover and vet local service providers before reaching out.
              </p>
            </div>

            <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-2">
              <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider">Mobile Share</span>
              <div className="text-3xl sm:text-4xl font-black font-display text-[#123e35]">84%</div>
              <p className="text-xs text-[#4e524f] font-semibold">
                Of high-intent local commercial inquiries originate on mobile smartphones with "near me" proximity.
              </p>
            </div>

            <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-2">
              <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider">Map Pack Concentration</span>
              <div className="text-3xl sm:text-4xl font-black font-display text-[#123e35]">76%</div>
              <p className="text-xs text-[#4e524f] font-semibold">
                Of all clicks on local service searches concentrate directly on the top 3 Google Maps listings.
              </p>
            </div>

            <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-2">
              <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider">Digital Opportunity</span>
              <div className="text-3xl sm:text-4xl font-black font-display text-[#bc5f40]">62%</div>
              <p className="text-xs text-[#4e524f] font-semibold">
                Of registered small businesses still have unclaimed, incomplete, or duplicate directory citations.
              </p>
            </div>
          </div>
        </section>

        {/* Scalable State & District Directory Explorer */}
        <section aria-labelledby="directory-index-heading" className="bg-white border border-[#dfded4] rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider">
              Scalable Search Directory
            </span>
            <h2 id="directory-index-heading" className="text-xl sm:text-2xl font-black font-display text-[#151716]">
              Browse Search Markets by State & District
            </h2>
            <p className="text-xs text-[#4e524f] font-semibold">
              Search by city, district, or state name, or select any state below to view its active district studies.
            </p>
          </div>

          {/* Instant Search Bar */}
          <div className="relative max-w-lg">
            <Search className="w-4 h-4 text-[#8c918d] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city (e.g. Austin, Miami, San Jose, Dallas)..."
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#dfded4] bg-[#fcfbf9] text-xs font-semibold text-[#151716] placeholder:text-[#8c918d] focus:outline-none focus:ring-2 focus:ring-[#123e35] focus:bg-white transition-all shadow-2xs"
              aria-label="Filter locations by state, district, or city"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8c918d] hover:text-[#151716] transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Instant Search Results when user is typing */}
          {searchQuery.trim() && (
            <div className="bg-[#faf9f6] border border-[#dfded4] rounded-2xl p-5 space-y-3 animate-in fade-in duration-150">
              <div className="flex justify-between items-center pb-2 border-b border-[#dfded4]">
                <span className="text-xs font-bold text-[#151716]">
                  Matching Search Results ({matchingDistricts.length + matchingStates.length})
                </span>
                <span className="text-[10px] font-mono text-[#bc5f40]">
                  Press Esc or clear to reset
                </span>
              </div>

              {matchingDistricts.length === 0 && matchingStates.length === 0 ? (
                <p className="text-xs text-[#8c918d] py-3 text-center font-medium">
                  No location studies matched "{searchQuery}". Try searching for a major state or metro area.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {matchingDistricts.map((dist) => (
                    <a
                      key={`search-${dist.slug}`}
                      href={`/locations/${dist.stateSlug}/${dist.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigateToLocation(`/locations/${dist.stateSlug}/${dist.slug}`);
                      }}
                      className="bg-white border border-[#dfded4] hover:border-[#123e35] p-3 rounded-xl flex items-center justify-between text-xs font-bold text-[#151716] group transition-all shadow-2xs hover:shadow-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="group-hover:text-[#123e35] transition-colors block">
                          {dist.name}, {dist.stateCode}
                        </span>
                        <span className="block text-[10px] font-mono text-[#bc5f40]">
                          District Study ({dist.webUtilizationRate} Web)
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8c918d] group-hover:text-[#123e35]" aria-hidden="true" />
                    </a>
                  ))}
                  {matchingStates.map((st) => (
                    <a
                      key={`search-st-${st.slug}`}
                      href={`/locations/${st.slug}/`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigateToLocation(`/locations/${st.slug}/`);
                      }}
                      className="bg-white border border-[#dfded4] hover:border-[#bc5f40] p-3 rounded-xl flex items-center justify-between text-xs font-bold text-[#151716] group transition-all shadow-2xs hover:shadow-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="group-hover:text-[#bc5f40] transition-colors block">
                          {st.name} Statewide Guide
                        </span>
                        <span className="block text-[10px] font-mono text-[#123e35]">
                          Statewide SEO Blueprint →
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8c918d] group-hover:text-[#bc5f40]" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Clean Clickable State Names */}
          <div className="flex flex-wrap gap-2.5" role="tablist" aria-label="States directory">
            {states.map((state) => {
              const hasDistricts = state.districts && state.districts.length > 0;
              const isSelected = selectedStateSlug === state.slug;

              return (
                <button
                  key={state.slug}
                  type="button"
                  onClick={() => {
                    if (hasDistricts) {
                      setSelectedStateSlug(isSelected ? null : state.slug);
                    } else {
                      onNavigateToLocation(`/locations/${state.slug}/`);
                    }
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border focus-visible:outline-2 focus-visible:outline-[#123e35] ${
                    isSelected
                      ? 'bg-[#123e35] text-white border-[#123e35] shadow-xs'
                      : 'bg-[#fcfbf9] hover:bg-[#f7f6f2] text-[#151716] border-[#dfded4] hover:border-[#123e35]'
                  }`}
                  aria-expanded={hasDistricts ? isSelected : undefined}
                >
                  <span>{state.name}</span>
                  {hasDistricts ? (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#dfded4]/70 text-[#4e524f]'
                    }`}>
                      {state.districts.length} {state.districts.length === 1 ? 'district' : 'districts'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[#bc5f40]">
                      State Guide →
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Expanded District Studies Sub-List */}
          {selectedState && (
            <div className="bg-[#faf9f6] border border-[#dfded4] rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#dfded4] pb-3">
                <div>
                  <h3 className="text-sm font-black font-display text-[#151716]">
                    Active Districts in {selectedState.name} ({selectedState.districts.length})
                  </h3>
                  <p className="text-[11px] text-[#4e524f]">
                    Click any district study below for empirical search data, customer behavior trends, and local business roadmaps.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToLocation(`/locations/${selectedState.slug}/`)}
                  className="text-xs font-bold text-[#bc5f40] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Complete {selectedState.name} Statewide Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {selectedState.districts.map((distSlug) => {
                  const dist = DISTRICTS_REGISTRY[distSlug];
                  if (!dist) return null;
                  return (
                    <a
                      key={dist.slug}
                      href={`/locations/${dist.stateSlug}/${dist.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigateToLocation(`/locations/${dist.stateSlug}/${dist.slug}`);
                      }}
                      className="bg-white border border-[#dfded4] hover:border-[#123e35] p-3.5 rounded-xl flex items-center justify-between text-xs font-bold text-[#151716] group transition-all shadow-2xs hover:shadow-xs focus-visible:outline-2 focus-visible:outline-[#123e35]"
                    >
                      <div className="space-y-0.5">
                        <span className="group-hover:text-[#123e35] transition-colors">{dist.name} District Study</span>
                        <span className="block text-[10px] font-mono text-[#bc5f40]">{dist.webUtilizationRate} Web Utilization</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8c918d] group-hover:text-[#123e35] transition-colors" aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Ask a Question FAQ Section */}
        <section aria-labelledby="faq-heading" className="bg-white border border-[#dfded4] rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider">
              Knowledge Base & Schema
            </span>
            <h2 id="faq-heading" className="text-2xl font-black font-display text-[#151716]">
              Frequently Asked Questions: Local Search Behavior & Directory SEO
            </h2>
          </div>

          <div className="divide-y divide-[#dfded4] space-y-4 pt-2">
            <div className="pt-4 space-y-2">
              <h3 className="text-sm font-bold text-[#151716]">
                How does Local Surge analyze local customer behavior across U.S. districts?
              </h3>
              <p className="text-xs text-[#4e524f] leading-relaxed">
                We combine authoritative data from the U.S. Small Business Administration (SBA), U.S. Census Bureau, and empirical local search studies. We measure consumer search habits, smartphone usage rates, and the conversion impact of ranking in the top 3 positions of the Google Map Pack.
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <h3 className="text-sm font-bold text-[#151716]">
                Why can't I zoom into individual houses or streets on the map?
              </h3>
              <p className="text-xs text-[#4e524f] leading-relaxed">
                Our interactive map is clamped to district level (zoom 11) for representational market analysis. It is designed to highlight regional consumer behavior and market opportunities rather than street-level consumer tracking.
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <h3 className="text-sm font-bold text-[#151716]">
                How can my business add our district to this study?
              </h3>
              <p className="text-xs text-[#4e524f] leading-relaxed">
                Our data research team regularly evaluates growing metropolitan areas. You can request a custom market audit to analyze your regional search volume and establish your local ranking roadmap.
              </p>
            </div>
          </div>
        </section>

        {/* Free Strategy CTA */}
        <div className="bg-[#123e35] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-md">
          <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight">
            Ready to Dominate Your Local District Search Pack?
          </h2>
          <p className="text-xs sm:text-sm text-[#dfded4] max-w-2xl mx-auto leading-relaxed">
            Stop losing qualified local customers to competitors down the street. Claim your free Local Surge SEO audit and market gap analysis today.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="bg-[#bc5f40] hover:bg-[#cf6d4e] active:scale-95 text-white font-extrabold py-4 px-8 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md focus-visible:outline-2 focus-visible:outline-white"
            >
              Get Your Free Strategy & Audit Now
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
