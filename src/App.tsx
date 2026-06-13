import React, { useState, useEffect, useRef } from 'react';
import { Page, Plan, Lead, SEOAuditResult } from './types';
import { jsPDF } from 'jspdf';
import Header from './components/Header';
import Footer from './components/Footer';
import OnboardingWizard from './components/OnboardingWizard';
import LeadDashboard from './components/LeadDashboard';
import BlogView from './components/BlogView';
import SitemapView from './components/SitemapView';
import SeoHomeTool from './components/SeoHomeTool';
import AdminLoginForm from './components/AdminLoginForm';
import LocalSeoView from './components/LocalSeoView';
import LocalDirectoryTool from './components/LocalDirectoryTool';
import CaliforniaView from './components/CaliforniaView';
import LosAngelesSeoView from './components/LosAngelesSeoView';
import DirectoryView from './components/DirectoryView';
import SchemaMarkup from './components/SchemaMarkup';
import { 
  Rocket, BarChart3, Users, Landmark, Contact, Sparkles, Check, ChevronRight, 
  ArrowRight, ShieldCheck, Mail, MapPin, Clock, Search, MessageSquare, AlertCircle, Quote, Star,
  TrendingUp, Globe, CheckSquare, Zap, ExternalLink, HelpCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Pricing packages
const PLANS: Plan[] = [
  {
    id: 'single-page',
    name: 'Single-Page Blast',
    price: 0,
    period: 'monthly',
    description: 'Perfect for local contractors or service specialists needing an instant, highly-optimized digital storefront.',
    features: [
      'Professional Single-Page Website',
      'Mobile-Responsive Design',
      'Basic On-Page SEO Setup',
      'Fast Cloud-Hosted Payload',
      'Secure SSL Certificate Enabled',
      'Domain Setup (Domain cost excluded)'
    ]
  },
  {
    id: 'starter',
    name: 'Starter Boost',
    price: 999,
    period: 'monthly',
    description: 'Empowers local brick-and-mortar storefronts to capture neighborhood search intent and drive foot traffic.',
    features: [
      'Google Business Profile Setup & Sync',
      'Local Keyword Research (10 Terms)',
      'On-Page Local SEO Basics',
      'Lead Generation Contact Form',
      'Top 20 Local Citation Syndications',
      'Monthly Search Performance Report'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium Surge',
    price: 1999,
    period: 'monthly',
    description: 'Comprehensive domination blueprint designed to crush surrounding local competition and secure high-intent search share.',
    features: [
      'Everything in Starter Boost, Plus:',
      'Comprehensive Website Content Strategy',
      'High-Authority Citation Backlinks',
      '4 Geo-Targeted Blog Posts / Month',
      'Localized Service Schema Embeds',
      'Bi-Weekly Strategy Coordination Calls',
      'Dedicated Local SEO Account Lead'
    ]
  }
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [activeArticleSlug, setActiveArticleSlug] = useState<string | null>(null);
  const [activeStateSlug, setActiveStateSlug] = useState<string | null>(null);
  const [activeCitySlug, setActiveCitySlug] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Address Bar Routing and Synchronizer
  useEffect(() => {
    const getPageFromPath = (pathname: string): { 
      page: Page; 
      stateSlug: string | null; 
      citySlug: string | null; 
      blogSlug: string | null;
    } => {
      const cleanPath = pathname.replace(/\/+$/, '');
      if (cleanPath === '' || cleanPath === '/') return { page: 'home', stateSlug: null, citySlug: null, blogSlug: null };
      if (cleanPath === '/about') return { page: 'about', stateSlug: null, citySlug: null, blogSlug: null };
      if (cleanPath === '/why-us') return { page: 'why-us', stateSlug: null, citySlug: null, blogSlug: null };
      if (cleanPath === '/local-seo') return { page: 'local-seo', stateSlug: null, citySlug: null, blogSlug: null };
      if (cleanPath === '/pricing') return { page: 'pricing', stateSlug: null, citySlug: null, blogSlug: null };
      if (cleanPath === '/seo-tool') return { page: 'seo-tool', stateSlug: null, citySlug: null, blogSlug: null };
      if (cleanPath === '/contact') return { page: 'contact', stateSlug: null, citySlug: null, blogSlug: null };
      if (cleanPath === '/admin' || cleanPath === '/admin/dashboard') return { page: 'admin', stateSlug: null, citySlug: null, blogSlug: null };
      if (cleanPath === '/site-map') return { page: 'site-map', stateSlug: null, citySlug: null, blogSlug: null };
      if (cleanPath === '/california') return { page: 'california', stateSlug: null, citySlug: null, blogSlug: null };
      if (cleanPath === '/los-angeles-seo') return { page: 'los-angeles-seo', stateSlug: null, citySlug: null, blogSlug: null };
      if (cleanPath === '/blog') return { page: 'blog', stateSlug: null, citySlug: null, blogSlug: null };
      if (cleanPath.startsWith('/blog/')) {
        const slug = cleanPath.slice(6);
        return { page: 'blog', stateSlug: null, citySlug: null, blogSlug: slug };
      }

      // Check dynamic state or city paths
      const parts = cleanPath.split('/').filter(Boolean);
      const knownStates = ['california', 'texas', 'arizona', 'florida'];
      
      if (parts.length === 1 && knownStates.includes(parts[0])) {
        if (parts[0] === 'california') {
          return { page: 'california', stateSlug: null, citySlug: null, blogSlug: null };
        }
        return { page: 'state-seo', stateSlug: parts[0], citySlug: null, blogSlug: null };
      }

      if (parts.length === 2 && knownStates.includes(parts[0])) {
        if (parts[1] === 'los-angeles-seo') {
          return { page: 'los-angeles-seo', stateSlug: null, citySlug: null, blogSlug: null };
        }
        return { page: 'city-seo', stateSlug: parts[0], citySlug: parts[1], blogSlug: null };
      }

      return { page: 'home', stateSlug: null, citySlug: null, blogSlug: null };
    };

    // Load initial URL
    const { page, stateSlug, citySlug, blogSlug } = getPageFromPath(window.location.pathname);
    setCurrentPage(page);
    setActiveStateSlug(stateSlug);
    setActiveCitySlug(citySlug);
    setActiveArticleSlug(blogSlug);

    // Track Back/Forward
    const handlePopState = () => {
      const { page, stateSlug, citySlug, blogSlug } = getPageFromPath(window.location.pathname);
      setCurrentPage(page);
      setActiveStateSlug(stateSlug);
      setActiveCitySlug(citySlug);
      setActiveArticleSlug(blogSlug);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Sync state updates back to address bar path
  useEffect(() => {
    let path = '/';
    if (currentPage === 'about') path = '/about';
    else if (currentPage === 'why-us') path = '/why-us';
    else if (currentPage === 'local-seo') path = '/local-seo';
    else if (currentPage === 'pricing') path = '/pricing';
    else if (currentPage === 'seo-tool') path = '/seo-tool';
    else if (currentPage === 'contact') path = '/contact';
    else if (currentPage === 'admin') path = '/admin/dashboard';
    else if (currentPage === 'site-map') path = '/site-map';
    else if (currentPage === 'california') path = '/california';
    else if (currentPage === 'los-angeles-seo') path = '/los-angeles-seo';
    else if (currentPage === 'blog') {
      path = activeArticleSlug ? `/blog/${activeArticleSlug}` : '/blog';
    } else if (currentPage === 'state-seo') {
      path = activeStateSlug ? `/${activeStateSlug}` : '/site-map';
    } else if (currentPage === 'city-seo') {
      path = (activeStateSlug && activeCitySlug) ? `/${activeStateSlug}/${activeCitySlug}` : '/site-map';
    }

    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, [currentPage, activeArticleSlug, activeStateSlug, activeCitySlug]);

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPage, activeArticleSlug, activeStateSlug, activeCitySlug]);

  // Private Admin access credentials management
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('isAdminLoggedIn') === 'true';
  });

  // Dynamic Noindex Metadata to deny robots crawl indexing and tracking on /admin/dashboard
  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (currentPage === 'admin') {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else {
      if (robotsMeta) {
        robotsMeta.remove();
      }
    }
  }, [currentPage]);

  // Onboarding Wizard controls
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [preselectedPlan, setPreselectedPlan] = useState<Plan | null>(null);
  const [selectedPricingPlanId, setSelectedPricingPlanId] = useState<string>('single-page');

  // SEO Tool states
  const [toolUrl, setToolUrl] = useState('');
  const [toolNiche, setToolNiche] = useState('Plumbing & Rooter');
  const [toolLocation, setToolLocation] = useState('San Jose, CA');
  const [toolLoading, setToolLoading] = useState(false);
  const [toolResult, setToolResult] = useState<SEOAuditResult | null>(null);
  const [scannedCityDirectories, setScannedCityDirectories] = useState<{name: string, rating: number, status: string}[]>([]);

  // Homepage redirect & auto-analyze state
  const [homePrefilledUrl, setHomePrefilledUrl] = useState('');
  const [homeAutoAnalyze, setHomeAutoAnalyze] = useState(false);

  const handleAnalyzeFromHome = (url: string) => {
    setHomePrefilledUrl(url);
    setHomeAutoAnalyze(true);
    setCurrentPage('seo-tool');
  };

  // Simple Contact form states
  const [cntName, setCntName] = useState('');
  const [cntEmail, setCntEmail] = useState('');
  const [cntMessage, setCntMessage] = useState('');
  const [cntSubject, setCntSubject] = useState('');
  const [cntPlan, setCntPlan] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [shouldBlinkNameInput, setShouldBlinkNameInput] = useState(false);

  // Track previous page to manage pre-selecting "Preferred Growth Tier" in contact form
  const prevPageRef = useRef<Page>('home');

  useEffect(() => {
    if (currentPage === 'contact') {
      if (prevPageRef.current === 'pricing' && selectedPricingPlanId) {
        // If navigating from pricing, pre-select the currently selected pricing tier ID
        setCntPlan(selectedPricingPlanId);
      }
    }
    // Update the ref after assessing the transition
    prevPageRef.current = currentPage;
  }, [currentPage, selectedPricingPlanId]);

  // Fetch leads on mount
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  const handleOpenOnboarding = (plan: Plan | null = null) => {
    if (plan) {
      handleSelectPlanAndNavigate(plan.id);
    } else {
      handleSelectPlanAndNavigate('single-page');
    }
  };

  const handleGetFreeStrategy = () => {
    setCurrentPage('pricing');
    setSelectedPricingPlanId('single-page');
    const freePlan = PLANS.find(p => p.id === 'single-page') || null;
    setPreselectedPlan(freePlan);
  };

  const handleLeadSubmitted = (newLead: Lead) => {
    // Refresh admin dashboard leads
    fetchLeads();
    // Auto-navigate to home page to reveal dashboard results if requested,
    // but the OnboardingWizard will handle success rendering internally
  };

  // Run SEO Audit Tool
  const runSeoToolAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolUrl.trim()) return;

    setToolLoading(true);
    setToolResult(null);

    try {
      const response = await fetch('/api/seo-tool/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: toolUrl,
          niche: toolNiche,
          location: toolLocation
        })
      });

      if (response.ok) {
        const data = await response.json();
        setToolResult(data);

        // Populate beautiful local directories listing simulating competitive footprint
        const sampleCompetitors = [
          { name: `${toolNiche} Experts ${toolLocation.split(',')[0]}`, rating: 4.8, status: 'Top Rated • 142 Reviews' },
          { name: `Reliable ${toolNiche.split(' ')[0]} Specialist`, rating: 4.5, status: 'Standard • 42 Reviews' },
          { name: `All-Star Local ${toolNiche.split('&')[0]} Inc.`, rating: 4.2, status: 'Under-optimized • 19 Reviews' },
        ];
        setScannedCityDirectories(sampleCompetitors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToolLoading(false);
    }
  };

  const handleGeneratePDF = (planId: string, name: string, email: string): string => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Primary Colors
    const pTeal = [18, 62, 53];    // #123e35
    const aOrange = [188, 95, 64]; // #bc5f40
    const nDark = [26, 28, 26];    // #1a1c1a
    const nLight = [136, 139, 136]; // #888b88

    // Header Banner
    doc.setFillColor(pTeal[0], pTeal[1], pTeal[2]);
    doc.rect(0, 0, 210, 38, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('LOCAL SURGE SEO', 15, 15);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('High-Performance Web Design & Local SEO Suite', 15, 22);
    doc.text('https://localsurgeseo.com | contact@localsurgeseo.com', 15, 27);

    // Accent Line
    doc.setFillColor(aOrange[0], aOrange[1], aOrange[2]);
    doc.rect(0, 35, 210, 3, 'F');

    // Metadata Row
    doc.setTextColor(nDark[0], nDark[1], nDark[2]);
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text('OFFICIAL GROWTH STRATEGY BRIEF', 15, 52);

    doc.setFontSize(9);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(nLight[0], nLight[1], nLight[2]);
    const refCode = `LSS-${(planId || 'CUSTOM').toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    doc.text(`Doc Reference: ${refCode}`, 15, 58);
    doc.text(`Generated On: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 15, 14); // wait let's use 63
    doc.text(`Generated On: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 15, 63);

    // Client Panel
    doc.setFillColor(247, 246, 242);
    doc.rect(15, 68, 180, 22, 'F');
    doc.setDrawColor(223, 222, 212);
    doc.rect(15, 68, 180, 22, 'D');

    doc.setTextColor(pTeal[0], pTeal[1], pTeal[2]);
    doc.setFont('Helvetica', 'bold');
    doc.text('PREPARED FOR:', 19, 73);
    doc.setTextColor(nDark[0], nDark[1], nDark[2]);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Client Contact Name: ${name}`, 19, 78);
    doc.text(`Contact Email Address: ${email}`, 19, 83);

    // Plan-specific info lookup
    let planTitle = '';
    let planPrice = '';
    let estTimeline = '';
    let deliverables: string[] = [];
    let actions: string[] = [];

    if (planId === 'single-page') {
      planTitle = 'Single-Page Blast (Free Plan)';
      planPrice = '$0 / Free Promotion';
      estTimeline = '2 - 3 Business Days to Live Sandbox';
      deliverables = [
        'Premium Single-Page Fast Storefront Website Design',
        'Fully Responsive & Mobile-Optimized Layout Structure',
        'On-Page Local SEO Setup (Keywords, Heading hierarchies)',
        'Ultra-Fast secure Cloud-Hosted Payload hosting',
        'Secure SSL Certificate configuration & active mapping',
        'Bespoke Domain Name Pointer Routing (Domain purchase separate)'
      ];
      actions = [
        'Secure standard location info, target keywords, business description & graphics.',
        'Bootstrap highly optimized sandbox layout draft & share staging address.',
        'Gather direct customer design reviews and execute final refinements.',
        'Activate DNS primary domains records and propagate web-wide.'
      ];
    } else if (planId === 'starter') {
      planTitle = 'Starter Boost Plan';
      planPrice = '$999 / month';
      estTimeline = '1 - 2 Weeks Core Onboarding & Sync';
      deliverables = [
        'Google Business Profile (GBP) deep synchronization & setup verification',
        'High-converting, action-oriented Lead Form integration & coding',
        'Comprehensive Localized Keyword Research covering 10 major buyer terms',
        'Top 20 absolute primary Directory Citation syndications (Apple, MapQuest, Yelp)',
        'Basic On-Page Geographic Silos tuning and local metadata markup',
        'Monthly search rankings dashboard and phone-tap tracking reports'
      ];
      actions = [
        'Grant Manager access delegation for existing or new Google Business Profile.',
        'Define key physical service regions, target zip codes, and hours parameters.',
        'Scrub and eliminate redundant, mismatched historical NAP directory citations.',
        'Trigger automated keyword ranking monitors for active regional status assessment.'
      ];
    } else if (planId === 'premium') {
      planTitle = 'Premium Surge Plan';
      planPrice = '$1,999 / month';
      estTimeline = 'Weekly Milestones & Priority Direct Account Management';
      deliverables = [
        'Everything in Starter Boost (All map rankings services included)',
        'Interactive, rich LocalBusiness Schema Markup installations (JSON-LD)',
        'High-authority regional niche backlinking for accelerated ranking growth',
        '4 custom geo-targeted Local Industry Blog Articles published monthly',
        'Bespoke multi-page expansion silo content strategy mapping',
        'Dedicated senior Local SEO Account Representative',
        'Bi-weekly Strategy Alignment calls and priority workflow status'
      ];
      actions = [
        'Identify main point-of-contact for bi-weekly collaboration briefings.',
        'Establish direct integration links for Google Search Console (GSC) and analytics.',
        'Publish optimized initial geo-targeted campaign outline for content approval.',
        'Produce robust geographic competitor rankings grid review.'
      ];
    } else {
      planTitle = 'Custom Configuration / Enterprise Setup';
      planPrice = 'Bespoke Quote Pending Custom Formulation';
      estTimeline = 'Bespoke Schedule Based on Multi-City Scope';
      deliverables = [
        'Bespoke multi-location regional strategy structuring & silos setup',
        'Enterprise-grade multi-page location directories architecture matching 10+ cities',
        'Custom local schema template configurations & advanced page load speed tuning',
        'Tailored high-volume citation audits and priority Google Maps troubleshooting',
        'Omnichannel search marketing reports for headquarters & branch partners'
      ];
      actions = [
        'Conduct priority 1-on-1 strategy meeting with local search director.',
        'Map out expansion cities, operational zip codes, and priority locations.',
        'Draft a formal, custom full-stack Scope of Work (SOW).'
      ];
    }

    // Growth Plan Header
    doc.setTextColor(pTeal[0], pTeal[1], pTeal[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('CHOSEN GROWTH BLUEPRINT SUMMARY', 15, 98);

    doc.setFillColor(239, 244, 241); // brand light green tint
    doc.rect(15, 102, 180, 16, 'F');
    doc.rect(15, 102, 180, 16, 'D');

    doc.setTextColor(nDark[0], nDark[1], nDark[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Growth Tier: ${planTitle}`, 19, 108);
    doc.text(`Subscription: ${planPrice}`, 19, 113);
    doc.text(`Timeline: ${estTimeline}`, 110, 108);

    // Deliverables List
    doc.setTextColor(pTeal[0], pTeal[1], pTeal[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DELIVERABLES AND SERVICES INCLUDED WITH PLAN:', 15, 126);

    doc.setTextColor(nDark[0], nDark[1], nDark[2]);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    let y = 132;
    deliverables.forEach((item) => {
      // Small bullet
      doc.setFillColor(aOrange[0], aOrange[1], aOrange[2]);
      doc.circle(18, y - 1.2, 1, 'F');
      
      // Text
      doc.text(item, 23, y);
      y += 6.5;
    });

    // Next actions & Timeline
    y += 3;
    doc.setTextColor(pTeal[0], pTeal[1], pTeal[2]);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('IMMEDIATE ONBOARDING TIMELINE & NEXT ACTIONS:', 15, y);

    doc.setTextColor(nDark[0], nDark[1], nDark[2]);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    y += 6;
    actions.forEach((item, index) => {
      // Step Number
      doc.setTextColor(aOrange[0], aOrange[1], aOrange[2]);
      doc.setFont('Helvetica', 'bold');
      doc.text(`${index + 1}.`, 15, y);

      // Text block wrapped
      doc.setTextColor(nDark[0], nDark[1], nDark[2]);
      doc.setFont('Helvetica', 'normal');
      const lines = doc.splitTextToSize(item, 170);
      doc.text(lines, 23, y);
      y += (lines.length * 5) + 1.5;
    });

    // Footer Block
    doc.setFillColor(pTeal[0], pTeal[1], pTeal[2]);
    doc.rect(0, 282, 210, 15, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('Local Surge SEO is powered by verified regional data science. Our engineers have been alerted of your brief.', 15, 289);
    doc.text('Page 1 of 1', 185, 289);

    // Save filename
    doc.save(`Local_Surge_SEO_${planTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Strategy.pdf`);

    // Output base64 dataURI string and return the raw base64 segment
    const dataUri = doc.output('datauristring');
    return dataUri.split(',')[1] || '';
  };

  const handleSelectPlanAndNavigate = (planId: string) => {
    setCntPlan(planId);
    setSelectedPricingPlanId(planId);
    setCurrentPage('contact');
    setShouldBlinkNameInput(true);

    if (planId === 'single-page') {
      setCntSubject('Inquiry: Single-Page Blast (Free)');
      setCntMessage('Hello Local Surge Team, I would like to lock in my free Single-Page Blast storefront website and start my localized SEO setup.');
    } else if (planId === 'starter') {
      setCntSubject('Inquiry: Starter Boost ($999/mo)');
      setCntMessage('Hello Local Surge Team, I want to subscribe to the Starter Boost plan to synchronize my Google Business Profile and capture neighborhood search intent.');
    } else if (planId === 'premium') {
      setCntSubject('Inquiry: Premium Surge ($1999/mo)');
      setCntMessage('Hello Local Surge Team, I want to secure the Premium Surge local domination package to crush our local competition and build a content authority campaign.');
    } else if (planId === 'custom') {
      setCntSubject('Inquiry: Custom Configuration');
      setCntMessage('Hello Local Surge Team, I am interested in building a tailored enterprise or multi-city local SEO package.');
    }

    setTimeout(() => {
      const element = document.getElementById('manual-inquiry-container');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const inputElement = document.getElementById('cnt-full-name-input') as HTMLInputElement | null;
      if (inputElement) {
        inputElement.focus();
      }
    }, 150);

    // Stop blinking after 3 seconds
    setTimeout(() => {
      setShouldBlinkNameInput(false);
    }, 3000);
  };

  // Manual prefilled navigate from pricing custom links
  const handlePricingPrefillContact = (planName: string) => {
    handleSelectPlanAndNavigate('custom');
  };

  const handleContactOfficeClick = () => {
    setCurrentPage('contact');
    setTimeout(() => {
      const element = document.getElementById('manual-inquiry-container');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cntEmail.trim() || !cntName.trim()) return;

    // Immediately generate and download the PDF brief, capturing the base64 output
    const selectedPlanId = cntPlan || 'custom';
    const pdfBase64 = handleGeneratePDF(selectedPlanId, cntName, cntEmail);

    setContactSuccess(true);

    // Mimic API lead input as well
    const customLead: any = {
      planId: selectedPlanId,
      planName: PLANS.find(p => p.id === selectedPlanId)?.name || 'Custom Message',
      businessName: `${cntName}'s Enterprise`,
      contactName: cntName,
      email: cntEmail,
      phone: 'Not provided',
      website: '',
      hasWebsite: false,
      industry: 'Custom Inquiry',
      location: 'Request Location',
      keywords: cntMessage || 'Requested plan selection via Contact',
      hasGBP: false,
      pdfBase64: pdfBase64
    };

    try {
      await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customLead)
      });
      fetchLeads();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#1a1c1a] flex flex-col font-sans select-none antialiased">
      {/* Search Engine Structured JSON-LD Markup */}
      <SchemaMarkup
        currentPage={currentPage}
        activeArticleSlug={activeArticleSlug}
        activeStateSlug={activeStateSlug}
        activeCitySlug={activeCitySlug}
        plans={PLANS}
      />

      {/* Dynamic Header */}
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        onOpenOnboarding={handleGetFreeStrategy} 
      />

      {/* Main viewport */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {/* HOME SCREEN */}
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-16 lg:space-y-24 pb-20"
            >
              {/* Hero Section */}
              <section id="hero-section" className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 bg-[#faf9f6]/90 overflow-hidden border-b border-[#e6e4dc]">
                <div className="absolute inset-0 z-0 opacity-20">
                  <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[#123e35]/5 blur-3xl" />
                  <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-[#bc5f40]/5 blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Hero Left Content */}
                    <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-[#123e35]/10 border border-[#123e35]/15 text-[#123e35] text-xs font-bold font-mono tracking-wide uppercase">
                        <Sparkles className="w-3.5 h-3.5" />
                        Next-Gen Local SEO Domination
                      </div>
                      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display text-[#151716] tracking-tight leading-tight">
                        Dominate Your <br className="hidden sm:inline" />
                        <span className="text-[#bc5f40]">Local Market</span>
                      </h1>
                      <p className="text-sm sm:text-base text-[#4e524f] font-medium max-w-xl leading-relaxed">
                        Local Surge boosts your website's organic neighborhood traffic, connecting you with high-intent regional buyers. Stop losing valuable local business.
                      </p>
                      
                      <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <button
                          onClick={() => {
                            setCurrentPage('pricing');
                            setSelectedPricingPlanId('single-page');
                          }}
                          className="bg-[#123e35] hover:bg-[#185246] text-[#fbfaf8] text-sm font-bold px-7 py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 duration-200 shadow-sm"
                        >
                          Get Free Strategy
                          <ArrowRight className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Hero Right Widget Preview */}
                    <div className="lg:col-span-5 relative">
                      <SeoHomeTool 
                        onOpenOnboarding={() => setCurrentPage('contact')} 
                        hideTitle={true} 
                        isHomePage={true}
                        onAnalyzeFromHome={handleAnalyzeFromHome}
                      />
                    </div>

                  </div>
                </div>
              </section>

              {/* Service Features Block */}
              <section id="services-block" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#bc5f40] font-mono">
                    How We Boost Your Reach
                  </h2>
                  <h3 className="text-3xl sm:text-4xl font-black font-display text-[#151716] tracking-tight leading-none">
                    Uncompromising Local SEO Execution
                  </h3>
                  <p className="text-[#4e524f] font-medium text-sm sm:text-base leading-relaxed">
                    We provide a comprehensive suite of digital SEO engines designed exclusively to elevate your local footprint and generate pre-onboarded buyer inquiries.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 sm:mt-16">
                  {/* Service 1 */}
                  <div className="bg-white border border-[#dfded4] shadow-sm rounded-2xl p-6.5 hover:border-[#123e35]/30 hover:shadow-md transition-all duration-300 group">
                    <div className="w-12 h-12 bg-[#123e35]/10 text-[#123e35] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6 text-[#123e35]" />
                    </div>
                    <h4 className="font-extrabold text-lg text-[#151716] group-hover:text-[#bc5f40] transition-colors">
                      Google Maps & GBP Dominance
                    </h4>
                    <p className="text-xs sm:text-sm text-[#4e524f] leading-relaxed mt-3 font-medium">
                      Optimize your local presence to capture customers directly. We focus on Google Business Profile configurations, NAP (Name, Address, Phone) consistency, and structured regional citations.
                    </p>
                  </div>

                  {/* Service 2 */}
                  <div className="bg-white border border-[#dfded4] shadow-sm rounded-2xl p-6.5 hover:border-[#123e35]/30 hover:shadow-md transition-all duration-300 group">
                    <div className="w-12 h-12 bg-[#123e35]/10 text-[#123e35] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Globe className="w-6 h-6 text-[#123e35]" />
                    </div>
                    <h4 className="font-extrabold text-lg text-[#151716] group-hover:text-[#bc5f40] transition-colors">
                      Technical & On-Page Keyword Injectors
                    </h4>
                    <p className="text-xs sm:text-sm text-[#4e524f] leading-relaxed mt-3 font-medium">
                      Improve your website content, payload latency, metadata structures, and heading levels. We lay high-context semantic schema tags so crawl bots reward you with primary top-spots.
                    </p>
                  </div>

                  {/* Service 3 */}
                  <div className="bg-white border border-[#dfded4] shadow-sm rounded-2xl p-6.5 hover:border-[#123e35]/30 hover:shadow-md transition-all duration-300 group">
                    <div className="w-12 h-12 bg-[#123e35]/10 text-[#123e35] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <CheckSquare className="w-6 h-6 text-[#123e35]" />
                    </div>
                    <h4 className="font-extrabold text-lg text-[#151716] group-hover:text-[#bc5f40] transition-colors">
                      Authority Content & Strategy
                    </h4>
                    <p className="text-xs sm:text-sm text-[#4e524f] leading-relaxed mt-3 font-medium">
                      Engage your surrounding neighbors with rich content and reviews workflows. We implement consistent localized blogging assets that establish you as the immediate community authority.
                    </p>
                  </div>
                </div>
              </section>

              {/* Testimonials Slider */}
              <section id="testimonials-block" className="bg-[#faf9f6]/80 border-t border-b border-[#dfded4] py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
                    <h4 className="text-xs font-bold tracking-widest text-[#bc5f40] font-mono uppercase">Client Stories</h4>
                    <h3 className="text-2xl sm:text-3xl font-black font-display text-[#151716]">Proven organic surges in local neighborhood business</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Testimonial 1 */}
                    <div className="bg-white border border-[#dfded4] p-6.5 rounded-2xl relative shadow-xs flex flex-col justify-between hover:border-[#bc5f40]/40 transition-colors">
                      <div className="space-y-4">
                        <div className="flex gap-1 text-[#bc5f40]">
                          {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#bc5f40] text-[#bc5f40]" />)}
                        </div>
                        <p className="text-sm text-[#1a1c1a] italic font-medium leading-relaxed">
                          "We were practically invisible on Google Maps in Denver. After setting up our GBP and local citation sync with Local Surge, our intake went from 4 organic inquiries a week to almost 20. It completely transformed our plumbing schedules!"
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#f2f0ea]">
                        <div className="w-10 h-10 rounded bg-[#f7f6f2] font-display font-bold text-[#123e35] flex items-center justify-center text-xs border border-[#dfded4]">KR</div>
                        <div>
                           <span className="block text-xs font-extrabold text-[#151716] leading-none">Kevin Reynolds</span>
                           <span className="block text-[10px] text-[#888b88] font-bold mt-1">Elite Plumbing Denver, Owner</span>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="bg-white border border-[#dfded4] p-6.5 rounded-2xl relative shadow-xs flex flex-col justify-between hover:border-[#bc5f40]/40 transition-colors">
                      <div className="space-y-4">
                        <div className="flex gap-1 text-[#bc5f40]">
                          {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#bc5f40] text-[#bc5f40]" />)}
                        </div>
                        <p className="text-sm text-[#1a1c1a] italic font-medium leading-relaxed">
                          "They didn't push us into a complicated system or lock us into long-term contracts. The manual qualification call made us super comfortable, and they deployed our optimized homepage schema in just 3 days."
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#f2f0ea]">
                        <div className="w-10 h-10 rounded bg-[#f7f6f2] font-display font-bold text-[#123e35] flex items-center justify-center text-xs border border-[#dfded4]">SK</div>
                        <div>
                          <span className="block text-xs font-extrabold text-[#151716] leading-none">Dr. Sarah Kim</span>
                          <span className="block text-[10px] text-[#888b88] font-bold mt-1">Luminate Dental Care, Lead Dentist</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Ready to Surge CTA Section */}
              <section id="cta-block" className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="bg-[#123e35] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden text-center space-y-6 shadow-md border border-[#0f342e]">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#bc5f40]/10 rounded-full blur-3xl" />

                  <h3 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight text-white">Ready to Surge Ahead of your Local Competition?</h3>
                  <p className="text-slate-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-semibold">
                    Let's work together to unlock your local business's true organic potential. Get in touch or build your customized strategy audit to instantly discover neighborhood keyword opportunities.
                  </p>
                  
                  <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleContactOfficeClick}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/10 text-sm font-bold px-7 py-4 rounded-xl cursor-pointer"
                    >
                      Contact Team Office
                    </button>
                  </div>
                </div>
              </section>

            </motion.div>
          )}
          {/* ABOUT SCREEN */}
          {currentPage === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12"
            >
              <div className="text-center space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[#bc5f40] font-mono">Our Company</span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-[#151716] leading-none">
                  Our Mission: Your Local Success
                </h1>
                <p className="text-[#4e524f] max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-semibold">
                  We are driven by a single purpose: to empower local businesses to thrive in the digital landscape.
                </p>
              </div>

              <div className="p-8 bg-white rounded-2xl space-y-4 border border-[#dfded4] text-[#4e524f] leading-relaxed text-sm font-medium shadow-xs">
                <p>
                  At Local Surge, we believe that every service business, plumber, restaurant, boutique, or dental practice, deserves to be discovered by its community. In a world crowded with complex online platforms, getting your neighborhood presence aligned and visible shouldn't require tens of thousands of dollars in overpaid developer retainers or hidden fees.
                </p>
                <p>
                  Our mission is to bridge the gap between you and your localized customers. We do this through modern, expert-level, and completely transparent local search strategies. Our services are lightweight, powerful, and built to scale your bookings with zero friction.
                </p>
              </div>

              {/* Values */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold font-display text-[#151716] text-center uppercase tracking-wide">Our Core Pillars</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#faf9f6]/85 border border-[#dfded4] p-6 rounded-2xl space-y-2 text-center shadow-xs hover:border-[#123e35]/35 transition-colors">
                    <span className="text-2xl font-black text-[#bc5f40] font-mono">01</span>
                    <h4 className="font-extrabold text-[#151716] font-display">Absolute Transparency</h4>
                    <p className="text-xs text-[#4e524f] leading-relaxed font-semibold">We believe in clear communication and straightforward pricing reporting. No smoke, no mirrors.</p>
                  </div>
                  <div className="bg-[#faf9f6]/85 border border-[#dfded4] p-6 rounded-2xl space-y-2 text-center shadow-xs hover:border-[#123e35]/35 transition-colors">
                    <span className="text-2xl font-black text-[#bc5f40] font-mono">02</span>
                    <h4 className="font-extrabold text-[#151716] font-display">Results-Driven Design</h4>
                    <p className="text-xs text-[#4e524f] leading-relaxed font-semibold">Our metrics are focused: Google Maps rankings, organic traffic volume, and direct inquiry counts.</p>
                  </div>
                  <div className="bg-[#faf9f6]/85 border border-[#dfded4] p-6 rounded-2xl space-y-2 text-center shadow-xs hover:border-[#123e35]/35 transition-colors">
                    <span className="text-2xl font-black text-[#123e35] font-mono">03</span>
                    <h4 className="font-extrabold text-[#151716] font-display">Agile Innovation</h4>
                    <p className="text-xs text-[#4e524f] leading-relaxed font-semibold">Local algorithms pivot. We stay ahead of the curve to keep your rankings consistent.</p>
                  </div>
                </div>
              </div>

              {/* Team Section */}
              <div className="space-y-6 pt-4 text-center">
                <h3 className="text-lg font-bold font-display text-[#151716] uppercase">Meet Our Leadership</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white border border-[#dfded4] rounded-2xl p-5 hover:border-[#123e35]/30 transition shadow-xs">
                    <div className="w-16 h-16 rounded-full bg-[#f7f6f2] border border-[#dfded4] mx-auto font-display font-black text-[#123e35] flex items-center justify-center text-sm">S</div>
                    <h4 className="font-extrabold text-sm text-[#151716] mt-3">Sachidanand</h4>
                    <p className="text-[10px] uppercase font-bold text-[#bc5f40] font-mono mt-1">SEO Lead Strategist</p>
                  </div>
                  <div className="bg-white border border-[#dfded4] rounded-2xl p-5 hover:border-[#123e35]/30 transition shadow-xs">
                    <div className="w-16 h-16 rounded-full bg-[#f7f6f2] border border-[#dfded4] mx-auto font-display font-black text-[#123e35] flex items-center justify-center text-sm">JS</div>
                    <h4 className="font-extrabold text-sm text-[#151716] mt-3">Jitendra Singh</h4>
                    <p className="text-[10px] uppercase font-bold text-[#bc5f40] font-mono mt-1">Lead Systems Developer</p>
                  </div>
                  <div className="bg-white border border-[#dfded4] rounded-2xl p-5 hover:border-[#123e35]/30 transition shadow-xs">
                    <div className="w-16 h-16 rounded-full bg-[#f7f6f2] border border-[#dfded4] mx-auto font-display font-black text-[#123e35] flex items-center justify-center text-sm">AN</div>
                    <h4 className="font-extrabold text-sm text-[#151716] mt-3">Anudeep</h4>
                    <p className="text-[10px] uppercase font-bold text-[#bc5f40] font-mono mt-1">Content Marketing Head</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* WHY CHOOSE US */}
          {currentPage === 'why-us' && (
            <motion.div
              key="why-us"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12"
            >
              <div className="text-center space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[#bc5f40] font-mono">Our Edge</span>
                <h1 className="text-3xl sm:text-4xl font-black font-display text-[#151716] tracking-tight leading-tight">
                  Why Choose Local Surge?
                </h1>
                <p className="text-[#4e524f] max-w-2xl mx-auto text-sm sm:text-base font-semibold">
                  Tired of middlemen, sales padding, and outsourcing? So are we.
                </p>
              </div>

              {/* Bento grid comparisons */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                {/* Highlight 1 */}
                <div className="md:col-span-3 bg-white border border-[#dfded4] rounded-2xl p-6 space-y-3 shadow-xs hover:border-[#123e35]/30 hover:shadow-sm transition-all duration-300">
                  <div className="w-10 h-10 rounded bg-[#123e35]/10 flex items-center justify-center text-[#123e35]">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-[#151716] text-base">Direct In-House Communication</h4>
                  <p className="text-xs text-[#4e524f] font-medium leading-relaxed">
                    Speak directly with the search expert engineering your domain keyword mappings. No accounts managers, no tickets lag, and no translated client portal delays.
                  </p>
                </div>

                {/* Highlight 2 */}
                <div className="md:col-span-3 bg-white border border-[#dfded4] rounded-2xl p-6 space-y-3 shadow-xs hover:border-[#123e35]/30 hover:shadow-sm transition-all duration-300">
                  <div className="w-10 h-10 rounded bg-[#123e35]/10 flex items-center justify-center text-[#123e35]">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-[#151716] text-base">Lightning-Fast Deployments</h4>
                  <p className="text-xs text-[#4e524f] font-medium leading-relaxed">
                    Most companies take 4-6 weeks to build initial citations or code a local Schema. Because we maintain our core tooling in-house, your preliminary maps strategy commits are published in days.
                  </p>
                </div>

                {/* Wide Bento */}
                <div className="md:col-span-6 bg-[#123e35] text-white rounded-2xl p-8 relative overflow-hidden border border-[#0f342e] space-y-4 shadow-sm">
                  <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-[#bc5f40]/5 rounded-full blur-2xl" />
                  <span className="px-2.5 py-1 text-[9px] font-bold font-mono tracking-wider bg-white/10 text-[#faf9f6] border border-white/10 rounded uppercase">Offline to Online Transformation</span>
                  <p className="text-xl sm:text-2xl font-bold font-display text-white">Not online yet? We'll build your neighborhood's digital front door.</p>
                  <p className="text-xs text-slate-200 max-w-xl leading-relaxed">
                    If you don't even have a live domain or profile, we deploy our Single-Page Blast setup or Starter Boost. Go from completely invisible neighborhood vendor to the unmissable localized service within your first 30 days.
                  </p>
                  <ul className="flex flex-wrap gap-4 text-xs font-mono font-bold text-[#faf9f6]/95">
                    <li className="flex items-center gap-1">✔ High Speed Hosting</li>
                    <li className="flex items-center gap-1">✔ Semantic Citation Synch</li>
                    <li className="flex items-center gap-1">✔ Mobile Touch Optimized</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* PRICING SCREEN */}
          {currentPage === 'pricing' && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-10"
            >
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <span className="text-xs font-bold uppercase tracking-widest text-[#bc5f40] font-mono">Simple & Clear Slabs</span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-[#151716] tracking-tight whitespace-normal">
                  Transparent Pricing for Every Business
                </h1>
                <p className="text-[#4e524f] font-medium text-sm sm:text-base leading-relaxed">
                  Choose the local package that matches your operational appetite. No long-term contracts. No activation locks. Cancel or shift anytime.
                </p>

                {/* Billing toggle */}
                <div className="inline-flex items-center p-1 bg-white rounded-xl mt-4 border border-[#dfded4]">
                  <button
                    onClick={() => setBillingPeriod('monthly')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold leading-none cursor-pointer transition-all ${
                      billingPeriod === 'monthly' ? 'bg-[#123e35] text-white shadow-sm' : 'text-[#4e524f] hover:text-[#111111]'
                    }`}
                  >
                    Billed Monthly
                  </button>
                  <button
                    onClick={() => setBillingPeriod('yearly')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold leading-none cursor-pointer transition-all flex items-center gap-1.5 ${
                      billingPeriod === 'yearly' ? 'bg-[#123e35] text-white shadow-sm' : 'text-[#4e524f] hover:text-[#111111]'
                    }`}
                  >
                    Billed Yearly
                    <span className="bg-[#bc5f40]/20 text-[#bc5f40] border border-[#bc5f40]/40 text-[9px] font-black font-mono leading-none px-1.5 py-0.5 rounded-sm">Save 20%</span>
                  </button>
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-6">
                {PLANS.map((plan) => {
                  const calculatedPrice = billingPeriod === 'yearly' ? Math.round(plan.price * 0.8) : plan.price;
                  const isSelected = plan.id === selectedPricingPlanId;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedPricingPlanId(plan.id);
                        setPreselectedPlan(plan);
                      }}
                      className={`bg-white border rounded-2xl p-6.5 flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden cursor-pointer ${
                        isSelected
                          ? 'border-[#123e35] ring-4 ring-[#123e35]/15 shadow-sm bg-[#faf9f6]/95'
                          : plan.popular
                            ? 'border-[#dfded4] hover:border-[#123e35]/60 shadow-xs'
                            : 'border-[#dfded4] hover:border-[#123e35]/25 shadow-xs'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bg-[#123e35] text-white text-[9px] font-black tracking-widest py-1 px-3 rounded-br-lg font-mono shadow-sm flex items-center gap-1.5 z-10">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Selected
                        </div>
                      )}

                      {plan.popular && !isSelected && (
                        <div className="absolute right-0 top-0 translate-x-8 translate-y-4 rotate-45 bg-[#bc5f40] text-white text-[9px] font-black tracking-widest py-1.5 px-8 uppercase font-mono shadow-sm">
                          POPULAR
                        </div>
                      )}

                      <div className="space-y-6">
                        <div>
                          <h4 className="font-extrabold text-xl font-display text-[#151716] leading-none">
                            {plan.name}
                          </h4>
                          <p className="text-xs text-[#4e524f] font-semibold mt-2 leading-relaxed min-h-[40px]">
                            {plan.description}
                          </p>
                        </div>

                        {/* Price display */}
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-black font-display text-[#151716] tracking-tight">
                              ${calculatedPrice}
                            </span>
                            <span className="text-[#888b88] font-bold text-xs uppercase font-mono">
                              / mo
                            </span>
                          </div>
                          {plan.id !== 'single-page' && (
                            <span className="text-[10px] text-[#888b88] font-mono tracking-wide uppercase mt-1 inline-block">
                              {billingPeriod === 'yearly' ? 'Billed annually ($' + (calculatedPrice * 12) + ')' : 'No long-term contracts'}
                            </span>
                          )}
                        </div>

                        {/* Features */}
                        <ul className="space-y-3 pt-4 border-t border-[#dfded4]">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex gap-2.5 items-start text-xs text-[#2d2f2d] font-semibold">
                              <Check className="w-4.5 h-4.5 text-[#123e35] shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Convert Button triggers Onboarding Flow */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPlanAndNavigate(plan.id);
                        }}
                        className={`w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider font-mono mt-8 cursor-pointer transition-all flex items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-[#123e35] hover:bg-[#185246] text-white shadow-sm hover:scale-102'
                            : plan.popular
                              ? 'bg-[#bc5f40] hover:bg-[#cf6d4e] text-white shadow-sm hover:scale-102'
                              : 'bg-white font-extrabold text-[#4e524f] border border-[#dfded4] hover:bg-[#faf9f6]'
                        }`}
                      >
                        {isSelected
                          ? plan.id === 'single-page' ? 'START FREE PLAN' : 'Selected'
                          : plan.id === 'single-page' ? 'Start Free Plan' : `Select ${plan.name}`}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Custom inquiry option */}
              <div className="bg-white border border-[#dfded4] rounded-2xl p-6 text-center max-w-2xl mx-auto space-y-3 shadow-xs">
                <h5 className="font-extrabold text-sm text-[#151716]">Need a Custom Plan or Help Getting Online?</h5>
                <p className="text-xs text-[#4e524f] font-semibold max-w-md mx-auto">
                  We formulate tailored multi-city packages or coordinate full enterprise multi-location setups based on your unique niche parameters. Let's build a dedicated brief.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handlePricingPrefillContact('Custom/Enterprise Setup')}
                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold bg-[#faf9f6]/95 text-[#123e35] hover:text-[#185246] shadow-xs border border-[#dfded4] hover:bg-[#f2f0ea] cursor-pointer"
                  >
                    Request Custom Strategy Invoice
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* CONTACT SCREEN */}
          {currentPage === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12"
            >
              <div className="text-center space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[#bc5f40] font-mono">Contact Office</span>
                <h1 className="text-3xl sm:text-4xl font-black font-display text-[#151716] leading-none font-display">Get in Touch</h1>
                <p className="text-[#4e524f] max-w-lg mx-auto text-sm font-semibold">
                  Have a question or ready to coordinate your manual onboarding? We'd love to hear from you directly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* Details side */}
                <div className="md:col-span-5 space-y-6">
                  <div className="bg-white border border-[#dfded4] p-5 rounded-2xl shadow-xs space-y-4">
                    <h3 className="font-bold text-sm text-[#151716] font-display">Direct Email Outreach</h3>
                    
                    <div className="space-y-4">
                      <div className="flex gap-3 text-xs leading-relaxed text-[#4e524f] font-semibold">
                        <Mail className="w-5 h-5 text-[#bc5f40] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-[#151716]">General Information</p>
                          <a href="mailto:contact@localsurgeseo.com" className="text-[#123e35] hover:underline font-bold">
                            contact@localsurgeseo.com
                          </a>
                        </div>
                      </div>

                      <div className="flex gap-3 text-xs leading-relaxed text-[#4e524f] font-semibold">
                        <Clock className="w-5 h-5 text-[#bc5f40] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-[#151716]">Standard Business Hours</p>
                          <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                          <p className="text-[#bc5f40] font-bold mt-1">Saturday - Sunday: Closed</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#faf9f6] border border-[#e2dfd5] rounded-xl text-xs text-[#5c605d] leading-relaxed font-semibold">
                    To ensure focused and highly efficient communication, we process all initial onboarding inquiries via secure email or direct strategy audit first. We look forward to a point-to-point conversation about your rankings potential.
                  </div>
                </div>

                {/* Form side */}
                <div id="manual-inquiry-container" className="md:col-span-7 bg-white border border-[#dfded4] rounded-2xl p-6.5 shadow-xs transition-all duration-300">
                  {contactSuccess ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-6 space-y-6"
                    >
                      <div className="w-16 h-16 rounded-full bg-[#123e35]/10 text-[#123e35] mx-auto flex items-center justify-center animate-bounce">
                        <Check className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold font-display text-[#151716]">Inquiry Submitted!</h3>
                        <p className="text-xs text-[#bc5f40] font-bold uppercase font-mono tracking-widest">Pending Review Activated</p>
                        <p className="text-xs text-[#4e524f] max-w-sm mx-auto font-semibold leading-relaxed">
                          Thank you for choosing <strong>Local Surge SEO</strong>. Your PDF Growth Campaign Plan document is downloading automatically right now.
                        </p>
                      </div>

                      <div className="bg-[#faf9f6] border border-[#dfded4] rounded-xl p-4 text-left text-xs space-y-2.5 max-w-md mx-auto">
                        <div className="flex items-center justify-between text-[10px] font-bold text-[#888b88] uppercase font-mono pb-1.5 border-b border-[#dfded4]">
                          <span>Reference Details</span>
                          <span className="text-[#123e35]">LSS-PENDING</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#888b88]">Selected Plan:</span>
                          <span className="font-bold text-[#151716]">{PLANS.find(p => p.id === cntPlan)?.name || 'Custom Setup'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#888b88]">Status:</span>
                          <span className="font-bold text-[#bc5f40] uppercase font-mono text-[10px] tracking-wider">Pending Assignment</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#888b88]">Contact Name:</span>
                          <span className="font-bold text-[#151716]">{cntName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#888b88]">Email Address:</span>
                          <span className="font-bold text-[#151716]">{cntEmail}</span>
                        </div>
                      </div>

                      <div className="pt-2 text-center space-y-2">
                        <p className="text-[10px] text-[#888b88] font-semibold">If your download didn't start automatically, click below:</p>
                        <button
                          onClick={() => handleGeneratePDF(cntPlan || 'custom', cntName, cntEmail)}
                          className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold bg-[#123e35] text-white hover:bg-[#185246] shadow-xs cursor-pointer"
                        >
                          Download Actions PDF
                        </button>
                      </div>

                      <div className="pt-4 border-t border-[#dfded4]">
                        <button
                          onClick={() => {
                            setContactSuccess(false);
                            setCntName('');
                            setCntEmail('');
                            setCntMessage('');
                            setCntSubject('');
                          }}
                          className="text-xs text-[#888b88] hover:text-[#123e35] font-bold underline cursor-pointer"
                        >
                          Submit Another Inquiry
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-5">
                      <h3 className="font-bold text-[#151716] font-display">Manual Inquiry Request</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-[#4e524f] uppercase tracking-wide mb-1 font-mono">
                            Your Full Name *
                          </label>
                          <input
                            id="cnt-full-name-input"
                            type="text"
                            required
                            placeholder="e.g. Marcus Chen"
                            value={cntName}
                            onChange={(e) => setCntName(e.target.value)}
                            className={`bg-[#faf9f6]/95 border rounded-xl w-full px-3.5 py-2.5 text-xs text-[#1a1c1a] placeholder-[#888b88] focus:outline-none focus:border-[#bc5f40] transition-all duration-300 ${
                              shouldBlinkNameInput 
                                ? 'border-[#bc5f40] ring-4 ring-[#bc5f40]/25 bg-amber-50 animate-pulse' 
                                : 'border-[#dfded4]'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#4e524f] uppercase tracking-wide mb-1 font-mono">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. contact@domain.com"
                            value={cntEmail}
                            onChange={(e) => setCntEmail(e.target.value)}
                            className="bg-[#faf9f6]/95 border border-[#dfded4] rounded-xl w-full px-3.5 py-2.5 text-xs text-[#1a1c1a] placeholder-[#888b88] focus:outline-none focus:border-[#bc5f40]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-[#4e524f] uppercase tracking-wide mb-1 font-mono">
                            Preferred Growth Tier *
                          </label>
                          <select
                            required
                            value={cntPlan}
                            onChange={(e) => setCntPlan(e.target.value)}
                            className="bg-[#faf9f6]/95 border border-[#dfded4] rounded-xl w-full px-3.5 py-2.5 text-xs text-[#1a1c1a] cursor-pointer focus:outline-none focus:border-[#bc5f45]"
                          >
                            <option value="" className="bg-white text-[#888b88]">— Select Your Tier — *</option>
                            <option value="single-page" className="bg-white text-[#1a1c1a]">Single-Page Blast (Free)</option>
                            <option value="starter" className="bg-white text-[#1a1c1a]">Starter Boost ($999/mo)</option>
                            <option value="premium" className="bg-white text-[#1a1c1a]">Premium Surge ($1999/mo)</option>
                            <option value="custom" className="bg-white text-[#1a1c1a]">Custom Configuration</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#4e524f] uppercase tracking-wide mb-1 font-mono">
                            Inquiry Subject
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Local keywords scan"
                            value={cntSubject}
                            onChange={(e) => setCntSubject(e.target.value)}
                            className="bg-[#faf9f6]/95 border border-[#dfded4] rounded-xl w-full px-3.5 py-2.5 text-xs text-[#1a1c1a] placeholder-[#888b88] focus:outline-none focus:border-[#bc5f40]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#4e524f] uppercase tracking-wide mb-1.5 font-mono">
                          Additional Business Message / Questions
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Share details about your business category, current rankings, or what area you want to dominate..."
                          value={cntMessage}
                          onChange={(e) => setCntMessage(e.target.value)}
                          className="bg-[#faf9f6]/95 border border-[#dfded4] rounded-xl w-full px-3.5 py-2.5 text-xs text-[#1a1c1a] placeholder-[#888b88] focus:outline-none focus:border-[#bc5f40]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#123e35] hover:bg-[#185246] hover:shadow-xs text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer transition-all"
                      >
                        Submit Form
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          )}

           {/* LOCAL SEO SCREEN */}
          {currentPage === 'local-seo' && (
            <motion.div
              key="local-seo"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 py-12"
            >
              <LocalSeoView 
                onOpenOnboarding={() => handleOpenOnboarding(null)} 
                onGetFreeStrategy={handleGetFreeStrategy}
                setCurrentPage={setCurrentPage} 
              />
            </motion.div>
          )}

          {/* SEO TOOL SCREEN (FREE SEO ANALYSIS WITH AI BACKEND!) */}
          {currentPage === 'seo-tool' && (
            <motion.div
              key="seo-tool"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16"
            >
              <SeoHomeTool 
                onOpenOnboarding={() => setCurrentPage('contact')} 
                initialUrl={homePrefilledUrl}
                autoAnalyze={homeAutoAnalyze}
                onClearAutoAnalyze={() => setHomeAutoAnalyze(false)}
              />
              <div className="border-t border-[#dfded4] pt-12">
                <LocalDirectoryTool onOpenOnboarding={() => handleOpenOnboarding(null)} />
              </div>
            </motion.div>
          )}

          {/* ADMIN LEAD PORTAL */}
          {currentPage === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isAdminLoggedIn ? (
                <LeadDashboard 
                  leads={leads} 
                  onUpdateLeads={fetchLeads} 
                />
              ) : (
                <AdminLoginForm 
                  onLoginSuccess={() => setIsAdminLoggedIn(true)} 
                  onBackToHome={() => setCurrentPage('home')}
                />
              )}
            </motion.div>
          )}

          {/* BLOG SECTION */}
          {currentPage === 'blog' && (
            <motion.div
              key="blog"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <BlogView 
                initialSlug={activeArticleSlug}
                onNavigateToArticle={(slug) => setActiveArticleSlug(slug)}
                onOpenOnboarding={() => handleOpenOnboarding(null)}
                onNavigateToPage={(pageName) => {
                  setCurrentPage(pageName);
                  setActiveArticleSlug(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          )}

          {/* SITEMAP SECTION */}
          {currentPage === 'site-map' && (
            <motion.div
              key="site-map"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <SitemapView 
                setCurrentPage={setCurrentPage}
                onNavigateToArticle={(slug) => {
                  setActiveArticleSlug(slug);
                  setCurrentPage('blog');
                }}
                setActiveStateSlug={setActiveStateSlug}
                setActiveCitySlug={setActiveCitySlug}
              />
            </motion.div>
          )}

          {/* CALIFORNIA DIRECTORY SECTION */}
          {currentPage === 'california' && (
            <motion.div
              key="california"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <CaliforniaView 
                setCurrentPage={setCurrentPage}
                onOpenOnboarding={() => handleOpenOnboarding(null)}
                onGetFreeStrategy={handleGetFreeStrategy}
                setActiveStateSlug={setActiveStateSlug}
                setActiveCitySlug={setActiveCitySlug}
              />
            </motion.div>
          )}

          {/* LOS ANGELES SEO SECTION */}
          {currentPage === 'los-angeles-seo' && (
            <motion.div
              key="los-angeles-seo"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <LosAngelesSeoView 
                setCurrentPage={setCurrentPage}
                onOpenOnboarding={() => handleOpenOnboarding(null)}
                onGetFreeStrategy={handleGetFreeStrategy}
              />
            </motion.div>
          )}

          {/* DYNAMIC REGIONAL DIRECTORY STATE/CITY PAGES */}
          {(currentPage === 'state-seo' || currentPage === 'city-seo') && (
            <motion.div
              key={`dir-${activeStateSlug}-${activeCitySlug}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <DirectoryView 
                setCurrentPage={setCurrentPage}
                stateSlug={activeStateSlug}
                citySlug={activeCitySlug}
                onOpenOnboarding={() => handleOpenOnboarding(null)}
                onGetFreeStrategy={handleGetFreeStrategy}
                setActiveStateSlug={setActiveStateSlug}
                setActiveCitySlug={setActiveCitySlug}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Persistent Footer */}
      <Footer setCurrentPage={setCurrentPage} />

      {/* Shared Onboarding Wizard Modal */}
      <OnboardingWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        preselectedPlan={preselectedPlan}
        onLeadSubmitted={handleLeadSubmitted}
      />
    </div>
  );
}
