import React, { useState } from 'react';
import { Page } from '../types';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface RawFaqItem {
  question: string;
  answerText: string;
}

export const CORE_LOCAL_SEO_FAQS: RawFaqItem[] = [
  {
    question: "Which local SEO services should I pick for my business?",
    answerText: "The right local SEO package depends on your business stage and local competition. Solo contractors and newly launched businesses benefit most from our Single-Page Blast ($0/mo) or Starter Boost ($999/mo) to establish Google Business Profile verification, citation synchronization, and foundational Map Pack rankings. Established contractors in competitive metro markets (HVAC, roofing, plumbing, dental) require the Premium Surge ($1,999/mo) plan for coordinate geo-grid expansion, continuous review velocity, and dedicated multi-location domination."
  },
  {
    question: "How much does local SEO cost per month, and what determines the price?",
    answerText: "Legitimate local SEO services in the United States typically range from $500 to $3,000 per month depending on geographical market density, competitor count, and citation clean-up scope. Bargain services offering '$99/month' invariably fail because they rely on automated spam blasts that violate Google guidelines. Local Surge SEO offers transparent, contract-free pricing: Single-Page Blast ($0/mo), Starter Boost ($999/mo), and Premium Surge ($1,999/mo), with zero setup fees and proven ROI tracking."
  },
  {
    question: "What is the difference between Local SEO and Organic SEO?",
    answerText: "Local SEO focuses on spatial proximity, the Google Local 3-Pack (Google Maps), Google Business Profiles, and localized NAP citations to capture high-intent 'near me' searchers within a specific service radius. Organic SEO focuses on nationwide non-geotargeted website rankings in standard search results based on domain authority, comprehensive content, and backlinks. For service contractors, over 44% of total local search clicks go directly to the Google Map 3-Pack."
  },
  {
    question: "Local SEO vs Google Ads (PPC): Which is better for local businesses?",
    answerText: "Google Ads (PPC) delivers immediate search visibility by charging you $15 to $80+ for every single click, but leads cease the exact moment ad budget stops. Local SEO and Google Map Pack optimization build permanent, compounding digital equity. Over 44% of local service searchers bypass sponsored ads to click Google Local 3-Pack listings, producing up to 3x higher phone call conversion rates at a fraction of the ongoing customer acquisition cost."
  },
  {
    question: "How do I optimize and rank my business in the Google Local 3-Pack?",
    answerText: "Ranking in the Google Local 3-Pack requires four core signals: (1) Setting the single most accurate primary Google Business Profile category, (2) Generating consistent, verified customer reviews containing specific service and neighborhood keywords, (3) Deploying structured LocalBusiness and geo-coordinate schema on your website, and (4) Establishing 100% NAP citation consistency across Tier-1 data aggregators."
  },
  {
    question: "What is a local citation and why is NAP consistency critical?",
    answerText: "A local citation is any online mention of your business Name, Address, and Phone number (NAP) on platforms such as Apple Maps, Yelp, Bing Places, YellowPages, and industry trade directories. Inconsistent details (such as mismatched suite numbers or outdated phone numbers) fragment search engine trust, causing Googlebot to withhold Map Pack rankings due to uncertain location verification."
  },
  {
    question: "How can I get a free website for my business?",
    answerText: "You can launch a free, SEO-optimized single-page website instantly with Local Surge SEO’s Single-Page Blast plan ($0/mo). Simply click 'Select Plan' on our pricing page, provide your core business details, and our automated pipeline configures your mobile-first single page optimized for local search signals."
  },
  {
    question: "Do I need to purchase a custom domain name?",
    answerText: "No, a custom domain is not strictly required. You can utilize our high-speed subdomain structure (localsurgeseo.com/your-business-name) for instant local presence. However, connecting a dedicated custom domain (yourbusiness.com) strengthens your long-term brand authority and trust signals for search algorithms."
  },
  {
    question: "Do you offer franchise website design and multi-location SEO?",
    answerText: "Yes, we specialize in high-performance franchise website design and multi-location local search architecture. We build structured state and city sub-directories with coordinate-pinned schema markup, localized review silos, and zip code routing, enabling multi-unit brands to scale regional map pack rankings with zero duplicate content penalties."
  }
];

interface FaqSectionProps {
  setCurrentPage: (page: Page) => void;
}

interface FaqItemData {
  question: string;
  answer: (setCurrentPage: (page: Page) => void) => React.ReactNode;
}

const FAQS: FaqItemData[] = [
  {
    question: "Which local SEO services should I pick for my business?",
    answer: (setCurrentPage) => (
      <div className="space-y-3">
        <p>
          The right local SEO package depends on your business stage, current search visibility, and competitor density in your service area:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#4e524f] font-medium">
          <li>
            <strong className="text-[#151716]">Solo Contractors & New Businesses:</strong> Start with our{" "}
            <button
              onClick={() => {
                setCurrentPage('pricing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[#bc5f40] hover:text-[#123e35] underline font-extrabold cursor-pointer transition-colors duration-150 inline-block focus:outline-none"
            >
              Single-Page Blast ($0/mo)
            </button>{" "}
            or Starter Boost ($999/mo) to secure Google Business Profile verification, foundational citation consistency, and initial Local 3-Pack placement.
          </li>
          <li>
            <strong className="text-[#151716]">Growing Regional Service Providers:</strong> Contractors in competitive sectors (HVAC, plumbing, roofing, dental) require the{" "}
            <strong className="text-[#151716]">Premium Surge ($1,999/mo)</strong> plan for coordinate geo-grid expansion, active review acceleration, and multi-town citation authority.
          </li>
          <li>
            <strong className="text-[#151716]">Multi-Location & Franchise Brands:</strong> Businesses operating across multiple counties or states need custom multi-location directories and localized schema silos.
          </li>
        </ul>
      </div>
    )
  },
  {
    question: "How much does local SEO cost per month, and what determines the price?",
    answer: (setCurrentPage) => (
      <div className="space-y-3">
        <p>
          Legitimate local SEO services across the United States typically range between <strong className="text-[#151716]">$500 and $3,000 per month</strong>. Factors that influence investment include your metropolitan population density, how many competitors hold 4.5+ star ratings, and the extent of historical NAP citation errors.
        </p>
        <p>
          Bargain services offering "$99/month" typically rely on automated overseas directory spam that triggers algorithmic ranking penalties. Local Surge SEO offers transparent, contract-free plans with zero setup fees:{" "}
          <button
            onClick={() => {
              setCurrentPage('pricing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-[#bc5f40] hover:text-[#123e35] underline font-extrabold cursor-pointer transition-colors duration-150 inline-block focus:outline-none"
          >
            Explore Transparent Pricing
          </button>.
        </p>
      </div>
    )
  },
  {
    question: "What is the difference between Local SEO and Organic SEO?",
    answer: () => (
      <div className="space-y-3">
        <p>
          While both strategies improve your search visibility, they target entirely different areas of the Google search results page:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#4e524f] font-medium">
          <li>
            <strong className="text-[#151716]">Local SEO:</strong> Optimizes for spatial proximity, Google Maps, and the Google Local 3-Pack. It relies on Google Business Profiles, physical geo-coordinates, verified customer reviews, and NAP directory citations to capture high-intent customers searching for local services within your specific city.
          </li>
          <li>
            <strong className="text-[#151716]">Organic SEO:</strong> Targets nationwide or global search queries within the standard blue-link web results. It relies on overall domain authority, broad backlink campaigns, and long-form topical guides without geographic proximity constraints.
          </li>
        </ul>
        <p className="text-xs text-[#123e35] font-semibold bg-[#123e35]/5 p-2.5 rounded-lg">
          💡 For service contractors and local clinics, over 44% of all search clicks go directly to the Google Local 3-Pack.
        </p>
      </div>
    )
  },
  {
    question: "Local SEO vs Google Ads (PPC): Which is better for local businesses?",
    answer: () => (
      <div className="space-y-3">
        <p>
          Both channels have merit, but they serve fundamentally different economic purposes for local contractors and service businesses:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#4e524f] font-medium">
          <li>
            <strong className="text-[#151716]">Google Ads (PPC):</strong> Delivers instant traffic by charging between $15 and $80+ per click. The moment ad budget is depleted or paused, inbound calls drop to zero. You build no lasting equity.
          </li>
          <li>
            <strong className="text-[#151716]">Local SEO (Map Pack):</strong> Builds compounding organic equity. Modern searchers have "banner blindness" and trust Map Pack verification; listings in the Local 3-Pack generate 3x higher phone call conversion rates with zero recurring cost-per-click fees.
          </li>
        </ul>
        <p className="text-xs text-[#123e35] font-semibold bg-[#123e35]/5 p-2.5 rounded-lg">
          💡 Recommendation: Use Google Ads for short-term emergency cash flow, while investing in Local SEO to permanently lower your customer acquisition costs.
        </p>
      </div>
    )
  },
  {
    question: "How do I optimize and rank my business in the Google Local 3-Pack?",
    answer: () => (
      <div className="space-y-3">
        <p>
          Winning a coveted spot in the top 3 Google Map results requires aligning with Google's three primary local ranking algorithms: <strong className="text-[#151716]">Relevance, Distance, and Prominence</strong>.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-[#4e524f] font-medium">
          <li><strong className="text-[#151716]">Primary Category Selection:</strong> Choose the exact primary category in your Google Business Profile that matches buyer search terms (e.g. "HVAC Contractor" rather than generic "Heating Contractor").</li>
          <li><strong className="text-[#151716]">Review Velocity & Sentiment:</strong> Consistently collect authentic 5-star reviews where clients mention the specific service performed and neighborhood name.</li>
          <li><strong className="text-[#151716]">Structured Local Schema:</strong> Inject JSON-LD markup declaring your exact latitude/longitude coordinates, business hours, service types, and accepted payment methods.</li>
          <li><strong className="text-[#151716]">NAP Citation Consistency:</strong> Ensure your Name, Address, and Phone number are identical across Google, Apple Maps, Bing, Yelp, and local chamber directories.</li>
        </ul>
      </div>
    )
  },
  {
    question: "What is a local citation and why is NAP consistency critical?",
    answer: () => (
      <div className="space-y-3">
        <p>
          A <strong className="text-[#151716]">local citation</strong> is any online mention of your business's core contact data: Name, Address, and Phone number (NAP). Citations appear on Tier-1 directory platforms (Apple Maps, Bing Places, YellowPages, Better Business Bureau) and industry-specific portals.
        </p>
        <p>
          <strong className="text-[#151716]">NAP consistency is vital:</strong> When search crawlers detect conflicting information (such as an old phone number or mismatched street abbreviation), Google’s trust score drops because the search engine cannot confidently verify your physical operation. This directly causes Map Pack rankings to plunge.
        </p>
      </div>
    )
  },
  {
    question: "How can I get a free website for my business?",
    answer: (setCurrentPage) => (
      <p>
        You can launch a free, SEO-optimized single-page website instantly with Local Surge SEO’s "Single-Page Blast" plan{" "}
        <button
          onClick={() => {
            setCurrentPage('pricing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-[#bc5f40] hover:text-[#123e35] underline font-extrabold cursor-pointer transition-colors duration-150 inline-block focus:outline-none"
        >
          (View Pricing)
        </button>
        . Simply click "Select Plan," fill out the brief business form, and share your details to get started immediately.
      </p>
    )
  },
  {
    question: "Do I need to purchase a custom domain name?",
    answer: () => (
      <p>
        No, a custom domain is not required. You can utilize our free subdomain structure, such as{" "}
        <code className="bg-[#f2f0ea] px-2 py-0.5 rounded text-xs font-bold font-mono text-[#123e35] border border-[#e6e4dc]">
          localsurgeseo.com/your-business-name
        </code>
        , which is perfect for establishing an immediate local presence. Connecting a dedicated custom domain (<span className="italic font-bold text-[#151716]">yourbusiness.com</span>) is available at any time to build long-term digital authority.
      </p>
    )
  },
  {
    question: "Do you offer franchise website design and multi-location SEO?",
    answer: () => (
      <p>
        Yes, we specialize in high-performance <span className="font-bold text-[#151716]">franchise website design</span> and custom localized directories. We build scalable multi-location architectures with coordinate-pinned schema markup, localized review silos, and zip code routing, enabling multi-unit brands and regional franchisees to scale regional map pack rankings with zero duplicate content penalties.
      </p>
    )
  }
];

function FaqItemComponent({ item, setCurrentPage }: { item: FaqItemData; setCurrentPage: (page: Page) => void; key?: React.Key }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border border-[#dfded4] rounded-2xl overflow-hidden shadow-xs hover:border-[#123e35]/30 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer hover:bg-[#faf9f6]/40 transition-colors focus:outline-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 pr-4">
          <HelpCircle className="w-5 h-5 text-[#bc5f40] shrink-0" />
          <span className="font-extrabold text-[#151716] text-sm sm:text-base tracking-tight leading-snug">
            {item.question}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="w-6 h-6 rounded-full bg-[#123e35]/5 flex items-center justify-center text-[#123e35] shrink-0"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-[#4e524f] leading-relaxed border-t border-[#dfded4]/50 font-medium">
              {item.answer(setCurrentPage)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqSection({ setCurrentPage }: FaqSectionProps) {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#bc5f40] font-mono">
          Clear Solutions & Answers
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-[#151716] tracking-tight leading-none">
          Frequently Asked Questions: Local SEO & Growth
        </h2>
        <p className="text-[#4e524f] font-medium text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Transparent answers on choosing local SEO services, pricing packages, Google Local 3-Pack optimization, and citation consistency.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, index) => (
          <FaqItemComponent
            key={index}
            item={faq}
            setCurrentPage={setCurrentPage}
          />
        ))}
      </div>
    </section>
  );
}
