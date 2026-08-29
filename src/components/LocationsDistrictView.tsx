import React from 'react';
import { Page } from '../types';
import { 
  Rocket, MapPin, Globe, Star, Mail, CheckCircle, ShieldCheck, 
  ArrowRight, Landmark, Zap, Compass, Users, TrendingUp, HelpCircle,
  AlertCircle, BarChart3, ExternalLink, ChevronRight, BookOpen, Smartphone, Search
} from 'lucide-react';
import { LocationDistrict, getDistrictsForState, getStateBySlug } from '../data/locationsData';

interface LocationsDistrictViewProps {
  districtData: LocationDistrict;
  setCurrentPage: (page: Page) => void;
  onOpenOnboarding: () => void;
  onGetFreeStrategy: () => void;
  onNavigateToLocation: (path: string) => void;
}

export default function LocationsDistrictView({
  districtData,
  setCurrentPage,
  onOpenOnboarding,
  onGetFreeStrategy,
  onNavigateToLocation
}: LocationsDistrictViewProps) {
  const stateData = getStateBySlug(districtData.stateSlug);
  const sisterDistricts = getDistrictsForState(districtData.stateSlug).filter(
    d => d.slug !== districtData.slug
  );

  // Structured Data (Schema.org) for District Study & FAQ
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
            'name': `${districtData.stateName}`,
            'item': `https://localsurgeseo.com/locations/${districtData.stateSlug}/`
          },
          {
            '@type': 'ListItem',
            'position': 4,
            'name': `${districtData.name} Local SEO`,
            'item': `https://localsurgeseo.com/locations/${districtData.stateSlug}/${districtData.slug}`
          }
        ]
      },
      {
        '@type': 'FAQPage',
        'mainEntity': districtData.faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
          }
        }))
      },
      {
        '@type': 'LocalBusiness',
        'name': `Local Surge SEO - ${districtData.name} Market Services`,
        'description': districtData.heroSubheadline,
        'url': `https://localsurgeseo.com/locations/${districtData.stateSlug}/${districtData.slug}`,
        'telephone': '+1-909-707-5075',
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': districtData.lat,
          'longitude': districtData.lng
        },
        'areaServed': {
          '@type': 'AdministrativeArea',
          'name': `${districtData.name}, ${districtData.stateCode}`
        },
        'priceRange': '$$'
      }
    ]
  };

  return (
    <main id="main-content" className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#f7f6f2]">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Breadcrumb Navigation (Strict ADA WCAG AA Compliance) */}
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
          <button 
            type="button" 
            className="hover:text-[#bc5f40] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#123e35]" 
            onClick={() => onNavigateToLocation(`/locations/${districtData.stateSlug}/`)}
          >
            {districtData.stateName}
          </button>
          <span aria-hidden="true" className="text-[#8c918d]">/</span>
          <span className="text-[#123e35]" aria-current="page">{districtData.name} District SEO</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-white border border-[#dfded4] rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xs">
          <div className="space-y-5 max-w-3xl">
            <span className="px-3.5 py-1 text-[10px] font-black font-mono tracking-widest bg-amber-100/90 text-amber-900 border border-amber-200 uppercase rounded-md inline-block">
              {districtData.heroBadge}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black font-display text-[#151716] tracking-tight leading-tight">
              {districtData.heroHeadline}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-[#4e524f] leading-relaxed">
              {districtData.heroSubheadline}
            </p>
            
            <div className="flex flex-wrap gap-3.5 pt-2">
              <button
                type="button"
                onClick={onGetFreeStrategy}
                className="bg-[#123e35] hover:bg-[#195246] active:scale-95 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#123e35]"
              >
                <span>Get Free {districtData.name} Strategy</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <a
                href="#citations-section"
                className="border border-[#dfded4] hover:bg-[#f7f6f2] text-[#151716] font-bold py-3.5 px-6 rounded-xl text-xs flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-[#123e35]"
              >
                View Source Backlinks ({districtData.citations.length})
              </a>
            </div>
          </div>
        </div>

        {/* Cities & Municipal Communities in this District (Non-clickable representation) */}
        <section aria-labelledby="municipalities-heading" className="bg-white border border-[#dfded4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider">
                Geographic Coverage Perimeter
              </span>
              <h2 id="municipalities-heading" className="text-xl font-black font-display text-[#151716]">
                Municipal Cities & Communities in {districtData.name} District
              </h2>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#123e35] bg-[#123e35]/10 px-3 py-1 rounded-full border border-[#123e35]/15">
              {districtData.municipalCities.length} Contiguous Municipalities
            </span>
          </div>
          <p className="text-xs text-[#4e524f] font-semibold leading-relaxed">
            The following municipal cities, suburban hubs, and commercial zones fall directly within the {districtData.name} local service radius. Local search algorithms evaluate proximity signals across these neighboring municipalities:
          </p>
          <div className="flex flex-wrap gap-2 pt-1" aria-label={`Cities and communities within ${districtData.name}`}>
            {districtData.municipalCities.map((city, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-xl bg-[#fcfbf9] border border-[#dfded4] text-xs font-bold text-[#151716] shadow-2xs select-none"
              >
                {city}
              </span>
            ))}
          </div>
        </section>

        {/* District Key Metrics KPI Cards */}
        <section aria-labelledby="district-kpi-heading" className="space-y-6">
          <h2 id="district-kpi-heading" className="sr-only">
            {districtData.name} Consumer Search Benchmarks
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-[#bc5f40]" aria-hidden="true" />
                <span>Web Research Adoption</span>
              </span>
              <div className="text-3xl sm:text-4xl font-black font-display text-[#123e35]">{districtData.webUtilizationRate}</div>
              <p className="text-xs text-[#4e524f] font-semibold">
                Of {districtData.name} consumers research local businesses online prior to calling or booking.
              </p>
            </div>

            <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3 h-3 text-[#bc5f40]" aria-hidden="true" />
                <span>Mobile Search Share</span>
              </span>
              <div className="text-3xl sm:text-4xl font-black font-display text-[#123e35]">{districtData.mobileSearchShare}</div>
              <p className="text-xs text-[#4e524f] font-semibold">
                Of local search queries in {districtData.name} occur on smartphones with immediate navigation intent.
              </p>
            </div>

            <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#bc5f40]" aria-hidden="true" />
                <span>Map Pack Concentration</span>
              </span>
              <div className="text-3xl sm:text-4xl font-black font-display text-[#123e35]">{districtData.mapPackClickShare}</div>
              <p className="text-xs text-[#4e524f] font-semibold">
                Of high-intent clicks go strictly to the top 3 spots in the Google Local 3-Pack.
              </p>
            </div>

            <div className="bg-white border border-[#dfded4] p-6 rounded-2xl shadow-xs space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3 text-[#bc5f40]" aria-hidden="true" />
                <span>Active Enterprises</span>
              </span>
              <div className="text-3xl sm:text-4xl font-black font-display text-[#bc5f40]">{districtData.smallBusinesses}</div>
              <p className="text-xs text-[#4e524f] font-semibold">
                Operating small businesses across the {districtData.name} municipal market.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 1: Consumer Behavior & Web Utilization Empirical Study */}
        <section aria-labelledby="district-study-heading" className="bg-white border border-[#dfded4] rounded-3xl p-8 sm:p-12 shadow-xs space-y-8">
          <div className="space-y-3">
            <span className="px-3 py-1 text-[10px] font-black font-mono tracking-widest bg-[#123e35]/10 text-[#123e35] rounded-md uppercase">
              Empirical Research Study
            </span>
            <h2 id="district-study-heading" className="text-2xl sm:text-3xl font-black font-display text-[#151716] tracking-tight">
              {districtData.consumerBehavior.title}
            </h2>
            <p className="text-sm font-semibold text-[#4e524f] leading-relaxed">
              {districtData.consumerBehavior.overview}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {/* Key Findings List */}
            <div className="space-y-4">
              <h3 className="text-sm font-black font-display text-[#151716] uppercase tracking-wider flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#123e35]" aria-hidden="true" />
                <span>District Consumer Search Habits</span>
              </h3>
              <ul className="space-y-3 text-xs text-[#4e524f] font-semibold leading-relaxed">
                {districtData.consumerBehavior.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-[#fcfbf9] p-3.5 rounded-xl border border-[#dfded4]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#bc5f40] mt-1.5 flex-shrink-0" aria-hidden="true" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Consumer Decision Factors Breakdown */}
            <div className="space-y-4">
              <h3 className="text-sm font-black font-display text-[#151716] uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#bc5f40]" aria-hidden="true" />
                <span>Primary Decision & Conversion Drivers</span>
              </h3>
              <div className="space-y-3">
                {districtData.consumerBehavior.decisionFactors.map((df, idx) => (
                  <div key={idx} className="bg-[#fcfbf9] p-4 rounded-xl border border-[#dfded4] space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[#151716]">
                      <span>{df.factor}</span>
                      <span className="font-mono text-[#123e35] text-sm">{df.percentage}</span>
                    </div>
                    <p className="text-[11px] text-[#4e524f] font-medium">{df.impact}</p>
                  </div>
                ))}
              </div>

              {/* Search Friction Points */}
              <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <span className="text-[10px] font-mono font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                  <span>Key Conversion Friction Points</span>
                </span>
                <ul className="space-y-1.5 text-xs text-amber-900/90 font-medium">
                  {districtData.consumerBehavior.searchFrictionPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span aria-hidden="true">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Local Business Owner SEO Strategy */}
        <section aria-labelledby="district-strategy-heading" className="bg-[#fcfbf9] border border-[#dfded4] rounded-3xl p-8 sm:p-12 shadow-xs space-y-8">
          <div className="space-y-3">
            <span className="px-3 py-1 text-[10px] font-black font-mono tracking-widest bg-amber-100 text-amber-900 border border-amber-200 rounded-md uppercase">
              Actionable Owner Playbook
            </span>
            <h2 id="district-strategy-heading" className="text-2xl sm:text-3xl font-black font-display text-[#151716] tracking-tight">
              {districtData.businessStrategy.title}
            </h2>
            <p className="text-sm font-semibold text-[#4e524f] leading-relaxed">
              {districtData.businessStrategy.overview}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {districtData.businessStrategy.actionSteps.map((step, idx) => (
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

          {/* Neighborhood Micro-Cluster Focus (if available) */}
          {districtData.businessStrategy.neighborhoodFocus && (
            <div className="pt-4 space-y-4">
              <h3 className="text-sm font-black font-display text-[#151716] uppercase tracking-wider">
                High-Yield Micro-Neighborhood Clusters in {districtData.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {districtData.businessStrategy.neighborhoodFocus.map((hub, idx) => (
                  <div key={idx} className="bg-white border border-[#dfded4] p-4 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono font-bold text-[#bc5f40] uppercase">{hub.priority}</span>
                    <h4 className="text-xs font-bold text-[#151716]">{hub.name}</h4>
                    <p className="text-[11px] text-[#4e524f]">{hub.niche}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* SECTION 3: Sourced Research Citations & Authoritative Outbound Backlinks */}
        <section id="citations-section" aria-labelledby="district-citations-heading" className="bg-white border border-[#dfded4] rounded-3xl p-8 sm:p-12 shadow-xs space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Verified Primary Sources & Citations</span>
            </span>
            <h2 id="district-citations-heading" className="text-2xl font-black font-display text-[#151716]">
              {districtData.name} Research Data Citations & Authority Backlinks
            </h2>
            <p className="text-xs text-[#4e524f] font-semibold">
              All statistical claims, demographic metrics, and consumer search behavior indices published in this study cite official federal and industry reports:
            </p>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#dfded4] bg-[#f7f6f2]">
                  <th scope="col" className="p-3.5 font-mono font-bold text-[#151716] uppercase tracking-wider">Source Entity</th>
                  <th scope="col" className="p-3.5 font-mono font-bold text-[#151716] uppercase tracking-wider">Research Publication</th>
                  <th scope="col" className="p-3.5 font-mono font-bold text-[#151716] uppercase tracking-wider">Corroborated Metric / Finding</th>
                  <th scope="col" className="p-3.5 font-mono font-bold text-[#151716] uppercase tracking-wider text-right">External Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dfded4]">
                {districtData.citations.map((cite) => (
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

        {/* SECTION 4: Cross-linking Sister Districts and Parent State */}
        <section aria-labelledby="sister-districts-heading" className="bg-[#faf9f6] border border-[#dfded4] rounded-3xl p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 id="sister-districts-heading" className="text-xl font-black font-display text-[#151716]">
                More {districtData.stateName} District Studies
              </h2>
              <p className="text-xs text-[#4e524f] font-semibold">
                Explore nearby metropolitan markets and regional search behavior patterns.
              </p>
            </div>
            <a
              href={`/locations/${districtData.stateSlug}/`}
              onClick={(e) => {
                e.preventDefault();
                onNavigateToLocation(`/locations/${districtData.stateSlug}/`);
              }}
              className="text-xs font-bold text-[#123e35] hover:text-[#bc5f40] flex items-center gap-1 focus-visible:underline"
            >
              <span>View All {districtData.stateName} Districts</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {sisterDistricts.map(dist => (
              <a
                key={dist.slug}
                href={`/locations/${dist.stateSlug}/${dist.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateToLocation(`/locations/${dist.stateSlug}/${dist.slug}`);
                }}
                className="bg-white border border-[#dfded4] p-4 rounded-xl hover:border-[#123e35] transition-colors flex items-center justify-between group focus-visible:ring-2 focus-visible:ring-[#123e35]"
              >
                <div>
                  <span className="block font-black text-sm text-[#151716] group-hover:text-[#123e35]">
                    {dist.name}, {dist.stateCode}
                  </span>
                  <span className="block text-[10px] font-mono text-[#4e524f]">
                    {dist.webUtilizationRate} Web Utilization
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8c918d] group-hover:text-[#123e35] transition-colors" aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>

        {/* SECTION 5: Ask a Question FAQ Accordion + Schema */}
        <section aria-labelledby="district-faq-heading" className="bg-white border border-[#dfded4] rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#bc5f40] uppercase tracking-wider">
              Knowledge Base & FAQ Schema
            </span>
            <h2 id="district-faq-heading" className="text-2xl font-black font-display text-[#151716]">
              Frequently Asked Questions: {districtData.name} Local SEO
            </h2>
          </div>

          <div className="divide-y divide-[#dfded4] space-y-4 pt-2">
            {districtData.faqs.map((faq, idx) => (
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

        {/* Free Strategy CTA Banner */}
        <div className="bg-[#123e35] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-md">
          <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight">
            Dominate Your {districtData.name} Google Map Pack
          </h2>
          <p className="text-xs sm:text-sm text-[#dfded4] max-w-2xl mx-auto leading-relaxed">
            Stop losing high-value local calls to direct competitors. Let our local search team analyze your citations, schema health, and ranking gaps in {districtData.name}.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="bg-[#bc5f40] hover:bg-[#cf6d4e] active:scale-95 text-white font-extrabold py-4 px-8 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md focus-visible:outline-2 focus-visible:outline-white"
            >
              Get Free {districtData.name} Strategy Audit
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
