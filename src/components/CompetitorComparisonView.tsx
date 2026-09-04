import React, { useState } from 'react';
import { Page, CompetitorComparison } from '../types';
import { getComparisonBySlug, getAllComparisons } from '../data/competitorData';
import SchemaMarkup from './SchemaMarkup';
import { 
  ArrowRight, ShieldCheck, Check, X, AlertTriangle, Scale, Clock, 
  Sparkles, CheckCircle2, XCircle, HelpCircle, ChevronDown, ChevronUp,
  Layers, ExternalLink, Zap, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CompetitorComparisonViewProps {
  comparisonSlug: string;
  setCurrentPage: (page: Page) => void;
  setActiveCompareSlug: (slug: string) => void;
  onOpenOnboarding: () => void;
}

export default function CompetitorComparisonView({
  comparisonSlug,
  setCurrentPage,
  setActiveCompareSlug,
  onOpenOnboarding
}: CompetitorComparisonViewProps) {
  const comparison = getComparisonBySlug(comparisonSlug);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!comparison) {
    return (
      <div className="min-h-screen py-24 px-4 bg-[#f7f6f2] text-center space-y-6">
        <h1 className="text-2xl font-bold text-[#151716]">Comparison Not Found</h1>
        <p className="text-sm text-[#5c605d]">The comparison page you requested could not be located.</p>
        <button
          onClick={() => {
            setCurrentPage('compare-index');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/compare');
          }}
          className="px-6 py-2.5 rounded-xl bg-[#123e35] text-white text-xs font-bold hover:bg-[#185246] transition-colors cursor-pointer"
        >
          Return to Comparisons Hub
        </button>
      </div>
    );
  }

  // Schema generation
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Local Surge ${comparison.localSurgeProfile.planName}`,
    "description": comparison.metaDescription,
    "brand": {
      "@type": "Brand",
      "name": "Local Surge"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "0",
      "highPrice": "1999",
      "offerCount": "3"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "128",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": comparison.faqs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://localsurgeseo.com/" },
      { "@type": "ListItem", "position": 2, "name": "Comparisons", "item": "https://localsurgeseo.com/compare" },
      { "@type": "ListItem", "position": 3, "name": `${comparison.competitorName} vs Local Surge`, "item": `https://localsurgeseo.com/compare/${comparison.slug}` }
    ]
  };

  const handleCtaClick = () => {
    if (comparison.cta.buttonAction === 'onboarding') {
      onOpenOnboarding();
    } else if (comparison.cta.buttonAction === 'seo-tool') {
      setCurrentPage('seo-tool');
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/seo-tool');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setCurrentPage('pricing');
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/pricing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const relatedComparisons = getAllComparisons().filter(c => c.slug !== comparison.slug).slice(0, 3);

  return (
    <article id={`comparison-${comparison.slug}`} className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-[#f7f6f2]">
      <SchemaMarkup customSchema={productSchema} />
      <SchemaMarkup customSchema={faqSchema} />
      <SchemaMarkup customSchema={breadcrumbSchema} />

      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Dynamic Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[10px] font-bold font-mono text-[#4e524f] uppercase tracking-wider">
          <button 
            type="button" 
            className="hover:text-[#bc5f40] cursor-pointer focus:outline-none focus-visible:underline" 
            onClick={() => { setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            Home
          </button>
          <span aria-hidden="true">/</span>
          <button 
            type="button" 
            className="hover:text-[#bc5f40] cursor-pointer focus:outline-none focus-visible:underline" 
            onClick={() => { 
              setCurrentPage('compare-index'); 
              if (typeof window !== 'undefined') window.history.pushState({}, '', '/compare');
              window.scrollTo({ top: 0, behavior: 'smooth' }); 
            }}
          >
            Comparisons
          </button>
          <span aria-hidden="true">/</span>
          <span className="text-[#123e35]" aria-current="page">{comparison.competitorName} vs Local Surge</span>
        </nav>

        {/* Hero Header */}
        <header className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#123e35]/10 text-[#123e35] text-xs font-bold font-mono tracking-wider uppercase border border-[#123e35]/20">
              {comparison.badge}
            </span>
            <span className="px-3 py-1 rounded-full bg-white text-[#5c605d] text-xs font-mono font-semibold border border-[#dfded4] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#bc5f40]" aria-hidden="true" />
              <span>Verified {comparison.lastUpdated}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display text-[#151716] tracking-tight leading-tight">
            {comparison.h1}
          </h1>

          <p className="text-sm sm:text-base font-semibold text-[#4e524f] leading-relaxed">
            {comparison.subtitle}
          </p>
        </header>

        {/* Executive Verdict Box */}
        <section aria-labelledby="verdict-heading" className="p-6 sm:p-8 bg-white rounded-3xl border border-[#dfded4] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#123e35]">
            <Award className="w-5 h-5 text-[#bc5f40]" aria-hidden="true" />
            <h2 id="verdict-heading" className="text-base sm:text-lg font-black font-display text-[#151716] tracking-tight">
              Executive Summary & Verdict
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#4e524f] leading-relaxed font-medium">
            {comparison.verdict}
          </p>
          <div className="pt-2 flex flex-wrap gap-4 border-t border-[#dfded4] text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-[#5c605d]">
              <span className="text-[#151716] font-bold">Target Niche:</span> {comparison.categoryLabel}
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-[#5c605d]">
              <span className="text-[#151716] font-bold">Target Intent:</span> {comparison.targetKeyword}
            </div>
          </div>
        </section>

        {/* Side-by-Side Competitor Cards */}
        <section aria-labelledby="profiles-heading" className="space-y-6">
          <h2 id="profiles-heading" className="text-2xl font-black font-display text-[#151716] text-center">
            Side-by-Side Platform Profiles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Competitor Profile */}
            <div className="bg-white rounded-3xl border border-[#dfded4] p-6 sm:p-8 space-y-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#888b88] tracking-widest">
                      Competitor
                    </span>
                    <h3 className="text-2xl font-black font-display text-[#151716]">
                      {comparison.competitorProfile.name}
                    </h3>
                  </div>
                  <span className="p-2 rounded-xl bg-[#faf9f6] border border-[#dfded4] text-xs font-mono font-bold text-[#5c605d]">
                    {comparison.competitorProfile.pricingSummary.split('or')[0]}
                  </span>
                </div>

                <div className="p-3.5 bg-[#faf9f6] rounded-2xl border border-[#e6e4dc] text-xs text-[#5c605d] leading-relaxed">
                  <strong className="text-[#151716]">Best For: </strong>
                  {comparison.competitorProfile.bestFor}
                </div>

                {/* Pros */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold font-mono tracking-wider text-[#123e35] uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Strengths</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-[#4e524f]">
                    {comparison.competitorProfile.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold font-mono tracking-wider text-[#bc5f40] uppercase flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-[#bc5f40]" />
                    <span>Limitations & Drawbacks</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-[#4e524f]">
                    {comparison.competitorProfile.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <X className="w-3.5 h-3.5 text-[#bc5f40] shrink-0 mt-0.5" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Local Surge Profile */}
            <div className="bg-[#123e35] text-white rounded-3xl border-2 border-[#123e35] p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#bc5f40]/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-4 z-10">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#bc5f40] tracking-widest">
                      Local Surge Solution
                    </span>
                    <h3 className="text-2xl font-black font-display text-[#faf9f6]">
                      {comparison.localSurgeProfile.planName}
                    </h3>
                  </div>
                  <span className="p-2 rounded-xl bg-white/10 border border-white/20 text-xs font-mono font-bold text-[#fbfaf8]">
                    {comparison.localSurgeProfile.price}
                  </span>
                </div>

                <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 text-xs text-[#dfded4] leading-relaxed">
                  <strong className="text-white">Best For: </strong>
                  {comparison.localSurgeProfile.bestFor}
                </div>

                {/* Pros */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold font-mono tracking-wider text-[#bc5f40] uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#bc5f40]" />
                    <span>Local Surge Advantages</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-[#dfded4]">
                    {comparison.localSurgeProfile.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#bc5f40] shrink-0 mt-0.5" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Scope */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-slate-300" />
                    <span>Scope & Specialization</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-[#dfded4]">
                    {comparison.localSurgeProfile.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-slate-300">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-white/20 z-10">
                <button
                  onClick={handleCtaClick}
                  className="w-full py-3 px-4 rounded-xl bg-[#bc5f40] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#a85235] transition-colors shadow-md cursor-pointer"
                >
                  <span>{comparison.cta.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Feature Matrix Table */}
        <section aria-labelledby="matrix-heading" className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-[#bc5f40] uppercase">
              Granular Breakdown
            </span>
            <h2 id="matrix-heading" className="text-2xl sm:text-3xl font-black font-display text-[#151716]">
              Feature-by-Feature Comparison Matrix
            </h2>
          </div>

          <div className="bg-white rounded-3xl border border-[#dfded4] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#123e35] text-white">
                    <th scope="col" className="py-4 px-4 sm:px-6 font-bold font-display w-2/5">
                      Feature & Evaluation Criteria
                    </th>
                    <th scope="col" className="py-4 px-4 sm:px-6 font-bold font-display w-1/4 text-center bg-[#185246]">
                      Local Surge
                    </th>
                    <th scope="col" className="py-4 px-4 sm:px-6 font-bold font-display w-1/4 text-center">
                      {comparison.competitorName}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6e4dc]">
                  {comparison.featureMatrix.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#faf9f6]/70 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-bold text-[#151716]">{row.feature}</div>
                        <div className="text-[11px] text-[#888b88] mt-0.5">{row.note}</div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-center font-bold text-[#123e35] bg-[#123e35]/5">
                        {typeof row.localSurge === 'boolean' ? (
                          row.localSurge ? <Check className="w-5 h-5 text-emerald-600 mx-auto" /> : <X className="w-5 h-5 text-rose-500 mx-auto" />
                        ) : (
                          <span>{row.localSurge}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-center font-semibold text-[#5c605d]">
                        {typeof row.competitor === 'boolean' ? (
                          row.competitor ? <Check className="w-5 h-5 text-emerald-600 mx-auto" /> : <X className="w-5 h-5 text-rose-500 mx-auto" />
                        ) : (
                          <span>{row.competitor}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Detailed Narrative Sections */}
        <section aria-labelledby="deep-dive-heading" className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-[#bc5f40] uppercase">
              Deep-Dive Analysis
            </span>
            <h2 id="deep-dive-heading" className="text-2xl sm:text-3xl font-black font-display text-[#151716]">
              Critical Technical & Commercial Differences
            </h2>
          </div>

          <div className="space-y-6">
            {comparison.detailedSections.map((sec, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-[#dfded4] p-6 sm:p-8 space-y-4 shadow-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#123e35] tracking-widest">
                    Pillar #{idx + 1}: {sec.subtitle}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black font-display text-[#151716]">
                    {sec.title}
                  </h3>
                </div>
                
                <p className="text-xs sm:text-sm text-[#4e524f] leading-relaxed">
                  {sec.content}
                </p>

                <div className="p-4 rounded-2xl bg-[#faf9f6] border-l-4 border-[#123e35] text-xs text-[#151716] font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#bc5f40] shrink-0" />
                  <span><strong>Key Takeaway: </strong>{sec.keyTakeaway}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive FAQ Accordion */}
        <section aria-labelledby="faq-heading" className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-[#bc5f40] uppercase">
              Common Inquiries
            </span>
            <h2 id="faq-heading" className="text-2xl sm:text-3xl font-black font-display text-[#151716]">
              Frequently Asked Questions: {comparison.competitorName} vs. Local Surge
            </h2>
          </div>

          <div className="space-y-3">
            {comparison.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-[#dfded4] overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex justify-between items-center gap-4 font-bold text-xs sm:text-sm text-[#151716] hover:bg-[#faf9f6] transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#123e35] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#888b88] shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-5 pt-0 text-xs sm:text-sm text-[#4e524f] leading-relaxed border-t border-[#dfded4]/50">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* High-Converting Bottom CTA Card */}
        <section className="p-8 sm:p-12 rounded-3xl bg-[#123e35] text-white relative overflow-hidden flex flex-col items-center text-center space-y-6 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#bc5f40]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3 max-w-2xl z-10">
            <span className="text-xs font-mono font-bold tracking-widest text-[#bc5f40] uppercase">
              Get Started with Local Surge
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-[#faf9f6]">
              {comparison.cta.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#dfded4] font-medium leading-relaxed">
              {comparison.cta.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 z-10 w-full sm:w-auto">
            <button
              onClick={handleCtaClick}
              className="py-3.5 px-8 rounded-xl bg-[#bc5f40] text-white text-xs font-bold hover:bg-[#a85235] transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{comparison.cta.buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCurrentPage('compare-index');
                if (typeof window !== 'undefined') {
                  window.history.pushState({}, '', '/compare');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="py-3.5 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/20 cursor-pointer"
            >
              Explore Other Comparisons
            </button>
          </div>
        </section>

        {/* Related Comparisons Grid */}
        <section aria-labelledby="related-heading" className="space-y-6 pt-6">
          <h2 id="related-heading" className="text-xl font-black font-display text-[#151716] text-center">
            Compare Other Platforms
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedComparisons.map((rel) => (
              <button
                key={rel.slug}
                onClick={() => {
                  setActiveCompareSlug(rel.slug);
                  if (typeof window !== 'undefined') {
                    window.history.pushState({}, '', `/compare/${rel.slug}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="p-5 rounded-2xl bg-white border border-[#dfded4] hover:border-[#123e35] hover:shadow-md transition-all text-left space-y-2 group cursor-pointer"
              >
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#123e35] bg-[#123e35]/10 px-2 py-0.5 rounded">
                  {rel.badge}
                </span>
                <h3 className="text-sm font-bold text-[#151716] group-hover:text-[#123e35] transition-colors">
                  {rel.competitorName} vs. Local Surge
                </h3>
                <p className="text-[11px] text-[#5c605d] line-clamp-2">
                  {rel.subtitle}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Legal & Trademark Disclaimer */}
        <footer className="p-6 bg-white/70 border border-[#dfded4] rounded-2xl text-[10px] text-[#888b88] leading-relaxed space-y-2">
          <p>
            <strong>Disclaimer:</strong> {comparison.competitorName} is a trademark of its respective owner. Local Surge is not affiliated with, endorsed by, or sponsored by {comparison.competitorName}.
          </p>
          <p>
            Data and pricing comparisons are compiled from publicly available websites, documentation, and user feedback as of {comparison.lastUpdated}. Information is provided for educational and comparative purposes under U.S. FTC Comparative Advertising Guidelines and Nominative Fair Use doctrine.
          </p>
        </footer>

      </div>
    </article>
  );
}
