import React, { useState, useMemo } from 'react';
import { Page, CompetitorComparison } from '../types';
import { getAllComparisons, COMPARISON_CATEGORIES } from '../data/competitorData';
import { 
  ArrowRight, ShieldCheck, Search, Scale, Sparkles, CheckCircle2, 
  XCircle, Zap, Layers, HelpCircle, ChevronRight, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CompetitorIndexViewProps {
  setCurrentPage: (page: Page) => void;
  setActiveCompareSlug: (slug: string) => void;
  onOpenOnboarding: () => void;
}

export default function CompetitorIndexView({ 
  setCurrentPage, 
  setActiveCompareSlug, 
  onOpenOnboarding 
}: CompetitorIndexViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allComparisons = useMemo(() => getAllComparisons(), []);

  const filteredComparisons = useMemo(() => {
    return allComparisons.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' || 
        item.competitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.targetKeyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allComparisons, selectedCategory, searchQuery]);

  const handleSelectComparison = (slug: string) => {
    setActiveCompareSlug(slug);
    setCurrentPage('compare-detail');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/compare/${slug}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div id="compare-index-view" className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-[#f7f6f2]">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[10px] font-bold font-mono text-[#4e524f] uppercase tracking-wider">
          <button 
            type="button" 
            className="hover:text-[#bc5f40] cursor-pointer focus:outline-none focus-visible:underline" 
            onClick={() => { setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            Home
          </button>
          <span aria-hidden="true">/</span>
          <span className="text-[#123e35]" aria-current="page">Competitor Comparisons</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#123e35]/10 text-[#123e35] text-xs font-bold font-mono tracking-wider uppercase border border-[#123e35]/20">
            <Scale className="w-3.5 h-3.5 text-[#123e35]" aria-hidden="true" />
            <span>2026 US Market Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display text-[#151716] tracking-tight leading-tight">
            Objective Local SEO & Website Builder Comparisons
          </h1>
          <p className="text-sm sm:text-base font-semibold text-[#4e524f] leading-relaxed">
            Data-backed, transparent comparisons between DIY website builders, listing sync dashboards, legacy high-overhead digital agencies, and Local Surge’s performance-engineered local search solutions.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#dfded4] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#888b88] absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search competitors (Wix, Yext, WebFX...)"
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#dfded4] bg-[#faf9f6] text-[#151716] focus:outline-none focus:ring-2 focus:ring-[#123e35] focus:bg-white transition-all placeholder:text-[#888b88]"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
              {COMPARISON_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#123e35] text-white shadow-xs'
                      : 'bg-[#faf9f6] text-[#4e524f] border border-[#dfded4] hover:bg-white hover:border-[#123e35]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Comparison Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredComparisons.map((item) => (
              <motion.article
                key={item.slug}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-[#dfded4] p-6 flex flex-col justify-between hover:shadow-lg hover:border-[#123e35]/40 transition-all duration-300 group"
              >
                <div className="space-y-4">
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider uppercase bg-[#123e35]/10 text-[#123e35]">
                      {item.badge}
                    </span>
                    <span className="text-[10px] font-mono text-[#888b88]">
                      Updated {item.lastUpdated}
                    </span>
                  </div>

                  {/* Title & Target Keyword */}
                  <div>
                    <h2 className="text-lg font-black font-display text-[#151716] group-hover:text-[#123e35] transition-colors leading-snug">
                      {item.competitorName} vs. Local Surge
                    </h2>
                    <p className="text-xs font-semibold text-[#5c605d] line-clamp-2 mt-2 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Quick Comparison Highlights */}
                  <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6e4dc] space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[#5c605d]">
                      <span className="font-semibold">{item.competitorName}:</span>
                      <span className="font-mono text-[11px]">{item.competitorProfile.pricingSummary.split('or')[0]}</span>
                    </div>
                    <div className="flex justify-between items-center text-[#123e35] font-bold">
                      <span>Local Surge:</span>
                      <span className="font-mono text-[11px] text-[#bc5f40]">{item.localSurgeProfile.price}</span>
                    </div>
                  </div>

                  {/* Key Strengths Snippet */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-mono font-bold text-[#888b88] uppercase tracking-wider">
                      Key Takeaway
                    </p>
                    <p className="text-xs text-[#4e524f] line-clamp-2 leading-relaxed">
                      {item.verdict}
                    </p>
                  </div>
                </div>

                {/* Card Footer CTA */}
                <div className="pt-6 mt-4 border-t border-[#dfded4]">
                  <button
                    onClick={() => handleSelectComparison(item.slug)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#123e35] text-white text-xs font-bold flex items-center justify-center gap-2 group-hover:bg-[#185246] transition-colors shadow-xs cursor-pointer"
                  >
                    <span>Read Head-to-Head Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {filteredComparisons.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#dfded4] p-8 space-y-3">
            <HelpCircle className="w-8 h-8 text-[#888b88] mx-auto" />
            <h3 className="text-base font-bold text-[#151716]">No matching comparisons found</h3>
            <p className="text-xs text-[#5c605d]">Try changing your search keywords or resetting your category filter.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-2 text-xs font-bold text-[#123e35] underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Legal & Fairness Disclosure */}
        <div className="p-6 bg-white border border-[#dfded4] rounded-2xl text-xs text-[#5c605d] space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-[#151716] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#123e35]" aria-hidden="true" />
            <span>Fairness, Objectivity & Trademark Policy</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Our competitor comparisons are conducted according to U.S. Federal Trade Commission (FTC) Comparative Advertising Guidelines (16 C.F.R. § 14.15) and Lanham Act Nominative Fair Use principles. All competitor features, pricing, and capabilities are sourced from publicly available documentation and verified quarterly.
          </p>
          <p className="text-[10px] text-[#888b88] leading-relaxed italic border-t border-[#dfded4] pt-2">
            All product names, logos, and brands are property of their respective owners. All company, product, and service names used on this website are for identification purposes only. Use of these names, trademarks, and brands does not imply endorsement or affiliation.
          </p>
        </div>

        {/* Bottom Fast Action Banner */}
        <div className="p-8 rounded-3xl bg-[#123e35] text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left z-10">
            <span className="text-xs font-mono font-bold tracking-widest text-[#bc5f40] uppercase">
              Fast-Track Your Local Growth
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#faf9f6]">
              Ready to Win Your Neighborhood Google 3-Pack?
            </h2>
            <p className="text-xs sm:text-sm text-[#dfded4] max-w-xl font-medium">
              Skip the DIY builder bloat and high agency retainers. Launch an SEO-engineered web presence with Local Surge.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 z-10 w-full md:w-auto">
            <button
              onClick={onOpenOnboarding}
              className="py-3 px-6 rounded-xl bg-[#bc5f40] text-white text-xs font-bold hover:bg-[#a85235] transition-colors shadow-md text-center cursor-pointer whitespace-nowrap"
            >
              Claim Free Website ($0)
            </button>
            <button
              onClick={() => { setCurrentPage('seo-tool'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="py-3 px-6 rounded-xl bg-white text-[#123e35] text-xs font-bold hover:bg-[#f7f6f2] transition-colors shadow-md text-center cursor-pointer whitespace-nowrap"
            >
              Run Free Local SEO Scan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
