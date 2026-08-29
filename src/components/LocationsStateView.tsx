import React, { useState } from 'react';
import { Page } from '../types';
import { 
  Rocket, MapPin, Globe, Star, Mail, CheckCircle, ShieldCheck, 
  ArrowRight, Landmark, Zap, Compass, Users, TrendingUp, HelpCircle,
  AlertCircle, BarChart3, ExternalLink, ChevronRight, BookOpen
} from 'lucide-react';
import InteractiveLocationsMap from './InteractiveLocationsMap';
import { LocationState, getDistrictsForState, getAllMappedStates, DISTRICTS_REGISTRY } from '../data/locationsData';

interface LocationsStateViewProps {
  stateData: LocationState;
  setCurrentPage: (page: Page) => void;
  onOpenOnboarding: () => void;
  onGetFreeStrategy: () => void;
  onNavigateToLocation: (path: string) => void;
}

export default function LocationsStateView({
  stateData,
  setCurrentPage,
  onOpenOnboarding,
  onGetFreeStrategy,
  onNavigateToLocation
}: LocationsStateViewProps) {
  const districts = getDistrictsForState(stateData.slug);
  const allStates = getAllMappedStates();
  const otherStates = allStates.filter(s => s.slug !== stateData.slug);
  const [selectedOtherStateSlug, setSelectedOtherStateSlug] = useState<string | null>(null);
  const selectedOtherState = selectedOtherStateSlug ? allStates.find(s => s.slug === selectedOtherStateSlug) : null;

  // Structured Schema (FAQPage + BreadcrumbList)
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
            'name': 'Locations',
            'item': 'https://localsurgeseo.com/locations'
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': `${stateData.name} Local SEO Guide`,
            'item': `https://localsurgeseo.com/locations/${stateData.slug}/`
          }
        ]
      },
      {
        '@type': 'FAQPage',
        'mainEntity': stateData.faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
          }
        }))
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
        
        {/* Breadcrumbs (ADA WCAG AA Compliant) */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] font-bold font-mono text-[#4e524f] uppercase tracking-wider">
          <button 
            type="button" 
            className="hover:text-[#bc5f40] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#123e35]" 
            onClick={() => setCurrentPage('home')}
          >
            Home
          </button>
          <span aria-hidden="true" className="text-[#8c918d]">/</span>
          <button 
            type="button" 
            className="hover:text-[#bc5f40] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#123e35]" 
            onClick={() => onNavigateToLocation('/locations')}
          >
            Locations
          </button>
          <span aria-hidden="true" className="text-[#8c918d]">/</span>
          <span className="text-[#123e35]" aria-current="page">{stateData.name} Directory</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-white border border-[#dfded4] rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xs">
          <div className="space-y-5 max-w-3xl">
            <span className="px-3.5 py-1 text-[10px] font-black font-mono tracking-widest bg-amber-100/90 text-amber-900 border border-amber-200 uppercase rounded-md inline-block">
              {stateData.heroBadge}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black font-display text-[#151716] tracking-tight leading-tight">
              {stateData.heroHeadline}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-[#4e524f] leading-relaxed">
              {stateData.heroSubheadline}
            </p>
            
            <div className="flex flex-wrap gap-3.5 pt-2">
              <button
                type="button"
                onClick={onGetFreeStrategy}
                className="bg-[#123e35] hover:bg-[#195246] active:scale-95 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#123e35]"
              >
                <span>Get Free {stateData.name} Strategy</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <a
                href="#state-districts"
                className="border border-[#dfded4] hover:bg-[#f7f6f2] text-[#151716] font-bold py-3.5 px-6 rounded-xl text-xs flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-[#123e35]"
              >
                View Mapped Districts ({districts.length})
              </a>
            </div>
          </div>
        </div>

        {/* FULL WIDTH INTERACTIVE MAP */}
        <section aria-label={`${stateData.name} Interactive District Map`}>
          <div className="space-y-2 mb-4">
            <h2 className="text-xl sm:text-2xl font-black font-display text-[#151716]">
              {stateData.name} Regional Map & District Pins
            </h2>
            <p className="text-xs text-[#4e524f] font-semibold">
              Zoom level is clamped to district boundaries (max zoom 11) to focus on regional search density. Click any pin to open the empirical market study.
            </p>
          </div>

          <InteractiveLocationsMap
            currentLevel="state"
            selectedState={stateData}
            onNavigateToLocation={onNavigateToLocation}
          />
        </section>

        {/* State Macro Metrics */}
        <section aria-labelledby="state-metrics-heading" className="space-y-6">
          <h2 id="state-metrics-heading" className="sr-only">
            {stateData.name} Commercial Metrics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider">Small Businesses</span>
              <div className="text-3xl sm:text-4xl font-black font-display text-[#123e35]">{stateData.totalBusinesses}</div>
              <p className="text-xs text-[#4e524f] font-semibold">
                Representing {stateData.workforceShare} of the entire private state workforce.
              </p>
            </div>

            <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider">Web Search Rate</span>
              <div className="text-3xl sm:text-4xl font-black font-display text-[#123e35]">{stateData.consumerWebSearchRate}</div>
              <p className="text-xs text-[#4e524f] font-semibold">
                Of state consumers search online before buying from or calling local providers.
              </p>
            </div>

            <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider">Mobile Queries</span>
              <div className="text-3xl sm:text-4xl font-black font-display text-[#123e35]">{stateData.mobileLocalQueries}</div>
              <p className="text-xs text-[#4e524f] font-semibold">
                Of local search volume occurs on smartphones with immediate navigation intent.
              </p>
            </div>

            <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider">Economic Output</span>
              <div className="text-3xl sm:text-4xl font-black font-display text-[#bc5f40]">{stateData.economicOutput}</div>
              <p className="text-xs text-[#4e524f] font-semibold">
                Annual state economic commerce generated by small and mid-sized enterprises.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 1: Consumer Behavior Study */}
        <section aria-labelledby="behavior-study-heading" className="bg-white border border-[#dfded4] rounded-3xl p-8 sm:p-12 shadow-xs space-y-8">
          <div className="space-y-3">
            <span className="px-3 py-1 text-[10px] font-black font-mono tracking-widest bg-[#123e35]/10 text-[#123e35] rounded-md uppercase">
              Consumer Market Research
            </span>
            <h2 id="behavior-study-heading" className="text-2xl sm:text-3xl font-black font-display text-[#151716] tracking-tight">
              {stateData.consumerBehavior.title}
            </h2>
            <p className="text-sm font-semibold text-[#4e524f] leading-relaxed">
              {stateData.consumerBehavior.overview}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {/* Key Findings List */}
            <div className="space-y-4">
              <h3 className="text-sm font-black font-display text-[#151716] uppercase tracking-wider flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#123e35]" aria-hidden="true" />
                <span>Empirical Search Findings</span>
              </h3>
              <ul className="space-y-3 text-xs text-[#4e524f] font-semibold leading-relaxed">
                {stateData.consumerBehavior.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-[#fcfbf9] p-3 rounded-xl border border-[#dfded4]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#bc5f40] mt-1.5 flex-shrink-0" aria-hidden="true" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Consumer Decision Factors */}
            <div className="space-y-4">
              <h3 className="text-sm font-black font-display text-[#151716] uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#bc5f40]" aria-hidden="true" />
                <span>Key Consumer Decision Factors</span>
              </h3>
              <div className="space-y-3">
                {stateData.consumerBehavior.decisionFactors.map((df, idx) => (
                  <div key={idx} className="bg-[#fcfbf9] p-3.5 rounded-xl border border-[#dfded4] space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[#151716]">
                      <span>{df.factor}</span>
                      <span className="font-mono text-[#123e35]">{df.percentage}</span>
                    </div>
                    <p className="text-[11px] text-[#4e524f]">{df.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Local Business Owner SEO Strategy */}
        <section aria-labelledby="strategy-heading" className="bg-[#fcfbf9] border border-[#dfded4] rounded-3xl p-8 sm:p-12 shadow-xs space-y-8">
          <div className="space-y-3">
            <span className="px-3 py-1 text-[10px] font-black font-mono tracking-widest bg-amber-100 text-amber-900 border border-amber-200 rounded-md uppercase">
              Action Blueprint
            </span>
            <h2 id="strategy-heading" className="text-2xl sm:text-3xl font-black font-display text-[#151716] tracking-tight">
              {stateData.businessStrategy.title}
            </h2>
            <p className="text-sm font-semibold text-[#4e524f] leading-relaxed">
              {stateData.businessStrategy.overview}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {stateData.businessStrategy.actionSteps.map((step, idx) => (
              <div key={idx} className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-3">
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-[#123e35]/10 text-[#123e35] uppercase">
                  {step.step}
                </span>
                <h3 className="text-base font-black font-display text-[#151716]">
                  {step.title}
                </h3>
                <p className="text-xs text-[#4e524f] font-semibold leading-relaxed">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: Sourced Research Citations & Authoritative Backlinks */}
        <section aria-labelledby="citations-heading" className="bg-white border border-[#dfded4] rounded-3xl p-8 sm:p-12 shadow-xs space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Verified Primary Sources & Citations</span>
            </span>
            <h2 id="citations-heading" className="text-2xl font-black font-display text-[#151716]">
              {stateData.name} Research Data Citations & External Backlinks
            </h2>
            <p className="text-xs text-[#4e524f] font-semibold">
              All statistical findings, commercial counts, and consumer percentages on this page are corroborated by official government agencies and recognized market intelligence benchmarks.
            </p>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#dfded4] bg-[#f7f6f2]">
                  <th scope="col" className="p-3.5 font-mono font-bold text-[#151716] uppercase tracking-wider">Source Entity</th>
                  <th scope="col" className="p-3.5 font-mono font-bold text-[#151716] uppercase tracking-wider">Research Study / Publication</th>
                  <th scope="col" className="p-3.5 font-mono font-bold text-[#151716] uppercase tracking-wider">Key Corroborated Finding</th>
                  <th scope="col" className="p-3.5 font-mono font-bold text-[#151716] uppercase tracking-wider text-right">Official Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dfded4]">
                {stateData.citations.map((cite) => (
                  <tr key={cite.id} className="hover:bg-[#fcfbf9] transition-colors">
                    <td className="p-3.5 font-bold text-[#123e35]">
                      {cite.sourceName}
                    </td>
                    <td className="p-3.5 text-[#151716] font-semibold">
                      {cite.title} ({cite.publishedYear})
                    </td>
                    <td className="p-3.5 text-[#4e524f]">
                      {cite.finding}
                    </td>
                    <td className="p-3.5 text-right">
                      <a
                        href={cite.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-[#bc5f40] hover:underline focus-visible:outline-2 focus-visible:outline-[#bc5f40]"
                      >
                        <span>{cite.anchorText}</span>
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 4: Scalable District & Nationwide Directory */}
        <section id="state-districts" aria-labelledby="districts-grid-heading" className="bg-white border border-[#dfded4] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          {/* Current State Districts */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider">
                {stateData.name} Municipal Coverage
              </span>
              <h2 id="districts-grid-heading" className="text-xl sm:text-2xl font-black font-display text-[#151716]">
                Published District Studies in {stateData.name} ({districts.length})
              </h2>
              <p className="text-xs text-[#4e524f] font-semibold">
                Explore empirical local search behavior studies for specific metropolitan districts within {stateData.name}:
              </p>
            </div>

            {districts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {districts.map((dist) => (
                  <a
                    key={dist.slug}
                    href={`/locations/${dist.stateSlug}/${dist.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateToLocation(`/locations/${dist.stateSlug}/${dist.slug}`);
                    }}
                    className="bg-[#fcfbf9] border border-[#dfded4] hover:border-[#123e35] p-3.5 rounded-xl flex items-center justify-between text-xs font-bold text-[#151716] group transition-all shadow-2xs hover:shadow-xs focus-visible:outline-2 focus-visible:outline-[#123e35]"
                  >
                    <div className="space-y-0.5">
                      <span className="group-hover:text-[#123e35] transition-colors">{dist.name} District Study</span>
                      <span className="block text-[10px] font-mono text-[#bc5f40]">{dist.webUtilizationRate} Web Utilization</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8c918d] group-hover:text-[#123e35] transition-colors" aria-hidden="true" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="bg-[#faf9f6] border border-[#dfded4] p-4 rounded-xl text-xs text-[#4e524f] font-semibold">
                All empirical research and local search playbooks for {stateData.name} are currently consolidated in this statewide guide.
              </div>
            )}
          </div>

          {/* Nationwide States Switcher Directory */}
          <div className="border-t border-[#dfded4] pt-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#123e35] uppercase tracking-wider">
                Explore Other States
              </span>
              <h3 className="text-base font-black font-display text-[#151716]">
                Compare Search Markets Across Other U.S. States
              </h3>
              <p className="text-xs text-[#4e524f] font-semibold">
                Click any state below to view its active district studies or navigate directly to its statewide guide if no districts are created:
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1" role="tablist" aria-label="Other states list">
              {otherStates.map((st) => {
                const hasDistricts = st.districts && st.districts.length > 0;
                const isSelected = selectedOtherStateSlug === st.slug;

                return (
                  <button
                    key={st.slug}
                    type="button"
                    onClick={() => {
                      if (hasDistricts) {
                        setSelectedOtherStateSlug(isSelected ? null : st.slug);
                      } else {
                        onNavigateToLocation(`/locations/${st.slug}/`);
                      }
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border focus-visible:outline-2 focus-visible:outline-[#123e35] ${
                      isSelected
                        ? 'bg-[#123e35] text-white border-[#123e35] shadow-xs'
                        : 'bg-[#fcfbf9] hover:bg-[#f7f6f2] text-[#151716] border-[#dfded4] hover:border-[#123e35]'
                    }`}
                    aria-expanded={hasDistricts ? isSelected : undefined}
                  >
                    <span>{st.name}</span>
                    {hasDistricts ? (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#dfded4]/70 text-[#4e524f]'
                      }`}>
                        {st.districts.length}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#bc5f40]">→</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Expanded District Studies Sub-List for Other State */}
            {selectedOtherState && (
              <div className="bg-[#faf9f6] border border-[#dfded4] rounded-2xl p-5 space-y-3 mt-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#dfded4] pb-2.5">
                  <h4 className="text-xs font-black font-display text-[#151716]">
                    Active Districts in {selectedOtherState.name} ({selectedOtherState.districts.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => onNavigateToLocation(`/locations/${selectedOtherState.slug}/`)}
                    className="text-xs font-bold text-[#bc5f40] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Go to {selectedOtherState.name} Guide</span>
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                  {selectedOtherState.districts.map((distSlug) => {
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
                        className="bg-white border border-[#dfded4] hover:border-[#123e35] p-3 rounded-xl flex items-center justify-between text-xs font-bold text-[#151716] group transition-all shadow-2xs"
                      >
                        <span className="group-hover:text-[#123e35] transition-colors">{dist.name} District Study</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#8c918d] group-hover:text-[#123e35]" aria-hidden="true" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 5: Ask a Question FAQ (Schema Corroborated) */}
        <section aria-labelledby="state-faq-heading" className="bg-white border border-[#dfded4] rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider">
              Knowledge Base & Schema
            </span>
            <h2 id="state-faq-heading" className="text-2xl font-black font-display text-[#151716]">
              Frequently Asked Questions: {stateData.name} Local Search
            </h2>
          </div>

          <div className="divide-y divide-[#dfded4] space-y-4 pt-2">
            {stateData.faqs.map((faq, idx) => (
              <div key={idx} className="pt-4 space-y-2">
                <h3 className="text-sm font-bold text-[#151716]">
                  {faq.question}
                </h3>
                <p className="text-xs text-[#4e524f] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Free Strategy CTA */}
        <div className="bg-[#123e35] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-md">
          <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight">
            Want to Outrank Competitors Across {stateData.name}?
          </h2>
          <p className="text-xs sm:text-sm text-[#dfded4] max-w-2xl mx-auto leading-relaxed">
            Gain a complete audit of your Google Business Profile, local citation health, and neighborhood coordinate signals.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="bg-[#bc5f40] hover:bg-[#cf6d4e] active:scale-95 text-white font-extrabold py-4 px-8 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md focus-visible:outline-2 focus-visible:outline-white"
            >
              Claim Free {stateData.name} SEO Audit
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
