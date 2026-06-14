import React from 'react';
import { Page } from '../types';
import { ShieldCheck, Mail, FileText, ArrowLeft, Globe, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface PrivacyPolicyProps {
  setCurrentPage: (page: Page) => void;
}

export default function PrivacyPolicy({ setCurrentPage }: PrivacyPolicyProps) {
  const handleBackToHome = () => {
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#faf9f6] text-[#2d2f2d] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation & Header */}
        <button
          onClick={handleBackToHome}
          className="group flex items-center gap-2 text-sm font-semibold text-[#123e35] hover:text-[#bc5f40] transition-all mb-8 bg-white px-4 py-2 rounded-full shadow-sm border border-[#dfded4] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#dfded4] space-y-8"
        >
          <div className="border-b border-[#dfded4] pb-8">
            <div className="flex items-center gap-3 text-[#bc5f40] mb-3">
              <ShieldCheck className="w-8 h-8" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider">Legal Framework & Privacy</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#151711] tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-xs text-[#888b88] font-semibold">
              Effective Date: June 14, 2026 | Last Updated: June 14, 2026
            </p>
          </div>

          {/* Intro notice for US/Canada compliance */}
          <div className="bg-[#f0f4f2] border-l-4 border-[#123e35] p-4 rounded-r-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#123e35] shrink-0 mt-0.5" />
            <div className="text-xs text-[#3a3d3a] leading-relaxed">
              <strong className="text-[#123e35]">Cross-Border Compliance Notice:</strong> This privacy policy has been updated to fully comply with statutory guidelines for entities operating in both the <strong className="text-[#123e35]">United States</strong> (including CCPA/CPRA, CAN-SPAM Act) and <strong className="text-[#123e35]">Canada</strong> (including PIPEDA, CASL - Canada's Anti-Spam Legislation).
            </div>
          </div>

          <div className="space-y-6 text-sm text-[#4e524f] leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#151711] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#bc5f40] rounded-full inline-block"></span>
                1. Information We Collect
              </h2>
              <p>
                At Local Surge SEO, we collect personal information necessary to deliver, analyze, and optimize our professional Local SEO analysis tools, state and city search signal strategies, and custom marketing dashboards. We collect the following classes of data:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong>Identity Context:</strong> Contact name, business name, location, and industry segment.</li>
                <li><strong>Outreach Details:</strong> Electronic mail address (email), telephone number, and website URLs.</li>
                <li><strong>SEO Diagnostic Signals:</strong> Information entered during local search auditing, Google Business Profile validation states, and citations performance metadata.</li>
                <li><strong>Technical Tracking:</strong> Internet Protocol (IP) address, browser version, device identifiers, and page interaction characteristics.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#151711] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#bc5f40] rounded-full inline-block"></span>
                2. Legal Basis for Processing & Consent
              </h2>
              <p>
                For residents of Canada, our processing of your personal information relies on your explicit or implied consent pursuant to the <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA).
              </p>
              <p>
                For residents of the United States, we process data to execute contract deliverables, fulfill request parameters on our local SEO tools, address diagnostic queries, and pursue legitimate marketing engagement in compliance with applicable federal and state data statutes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#151711] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#bc5f40] rounded-full inline-block"></span>
                3. Electronic Communications & Anti-Spam (CASL & CAN-SPAM)
              </h2>
              <p>
                We adhere strictly to anti-spam laws across North America. Every email dispatched from our systems is aligned as follows:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong>CASL Compliance (Canada):</strong> We obtain explicit consent before delivering commercial electronic messages (CEMs) to Canadian users, unless a statutory implied relationship exists (e.g., direct inquiry regarding services). All messages carry a clean, free, and automated unsubscribe mechanism which is processed within 10 business days.</li>
                <li><strong>CAN-SPAM Compliance (United States):</strong> We provide clear, non-deceptive subject lines, specify our logical physical postal address, and ensure opt-out commands are parsed immediately.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#151711] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#bc5f40] rounded-full inline-block"></span>
                4. State Privacy Mandates (CCPA & CPRA)
              </h2>
              <p>
                If you are a resident of California or other US states with active consumer privacy provisions:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong>Right to Know:</strong> You may request a summary detailing what categories of personal information we have collected and processed.</li>
                <li><strong>Right to Correct & Delete:</strong> You can demand correction of inaccurate records or complete removal of your personal information.</li>
                <li><strong>No Sale or Sharing:</strong> We do <strong>NOT</strong> sell, sell-by-proxy, or share consumer database lists with third-party data brokers for commercial monetization.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#151711] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#bc5f40] rounded-full inline-block"></span>
                5. Access Control & Safeguards
              </h2>
              <p>
                We implement industry-standard cryptographic techniques, isolated database access keys, and secure server hosts to guard against data leaks, unauthorized access, and alteration of consumer records. No communication over the public internet can be guaranteed as 100% secure, so we advise active safeguards when transferring sensitive parameters.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#151711] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#bc5f40] rounded-full inline-block"></span>
                6. Contact Information & Concerns
              </h2>
              <p>
                If you have questions regarding these privacy standards, wish to file a formal request concerning your personal records, or want to opt-out of our marketing circulars, contact our team:
              </p>
              <div className="bg-[#faf9f6] p-4 rounded-xl border border-[#dfded4] flex items-center gap-4 text-xs font-semibold">
                <Mail className="w-5 h-5 text-[#123e35]" />
                <div>
                  <p className="text-[#123e35]">Privacy & Compliance Officer</p>
                  <p className="text-[#888b88]">Email: <a href="mailto:contact@localsurgeseo.com" className="hover:underline text-[#bc5f40]">contact@localsurgeseo.com</a></p>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
