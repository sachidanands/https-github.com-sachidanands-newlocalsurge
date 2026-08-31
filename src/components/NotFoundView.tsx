import React, { useState } from 'react';
import { Page } from '../types';
import { 
  Rocket, Search, MapPin, BarChart3, Sparkles, Award, BookOpen, 
  ArrowLeft, Phone, Compass, ArrowRight, X, HelpCircle
} from 'lucide-react';

interface NotFoundViewProps {
  setCurrentPage: (page: Page) => void;
  onOpenOnboarding: () => void;
  onNavigateToLocation?: (path: string) => void;
}

export default function NotFoundView({
  setCurrentPage,
  onOpenOnboarding,
  onNavigateToLocation
}: NotFoundViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const popularLinks = [
    {
      title: 'Free SEO Audit Tool',
      desc: 'Scan any website for Google Local 3-Pack and citation issues.',
      icon: Sparkles,
      page: 'seo-tool' as Page,
      path: '/seo-tool',
      badge: 'Interactive Tool'
    },
    {
      title: 'Local SEO Pricing & Plans',
      desc: 'Affordable, contract-free monthly ranking packages.',
      icon: BarChart3,
      page: 'pricing' as Page,
      path: '/pricing',
      badge: 'Packages'
    },
    {
      title: 'Locations Directory',
      desc: 'Empirical consumer search studies across U.S. states & districts.',
      icon: MapPin,
      page: 'locations-index' as Page,
      path: '/locations',
      badge: '91 Markets'
    },
    {
      title: 'Client Results & Case Studies',
      desc: 'Empirical data on verified #1 Map Pack rankings and call increases.',
      icon: Award,
      page: 'case-studies' as Page,
      path: '/case-studies',
      badge: 'Case Studies'
    },
    {
      title: 'Local Marketing Insights Blog',
      desc: 'Actionable strategies for Google Maps & Generative Engine Optimization.',
      icon: BookOpen,
      page: 'blog' as Page,
      path: '/blog',
      badge: '23 Guides'
    },
    {
      title: 'Local Surge Homepage',
      desc: 'Explore our full suite of local search optimization services.',
      icon: Rocket,
      page: 'home' as Page,
      path: '/',
      badge: 'Main Hub'
    },
  ];

  const handleNav = (e: React.MouseEvent, pageId: Page, path: string) => {
    e.preventDefault();
    setCurrentPage(pageId);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase().trim();

    if (q.includes('price') || q.includes('cost') || q.includes('plan') || q.includes('package')) {
      setCurrentPage('pricing');
      window.history.pushState(null, '', '/pricing');
    } else if (q.includes('tool') || q.includes('audit') || q.includes('scan') || q.includes('check')) {
      setCurrentPage('seo-tool');
      window.history.pushState(null, '', '/seo-tool');
    } else if (q.includes('locat') || q.includes('city') || q.includes('state') || q.includes('district') || q.includes('map')) {
      setCurrentPage('locations-index');
      window.history.pushState(null, '', '/locations');
    } else if (q.includes('case') || q.includes('result') || q.includes('proof') || q.includes('review')) {
      setCurrentPage('case-studies');
      window.history.pushState(null, '', '/case-studies');
    } else if (q.includes('blog') || q.includes('guide') || q.includes('article') || q.includes('read')) {
      setCurrentPage('blog');
      window.history.pushState(null, '', '/blog');
    } else if (q.includes('contact') || q.includes('call') || q.includes('phone') || q.includes('support')) {
      setCurrentPage('contact');
      window.history.pushState(null, '', '/contact');
    } else {
      // Default to locations search
      setCurrentPage('locations-index');
      window.history.pushState(null, '', '/locations');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#f7f6f2] flex flex-col justify-center">
      <div className="max-w-4xl mx-auto w-full space-y-10">
        
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold font-mono text-[#4e524f] uppercase tracking-wider">
          <a
            href="/"
            onClick={(e) => handleNav(e, 'home', '/')}
            className="hover:text-[#bc5f40] transition-colors focus-visible:outline-2 focus-visible:outline-[#123e35]"
          >
            Home
          </a>
          <span aria-hidden="true" className="text-[#8c918d]">/</span>
          <span className="text-[#bc5f40]" aria-current="page">404 Not Found</span>
        </nav>

        {/* Hero 404 Card */}
        <div className="bg-white border border-[#dfded4] rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-sm space-y-6">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-[#bc5f40]/5 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-[#123e35]/5 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />

          {/* 404 Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#bc5f40]/10 border border-[#bc5f40]/20 text-[#bc5f40] text-xs font-mono font-bold tracking-widest uppercase">
            <Compass className="w-4 h-4" aria-hidden="true" />
            <span>Error 404 &bull; Page Not Found</span>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-5xl font-black font-display text-[#151716] tracking-tight leading-tight">
              Oops! This Page Is Off The Map 🧭
            </h1>
            <p className="text-sm sm:text-base font-semibold text-[#4e524f] leading-relaxed">
              The page you are looking for might have been moved, renamed, or is no longer mapped. Let's get you back on track to local search dominance.
            </p>
          </div>

          {/* Instant Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-lg mx-auto relative pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8c918d] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, pricing, cities, guides..."
                className="w-full pl-11 pr-24 py-3.5 rounded-2xl border border-[#dfded4] bg-[#fcfbf9] text-xs sm:text-sm font-semibold text-[#151716] placeholder:text-[#8c918d] focus:outline-none focus:ring-2 focus:ring-[#123e35] focus:bg-white transition-all shadow-xs"
                aria-label="Search Local Surge pages"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#123e35] hover:bg-[#185246] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex items-center justify-center gap-3 pt-2">
            <a
              href="/"
              onClick={(e) => handleNav(e, 'home', '/')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#123e35] text-white text-xs font-bold hover:bg-[#185246] transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Homepage</span>
            </a>
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#dfded4] text-[#151716] text-xs font-bold hover:bg-[#f7f6f2] transition-colors shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Get Free Strategy</span>
            </button>
          </div>
        </div>

        {/* Popular Destinations Grid */}
        <section aria-labelledby="popular-heading" className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 id="popular-heading" className="text-lg font-black font-display text-[#151716]">
              Popular Sections & Tools
            </h2>
            <span className="text-[10px] font-mono text-[#888b88] font-semibold">
              Verified Working Links
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {popularLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => handleNav(e, link.page, link.path)}
                  className="bg-white border border-[#dfded4] hover:border-[#123e35] p-5 rounded-2xl transition-all group shadow-2xs hover:shadow-xs flex flex-col justify-between space-y-3 cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-[#f7f6f2] group-hover:bg-[#123e35] text-[#123e35] group-hover:text-white flex items-center justify-center transition-colors">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#bc5f40] px-2 py-0.5 rounded-md bg-[#bc5f40]/5">
                        {link.badge}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#151716] group-hover:text-[#123e35] transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-[11px] text-[#4e524f] font-semibold leading-relaxed">
                      {link.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#123e35] pt-1">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Need Assistance Consultation Callout */}
        <div className="bg-[#123e35] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5 text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-black font-display">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-xs text-[#dfded4] font-medium max-w-xl leading-relaxed">
              Our local search engineers can help analyze your market or route you to the correct custom strategy roadmap.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+19097075075"
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
              <span>(909) 707-5075</span>
            </a>
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="py-2.5 px-4 rounded-xl bg-[#bc5f40] hover:bg-[#cf6d4e] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Free Strategy Brief
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
