import React from 'react';
import { Page } from '../types';
import { Rocket, Mail, MapPin, Clock, Calendar } from 'lucide-react';

interface FooterProps {
  setCurrentPage: (page: Page) => void;
}

export default function Footer({ setCurrentPage }: FooterProps) {
  return (
    <footer id="main-footer" className="bg-white text-[#4e524f] border-t border-[#dfded4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2 p-6 rounded-2xl bg-[#faf9f6] border border-[#e6e4dc]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#123e35] flex items-center justify-center text-[#faf9f6] shadow-sm">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black font-display text-[#151716] tracking-tight">
                Local Surge
              </span>
            </div>
            <p className="text-xs text-[#5c605d] max-w-sm leading-relaxed">
              We empower local businesses to thrive in the digital landscape. Bridging the gap between you and your neighborhood customers through expert, transparent, and results-oriented SEO strategies.
            </p>
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#2d2f2d] font-semibold">
                <Mail className="w-4 h-4 text-[#123e35] shrink-0" />
                <a href="mailto:contact@localsurgeseo.com" className="hover:text-[#bc5f40] transition-colors">
                  contact@localsurgeseo.com
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 p-6 rounded-2xl bg-[#faf9f6]/40 border border-[#e2dfd5]">
            <h3 className="text-xs font-bold font-mono tracking-wider text-[#bc5f40] uppercase">
              Solutions
            </h3>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <button onClick={() => setCurrentPage('local-seo')} className="hover:text-[#123e35] transition-colors cursor-pointer text-left">
                  Local SEO Optimization
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('pricing')} className="hover:text-[#123e35] transition-colors cursor-pointer text-left">
                  Transparent Pricing
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('seo-tool')} className="hover:text-[#123e35] transition-colors cursor-pointer text-left">
                  Free SEO Analysis Tool
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('why-us')} className="hover:text-[#123e35] transition-colors cursor-pointer text-left">
                  Why Choose Us
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div className="space-y-4 p-6 rounded-2xl bg-[#faf9f6]/40 border border-[#e2dfd5]">
            <h3 className="text-xs font-bold font-mono tracking-wider text-[#bc5f40] uppercase">
              Support
            </h3>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <button onClick={() => setCurrentPage('about')} className="hover:text-[#123e35] transition-colors cursor-pointer text-left">
                  Our Mission & About Us
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('contact')} className="hover:text-[#123e35] transition-colors cursor-pointer text-left">
                  Get in Touch
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('blog')} className="text-[#123e35] hover:text-[#185246] transition-colors cursor-pointer text-left font-bold flex items-center gap-1">
                  📚 Editorial Blog
                </button>
              </li>
              <li>
                <button onClick={() => {
                  setCurrentPage('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} className="text-[#123e35] hover:text-[#185246] transition-colors cursor-pointer text-left font-bold flex items-center gap-1">
                  🏆 Leader Board
                </button>
              </li>
              <li className="text-xs text-[#888b88] pt-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mon - Fri: 9:00 AM - 5:00 PM</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#dfded4] mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#888b88] font-semibold">
          <div>
            © {new Date().getFullYear()} Local Surge SEO. All rights reserved. Billed monthly, cancel anytime.
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => {
              setCurrentPage('privacy-policy');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} className="hover:text-[#123e35] transition-colors cursor-pointer bg-transparent border-none p-0 inline font-semibold">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => {
              setCurrentPage('terms-of-service');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} className="hover:text-[#123e35] transition-colors cursor-pointer bg-transparent border-none p-0 inline font-semibold">
              Terms of Service
            </button>
            <span>•</span>
            <button onClick={() => {
              setCurrentPage('site-map');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} className="hover:text-[#123e35] transition-colors cursor-pointer font-semibold bg-transparent border-none p-0 inline">Sitemap</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
