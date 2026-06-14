import React from 'react';
import { Page } from '../types';
import { FileText, ArrowLeft, ShieldAlert, Mail, MapPin, Globe, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface TermsOfServiceProps {
  setCurrentPage: (page: Page) => void;
}

export default function TermsOfService({ setCurrentPage }: TermsOfServiceProps) {
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
              <FileText className="w-8 h-8" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider">Governing Agreement</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#151711] tracking-tight mb-4">
              Terms of Service
            </h1>
            <p className="text-xs text-[#888b88] font-semibold">
              Effective Date: June 14, 2026 | Last Updated: June 14, 2026
            </p>
          </div>

          {/* Intro Notice */}
          <div className="bg-[#fff9f6] border-l-4 border-[#bc5f40] p-4 rounded-r-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#bc5f40] shrink-0 mt-0.5" />
            <div className="text-xs text-[#52443e] leading-relaxed">
              <strong className="text-[#bc5f40]">Statutory Jurisdiction:</strong> These terms govern all services, subscriptions, and diagnostic software platforms utilized across the <strong className="text-[#bc5f40]">United States and Canada</strong>. Accessing our pages or local search signal scanners constitutes complete assent to these conditions.
            </div>
          </div>

          <div className="space-y-6 text-sm text-[#4e524f] leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#151711] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#123e35] rounded-full inline-block"></span>
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing Local Surge SEO, including our free SEO audit tooling, local maps tracking, city directories analysis, and leaderboard tracking systems, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you must terminate your access to our assets immediately.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#151711] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#123e35] rounded-full inline-block"></span>
                2. Subscription Billing & Cancellations
              </h2>
              <p>
                Certain features are offered on a recurring, monthly subscription plan as documented in our pricing sections:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong>Billing Cadence:</strong> Fees are charged on a monthly pre-pay interval starting from the initiation date of your active campaign structure.</li>
                <li><strong>No-Contract Flexibility:</strong> All billing profiles operate on a rolling cancel-anytime mechanism. To avoid a subsequent renewal interval, cancellation directives must be submitted via your workspace page or email at least 48 hours prior to the next scheduled debit.</li>
                <li><strong>Refund Policy:</strong> Since local search signals, audit reporting, schema markups, and directory sync integrations represent immediate digital assets, all transactions are final. Refunds are not issued for partial monthly usage blocks.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#151711] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#123e35] rounded-full inline-block"></span>
                3. Accuracy of Search Diagnostic Claims
              </h2>
              <p>
                Our Free SEO Analysis Tool provides point-in-time diagnostics based on crawling signals, public directories patterns, and ranking profiles in the target zip codes. You acknowledge that search engine ranking algorithms change rapidly, and we do not guarantee specific or permanent placement results on Google Search, organic local map listings, or other directory providers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#151711] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#123e35] rounded-full inline-block"></span>
                4. Acceptable System Usage Rules
              </h2>
              <p>
                You represent and warrant that all data input into our local search audit tool or onboarding wizard (including business names, physical operational addresses, telephone points, and website domains) is entirely accurate, truthful, and owned by you (or that you carry written authorization to optimize such property). You are strictly prohibited from:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>Automating scan requests via malicious scripts or headless crawlers.</li>
                <li>Inputting fraudulent, defamatory, or false directory details.</li>
                <li>Simulating infrastructure loads or attacking backend APIs.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#151711] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#123e35] rounded-full inline-block"></span>
                5. Cross-Border Governing Laws
              </h2>
              <p>
                These Terms of Service represent a bilateral agreement. To provide clear regulatory guidance for our international reach, the governing jurisdictions are declared as:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong>United States:</strong> Delaware and California, without regard to conflict of laws parameters.</li>
                <li><strong>Canada:</strong> Ontario, without regard to provincial or national conflict of laws parameters.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#151711] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#123e35] rounded-full inline-block"></span>
                6. Limitation of Liability
              </h2>
              <p>
                IN NO EVENT SHALL LOCAL SURGE SEO, ITS PRINCIPALS, DEVELOPERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF ORGANIC TRAFFIC, REVENUE REDUCTIONS, LOSS OF GOOGLE BUSINESS PROFILES, OR SERVICE DISRUPTIONS ARISING OUT OF THE USE OR INABILITY TO USE OUR AUDITING SERVICES AND LOCAL SCHEMAS.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#151711] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#123e35] rounded-full inline-block"></span>
                7. Contact Information & Support Desk
              </h2>
              <p>
                If you have questions, concerns, updates, or disputes regarding our terms, please submit a detailed brief to our administration desk:
              </p>
              <div className="bg-[#faf9f6] p-4 rounded-xl border border-[#dfded4] flex items-center gap-4 text-xs font-semibold">
                <Mail className="w-5 h-5 text-[#123e35]" />
                <div>
                  <p className="text-[#123e35]">Legal & Compliance Operations Desk</p>
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
