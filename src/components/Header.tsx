import React from 'react';
import { Page } from '../types';
import { Rocket, BarChart3, Users, Landmark, Contact, Sparkles, Sliders, FileText } from 'lucide-react';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onOpenOnboarding: () => void;
}

export default function Header({ currentPage, setCurrentPage, onOpenOnboarding }: HeaderProps) {
  const navItems = [
    { id: 'home' as Page, label: 'Home', icon: Rocket },
    { id: 'about' as Page, label: 'About Us', icon: Users },
    { id: 'why-us' as Page, label: 'Why Us', icon: Landmark },
    { id: 'pricing' as Page, label: 'Pricing', icon: BarChart3 },
    { id: 'seo-tool' as Page, label: 'SEO Tool', icon: Sparkles },
    { id: 'contact' as Page, label: 'Contact', icon: Contact },
  ];

  return (
    <header id="main-header" className="sticky top-0 z-50 bg-[#f7f6f2]/90 backdrop-blur-md border-b border-[#e6e4dc] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <button
              id="logo-button"
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-[#123e35] flex items-center justify-center text-[#faf9f6] shadow-sm group-hover:scale-105 transition-transform duration-300">
                <Rocket className="w-5 h-5 text-[#fbfaf8]" />
              </div>
              <div className="text-left">
                <span className="block text-xl font-black font-display text-[#151716] leading-none tracking-tight">
                  Local Surge
                </span>
                <span className="block text-[10px] font-bold font-mono tracking-widest text-[#bc5f40] uppercase mt-1">
                  LOCAL SEARCH SEO
                </span>
              </div>
            </button>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  id={`nav-link-${item.id}`}
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs lg:text-sm font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#123e35] border-b-2 border-[#123e35] rounded-b-none'
                      : 'text-[#4e524f] hover:text-[#111111] hover:bg-[#e6e4dc]/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#123e35]' : 'text-[#888b88]'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action Button & Admin Toggle */}
          <div className="flex items-center gap-3">
            <button
              id="header-get-started"
              onClick={onOpenOnboarding}
              className="bg-[#123e35] hover:bg-[#185246] text-[#fbfaf8] shadow-sm text-xs font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 duration-200"
            >
              Get Free Strategy
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
