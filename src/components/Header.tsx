import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { 
  Rocket, BarChart3, Users, Landmark, Contact, Sparkles, MapPin, 
  Menu, X, ChevronRight, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onOpenOnboarding: () => void;
}

export default function Header({ currentPage, setCurrentPage, onOpenOnboarding }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Core navigation items matching top header menu
  const navItems: { id: Page; label: string; icon: any; path: string }[] = [
    { id: 'home', label: 'Home', icon: Rocket, path: '/' },
    { id: 'about', label: 'About Us', icon: Users, path: '/about' },
    { id: 'why-us', label: 'Why Us', icon: Landmark, path: '/why-us' },
    { id: 'local-seo', label: 'Local SEO', icon: MapPin, path: '/local-seo' },
    { id: 'pricing', label: 'Pricing', icon: BarChart3, path: '/pricing' },
    { id: 'seo-tool', label: 'SEO Tool', icon: Sparkles, path: '/seo-tool' },
    { id: 'contact', label: 'Contact', icon: Contact, path: '/contact' },
  ];

  const handleNavClick = (e: React.MouseEvent, pageId: Page, path: string) => {
    e.preventDefault();
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header id="main-header" className="sticky top-0 z-50 bg-[#f7f6f2]/95 backdrop-blur-md border-b border-[#e6e4dc] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo (Left-aligned) */}
          <div className="flex-shrink-0 flex items-center">
            <a
              id="logo-button"
              href="/"
              onClick={(e) => handleNavClick(e, 'home', '/')}
              className="flex items-center gap-2.5 group cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-[#123e35]"
              aria-label="Local Surge SEO Home"
            >
              <div className="w-10 h-10 rounded-lg bg-[#123e35] flex items-center justify-center text-[#faf9f6] shadow-sm group-hover:scale-105 transition-transform duration-300">
                <Rocket className="w-5 h-5 text-[#fbfaf8]" aria-hidden="true" />
              </div>
              <div className="text-left">
                <span className="block text-lg sm:text-xl font-black font-display text-[#151716] leading-none tracking-tight">
                  Local Surge
                </span>
                <span className="block text-[9px] sm:text-[10px] font-bold font-mono tracking-widest text-[#bc5f40] uppercase mt-1">
                  LOCAL SEARCH SEO
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Nav Links (Hidden on Mobile/Tablet) */}
          <nav aria-label="Main Navigation" className="hidden lg:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <a
                  id={`nav-link-${item.id}`}
                  key={item.id}
                  href={item.path}
                  onClick={(e) => handleNavClick(e, item.id, item.path)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#123e35] border-b-2 border-[#123e35] rounded-b-none shadow-xs'
                      : 'text-[#4e524f] hover:text-[#111111] hover:bg-[#e6e4dc]/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#123e35]' : 'text-[#888b88]'}`} aria-hidden="true" />
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Right Action Group: Strategy CTA + Right-aligned Mobile Hamburger Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="header-get-started"
              onClick={onOpenOnboarding}
              className="bg-[#123e35] hover:bg-[#185246] text-[#fbfaf8] shadow-sm text-xs font-bold px-3.5 sm:px-5 py-2.5 rounded-lg flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 duration-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
              <span className="hidden sm:inline">Get Free Strategy</span>
              <span className="sm:hidden">Strategy</span>
            </button>

            {/* Hamburger Button on Right for Ergonomic Right-Handed Thumb Reach */}
            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2.5 rounded-xl text-[#151716] bg-white border border-[#dfded4] hover:bg-[#e6e4dc]/60 transition-colors focus-visible:outline-2 focus-visible:outline-[#123e35] cursor-pointer shadow-2xs"
              aria-label="Open navigation drawer"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              <Menu className="w-5 h-5 text-[#151716]" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Full-Width Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Main Navigation Menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 w-full h-screen h-dvh bg-[#f7f6f2] z-[9999] flex flex-col justify-between overflow-y-auto"
          >
            {/* Top Bar inside Full-Width Drawer */}
            <div>
              <div className="h-20 px-4 sm:px-6 border-b border-[#e6e4dc] flex items-center justify-between bg-white shadow-xs">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-[#123e35] flex items-center justify-center text-[#faf9f6] shadow-sm">
                    <Rocket className="w-5 h-5 text-[#fbfaf8]" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="block text-lg sm:text-xl font-black font-display text-[#151716] leading-none tracking-tight">
                      Local Surge
                    </span>
                    <span className="block text-[9px] sm:text-[10px] font-bold font-mono tracking-widest text-[#bc5f40] uppercase mt-1">
                      LOCAL SEARCH SEO
                    </span>
                  </div>
                </div>

                {/* Close Button on Top Right (Exact same spot as the hamburger toggle) */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl text-[#151716] bg-[#f7f6f2] border border-[#dfded4] hover:bg-[#e6e4dc]/60 transition-colors focus-visible:outline-2 focus-visible:outline-[#123e35] cursor-pointer shadow-2xs"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5 text-[#151716]" aria-hidden="true" />
                </button>
              </div>

              {/* Navigation Links (Spacious Full-Width Tap Targets) */}
              <nav className="p-4 sm:p-6 space-y-2" aria-label="Mobile Navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <a
                      key={`drawer-${item.id}`}
                      href={item.path}
                      onClick={(e) => handleNavClick(e, item.id, item.path)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#123e35] text-white shadow-sm'
                          : 'bg-white text-[#151716] hover:bg-[#eae8df] border border-[#dfded4]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20 text-white' : 'bg-[#f7f6f2] text-[#123e35]'}`}>
                          <Icon className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <span className="font-extrabold">{item.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white/80' : 'text-[#8c918d]'}`} aria-hidden="true" />
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 sm:p-6 border-t border-[#dfded4] bg-white space-y-3">
              <a
                href="tel:+19097075075"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#f7f6f2] border border-[#dfded4] text-[#123e35] text-xs font-bold hover:bg-[#eae8df] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#bc5f40]" aria-hidden="true" />
                <span>Call Us: +1 (909) 707-5075</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenOnboarding();
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#123e35] text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-[#185246] transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" aria-hidden="true" />
                <span>Get Free Strategy</span>
              </button>
              <div className="text-center text-[10px] text-[#888b88] font-mono">
                Contract-Free Local SEO Acceleration
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
