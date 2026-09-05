import React, { useState } from 'react';
import { Page } from '../types';
import { 
  Sparkles, ArrowRight, Share2, Link2, Image, Activity, FileText, 
  MapPin, Bot, Calculator, Layers, ExternalLink, CheckCircle2, ShieldCheck, Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ToolItem {
  id: string;
  title: string;
  badge: string;
  category: 'metadata' | 'technical' | 'local' | 'ai-schema';
  categoryLabel: string;
  description: string;
  blogSlug: string;
  image?: string;
  icon: any;
  featured?: boolean;
}

interface ExploreOtherToolsProps {
  onNavigateToBlogArticle: (slug: string) => void;
}

export const SPECIALIZED_TOOLS: ToolItem[] = [
  {
    id: 'gbp-inspector',
    title: 'Google Business Profile & Map Pack Inspector',
    badge: 'Official Google Places API (New)',
    category: 'local',
    categoryLabel: 'Local & Citations',
    description: 'Audit your official Google Place ID, star ratings, review velocity, and category signals with a 5-step Local 3-Pack ranking roadmap.',
    blogSlug: 'mastering-google-business-profile-optimization',
    image: '/assets/tools/pagespeed-scanner-preview.jpg',
    icon: MapPin,
    featured: true
  },
  {
    id: 'pagespeed-scanner',
    title: 'Google PageSpeed Insights Scanner',
    badge: 'Core Web Vitals & Real CrUX Speeds',
    category: 'technical',
    categoryLabel: 'Technical & Speed',
    description: 'Run an instant Google PageSpeed Insights audit measuring mobile LCP, INP, and CLS scores with actionable server latency fixes.',
    blogSlug: 'why-google-pagespeed-insights-matters-for-local-seo',
    image: '/assets/tools/pagespeed-scanner-preview.jpg',
    icon: Gauge,
    featured: true
  },
  {
    id: 'og-scanner',
    title: 'Scan OG Tags',
    badge: 'Social & Referral Previews',
    category: 'metadata',
    categoryLabel: 'Metadata & Social',
    description: 'Audit any page for missing or broken Open Graph & Twitter Card tags, test how your link previews render in iMessage, WhatsApp & Facebook, and generate standardized code.',
    blogSlug: 'why-open-graph-meta-tags-are-essential-for-local-seo',
    image: '/assets/tools/og-scanner-preview.jpg',
    icon: Share2,
    featured: true
  },
  {
    id: 'canonical-checker',
    title: 'Canonical URL Validator',
    badge: 'Indexation & Duplicate Defense',
    category: 'technical',
    categoryLabel: 'Technical & Speed',
    description: 'Verify self-referencing canonical links, detect duplicate content penalties, and enforce HTTP/HTTPS protocol consistency across your service pages.',
    blogSlug: 'why-canonical-link-tag-checker-is-essential-for-local-seo',
    icon: Link2
  },
  {
    id: 'alt-tag-scanner',
    title: 'Image Alt Tag & A11y Scanner',
    badge: 'Image SEO & ADA Compliance',
    category: 'technical',
    categoryLabel: 'Technical & Speed',
    description: 'Scan media assets for missing alt text, optimize keyword density for Google Image searches, and satisfy WCAG 2.1 ADA accessibility standards.',
    blogSlug: 'why-image-alt-tag-accessibility-scanner-is-essential-for-local-seo',
    icon: Image
  },
  {
    id: 'cls-simulator',
    title: 'CLS & Core Web Vitals Simulator',
    badge: 'Page Speed & Layout Stability',
    category: 'technical',
    categoryLabel: 'Technical & Speed',
    description: 'Simulate visual layout jumps, banner displacement, and mobile viewport shifting before Google Core Web Vitals algorithms penalize your local rankings.',
    blogSlug: 'why-your-website-jumps-cls-guide',
    icon: Activity
  },
  {
    id: 'meta-length-tester',
    title: 'Meta Title & SERP Snippet Tester',
    badge: 'CTR & Search Snippet Width',
    category: 'metadata',
    categoryLabel: 'Metadata & Social',
    description: 'Calculate pixel widths and character boundaries for Google desktop and mobile search snippets to prevent truncated headlines and increase click-through rates.',
    blogSlug: '10-second-website-hack-why-meta-titles-matter',
    icon: FileText
  },
  {
    id: 'nap-formatter',
    title: 'Local NAP Consistency Formatter',
    badge: 'Google Map 3-Pack Sync',
    category: 'local',
    categoryLabel: 'Local & Citations',
    description: 'Standardize your business Name, Address, and Phone into exact Google Business Profile and Tier-1 directory aggregator formats to fix citation splits.',
    blogSlug: 'what-is-nap-consistency-citation-guide',
    icon: MapPin
  },
  {
    id: 'llms-generator',
    title: 'LLMs.txt & AI Search Feed Generator',
    badge: 'Generative Engine Optimization (GEO)',
    category: 'ai-schema',
    categoryLabel: 'AI & Schema',
    description: 'Generate standardized markdown feeds for ChatGPT, Perplexity, and Claude to cite your local business entities directly in generative search summaries.',
    blogSlug: 'llmstxt-blueprint-ai-sitemap-local-business',
    icon: Bot
  },
  {
    id: 'lsa-calculator',
    title: 'Google LSA Budget & ROI Calculator',
    badge: 'Google Guaranteed & Ads',
    category: 'local',
    categoryLabel: 'Local & Citations',
    description: 'Estimate monthly lead volumes, cost-per-lead, and optimal bidding across US trade categories for Google Screened and Local Services Ads.',
    blogSlug: 'what-are-google-local-service-ads-optimization',
    icon: Calculator
  },
  {
    id: 'breadcrumb-schema',
    title: 'BreadcrumbList Schema Generator',
    badge: 'Rich Snippets & Architecture',
    category: 'ai-schema',
    categoryLabel: 'AI & Schema',
    description: 'Generate copy-paste Schema.org BreadcrumbList JSON-LD to enhance your search result path hierarchy and visual breadcrumbs in Google.',
    blogSlug: 'why-breadcrumblist-json-ld-schema-is-essential-for-local-seo',
    icon: Layers
  }
];

const TOOL_CATEGORIES = [
  { id: 'all', label: 'All Tools' },
  { id: 'metadata', label: 'Metadata & Social' },
  { id: 'technical', label: 'Technical & Speed' },
  { id: 'local', label: 'Local & Citations' },
  { id: 'ai-schema', label: 'AI & Schema' }
] as const;

export default function ExploreOtherTools({ onNavigateToBlogArticle }: ExploreOtherToolsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTools = SPECIALIZED_TOOLS.filter(tool => {
    if (selectedCategory === 'all') return true;
    return tool.category === selectedCategory;
  });

  const handleToolClick = (blogSlug: string) => {
    onNavigateToBlogArticle(blogSlug);
  };

  return (
    <section id="explore-other-tools" aria-labelledby="explore-tools-heading" className="space-y-8">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#123e35]/10 text-[#123e35] text-xs font-bold font-mono tracking-wider uppercase border border-[#123e35]/20">
          <Sparkles className="w-3.5 h-3.5 text-[#bc5f40]" aria-hidden="true" />
          <span>Interactive Diagnostic Suite</span>
        </div>
        
        <h2 id="explore-tools-heading" className="text-2xl sm:text-4xl font-black font-display text-[#151716] tracking-tight">
          Explore Other Tools
        </h2>
        
        <p className="text-xs sm:text-sm font-semibold text-[#4e524f] leading-relaxed">
          Know more about our specialized audit tools and scan your website for feature-ready and SEO-ready performance. Test your open graph preview cards, Core Web Vitals, local schema, and AI citation feeds with live simulators.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {TOOL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#123e35] text-white shadow-xs'
                : 'bg-white text-[#4e524f] border border-[#dfded4] hover:bg-[#faf9f6] hover:border-[#123e35]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTools.map((tool, idx) => {
            const Icon = tool.icon;
            const isOgFeatured = tool.id === 'og-scanner';

            return (
              <motion.div
                key={tool.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                className={`bg-white rounded-3xl border ${
                  isOgFeatured 
                    ? 'border-[#123e35]/60 shadow-md ring-2 ring-[#123e35]/15 md:col-span-2 lg:col-span-3' 
                    : 'border-[#dfded4] shadow-xs hover:border-[#123e35]/40 hover:shadow-md'
                } p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 group`}
              >
                {/* Top Content */}
                <div className="space-y-4">
                  {/* Category Badge & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider uppercase bg-[#123e35]/10 text-[#123e35]">
                      {tool.badge}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-mono text-[#bc5f40] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Feature Ready</span>
                    </span>
                  </div>

                  {/* If OG Featured Tile, render side-by-side with generated image */}
                  {isOgFeatured && tool.image ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-1">
                      <div className="lg:col-span-7 space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-[#123e35] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                            <Icon className="w-5 h-5 text-[#faf9f6]" />
                          </div>
                          <div>
                            <h3 className="text-xl sm:text-2xl font-black font-display text-[#151716] group-hover:text-[#123e35] transition-colors">
                              {tool.title}
                            </h3>
                            <span className="text-[11px] font-mono text-[#888b88] font-bold">
                              1200x630p Social Preview & Card Simulator
                            </span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-[#4e524f] font-semibold leading-relaxed">
                          {tool.description}
                        </p>

                        <div className="p-3 bg-[#faf9f6] rounded-xl border border-[#e6e4dc] text-[11px] text-[#123e35] font-semibold flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#bc5f40] shrink-0" />
                          <span>Includes real-time preview renderers for iMessage, WhatsApp, Facebook &amp; Twitter / X.</span>
                        </div>
                      </div>

                      <div className="lg:col-span-5">
                        <div className="rounded-2xl overflow-hidden border border-[#dfded4] shadow-xs group-hover:shadow-md transition-shadow relative bg-[#faf9f6]">
                          <img
                            src={tool.image}
                            alt="Scan OG Tags - Open Graph Social Preview Inspector Tool"
                            className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
                            width={640}
                            height={360}
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="absolute bottom-2 right-2 bg-[#123e35]/90 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                            Live Inspector
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Standard Tile Layout */
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#123e35]/10 text-[#123e35] flex items-center justify-center shrink-0 group-hover:bg-[#123e35] group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-black font-display text-[#151716] group-hover:text-[#123e35] transition-colors leading-snug">
                            {tool.title}
                          </h3>
                          <span className="text-[10px] font-mono text-[#888b88]">
                            {tool.categoryLabel}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#4e524f] font-semibold leading-relaxed line-clamp-3">
                        {tool.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Action Button */}
                <div className="pt-6 mt-4 border-t border-[#dfded4]">
                  <button
                    onClick={() => handleToolClick(tool.blogSlug)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#123e35] text-white text-xs font-bold flex items-center justify-center gap-2 group-hover:bg-[#185246] transition-colors shadow-xs cursor-pointer"
                  >
                    <span>Launch &amp; Audit with This Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </section>
  );
}
