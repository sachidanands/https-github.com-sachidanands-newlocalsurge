import React, { useState } from 'react';
import { Page } from '../types';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FaqSectionProps {
  setCurrentPage: (page: Page) => void;
}

interface FaqItemData {
  question: string;
  answer: (setCurrentPage: (page: Page) => void) => React.ReactNode;
}

const FAQS: FaqItemData[] = [
  {
    question: "How can I get a free website for my business?",
    answer: (setCurrentPage) => (
      <p>
        You can launch a free, SEO-optimized single-page website instantly with LocalSurge SEO’s "Single-Page Blast" plan{" "}
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
    question: "What information do I need to provide to build my site quickly?",
    answer: () => (
      <div className="space-y-3">
        <p>To fast-track your website creation, please prepare the following details:</p>
        <ul className="list-disc pl-5 space-y-2 text-[#4e524f] font-medium">
          <li>A brief description of your business.</li>
          <li>Your physical business address.</li>
          <li>Links to your social media profiles (if available).</li>
          <li>Your business contact phone number.</li>
          <li>5 Common Questions local customers ask you.</li>
          <li>Your preferred color theme or branding style for website.</li>
          <li>Your desired domain name (optional).</li>
        </ul>
      </div>
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
        , which is perfect for establishing an immediate local presence.
      </p>
    )
  },
  {
    question: "Why is having a custom domain beneficial if I can use a free subdomain?",
    answer: () => (
      <p>
        In the era of AI and advanced search algorithms, a dedicated domain (e.g.,{" "}
        <span className="italic font-bold text-[#151716]">yourbusiness.com</span>) significantly strengthens your digital identity and authority. It signals trust to both customers and search engines, making it easier to rank higher for local keywords compared to a subdomain.
      </p>
    )
  },
  {
    question: "Can I upgrade my plan if my business grows?",
    answer: (setCurrentPage) => (
      <p>
        Absolutely. You have the flexibility to switch from the free single-page plan to a paid plan{" "}
        <button
          onClick={() => {
            setCurrentPage('pricing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-[#bc5f40] hover:text-[#123e35] underline font-extrabold cursor-pointer transition-colors duration-150 inline-block focus:outline-none"
        >
          (View Pricing)
        </button>{" "}
        at any time as your digital presence and needs expand.
      </p>
    )
  },
  {
    question: "Does the free plan support multiple pages?",
    answer: () => (
      <p>
        No, the free "Single-Page Blast" plan is designed specifically as a high-converting one-page website. If you require a multi-page structure, you can upgrade to a higher-tier plan.
      </p>
    )
  },
  {
    question: "How often can I update the content on my free website?",
    answer: () => (
      <p>
        To ensure content freshness and optimal SEO performance, you are allowed to update your website content once per month under the free plan.
      </p>
    )
  },
  {
    question: "What post-launch support does LocalSurge SEO provide?",
    answer: () => (
      <div className="space-y-3">
        <p>We don't just build the site; we help you succeed. LocalSurge SEO support includes assistance with:</p>
        <ul className="list-disc pl-5 space-y-2 text-[#4e524f] font-medium">
          <li>Optimizing your Core Web Vitals (CWV) score for faster loading and better rankings.</li>
          <li>Implementing Local Schema markup to help Google understand your business.</li>
          <li>Refining your content based on local search intent and business specifics.</li>
        </ul>
      </div>
    )
  },
  {
    question: "What components are included in my single-page website?",
    answer: () => (
      <div className="space-y-3">
        <p>Your single-page website comes with 10 essential components designed to convert visitors into customers:</p>
        <ul className="list-disc pl-5 space-y-2 text-[#4e524f] font-medium">
          <li><strong className="text-[#151716]">Header Navigation:</strong> Easy access to key sections.</li>
          <li><strong className="text-[#151716]">Hero Section:</strong> A compelling headline and call-to-action.</li>
          <li><strong className="text-[#151716]">About Us:</strong> Your business story.</li>
          <li><strong className="text-[#151716]">Why Choose Us:</strong> Your unique selling propositions.</li>
          <li><strong className="text-[#151716]">Our Work/Portfolio:</strong> Showcase up to 10 images of your products or projects.</li>
          <li><strong className="text-[#151716]">FAQ Section:</strong> Answers to common customer inquiries.</li>
          <li><strong className="text-[#151716]">Footer:</strong> Essential links and copyright info.</li>
          <li><strong className="text-[#151716]">Call to Action (CTA):</strong> Prominent buttons for customers to call you directly.</li>
          <li><strong className="text-[#151716]">Contact Info:</strong> Clear display of phone and address.</li>
          <li><strong className="text-[#151716]">Local SEO Tags:</strong> Hidden metadata optimized for search engines.</li>
        </ul>
      </div>
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
          Clear Solutions
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-[#151716] tracking-tight leading-none">
          Frequently Asked Questions: Free Single-Page Websites
        </h2>
        <p className="text-[#4e524f] font-medium text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Get transparent answers about our Single-Page Blast website development, custom domain configurations, and local search growth integrations.
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
