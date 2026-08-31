import React from 'react';
import { Page } from '../types';
import { BLOG_POSTS } from '../data/blogData';
import { STATE_DIRECTORY, CITY_DIRECTORY } from '../data/directoryData';
import { STATES_REGISTRY, DISTRICTS_REGISTRY } from '../data/locationsData';
import { 
  Rocket, MapPin, Globe, Star, Mail, Briefcase, FileCode, CheckSquare, 
  Sparkles, ExternalLink, ShieldAlert, ArrowRight, ShieldCheck, ListCollapse, Compass
} from 'lucide-react';

interface SitemapViewProps {
  setCurrentPage: (page: Page) => void;
  onNavigateToArticle: (slug: string | null) => void;
  setActiveStateSlug?: (slug: string | null) => void;
  setActiveCitySlug?: (slug: string | null) => void;
  setActiveDemoSlug?: (slug: string | null) => void;
}

export default function SitemapView({ 
  setCurrentPage, 
  onNavigateToArticle,
  setActiveStateSlug,
  setActiveCitySlug,
  setActiveDemoSlug
}: SitemapViewProps) {
  
  const handleNavPage = (e: React.MouseEvent, pageName: Page, path: string) => {
    e.preventDefault();
    onNavigateToArticle(null);
    setCurrentPage(pageName);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavBlog = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    onNavigateToArticle(slug);
    setCurrentPage('blog');
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/blog/${slug}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavState = (e: React.MouseEvent, slug: string, path: string) => {
    e.preventDefault();
    if (setActiveStateSlug) setActiveStateSlug(slug);
    if (setActiveCitySlug) setActiveCitySlug(null);
    setCurrentPage('state-seo' as any);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavCity = (e: React.MouseEvent, stateSlug: string, citySlug: string, path: string) => {
    e.preventDefault();
    if (setActiveStateSlug) setActiveStateSlug(stateSlug);
    if (setActiveCitySlug) setActiveCitySlug(citySlug);
    setCurrentPage('city-seo' as any);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavLocationState = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    if (setActiveStateSlug) setActiveStateSlug(slug);
    if (setActiveCitySlug) setActiveCitySlug(null);
    setCurrentPage('locations-state' as any);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/locations/${slug}/`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavLocationDistrict = (e: React.MouseEvent, stateSlug: string, distSlug: string) => {
    e.preventDefault();
    if (setActiveStateSlug) setActiveStateSlug(stateSlug);
    if (setActiveCitySlug) setActiveCitySlug(distSlug);
    setCurrentPage('locations-district' as any);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/locations/${stateSlug}/${distSlug}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Group pages by context
  const mainPages = [
    { id: 'home' as Page, path: '/', label: 'Home Page Dashboard', desc: 'Next-Generation Local SEO Suite and core strategy features.' },
    { id: 'about' as Page, path: '/about', label: 'Our Mission & About Us', desc: 'Understanding our background, local verification systems, and team standards.' },
    { id: 'why-us' as Page, path: '/why-us', label: 'Why Choose Local Surge', desc: 'Comparison metrics proving how lightweight structures defeat bloated multi-page payloads.' },
    { id: 'local-seo' as Page, path: '/local-seo', label: 'Local SEO Optimization', desc: 'Comprehensive blueprint detailing Google Business Profile setup, NAP citation audits, and directories synchronization.' },
    { id: 'case-studies' as Page, path: '/case-studies', label: 'Case Studies & Results', desc: 'Proven organic surges and map pack success stories detailing problem, strategy, and metrics.' },
    { id: 'pricing' as Page, path: '/pricing', label: 'Transparent Pricing Model', desc: 'Detailed options regarding Single-Page Blast, Starter Boost, and Premium Surge.' },
    { id: 'seo-tool' as Page, path: '/seo-tool', label: 'Free Search Signal Scanner', desc: 'Real-time analysis comparing websites to regional Local 3-Pack leaders.' },
    { id: 'contact' as Page, path: '/contact', label: 'Partner Collaboration Desk', desc: 'Direct outreach for customized regional configurations and local directories.' },
    { id: 'locations-index' as Page, path: '/locations', label: 'U.S. Locations & Consumer Behavior Studies', desc: 'Interactive maps, consumer search indices, and municipal ranking playbooks.' },
    { id: 'privacy-policy' as Page, path: '/privacy-policy', label: 'Privacy Policy', desc: 'Statutory compliance, CCPA/CPRA, PIPEDA alignment, and data protection.' },
    { id: 'terms-of-service' as Page, path: '/terms-of-service', label: 'Terms of Service', desc: 'Governing billing guidelines, cancel-anytime terms, and service agreements.' }
  ];

  const demoPages = [
    { path: '/demo/contractor-surge', label: 'Contractor Surge Blueprint', desc: 'Interactive demo for HVAC, roofers, and plumbing trade contractors.' },
    { path: '/demo/dental-surge', label: 'Dental Clinic Local Surge', desc: 'Interactive local 3-pack demo for dental practices and medical clinics.' },
    { path: '/demo/legal-surge', label: 'Legal Practice Surge', desc: 'High-intent client acquisition demo for law firms and regional attorneys.' }
  ];

  const packages = [
    { id: 'single-page', label: 'Single-Page Blast (Free)', desc: 'Professional mobile-first single page optimized instantly for local keywords.' },
    { id: 'starter', label: 'Starter Boost ($999/mo)', desc: 'GBP syncing, localized keyword mapping (10 terms), and citation listings.' },
    { id: 'premium', label: 'Premium Surge ($1999/mo)', desc: 'Content strategies, high-authority backlinking, and weekly coord calls.' }
  ];

  const categories = Array.from(new Set(BLOG_POSTS.map(post => post.category)));

  // Research Locations data
  const locationStates = Object.values(STATES_REGISTRY);
  const locationDistricts = Object.values(DISTRICTS_REGISTRY);

  return (
    <div id="visual-sitemap-page" className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-[#f7f6f2]">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Banner Intro */}
        <div className="text-center space-y-3.5 max-w-2xl mx-auto">
          <span className="px-2.5 py-1 text-[10px] font-bold font-mono tracking-widest bg-[#123e35]/10 text-[#123e35] border border-[#123e35]/20 uppercase rounded">
            Crawl Directory Listing
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-[#151716] tracking-tight leading-none">
            XML & HTML Sitemap 🗂️
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[#4e524f] leading-relaxed">
            This sitemap catalogs all active routes, research studies, packages, and dynamically tagged blog articles on <span className="font-bold text-[#123e35]">localsurgeseo.com</span>. Designed to guarantee frictionless user accessibility and seamless indexation by search engine spiders.
          </p>
        </div>

        {/* Informational crawlers alert */}
        <div className="p-4 bg-white border border-[#dfded4] rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-xs font-semibold text-[#4e524f] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#bc5f40]/10 flex items-center justify-center text-[#bc5f40] shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[#1a1c1a] font-bold">SEO Crawler & Backlink Friendly Structure</p>
            <p className="text-[11px] leading-relaxed text-[#5c605d]">
              Our static index structure is built on clear, canonical links with semantic HTML anchors. Path definitions are synchronized with single-session pushStates for premium Core Web Vital scoring.
            </p>
          </div>
        </div>

        {/* Sitemap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          
          {/* Main Pages section */}
          <div className="space-y-4 bg-white p-6 rounded-3xl border border-[#dfded4] shadow-xs">
            <h3 className="text-sm font-bold text-[#bc5f40] font-mono uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#dfded4]">
              <Rocket className="w-4 h-4 text-[#bc5f40]" />
              Core Website Routes (Path Index)
            </h3>
            
            <div className="space-y-3">
              {mainPages.map((page) => (
                <a 
                  key={page.id}
                  href={page.path}
                  onClick={(e) => handleNavPage(e, page.id, page.path)}
                  className="group cursor-pointer p-3 rounded-xl hover:bg-[#faf9f6] transition-all space-y-1 block focus-visible:outline-2 focus-visible:outline-[#123e35]"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-[#151716] group-hover:text-[#bc5f40] transition-colors">
                      {page.label}
                    </span>
                    <span className="text-[10px] font-mono text-[#123e35] uppercase font-bold tracking-wider">
                      {page.path}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4e524f] font-semibold leading-relaxed">
                    {page.desc}
                  </p>
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {/* Interactive Showcase Demos */}
            <div className="space-y-4 bg-white p-6 rounded-3xl border border-[#dfded4] shadow-xs">
              <h3 className="text-sm font-bold text-[#123e35] font-mono uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#dfded4]">
                <Sparkles className="w-4 h-4 text-[#bc5f40]" />
                Industry Showcase Demos
              </h3>
              
              <div className="space-y-3">
                {demoPages.map((demo) => (
                  <a 
                    key={demo.path}
                    href={demo.path}
                    onClick={(e) => {
                      e.preventDefault();
                      const slug = demo.path.replace('/demo/', '');
                      if (setActiveDemoSlug) setActiveDemoSlug(slug);
                      setCurrentPage('demo');
                      if (typeof window !== 'undefined') {
                        window.history.pushState({}, '', demo.path);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="p-3 rounded-xl hover:bg-[#faf9f6]/95 border border-transparent hover:border-[#dfded4] transition-all cursor-pointer block focus-visible:outline-2 focus-visible:outline-[#123e35]"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-[#1a1c1a] block">{demo.label}</span>
                      <span className="text-[10px] font-mono text-[#123e35] font-bold">{demo.path}</span>
                    </div>
                    <p className="text-[11px] text-[#4e524f] font-semibold mt-1 leading-relaxed">
                      {demo.desc}
                    </p>
                  </a>
                ))}
              </div>
            </div>

            {/* Packages Section */}
            <div className="space-y-4 bg-white p-6 rounded-3xl border border-[#dfded4] shadow-xs">
              <h3 className="text-sm font-bold text-[#123e35] font-mono uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#dfded4]">
                <Briefcase className="w-4 h-4 text-[#123e35]" />
                Solutions & Pricing Plans
              </h3>
              
              <div className="space-y-3">
                {packages.map((pkg) => (
                  <a 
                    key={pkg.id}
                    href="/pricing"
                    onClick={(e) => handleNavPage(e, 'pricing', '/pricing')}
                    className="p-3 rounded-xl hover:bg-[#faf9f6]/95 border border-transparent hover:border-[#dfded4] transition-all cursor-pointer block focus-visible:outline-2 focus-visible:outline-[#123e35]"
                  >
                    <span className="text-xs font-black text-[#1a1c1a] block">{pkg.label}</span>
                    <p className="text-[11px] text-[#4e524f] font-semibold mt-1 leading-relaxed">
                      {pkg.desc}
                    </p>
                  </a>
                ))}
              </div>
            </div>

            {/* Dynamic Blog Channels */}
            <div className="space-y-4 bg-white p-6 rounded-3xl border border-[#dfded4] shadow-xs">
              <h3 className="text-sm font-bold text-[#123e35] font-mono uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#dfded4]">
                <ListCollapse className="w-4 h-4 text-[#bc5f40]" />
                Dynamic Blog Categories
              </h3>
              <p className="text-[11px] text-[#4e524f] font-semibold leading-relaxed px-1">
                Explore our editorial guides and algorithmic breakdowns by topic area:
              </p>
              
              <div className="flex flex-wrap gap-2 pt-2.5 px-1">
                <a 
                  href="/blog"
                  onClick={(e) => handleNavPage(e, 'blog', '/blog')}
                  className="px-2.5 py-1.5 bg-[#faf9f6] hover:bg-[#dfded4]/40 text-[10px] font-mono text-[#bc5f40] font-black uppercase rounded border border-[#dfded4] cursor-pointer inline-block"
                >
                  All Channels (/blog)
                </a>
                {categories.map((cat) => (
                  <a 
                    key={cat}
                    href="/blog"
                    onClick={(e) => handleNavPage(e, 'blog', '/blog')}
                    className="px-2.5 py-1.5 bg-[#faf9f6] hover:bg-[#dfded4]/40 text-[10px] font-mono text-[#123e35] font-bold uppercase rounded border border-[#dfded4] cursor-pointer inline-block"
                  >
                    {cat}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Blog Articles Link Tree */}
          <div className="lg:col-span-2 space-y-4 bg-white p-6 rounded-3xl border border-[#dfded4] shadow-xs">
            <h3 className="text-sm font-bold text-[#151716] font-display uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#dfded4]">
              <FileCode className="w-4 h-4 text-[#bc5f40]" />
              Blog Articles URL Index ({BLOG_POSTS.length} Comprehensive Guides)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BLOG_POSTS.map((post) => (
                <a 
                  id={`sitemap-article-${post.slug}`}
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  onClick={(e) => handleNavBlog(e, post.slug)}
                  className="p-3.5 rounded-2xl hover:bg-[#faf9f6]/95 border border-[#dfded4]/40 hover:border-[#dfded4] transition-all cursor-pointer space-y-1 block h-fit text-left group focus-visible:outline-2 focus-visible:outline-[#123e35]"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-1.5 py-0.5 text-[8px] font-black uppercase font-mono tracking-widest bg-[#bc5f40]/10 text-[#bc5f40] rounded">
                      {post.category}
                    </span>
                    <span className="text-[9px] text-[#888b88] font-semibold">{post.date}</span>
                  </div>
                  <h4 className="text-xs font-black text-[#151716] leading-snug group-hover:text-[#bc5f40] transition-colors mt-1">
                    {post.title}
                  </h4>
                  <span className="text-[9px] font-mono text-[#123e35] block pt-1 group-hover:underline truncate">
                    /blog/{post.slug}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Research Locations Directory (locationsData.ts) */}
          <div className="lg:col-span-2 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#dfded4] shadow-xs">
            <div className="border-b border-[#dfded4] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#123e35]" />
                <h3 className="text-sm font-bold text-[#151716] font-display uppercase tracking-wider">
                  U.S. Consumer Behavior Studies & District Research Hubs
                </h3>
              </div>
              <a
                href="/locations"
                onClick={(e) => handleNavPage(e, 'locations-index', '/locations')}
                className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#bc5f40] hover:underline"
              >
                Explore National Index (/locations) ➔
              </a>
            </div>

            <p className="text-xs text-[#4e524f] font-semibold leading-relaxed">
              Empirical market studies quantifying local search friction, mobile utilization, and Google Map Pack click distributions across key commercial corridors:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {locationStates.map((state) => {
                const stateDistricts = locationDistricts.filter(d => d.stateSlug === state.slug);
                return (
                  <div key={state.slug} className="space-y-3.5 bg-[#faf9f6]/75 border border-[#dfded4]/70 p-4.5 rounded-2xl">
                    <div className="flex items-center justify-between border-b border-[#dfded4]/40 pb-2">
                      <a 
                        href={`/locations/${state.slug}/`}
                        onClick={(e) => handleNavLocationState(e, state.slug)}
                        className="text-xs font-black text-[#123e35] hover:text-[#bc5f40] hover:underline transition-colors flex items-center gap-1 font-display"
                      >
                        <span>{state.name} ({state.code})</span>
                        <ArrowRight className="w-2.5 h-2.5 inline text-[#bc5f40]" />
                      </a>
                      <span className="text-[9px] font-mono font-bold text-[#888b88]">{state.consumerWebSearchRate} Web Share</span>
                    </div>

                    <ul className="space-y-1.5 font-sans">
                      {stateDistricts.map((dist) => (
                        <li key={dist.slug}>
                          <a 
                            href={`/locations/${dist.stateSlug}/${dist.slug}`}
                            onClick={(e) => handleNavLocationDistrict(e, dist.stateSlug, dist.slug)}
                            className="text-[11px] font-semibold text-[#4e524f] hover:text-[#bc5f40] transition-colors flex items-center justify-between group w-full text-left"
                          >
                            <span className="truncate group-hover:underline">{dist.name}</span>
                            <span className="text-[9px] font-mono text-[#123e35]/65 group-hover:text-[#bc5f40] select-none">➔</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regional Directories (City & State Pages from directoryData.ts) */}
          <div className="lg:col-span-2 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#dfded4] shadow-xs">
            <div className="border-b border-[#dfded4] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-sm font-bold text-[#151716] font-display uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#123e35]" />
                Regional City Landing Directories
              </h3>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md w-fit">
                Localized Query Landings
              </span>
            </div>
            
            <p className="text-xs text-[#4e524f] font-semibold leading-relaxed">
              Targeted regional landing channels designed to capture high-intent geographic queries across California, Texas, Florida, Arizona, New York, and Canadian metro corridors:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
              {(() => {
                const citiesByState: Record<string, { name: string; slug: string; stateSlug: string }[]> = {};
                Object.values(CITY_DIRECTORY).forEach((city) => {
                  if (!citiesByState[city.stateSlug]) {
                    citiesByState[city.stateSlug] = [];
                  }
                  citiesByState[city.stateSlug].push({
                    name: city.name,
                    slug: city.slug,
                    stateSlug: city.stateSlug
                  });
                });

                const dynamicRegions = [
                  {
                    state: 'California',
                    code: 'CA',
                    slug: 'california',
                    path: '/california',
                    cities: citiesByState['california'] || []
                  },
                  ...Object.values(STATE_DIRECTORY).map((s) => ({
                    state: s.name,
                    code: s.code,
                    slug: s.slug,
                    path: `/${s.slug}`,
                    cities: citiesByState[s.slug] || []
                  }))
                ];

                return dynamicRegions.map((item) => (
                  <div key={item.state} className="space-y-3.5 bg-[#faf9f6]/65 border border-[#dfded4]/70 p-4.5 rounded-2xl">
                    <div className="flex items-center justify-between border-b border-[#dfded4]/40 pb-2">
                      <a 
                        href={item.path}
                        onClick={(e) => {
                          if (item.slug === 'california') {
                            handleNavPage(e, 'california', '/california');
                          } else {
                            handleNavState(e, item.slug, item.path);
                          }
                        }}
                        className="text-xs font-black text-[#123e35] hover:text-[#bc5f40] hover:underline transition-colors flex items-center gap-1 font-display"
                      >
                        <span>{item.state} ({item.code})</span>
                        <ArrowRight className="w-2.5 h-2.5 inline text-[#bc5f40]" />
                      </a>
                    </div>

                    <ul className="space-y-1.5 font-sans">
                      {item.cities.map((city) => {
                        const cityPath = city.slug === 'los-angeles-seo' 
                          ? '/los-angeles-seo' 
                          : `/${item.slug}/${city.slug}`;
                        return (
                          <li key={city.name}>
                            <a 
                              href={cityPath}
                              onClick={(e) => {
                                if (city.slug === 'los-angeles-seo') {
                                  handleNavPage(e, 'los-angeles-seo', '/los-angeles-seo');
                                } else {
                                  handleNavCity(e, item.slug, city.slug, cityPath);
                                }
                              }}
                              className="text-[11px] font-semibold text-[#4e524f] hover:text-[#bc5f40] transition-colors flex items-center justify-between group w-full text-left"
                            >
                              <span className="truncate group-hover:underline">{city.name}</span>
                              <span className="text-[9px] font-mono text-[#123e35]/65 group-hover:text-[#bc5f40] select-none">➔</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ));
              })()}
            </div>
          </div>

        </div>

        {/* Footer Support indicator */}
        <div className="text-center text-[10px] text-[#888b88] font-mono font-semibold">
          Sitemap compiled automatically. Local Surge Core Engine v1.0.0 • 88 Validated Routes
        </div>

      </div>
    </div>
  );
}
