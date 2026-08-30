import React from 'react';
import { Page } from '../types';
import { Rocket, Mail, MapPin, Clock, Calendar, Facebook, Youtube } from 'lucide-react';

const XIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface FooterProps {
  setCurrentPage: (page: Page) => void;
}

export default function Footer({ setCurrentPage }: FooterProps) {
  const handleFooterNav = (e: React.MouseEvent, page: Page, path: string) => {
    e.preventDefault();
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
              <div className="pt-2 space-y-3">
              <div className="flex items-center gap-2 text-xs text-[#2d2f2d] font-semibold">
                <Mail className="w-4 h-4 text-[#123e35] shrink-0" aria-hidden="true" />
                <a href="mailto:contact@localsurgeseo.com" className="hover:text-[#bc5f40] transition-colors">
                  contact@localsurgeseo.com
                </a>
              </div>

              {/* Service Area Business Address Block */}
              <div className="pt-3 border-t border-[#dfded4]/65 space-y-1.5 text-[11px] text-[#5c605d] leading-relaxed">
                <p className="font-extrabold text-[#151716] text-xs">Local Surge SEO HQ (Virtual)</p>
                <div className="flex items-start gap-1.5 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#bc5f40] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p>Administration Base: San Jose, CA 95112</p>
                    <p className="text-[#123e35] text-[10px] font-bold">Service Area: United States, Canada & Remote Nationwide</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#888b88]">
                  <Clock className="w-3.5 h-3.5 text-[#bc5f40] shrink-0" aria-hidden="true" />
                  <span>Phone: +1 (909) 707-5075 (VoIP Inbox)</span>
                </div>
                <div className="pt-3 border-t border-[#dfded4]/65 flex gap-3">
                  <a
                    href="https://www.facebook.com/localsurgeseo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white border border-[#e6e4dc] text-[#5c605d] hover:text-[#123e35] hover:border-[#123e35] hover:bg-[#123e35]/5 hover:scale-105 transition-all duration-200"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" aria-hidden="true" />
                  </a>
                  <a
                    href="https://www.youtube.com/@LocalSurgeSEO"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white border border-[#e6e4dc] text-[#5c605d] hover:text-[#bc5f40] hover:border-[#bc5f40] hover:bg-[#bc5f40]/5 hover:scale-105 transition-all duration-200"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-4 h-4" aria-hidden="true" />
                  </a>
                  <a
                    href="https://x.com/localsurgeseo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white border border-[#e6e4dc] text-[#5c605d] hover:text-[#123e35] hover:border-[#123e35] hover:bg-[#123e35]/5 hover:scale-105 transition-all duration-200"
                    aria-label="X (formerly Twitter)"
                  >
                    <XIcon className="w-4 h-4" aria-hidden="true" />
                  </a>
                </div>
                <p className="text-[9px] text-[#888b88] italic pt-2 border-t border-dashed border-[#dfded4]">
                  * Local Surge SEO operates as a Service Area Business (SAB). We consult with our clients virtually and do not maintain a physical walk-in storefront.
                </p>
                <div className="pt-3 border-t border-[#dfded4] flex justify-start">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open('https://www.sitelock.com/verify.php?site=localsurgeseo.com', 'SiteLock', 'width=600,height=600,left=160,top=170');
                    }}
                    className="inline-block hover:opacity-85 transition-opacity"
                    aria-label="Verify SiteLock security certification"
                  >
                    <img 
                      className="h-8 w-auto img-fluid" 
                      alt="SiteLock verified website security seal" 
                      title="SiteLock" 
                      src="https://shield.sitelock.com/shield/localsurgeseo.com" 
                      loading="lazy"
                      decoding="async"
                      width={100}
                      height={32}
                    />
                  </a>
                </div>
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
                <a
                  href="/local-seo"
                  onClick={(e) => handleFooterNav(e, 'local-seo', '/local-seo')}
                  className="hover:text-[#123e35] transition-colors cursor-pointer text-left block"
                >
                  Local SEO Optimization
                </a>
              </li>
              <li>
                <a
                  href="/case-studies"
                  onClick={(e) => handleFooterNav(e, 'case-studies', '/case-studies')}
                  className="hover:text-[#123e35] transition-colors cursor-pointer text-left block"
                >
                  Case Studies & Results
                </a>
              </li>
              <li>
                <a
                  href="/pricing"
                  onClick={(e) => handleFooterNav(e, 'pricing', '/pricing')}
                  className="hover:text-[#123e35] transition-colors cursor-pointer text-left block"
                >
                  Transparent Pricing
                </a>
              </li>
              <li>
                <a
                  href="/seo-tool"
                  onClick={(e) => handleFooterNav(e, 'seo-tool', '/seo-tool')}
                  className="hover:text-[#123e35] transition-colors cursor-pointer text-left block"
                >
                  Free SEO Analysis Tool
                </a>
              </li>
              <li>
                <a
                  href="/why-us"
                  onClick={(e) => handleFooterNav(e, 'why-us', '/why-us')}
                  className="hover:text-[#123e35] transition-colors cursor-pointer text-left block"
                >
                  Why Choose Us
                </a>
              </li>
              <li>
                <a
                  href="/locations"
                  onClick={(e) => handleFooterNav(e, 'locations-index', '/locations')}
                  className="text-[#123e35] font-bold hover:text-[#bc5f40] transition-colors cursor-pointer text-left inline-flex items-center gap-1.5"
                >
                  <span>🗺️ U.S. Locations & Maps</span>
                </a>
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
                <a
                  href="/about"
                  onClick={(e) => handleFooterNav(e, 'about', '/about')}
                  className="hover:text-[#123e35] transition-colors cursor-pointer text-left block"
                >
                  Our Mission & About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => handleFooterNav(e, 'contact', '/contact')}
                  className="hover:text-[#123e35] transition-colors cursor-pointer text-left block"
                >
                  Get in Touch
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  onClick={(e) => handleFooterNav(e, 'blog', '/blog')}
                  className="text-[#123e35] hover:text-[#185246] transition-colors cursor-pointer text-left font-bold flex items-center gap-1"
                >
                  📚 Blog
                </a>
              </li>
              <li>
                <a
                  href="/admin"
                  onClick={(e) => handleFooterNav(e, 'admin', '/admin')}
                  className="text-[#123e35] hover:text-[#185246] transition-colors cursor-pointer text-left font-bold flex items-center gap-1"
                >
                  🏆 Admin Board
                </a>
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
        <div className="border-t border-[#dfded4] mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#545754] font-semibold">
          <div>
            © {new Date().getFullYear()} Local Surge SEO. All rights reserved. Billed monthly, cancel anytime.
          </div>
          <div className="flex gap-4 items-center">
            <a
              href="/privacy-policy"
              onClick={(e) => handleFooterNav(e, 'privacy-policy', '/privacy-policy')}
              className="hover:text-[#123e35] transition-colors cursor-pointer inline font-semibold"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="/terms-of-service"
              onClick={(e) => handleFooterNav(e, 'terms-of-service', '/terms-of-service')}
              className="hover:text-[#123e35] transition-colors cursor-pointer inline font-semibold"
            >
              Terms of Service
            </a>
            <span>•</span>
            <a
              href="/site-map"
              onClick={(e) => handleFooterNav(e, 'site-map', '/site-map')}
              className="hover:text-[#123e35] transition-colors cursor-pointer font-semibold inline"
            >
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
