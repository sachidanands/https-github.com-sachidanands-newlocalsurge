import React, { useState, useEffect } from 'react';
import { BlogPost, BLOG_POSTS } from '../data/blogData';
import { 
  ArrowLeft, Search, Sparkles, Clock, Calendar, User, ArrowRight, Check, 
  Share2, BookOpen, ExternalLink, MapPin, CheckSquare, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BlogViewProps {
  initialSlug: string | null;
  onNavigateToArticle: (slug: string | null) => void;
  onOpenOnboarding: () => void;
  onNavigateToPage: (page: 'seo-tool' | 'pricing' | 'contact') => void;
}

export default function BlogView({ 
  initialSlug, 
  onNavigateToArticle, 
  onOpenOnboarding,
  onNavigateToPage
}: BlogViewProps) {
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync state with parent route slug trigger
  useEffect(() => {
    if (initialSlug) {
      const match = BLOG_POSTS.find(post => post.slug === initialSlug);
      if (match) {
        setActiveArticle(match);
        // Scroll to top of article viewport
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setActiveArticle(null);
      }
    } else {
      setActiveArticle(null);
    }
  }, [initialSlug]);

  // Extract unique categories dynamically based on all posts
  const categories = ['All', ...Array.from(new Set(BLOG_POSTS.map(post => post.category)))];

  // Filters posts according to active category and search matching
  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.sections.some(sec => sec.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Featured post is the newest one (first array item that matches category if not All, otherwise first item in array)
  const featuredPost = BLOG_POSTS[0];
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
    return BLOG_POSTS.filter(
      p => p.slug !== currentPost.slug && (p.category === currentPost.category)
    ).slice(0, 2);
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

                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#888b88] flex-wrap">
                    <span className="hover:text-[#bc5f40] cursor-pointer" onClick={() => onNavigateToPage('contact')}>Home</span>
                    <span>/</span>
                    <span className="hover:text-[#bc5f40] cursor-pointer" onClick={handleReturnToList}>Blog</span>
                    <span>/</span>
                    <span className="text-[#123e35] uppercase">{activeArticle.category}</span>
                  </div>
                </div>
              </div>

              {/* Core Content area */}
              <div className="lg:col-span-8 space-y-8 bg-white border border-[#dfded4] p-6 sm:p-10 rounded-3xl shadow-xs">
                
                {/* Meta details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-[10px] font-bold font-mono tracking-wider bg-[#123e35]/10 text-[#123e35] border border-[#123e35]/20 uppercase rounded">
                      {activeArticle.category}
                    </span>
                    <span className="text-xs text-[#888b88] font-semibold flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {activeArticle.readTime}
                    </span>
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
                  <div className="absolute inset-0 bg-[#123e35]/5 mix-blend-multiply" />
                  <img
                    src={activeArticle.image}
                    alt={activeArticle.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transform hover:scale-102 transition-transform duration-500"
                  />
                </div>

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
                          {section.content}
                        </p>
                      );
                    }
                    if (section.type === 'alert-box') {
                      return (
                        <div 
                          key={idx} 
                          className="p-4.5 bg-[#bc5f40]/5 border-l-4 border-[#bc5f40] rounded-r-xl text-xs font-bold text-[#2d2f2d] flex items-start gap-3 shadow-xs"
                        >
                          <span>{section.content}</span>
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
                                <span>{item}</span>
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
                                        <span>{descPart}</span>
                                      </>
                                    ) : (
                                      <span>{item}</span>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                      );
                    }
                    if (section.type === 'quote') {
                      return (
                        <div 
                          key={idx} 
                          className="p-5 border border-[#dfded4] bg-[#faf9f6]/90 rounded-2xl relative overflow-hidden flex gap-4 pr-10 hover:shadow-xs transition-shadow"
                        >
                          <div className="text-[#bc5f40] text-4xl font-serif font-black leading-none shrink-0 select-none">“</div>
                          <p className="text-xs font-semibold text-[#123e35] italic leading-relaxed self-center">
                            {section.content}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })}
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
                    <button
                      onClick={() => onNavigateToPage('seo-tool')}
                      className="bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold py-2.5 px-4.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      Run Instant Website Scan
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
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
                  <button
                    onClick={() => onNavigateToPage('seo-tool')}
                    className="w-full bg-[#123e35] hover:bg-[#185246] text-white flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl transition-all h-10 shadow-xs cursor-pointer"
                  >
                    Launch SEO Scan
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
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
                        <div 
                          key={post.slug} 
                          onClick={() => handleArticleClick(post.slug)}
                          className="pt-4 first:pt-0 group cursor-pointer space-y-1.5 block"
                        >
                          <span className="text-[9px] text-[#bc5f40] font-black uppercase font-mono tracking-widest">{post.category}</span>
                          <h5 className="font-extrabold text-xs text-[#151716] group-hover:text-[#bc5f40] transition-colors leading-snug">
                            {post.title}
                          </h5>
                          <span className="text-[9px] text-[#4e524f] font-semibold block font-mono">{post.readTime}</span>
                        </div>
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
                <div className="relative w-full md:max-w-xs">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#888b88]" />
                  <input
                    type="text"
                    placeholder="Search articles & guides..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#faf9f6] border border-[#dfded4] rounded-xl w-full pl-10 pr-4 py-2.5 text-xs text-[#1a1c1a] placeholder-[#888b88] focus:outline-none focus:border-[#bc5f40] transition-all font-semibold"
                  />
                </div>

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

              {/* FEATURED HERO POST (ONLY visible when searching/filters are empty) */}
              {selectedCategory === 'All' && searchQuery === '' && (
                <div 
                  onClick={() => handleArticleClick(featuredPost.slug)}
                  className="bg-white border border-[#dfded4] rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 cursor-pointer group"
                >
                  {/* Left Hero Image */}
                  <div className="lg:col-span-7 h-64 sm:h-80 lg:h-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#123e35]/10 mix-blend-multiply group-hover:bg-transparent transition-all duration-500" />
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
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
                </div>
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
                      <div 
                        id={`post-card-${post.slug}`}
                        key={post.slug}
                        onClick={() => handleArticleClick(post.slug)}
                        className="bg-white border border-[#dfded4] rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer relative"
                      >
                        <div>
                          {/* Image box */}
                          <div className="h-44 w-full relative overflow-hidden border-b border-[#dfded4]">
                            <img
                              src={post.image}
                              alt={post.title}
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

                      </div>
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
