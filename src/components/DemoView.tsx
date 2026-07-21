import React, { useState, useEffect } from 'react';
import { DemoConfig } from '../types';
import { 
  Phone, Mail, MapPin, CheckCircle2, Star, ShieldCheck, Clock, Award, ChevronRight, Sparkles, X, Send, Globe
} from 'lucide-react';

interface DemoViewProps {
  demoSlug: string;
  onNavigateHome?: () => void;
}

export default function DemoView({ demoSlug, onNavigateHome }: DemoViewProps) {
  const [demo, setDemo] = useState<DemoConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Claim Form state
  const [claimDomain, setClaimDomain] = useState('');
  const [claimTier, setClaimTier] = useState<'free' | 'starter'>('free');
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [submittingClaim, setSubmittingClaim] = useState(false);

  useEffect(() => {
    fetchDemoConfig();
  }, [demoSlug]);

  const fetchDemoConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/outreach/demo/${demoSlug}`);
      if (res.ok) {
        const data = await res.json();
        setDemo(data.demo);
      } else {
        // Build dynamic fallback demo from slug
        const parts = demoSlug.split('-');
        const cleanName = parts.slice(0, Math.max(1, parts.length - 2)).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Local Services';
        const cleanCity = parts.slice(Math.max(1, parts.length - 2)).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'San Jose, CA';

        setDemo({
          slug: demoSlug,
          businessName: cleanName.toUpperCase().includes('PROS') ? cleanName : `${cleanName} Services`,
          niche: 'Local Trade Services',
          location: cleanCity,
          phone: '(408) 555-0192',
          email: `contact@${demoSlug}.com`,
          tagline: `Premier Licensed ${cleanName} in ${cleanCity}`,
          heroHeadline: `Fast, Trusted ${cleanName} in ${cleanCity}`,
          heroSubheadline: `Professional local service available 24/7. Fully licensed, insured, and top-rated by neighborhood homeowners.`,
          services: [
            { title: 'Emergency Service & Repairs', description: 'Immediate 24/7 rapid response for urgent home and commercial needs.' },
            { title: 'Full Inspection & Diagnostics', description: 'Comprehensive diagnostic audits utilizing modern commercial tools.' },
            { title: 'Custom Installation & Setup', description: 'Bespoke installations backed by 100% satisfaction warranties.' },
            { title: 'Preventative Maintenance', description: 'Scheduled maintenance plans to extend lifespan and prevent breakdowns.' }
          ],
          reviews: [
            { author: 'Robert M.', rating: 5, text: 'Fantastic service! Arrived within 30 minutes and resolved our issue completely.' },
            { author: 'Sarah K.', rating: 5, text: 'Honest pricing, polite technicians, and clean work. Highly recommended in our neighborhood!' }
          ]
        });
      }
    } catch (err) {
      console.error('Error loading demo config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demo) return;

    setSubmittingClaim(true);
    try {
      const res = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: claimTier === 'free' ? 'single-page' : 'starter',
          planName: claimTier === 'free' ? 'Single-Page Blast (Free)' : 'Starter Boost ($999/mo)',
          businessName: demo.businessName,
          contactName: `${demo.businessName} Owner`,
          email: demo.email,
          phone: demo.phone,
          website: claimDomain || `https://${demo.slug}.com`,
          hasWebsite: false,
          industry: demo.niche,
          location: demo.location,
          keywords: `${demo.niche} ${demo.location}`,
          hasGBP: false
        })
      });

      if (res.ok) {
        setClaimSubmitted(true);
      }
    } catch (err) {
      console.error('Error claiming site:', err);
    } finally {
      setSubmittingClaim(false);
    }
  };

  if (loading || !demo) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-[#123e35] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-[#123e35]">Loading Pre-Built Storefront Preview...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#faf9f6] min-h-screen text-[#1a1c1a] font-sans antialiased">
      {/* Sticky Claim & Upsell Banner */}
      <div className="sticky top-0 z-50 bg-[#123e35] text-white py-3 px-4 shadow-md border-b-2 border-[#bc5f40]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="bg-[#bc5f40] text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
              FREE PRE-BUILT DEMO
            </span>
            <p className="text-xs font-semibold">
              This site was pre-built for <strong className="text-white font-extrabold">{demo.businessName}</strong> in {demo.location}!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowClaimModal(true)}
              className="px-4 py-1.5 bg-[#bc5f40] hover:bg-[#cf6d4e] text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Claim Free Website
            </button>
            <button
              onClick={() => setShowClaimModal(true)}
              className="hidden md:flex items-center gap-1 text-xs text-[#dfded4] hover:text-white font-bold cursor-pointer underline underline-offset-2"
            >
              Or Add $999/mo Google Maps Ranking →
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="bg-white border-b border-[#dfded4] py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#123e35]" />
            <div>
              <h1 className="font-extrabold text-base text-[#151716] leading-none">{demo.businessName}</h1>
              <p className="text-[11px] text-[#888b88] font-medium">{demo.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-[#151716]">
            <a href={`tel:${demo.phone}`} className="flex items-center gap-1.5 bg-[#eff4f1] text-[#123e35] px-3.5 py-2 rounded-xl border border-[#dfded4]">
              <Phone className="w-3.5 h-3.5" /> Call {demo.phone}
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-[#f7f6f2] py-16 px-6 border-b border-[#dfded4]">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#123e35]/10 text-[#123e35] border border-[#123e35]/20">
            <Award className="w-3.5 h-3.5" /> Top-Rated {demo.niche} in {demo.location}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#151716] tracking-tight leading-tight">
            {demo.heroHeadline}
          </h2>
          <p className="text-sm sm:text-base text-[#4e524f] max-w-2xl mx-auto font-medium leading-relaxed">
            {demo.heroSubheadline}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href={`tel:${demo.phone}`}
              className="px-6 py-3 bg-[#123e35] hover:bg-[#0d2e27] text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Phone className="w-4 h-4" /> Call Now: {demo.phone}
            </a>
            <button
              onClick={() => setShowClaimModal(true)}
              className="px-6 py-3 bg-[#bc5f40] hover:bg-[#cf6d4e] text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Claim Free Storefront
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black text-[#151716]">Our Specialized Services</h3>
          <p className="text-xs text-[#4e524f]">Serving residential and commercial clients across {demo.location}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {demo.services.map((svc, idx) => (
            <div key={idx} className="bg-white border border-[#dfded4] p-6 rounded-2xl space-y-3 hover:shadow-xs transition">
              <div className="w-10 h-10 rounded-xl bg-[#eff4f1] text-[#123e35] flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5 text-[#123e35]" />
              </div>
              <h4 className="font-bold text-base text-[#151716]">{svc.title}</h4>
              <p className="text-xs text-[#4e524f] leading-relaxed">{svc.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-white py-16 px-6 border-y border-[#dfded4]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-[#151716]">Client Feedback & Ratings</h3>
            <p className="text-xs text-[#4e524f]">Verified local reviews in {demo.location}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demo.reviews.map((rev, idx) => (
              <div key={idx} className="bg-[#faf9f6] border border-[#dfded4] p-6 rounded-2xl space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-[#1a1c1a] italic font-medium leading-relaxed">"{rev.text}"</p>
                <p className="text-xs font-bold text-[#123e35]">— {rev.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#123e35] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h4 className="font-bold text-lg">{demo.businessName}</h4>
            <p className="text-xs text-[#dfded4] mt-1">Free Single-Page Website Demo &bull; Powered by Local Surge SEO</p>
          </div>
          <button
            onClick={() => setShowClaimModal(true)}
            className="px-6 py-2.5 bg-[#bc5f40] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#cf6d4e] transition cursor-pointer"
          >
            Claim Free Website Now
          </button>
        </div>
      </footer>

      {/* Claim & Upgrade Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#dfded4] rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#dfded4] pb-4">
              <div>
                <h3 className="text-base font-black text-[#151716]">
                  Claim Your Free Website: {demo.businessName}
                </h3>
                <p className="text-xs text-[#888b88]">Zero setup cost. Get your business live in 24 hours.</p>
              </div>
              <button onClick={() => setShowClaimModal(false)} className="text-[#888b88] hover:text-[#151716] font-bold cursor-pointer">✕</button>
            </div>

            {claimSubmitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-black text-[#151716]">Website Claim Authorized!</h4>
                <p className="text-xs text-[#4e524f] max-w-md mx-auto">
                  Our engineers have received your claim request for <strong>{demo.businessName}</strong>. We will contact you at <strong>{demo.email}</strong> to connect your domain.
                </p>
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="mt-4 px-6 py-2.5 bg-[#123e35] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close & View Preview
                </button>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#151716] mb-1">Select Your Program</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setClaimTier('free')}
                      className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                        claimTier === 'free'
                          ? 'border-[#123e35] bg-[#eff4f1] font-bold text-[#123e35]'
                          : 'border-[#dfded4] bg-white text-[#4e524f]'
                      }`}
                    >
                      <div className="font-extrabold">Single-Page Blast</div>
                      <div className="text-[11px] font-mono text-[#bc5f40]">$0 / Free Forever</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setClaimTier('starter')}
                      className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                        claimTier === 'starter'
                          ? 'border-[#123e35] bg-[#eff4f1] font-bold text-[#123e35]'
                          : 'border-[#dfded4] bg-white text-[#4e524f]'
                      }`}
                    >
                      <div className="font-extrabold">Starter Maps Boost</div>
                      <div className="text-[11px] font-mono text-[#123e35]">$999 / month</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#151716] mb-1">Custom Domain Name (Optional)</label>
                  <input
                    type="text"
                    value={claimDomain}
                    onChange={e => setClaimDomain(e.target.value)}
                    placeholder="e.g. www.apexservicepros.com"
                    className="w-full px-3 py-2 text-xs border border-[#dfded4] rounded-xl focus:outline-none focus:border-[#123e35] bg-[#faf9f6]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#dfded4]">
                  <button
                    type="button"
                    onClick={() => setShowClaimModal(false)}
                    className="px-4 py-2 text-xs font-bold bg-[#f7f6f2] hover:bg-[#e8e7e1] text-[#151716] rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingClaim}
                    className="px-6 py-2 text-xs font-bold bg-[#bc5f40] hover:bg-[#cf6d4e] text-white rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {submittingClaim ? 'Submitting...' : 'Authorize Free Site Claim'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
