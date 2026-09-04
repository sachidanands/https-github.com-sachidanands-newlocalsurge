import React, { useState, useEffect, useRef } from 'react';
import { BlogPost, BLOG_POSTS, getClusterForPost, TOPIC_CLUSTERS } from '../data/blogData';

const ClientMicroToolWidget = React.lazy(() => import('./ClientMicroToolWidget'));
import { 
  ArrowLeft, Search, Sparkles, Clock, Calendar, User, ArrowRight, Check, 
  Share2, BookOpen, ExternalLink, MapPin, CheckSquare, RefreshCw, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BlogViewProps {
  initialSlug: string | null;
  onNavigateToArticle: (slug: string | null) => void;
  onOpenOnboarding: () => void;
  onNavigateToPage: (page: 'home' | 'seo-tool' | 'pricing' | 'contact' | 'site-map') => void;
}

export default function BlogView({ 
  initialSlug, 
  onNavigateToArticle, 
  onOpenOnboarding,
  onNavigateToPage
}: BlogViewProps) {
  const [activeArticle, setActiveArticle] = useState<any | null>(null);
  const [dynamicPosts, setDynamicPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState<'markdown' | 'apa' | null>(null);
  const [showAiSummarize, setShowAiSummarize] = useState(false);
  const summarizeMenuRef = useRef<HTMLDivElement>(null);

  // Close AI summarize menu on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (summarizeMenuRef.current && !summarizeMenuRef.current.contains(event.target as Node)) {
        setShowAiSummarize(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowAiSummarize(false);
      }
    };
    if (showAiSummarize) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAiSummarize]);

  // Fetch dynamic approved blog posts from backend API
  useEffect(() => {
    fetch('/api/blog/published')
      .then(res => res.ok ? res.json() : [])
      .then(data => setDynamicPosts(data))
      .catch(err => console.error('Error fetching dynamic blogs:', err));
  }, []);

  const parseBlogDate = (dateStr?: string): number => {
    if (!dateStr) return 0;
    const timestamp = Date.parse(dateStr);
    return isNaN(timestamp) ? 0 : timestamp;
  };

  const allPosts = [...dynamicPosts, ...BLOG_POSTS].sort((a, b) => parseBlogDate(b.date) - parseBlogDate(a.date));

  // Sync state with parent route slug trigger
  useEffect(() => {
    if (initialSlug) {
      const match = allPosts.find(post => post.slug === initialSlug);
      if (match) {
        setActiveArticle(match);
        // Scroll to hash anchor if present, otherwise scroll to top
        if (typeof window !== 'undefined' && window.location.hash) {
          setTimeout(() => {
            const el = document.querySelector(window.location.hash);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }, 350);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        setActiveArticle(null);
      }
    } else {
      setActiveArticle(null);
    }
  }, [initialSlug, dynamicPosts]);

  // Extract unique categories dynamically based on all posts
  const categories = ['All', ...Array.from(new Set(allPosts.map(post => post.category)))];

  // Filters posts according to active category and search matching
  const filteredPosts = allPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.sections.some((sec: any) => sec.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Featured post is the newest one
  const featuredPost = allPosts[0] || BLOG_POSTS[0];
  const listPosts = selectedCategory === 'All' && searchQuery === '' 
    ? filteredPosts.filter(p => p.slug !== featuredPost.slug)
    : filteredPosts;


  const handleShareArticle = (e: React.MouseEvent, post: BlogPost) => {
    e.stopPropagation();
    const url = `${window.location.origin}/blog/${post.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }).catch(err => {
      console.warn('Clipboard err', err);
    });
  };

  const handleArticleClick = (slug: string) => {
    onNavigateToArticle(slug);
  };

  const handleReturnToList = () => {
    onNavigateToArticle(null);
  };

  const getRelatedPosts = (currentPost: BlogPost) => {
    const clusterInfo = getClusterForPost(currentPost.slug);
    if (clusterInfo) {
      const { cluster, role } = clusterInfo;
      const targetSlugs = role === 'pillar'
        ? cluster.spokeSlugs
        : [cluster.pillarSlug, ...cluster.spokeSlugs.filter(s => s !== currentPost.slug)];
      
      const clusterPosts = targetSlugs
        .map(slug => allPosts.find(p => p.slug === slug))
        .filter((p): p is BlogPost => !!p);
      
      if (clusterPosts.length > 0) return clusterPosts.slice(0, 4);
    }

    return allPosts.filter(
      p => p.slug !== currentPost.slug && (p.category === currentPost.category)
    ).slice(0, 4);
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(text)) !== null) {
      const precedingText = text.substring(lastIndex, match.index);
      if (precedingText) {
        parts.push(precedingText);
      }

      const linkLabel = match[1];
      const linkUrl = match[2];

      if (linkUrl.startsWith('/blog/')) {
        const targetSlug = linkUrl.replace('/blog/', '');
        parts.push(
          <button
            key={`link-${match.index}`}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleArticleClick(targetSlug);
            }}
            className="text-[#bc5f40] hover:text-[#cf6d4e] underline font-bold transition-colors cursor-pointer inline text-left"
          >
            {linkLabel}
          </button>
        );
      } else if (linkUrl.startsWith('/')) {
        const pageName = linkUrl.replace('/', '') as any;
        parts.push(
          <button
            key={`link-${match.index}`}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToPage(pageName || 'home');
            }}
            className="text-[#bc5f40] hover:text-[#cf6d4e] underline font-bold transition-colors cursor-pointer inline text-left"
          >
            {linkLabel}
          </button>
        );
      } else {
        let externalHref = linkUrl;
        try {
          if (externalHref.startsWith('http://') || externalHref.startsWith('https://')) {
            const parsedUrl = new URL(externalHref);
            if (!parsedUrl.hostname.includes('localsurgeseo.com')) {
              parsedUrl.searchParams.delete('campaigenName');
              parsedUrl.searchParams.delete('campainName');
              if (!parsedUrl.searchParams.has('campaignName')) {
                parsedUrl.searchParams.set('campaignName', 'localsurgeseo.com');
              }
              externalHref = parsedUrl.toString();
            }
          }
        } catch (e) {
          // Keep original linkUrl if URL parsing fails
        }

        parts.push(
          <a
            key={`link-${match.index}`}
            href={externalHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#bc5f40] hover:text-[#cf6d4e] underline font-bold transition-colors inline-flex items-center gap-0.5"
          >
            <span>{linkLabel}</span>
            <ExternalLink className="w-3 h-3 inline-block shrink-0 opacity-75" />
          </a>
        );
      }

      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return (
      <>
        {parts.map((part, i) => {
          if (typeof part === 'string') {
            const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
            return (
              <React.Fragment key={i}>
                {boldParts.map((bp, j) => {
                  if (bp.startsWith('**') && bp.endsWith('**')) {
                    return <strong key={j} className="font-extrabold text-[#151716]">{bp.slice(2, -2)}</strong>;
                  }
                  return bp;
                })}
              </React.Fragment>
            );
          }
          return <React.Fragment key={i}>{part}</React.Fragment>;
        })}
      </>
    );
  };

  return (
    <div id="blog-viewport-section" className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#f7f6f2]">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* ARTICLE VIEW */}
          {activeArticle ? (
            <motion.div
              key="article-details"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
            >
              
              {/* Back & Breadcrumbs Panel */}
              <div className="lg:col-span-12">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <button
                    id="blog-back-btn"
                    onClick={handleReturnToList}
                    className="flex items-center gap-2 px-4 py-2 border border-[#dfded4] bg-white rounded-xl text-xs font-bold text-[#4e524f] hover:text-[#1a1c1a] hover:bg-[#faf9f6] transition-all cursor-pointer shadow-xs"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#bc5f40]" />
                    Back to Blog Landing
                  </button>

                  <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono font-bold text-[#888b88] flex-wrap">
                    <button type="button" className="hover:text-[#bc5f40] cursor-pointer focus:outline-none focus-visible:underline" onClick={() => onNavigateToPage('home')}>Home</button>
                    <span aria-hidden="true">/</span>
                    <button type="button" className="hover:text-[#bc5f40] cursor-pointer focus:outline-none focus-visible:underline" onClick={handleReturnToList}>Blog</button>
                    <span aria-hidden="true">/</span>
                    <span className="text-[#123e35] uppercase" aria-current="page">{activeArticle.category}</span>
                  </nav>
                </div>
              </div>

              {/* Core Content area */}
              <div className="lg:col-span-8 space-y-8 bg-white border border-[#dfded4] p-6 sm:p-10 rounded-3xl shadow-xs">
                
                {/* Meta details */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-[10px] font-bold font-mono tracking-wider bg-[#123e35]/10 text-[#123e35] border border-[#123e35]/20 uppercase rounded">
                        {activeArticle.category}
                      </span>
                      <span className="text-xs text-[#888b88] font-semibold flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        {activeArticle.readTime}
                      </span>
                    </div>

                    {/* Top Action CTAs: Summarize with AI & Add as preferred on Google */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* 1. Summarize with AI (Hostinger reference) */}
                      <div className="relative" ref={summarizeMenuRef}>
                        <button
                          type="button"
                          id="summarize-with-ai-btn"
                          aria-haspopup="true"
                          aria-expanded={showAiSummarize}
                          onClick={() => setShowAiSummarize(prev => !prev)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-[#dfded4] bg-[#faf9f6] text-[#123e35] hover:bg-[#123e35] hover:text-white hover:border-[#123e35] shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-[#123e35]"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#bc5f40]" aria-hidden="true" />
                          <span>Summarize with AI</span>
                          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showAiSummarize ? 'rotate-180' : ''}`} aria-hidden="true" />
                        </button>

                        {showAiSummarize && (
                          <div 
                            className="absolute right-0 mt-1.5 w-64 bg-white border border-[#dfded4] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="summarize-with-ai-btn"
                          >
                            <div className="px-2.5 py-1.5 text-[10px] font-bold text-[#888b88] uppercase tracking-wider border-b border-[#f0eee6]">
                              Summarize article with:
                            </div>
                            <div className="py-1 space-y-0.5">
                              {[
                                {
                                  name: 'ChatGPT',
                                  desc: 'OpenAI fast summary',
                                  url: `https://chat.openai.com/?q=${encodeURIComponent(`Summarize key takeaways from this article https://localsurgeseo.com/blog/${activeArticle.slug}. Highlight actionable local SEO tips for regional businesses.`)}`,
                                  badge: 'GPT-4o'
                                },
                                {
                                  name: 'Claude',
                                  desc: 'Anthropic deep takeaways',
                                  url: `https://claude.ai/new?q=${encodeURIComponent(`Summarize key takeaways from this article https://localsurgeseo.com/blog/${activeArticle.slug}. Highlight actionable local SEO tips for regional businesses.`)}`,
                                  badge: 'Claude 3.7'
                                },
                                {
                                  name: 'Perplexity',
                                  desc: 'Cited research summary',
                                  url: `https://www.perplexity.ai/search/new?q=${encodeURIComponent(`Summarize key takeaways from this article https://localsurgeseo.com/blog/${activeArticle.slug}. Highlight actionable local SEO tips for regional businesses.`)}`,
                                  badge: 'Live Web'
                                },
                                {
                                  name: 'Google AI',
                                  desc: 'Google search overview',
                                  url: `https://www.google.com/search?udm=50&q=${encodeURIComponent(`Summarize key takeaways from this article https://localsurgeseo.com/blog/${activeArticle.slug}`)}`,
                                  badge: 'Gemini'
                                },
                                {
                                  name: 'Grok',
                                  desc: 'xAI quick brief',
                                  url: `https://x.com/i/grok?text=${encodeURIComponent(`Summarize key takeaways from this article https://localsurgeseo.com/blog/${activeArticle.slug}`)}`,
                                  badge: 'Grok 2'
                                }
                              ].map((ai) => (
                                <a
                                  key={ai.name}
                                  href={ai.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  role="menuitem"
                                  onClick={() => setShowAiSummarize(false)}
                                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#faf9f6] text-[#151716] transition group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#123e35]"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-[#123e35]/10 text-[#123e35] flex items-center justify-center font-bold text-[10px] group-hover:bg-[#123e35] group-hover:text-white transition">
                                      {ai.name[0]}
                                    </div>
                                    <div className="text-left">
                                      <div className="text-xs font-bold leading-none">{ai.name}</div>
                                      <div className="text-[10px] text-[#888b88] leading-tight mt-0.5">{ai.desc}</div>
                                    </div>
                                  </div>
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f0eee6] text-[#4e524f] border border-[#dfded4]">
                                    {ai.badge}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 2. Add as preferred on Google (BBC reference) */}
                      <a
                        href="https://www.google.com/preferences/source?q=localsurgeseo.com&campaignName=localsurgeseo.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        id="preferred-on-google-cta"
                        aria-label="Add Local Surge SEO as preferred source on Google"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-[#dfded4] bg-white text-[#151716] hover:bg-[#faf9f6] hover:border-[#123e35] shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-[#123e35]"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                        </svg>
                        <span className="whitespace-nowrap">Add as preferred on Google</span>
                        <ExternalLink className="w-3 h-3 text-[#888b88]" aria-hidden="true" />
                      </a>
                    </div>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-[#151716] tracking-tight leading-tight">
                    {activeArticle.title}
                  </h1>

                  {/* Author Box */}
                  <div className="flex items-center gap-4.5 p-4.5 bg-[#faf9f6] rounded-2xl border border-[#e5e3da]/70">
                    <div className="w-10 h-10 rounded-full bg-[#123e35] text-[#fbfaf8] flex items-center justify-center font-bold font-display shadow-xs text-xs">
                      {activeArticle.author.avatar}
                    </div>
                    <div className="flex-grow">
                      <p className="text-xs font-extrabold text-[#1a1c1a]">{activeArticle.author.name}</p>
                      <p className="text-[10px] font-bold text-[#bc5f40] font-mono tracking-wide uppercase mt-0.5">{activeArticle.author.role}</p>
                    </div>
                    <div className="text-right font-mono text-[10px] text-[#888b88]">
                      <div className="flex items-center gap-1 justify-end font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-[#bc5f40]" />
                        <span>{activeArticle.date}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Article Main Image */}
                <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden border border-[#dfded4] shadow-inner-lg">
                  <div className="absolute inset-0 bg-[#123e35]/5 mix-blend-multiply" aria-hidden="true" />
                  <img
                    src={activeArticle.image}
                    alt={`${activeArticle.title} - Local Surge SEO Strategy Guide`}
                    fetchPriority="high"
                    decoding="async"
                    width={1200}
                    height={670}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transform hover:scale-102 transition-transform duration-500"
                  />
                </div>

                {/* GEO & AI Citations Executive Summary Quick Answer */}
                <div className="p-5 bg-[#123e35]/5 border border-[#123e35]/20 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black font-mono uppercase tracking-wider text-[#123e35]">
                    <Sparkles className="w-4 h-4 text-[#bc5f40]" />
                    <span>Executive Summary & Key Takeaways</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#151716] leading-relaxed">
                    {activeArticle.description}
                  </p>
                </div>

                {/* Table of Contents for Long-form Content & Rich Sitelinks */}
                {(() => {
                  const headings = activeArticle.sections
                    .map((s: any, idx: number) => ({ content: s.content, idx, type: s.type }))
                    .filter((s: any) => s.type === 'heading' && s.content);
                  
                  if (headings.length < 2) return null;
                  
                  return (
                    <nav aria-label="Table of Contents" className="p-5 bg-white border border-[#dfded4] rounded-2xl space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-[#dfded4] pb-2">
                        <span className="text-xs font-black font-mono uppercase tracking-wider text-[#151716] flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#bc5f40]" />
                          <span>Table of Contents</span>
                        </span>
                        <span className="text-[10px] font-mono text-[#888b88] font-bold">
                          {headings.length} Sections
                        </span>
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-[#4e524f]">
                        {headings.map((h: any) => (
                          <li key={h.idx}>
                            <a
                              href={`#art-heading-${h.idx}`}
                              onClick={(e) => {
                                e.preventDefault();
                                const el = document.getElementById(`art-heading-${h.idx}`);
                                if (el) {
                                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                              }}
                              className="hover:text-[#123e35] hover:underline flex items-start gap-1.5 py-1 text-left transition-colors"
                            >
                              <span className="text-[#bc5f40] font-mono text-[10px] shrink-0 mt-0.5">§</span>
                              <span className="line-clamp-2">{h.content}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  );
                })()}

                {/* Structured Sections */}
                <div className="space-y-6 pt-2 text-[#1a1c1a]">
                  {activeArticle.sections.map((section, idx) => {
                    if (section.type === 'heading') {
                      return (
                        <h2 
                          id={`art-heading-${idx}`}
                          key={idx} 
                          className="text-lg sm:text-xl font-bold font-display text-[#151716] pt-4 border-b border-[#faf9f6] pb-1.5 tracking-tight"
                        >
                          {section.content}
                        </h2>
                      );
                    }
                    if (section.type === 'paragraph') {
                      return (
                        <p 
                          key={idx} 
                          className="text-sm text-[#4e524f] font-semibold leading-relaxed"
                        >
                          {renderFormattedText(section.content)}
                        </p>
                      );
                    }
                    if (section.type === 'alert-box') {
                      return (
                        <div 
                          key={idx} 
                          className="p-4.5 bg-[#bc5f40]/5 border-l-4 border-[#bc5f40] rounded-r-xl text-xs font-bold text-[#2d2f2d] flex items-start gap-3 shadow-xs"
                        >
                          <span>{renderFormattedText(section.content)}</span>
                        </div>
                      );
                    }
                    if (section.type === 'bullet-list') {
                      return (
                        <div key={idx} className="space-y-2">
                          <p className="text-xs font-bold text-[#bc5f40] font-mono tracking-wider uppercase">{section.content}</p>
                          <ul className="space-y-2 pl-2">
                            {section.items?.map((item, idy) => (
                              <li key={idy} className="flex gap-2.5 items-start text-xs text-[#4e524f] font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#123e35] mt-1.5 shrink-0" />
                                <span>{renderFormattedText(item)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                    if (section.type === 'numbered-list') {
                      return (
                        <div key={idx} className="space-y-3">
                          <p className="text-xs font-bold text-[#123e35] font-mono tracking-wider uppercase">{section.content}</p>
                          <ol className="space-y-3 pl-1">
                            {section.items?.map((item, idy) => {
                              const [titlePart, descPart] = item.split(': ');
                              return (
                                <li key={idy} className="flex gap-3 text-xs text-[#4e524f] font-semibold items-start leading-relaxed">
                                  <span className="flex items-center justify-center w-5 h-5 rounded-md bg-[#123e35]/10 text-[#123e35] text-[10px] font-black shrink-0 font-mono">
                                    {idy + 1}
                                  </span>
                                  <div>
                                    {descPart ? (
                                      <>
                                        <span className="font-extrabold text-[#1a1c1a] block mb-0.5">{titlePart}</span>
                                        <span>{renderFormattedText(descPart)}</span>
                                      </>
                                    ) : (
                                      <span>{renderFormattedText(item)}</span>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                      );
                    }
                    if (section.type === 'micro-tool' && (section as any).toolConfig) {
                      return (
                        <div key={idx} id="interactive-tool" className="my-6 scroll-mt-28">
                          <React.Suspense fallback={
                            <div className="p-8 text-center text-xs font-mono text-[#888b88] bg-[#faf9f6] rounded-xl border border-[#dfded4]">
                              Loading interactive audit widget...
                            </div>
                          }>
                            <ClientMicroToolWidget config={(section as any).toolConfig} />
                          </React.Suspense>
                        </div>
                      );
                    }
                    if (section.type === 'quote') {
                      return (
                        <div 
                          key={idx} 
                          className="my-6 p-6 border-y border-[#dfded4] bg-[#faf9f6] rounded-xl text-center space-y-2"
                        >
                          <span className="text-3xl text-[#bc5f40] font-serif block">“</span>
                          <p className="text-sm font-semibold italic text-[#151716] leading-relaxed max-w-xl mx-auto">
                            {renderFormattedText(section.content)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })}

                </div>

                {/* Open Attribution Citation & Verified Primary Sources */}
                <div className="my-8 p-6 bg-white border border-[#dfded4] rounded-2xl shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#dfded4] pb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#123e35]" aria-hidden="true" />
                      <h4 className="text-xs font-black font-mono text-[#151716] uppercase tracking-wider">
                        Cite This Strategy Guide / Editorial Study
                      </h4>
                    </div>
                    <span className="text-[9px] font-mono text-[#bc5f40] font-bold uppercase bg-[#bc5f40]/10 px-2 py-0.5 rounded w-fit">
                      Open Attribution Citation
                    </span>
                  </div>
                  
                  <p className="text-xs text-[#4e524f] font-semibold leading-relaxed">
                    Publishing an industry article, local case study, or research analysis citing these findings? Use the pre-formatted citation anchors below:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-[#faf9f6] border border-[#e6e4dc] rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold text-[#123e35]">Markdown Format (Web / Blog)</span>
                        <button
                          onClick={() => {
                            const citeText = `[${activeArticle.title}](https://localsurgeseo.com/blog/${activeArticle.slug})`;
                            navigator.clipboard.writeText(citeText);
                            setCopiedCitation('markdown');
                            setTimeout(() => setCopiedCitation(null), 2000);
                          }}
                          className="text-[10px] font-bold text-[#bc5f40] hover:underline cursor-pointer"
                        >
                          {copiedCitation === 'markdown' ? 'Copied! 📎' : 'Copy Markdown'}
                        </button>
                      </div>
                      <code className="text-[11px] text-[#2d2f2d] font-mono block bg-white p-2 rounded border border-[#dfded4] truncate select-all">
                        [{activeArticle.title}](https://localsurgeseo.com/blog/{activeArticle.slug})
                      </code>
                    </div>

                    <div className="p-3 bg-[#faf9f6] border border-[#e6e4dc] rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold text-[#123e35]">APA / Academic Format</span>
                        <button
                          onClick={() => {
                            const citeText = `${activeArticle.author.name} (2026). "${activeArticle.title}". Local Surge SEO Research Insights. https://localsurgeseo.com/blog/${activeArticle.slug}`;
                            navigator.clipboard.writeText(citeText);
                            setCopiedCitation('apa');
                            setTimeout(() => setCopiedCitation(null), 2000);
                          }}
                          className="text-[10px] font-bold text-[#bc5f40] hover:underline cursor-pointer"
                        >
                          {copiedCitation === 'apa' ? 'Copied! 📎' : 'Copy APA'}
                        </button>
                      </div>
                      <code className="text-[11px] text-[#2d2f2d] font-mono block bg-white p-2 rounded border border-[#dfded4] truncate select-all">
                        {activeArticle.author.name} (2026). "{activeArticle.title}". Local Surge SEO.
                      </code>
                    </div>
                  </div>

                  {/* Authoritative Outbound Verification Sources */}
                  <div className="pt-2 border-t border-[#dfded4]/60 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-[#5c605d]">
                    <span className="font-bold text-[#151716] text-[10px] uppercase font-mono tracking-wider">Primary Verification Sources:</span>
                    <a 
                      href="https://developers.google.com/search/docs" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[#123e35] hover:text-[#bc5f40] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Google Search Central</span>
                      <ExternalLink className="w-3 h-3 text-[#888b88]" aria-hidden="true" />
                    </a>
                    <a 
                      href="https://schema.org" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[#123e35] hover:text-[#bc5f40] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Schema.org Vocabularies</span>
                      <ExternalLink className="w-3 h-3 text-[#888b88]" aria-hidden="true" />
                    </a>
                    <a 
                      href="https://www.w3.org/WAI/standards-guidelines/wcag/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[#123e35] hover:text-[#bc5f40] hover:underline inline-flex items-center gap-1"
                    >
                      <span>W3C Standards</span>
                      <ExternalLink className="w-3 h-3 text-[#888b88]" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                {/* Interaction Footer widget */}
                <div className="border-t border-[#dfded4] pt-6 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex gap-2">
                    <button
                      id={`share-btn-${activeArticle.slug}`}
                      onClick={(e) => handleShareArticle(e, activeArticle)}
                      className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 border border-[#dfded4] bg-[#faf9f6]/80 hover:bg-[#faf9f6] text-[#4e524f] hover:text-[#1a1c1a] rounded-xl transition-all cursor-pointer relative"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#bc5f40]" />
                      {copiedLink ? 'Link Copied! 📎' : 'Share Article'}
                    </button>
                  </div>
                  
                  <span className="text-[10px] text-[#888b88] font-mono">
                    Updated continuously for the {new Date().getFullYear()} season
                  </span>
                </div>

                {/* Topic Cluster Navigation Box */}
                {(() => {
                  const clusterInfo = getClusterForPost(activeArticle.slug);
                  if (!clusterInfo) return null;
                  const { cluster, role } = clusterInfo;
                  const isPillar = role === 'pillar';
                  const pillarPost = allPosts.find(p => p.slug === cluster.pillarSlug);
                  const spokePosts = cluster.spokeSlugs
                    .map(slug => allPosts.find(p => p.slug === slug))
                    .filter((p): p is BlogPost => !!p);
                  const crossPost = allPosts.find(p => p.slug === cluster.crossLinkSlug);

                  return (
                    <aside aria-label="Topic Cluster Series" className="bg-[#faf9f6] border border-[#dfded4] rounded-2xl p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#dfded4] pb-3">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono font-black text-[#bc5f40] uppercase tracking-widest block">
                            Topic Cluster Series
                          </span>
                          <h4 className="text-sm font-extrabold text-[#151716] font-display">
                            {cluster.name}
                          </h4>
                        </div>
                        <span className={`px-2.5 py-1 text-[9px] font-mono font-black uppercase tracking-wider rounded-md border ${
                          isPillar 
                            ? 'bg-[#123e35]/10 text-[#123e35] border-[#123e35]/20' 
                            : 'bg-[#bc5f40]/10 text-[#bc5f40] border-[#bc5f40]/20'
                        }`}>
                          {isPillar ? '★ Master Pillar Guide' : 'Companion Spoke Guide'}
                        </span>
                      </div>
                      
                      <p className="text-xs text-[#4e524f] leading-relaxed">
                        {cluster.description}
                      </p>

                      <div className="space-y-3 pt-1">
                        {!isPillar && pillarPost && (
                          <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-3 shadow-2xs">
                            <div>
                              <span className="text-[8px] font-mono font-black text-emerald-800 uppercase tracking-widest block">Core Pillar Blueprint</span>
                              <h5 className="text-xs font-bold text-[#151716]">{pillarPost.title}</h5>
                            </div>
                            <a
                              href={`/blog/${pillarPost.slug}`}
                              onClick={(e) => {
                                e.preventDefault();
                                handleArticleClick(pillarPost.slug);
                              }}
                              className="bg-[#123e35] text-white text-[10px] font-bold py-1.5 px-3 rounded-lg whitespace-nowrap uppercase tracking-wider hover:bg-[#185246] transition-colors flex items-center gap-1"
                            >
                              <span>Read Pillar</span>
                              <ArrowRight className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        <div className="space-y-2">
                          <span className="text-[9px] font-mono font-bold text-[#4e524f] uppercase tracking-wider block">
                            {isPillar ? 'Spoke Guides in this Topic Cluster:' : 'Sibling Guides in this Series:'}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(isPillar ? spokePosts : spokePosts.filter(p => p.slug !== activeArticle.slug)).map((post) => (
                              <a
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleArticleClick(post.slug);
                                }}
                                className="bg-white p-3 rounded-xl border border-[#dfded4] hover:border-[#bc5f40]/40 transition-colors block group shadow-2xs"
                              >
                                <span className="text-[8px] text-[#bc5f40] font-bold uppercase font-mono block">{post.category}</span>
                                <h6 className="text-[11px] font-bold text-[#151716] group-hover:text-[#bc5f40] transition-colors leading-snug line-clamp-2">
                                  {post.title}
                                </h6>
                              </a>
                            ))}
                          </div>
                        </div>

                        {crossPost && (
                          <div className="pt-2.5 border-t border-[#dfded4]/60 flex items-center justify-between text-[10px]">
                            <span className="text-[#888b88] font-mono">Recommended Cross-Cluster Reading:</span>
                            <a
                              href={`/blog/${crossPost.slug}`}
                              onClick={(e) => {
                                e.preventDefault();
                                handleArticleClick(crossPost.slug);
                              }}
                              className="text-[#123e35] font-bold hover:text-[#bc5f40] transition-colors flex items-center gap-1"
                            >
                              <span>{crossPost.title.slice(0, 45)}...</span>
                              <ArrowRight className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </aside>
                  );
                })()}

                {/* Sub-lead CTA container at bottom of article reading */}
                <div className="bg-[#123e35] text-[#fbfaf8] rounded-2xl p-6 relative overflow-hidden border border-[#0f342e] shadow-xs">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#bc5f40]/10 rounded-full blur-2xl pointer-events-none" />
                  <span className="text-[9px] font-black font-mono bg-[#bc5f40]/20 text-[#bc5f40] px-2 py-0.5 rounded border border-[#bc5f40]/30 uppercase tracking-widest inline-block">
                    PROFIT FROM LOCAL VISIBILITY
                  </span>
                  <h3 className="text-lg font-bold font-display text-white mt-1.5">
                    How is your business performing in Google\'s Local 3-Pack?
                  </h3>
                  <p className="text-xs text-slate-200 mt-2 leading-relaxed">
                    Don\'t leave your neighborhood market open for competitors to sweep up. Schedule a free optimization brief with our field strategist today—entirely risk-free.
                  </p>
                  <div className="mt-5 flex gap-3 flex-wrap">
                    <button
                      onClick={onOpenOnboarding}
                      className="bg-[#bc5f40] hover:bg-[#cf6d4e] hover:shadow-xs text-white text-xs font-black py-2.5 px-4.5 rounded-xl cursor-pointer transition-all uppercase tracking-wider font-mono"
                    >
                      Get My Local Strategy
                    </button>
                    <a
                      href="/seo-tool"
                      onClick={(e) => {
                        e.preventDefault();
                        window.history.pushState(null, '', '/seo-tool');
                        onNavigateToPage('seo-tool');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold py-2.5 px-4.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      Run Instant Website Scan
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

              </div>

              {/* Sidebar Content */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Free Website Auditor sidebar promo widget */}
                <div className="bg-white border border-[#dfded4] rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-[#123e35]/10 flex items-center justify-center text-[#123e35]">
                    <Sparkles className="w-5 h-5 text-[#bc5f40]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#151716] tracking-tight">Free Audit Tool</h4>
                    <p className="text-xs text-[#4e524f] font-semibold mt-1 leading-relaxed">
                      Run our real-time website audit tool with built-in competitor neighborhood listings scanning. See exact score parameters and deficiencies instantly!
                    </p>
                  </div>
                  <a
                    href="/seo-tool"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState(null, '', '/seo-tool');
                      onNavigateToPage('seo-tool');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full bg-[#123e35] hover:bg-[#185246] text-white flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl transition-all h-10 shadow-xs cursor-pointer"
                  >
                    Launch SEO Scan
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Popular posts */}
                {getRelatedPosts(activeArticle).length > 0 && (
                  <div className="bg-white border border-[#dfded4] rounded-3xl p-6 space-y-4 shadow-sm">
                    <h4 className="text-xs font-extrabold text-[#151716] uppercase tracking-wide font-mono flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-[#bc5f40]" />
                      Related Articles
                    </h4>
                    
                    <div className="divide-y divide-[#dfded4] space-y-4">
                      {getRelatedPosts(activeArticle).map((post) => (
                        <a 
                          key={post.slug} 
                          href={`/blog/${post.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleArticleClick(post.slug);
                          }}
                          className="pt-4 first:pt-0 group cursor-pointer space-y-1.5 block focus-visible:outline-2 focus-visible:outline-[#123e35]"
                        >
                          <span className="text-[9px] text-[#bc5f40] font-black uppercase font-mono tracking-widest">{post.category}</span>
                          <h5 className="font-extrabold text-xs text-[#151716] group-hover:text-[#bc5f40] transition-colors leading-snug">
                            {post.title}
                          </h5>
                          <span className="text-[9px] text-[#4e524f] font-semibold block font-mono">{post.readTime}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </motion.div>
          ) : (
            
            /* BLOG LANDING SCREEN */
            <motion.div
              key="blog-landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-10"
            >
              
              {/* Top Intro Section */}
              <div className="text-center space-y-3.5 max-w-2xl mx-auto py-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#bc5f40]/10 border border-[#bc5f40]/20 text-[#bc5f40] text-xs font-bold font-mono tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  Local Surge Editorial
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-[#151716] tracking-tight leading-none">
                  Knowledge & Strategies 💡
                </h1>
                <p className="text-sm font-semibold text-[#4e524f] leading-relaxed">
                  Deep dives on local Google maps dominance, keyword validation, home restoration safety rules, single-page architectures, and regional sales generation strategies.
                </p>
              </div>

              {/* Filtering & Navigation Controls */}
              <div className="bg-white border border-[#dfded4] p-4.5 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
                
                {/* Search query input */}
                <form
                  onSubmit={(e) => e.preventDefault()}
                  toolname="search_blog_articles"
                  tooldescription="Search local marketing insights, AI SEO guides, and case studies on the Local Surge SEO blog"
                  toolautosubmit="true"
                  className="relative w-full md:max-w-xs"
                >
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#888b88]" aria-hidden="true" />
                  <input
                    type="text"
                    aria-label="Search articles and guides"
                    toolparamtitle="Search Keywords"
                    toolparamdescription="Keywords or topics to search within blog posts"
                    placeholder="Search articles & guides..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#faf9f6] border border-[#dfded4] rounded-xl w-full pl-10 pr-4 py-2.5 text-xs text-[#1a1c1a] placeholder-[#888b88] focus:outline-none focus:border-[#bc5f40] transition-all font-semibold"
                  />
                </form>

                {/* Nav Category chips */}
                <div className="flex gap-2 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none flex-wrap items-center">
                  {categories.map((cat) => (
                    <button
                      id={`cat-chip-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        // Reset search if they select category chips
                        setSearchQuery('');
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#123e35] text-white shadow-xs scale-102'
                          : 'bg-[#faf9f6] hover:bg-[#dfded4]/40 border border-[#dfded4] text-[#4e524f] hover:text-[#1a1c1a]'
                      }`}
                    >
                      {cat === 'All' ? 'All Channels' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Free SEO Audit Banner Callout on Blog */}
              <div className="bg-gradient-to-r from-[#123e35] to-[#185246] text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#123e35] flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
                    <Sparkles className="w-6 h-6 text-[#bc5f40]" />
                  </div>
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-white/90">
                      Free Live Diagnostic Scanner
                    </div>
                    <h3 className="text-lg sm:text-xl font-black font-display tracking-tight text-white">
                      Want to see where your business stands in Google Search?
                    </h3>
                    <p className="text-xs sm:text-sm text-white/80 font-medium max-w-2xl leading-relaxed">
                      Benchmark your website's meta tags, Google Map Pack signals, schema markup, and speed against top-ranking local competitors in 60 seconds.
                    </p>
                  </div>
                </div>
                <a
                  href="/seo-tool"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState(null, '', '/seo-tool');
                    onNavigateToPage('seo-tool');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-[#bc5f40] hover:bg-[#cf6d4e] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-sm active:scale-95 duration-200 shrink-0 flex items-center gap-2 cursor-pointer"
                >
                  <span>Launch Free Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* FEATURED HERO POST (ONLY visible when searching/filters are empty) */}
              {selectedCategory === 'All' && searchQuery === '' && (
                <a 
                  href={`/blog/${featuredPost.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleArticleClick(featuredPost.slug);
                  }}
                  aria-label={`Read featured article: ${featuredPost.title}`}
                  className="bg-white border border-[#dfded4] rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 cursor-pointer group focus-visible:ring-2 focus-visible:ring-[#123e35] focus-visible:outline-none block"
                >
                  {/* Left Hero Image */}
                  <div className="lg:col-span-7 h-64 sm:h-80 lg:h-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#123e35]/10 mix-blend-multiply group-hover:bg-transparent transition-all duration-500" aria-hidden="true" />
                    <img
                      src={featuredPost.image}
                      alt={`${featuredPost.title} - Featured Strategy Guide`}
                      loading="lazy"
                      decoding="async"
                      width={800}
                      height={450}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 block"
                    />
                  </div>

                  {/* Right Hero content */}
                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 text-[8px] font-black uppercase font-mono tracking-widest bg-[#bc5f40]/15 text-[#bc5f40] border border-[#bc5f40]/25 rounded">
                          Featured Insight
                        </span>
                        <span className="text-[10px] text-[#888b88] font-bold font-mono uppercase">{featuredPost.category}</span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black font-display text-[#151716] tracking-tight hover:text-[#bc5f40] transition-colors leading-tight">
                        {featuredPost.title}
                      </h3>

                      <p className="text-xs text-[#4e524f] font-semibold leading-relaxed">
                        {featuredPost.description}
                      </p>
                    </div>

                    <div className="border-t border-[#dfded4] pt-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#123e35] text-white flex items-center justify-center font-bold text-xs">
                          {featuredPost.author.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-black text-[#1a1c1a]">{featuredPost.author.name}</p>
                          <p className="text-[9px] text-[#4e524f] font-mono leading-none">{featuredPost.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#123e35] group-hover:translate-x-1.5 transition-transform duration-300">
                        Read Story
                        <ArrowRight className="w-4 h-4 text-[#bc5f40]" />
                      </div>
                    </div>
                  </div>
                </a>
              )}

              {/* POST RESULTS GRID */}
              <div className="space-y-6">
                <h3 className="text-xs font-mono font-black text-[#888b88] uppercase tracking-widest">
                  {searchQuery !== '' ? `Found ${filteredPosts.length} results matching "${searchQuery}"` : 'All Available Articles'}
                </h3>

                {filteredPosts.length === 0 ? (
                  <div className="p-16 text-center bg-white border border-[#dfded4] rounded-3xl space-y-2">
                    <Search className="w-8 h-8 text-[#888b88] mx-auto opacity-30" />
                    <h4 className="text-sm font-bold text-[#151716]">No matching insights identified</h4>
                    <p className="text-xs text-[#4e524f] font-semibold">Try typing a different keyword or choosing other channel directories.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {listPosts.map((post) => (
                      <a
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleArticleClick(post.slug);
                        }}
                        aria-label={`Read article: ${post.title}`}
                        className="bg-white border border-[#dfded4] rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer relative focus-visible:ring-2 focus-visible:ring-[#123e35] focus-visible:outline-none block"
                      >
                        <div>
                          {/* Image box */}
                          <div className="h-44 w-full relative overflow-hidden border-b border-[#dfded4]">
                            <img
                              src={post.image}
                              alt={`${post.title} editorial cover`}
                              loading="lazy"
                              decoding="async"
                              width={600}
                              height={340}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                            />
                            <span className="absolute top-3.5 left-3.5 px-2 py-0.5 text-[8px] font-black uppercase font-mono tracking-wider bg-white/95 text-[#1a1c1a] border border-[#dfded4] rounded shadow-xs">
                              {post.category}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="p-5.5 space-y-3">
                            <div className="flex items-center gap-1 text-[10px] text-[#bc5f40] font-bold font-mono">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{post.readTime}</span>
                            </div>

                            <h4 className="font-extrabold text-sm sm:text-base text-[#151716] group-hover:text-[#bc5f40] transition-colors leading-snug">
                              {post.title}
                            </h4>

                            <p className="text-xs text-[#4e524f] leading-relaxed line-clamp-3 font-semibold">
                              {post.description}
                            </p>
                          </div>
                        </div>

                        {/* Footer details */}
                        <div className="p-5.5 pt-0 border-t border-[#dfded4]/60 mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#123e35]/10 text-[#123e35] flex items-center justify-center font-black text-[10px] font-display">
                              {post.author.avatar}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-[#1a1c1a]">{post.author.name}</p>
                              <p className="text-[9px] text-[#888b88] font-mono leading-none">{post.date}</p>
                            </div>
                          </div>

                          <div className="w-7 h-7 rounded-full border border-[#dfded4] hover:border-[#bc5f40] flex items-center justify-center text-[#888b88] hover:text-[#bc5f40] hover:bg-[#bc5f40]/5 transition-colors cursor-pointer">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>

                      </a>
                    ))}
                  </div>
                )}
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
