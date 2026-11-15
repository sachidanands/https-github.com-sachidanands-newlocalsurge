import React, { useState } from 'react';
import { Check, CheckCircle2, Code2, Copy, RefreshCw, AlertCircle } from 'lucide-react';
import { checkSiteInstall } from './api';
import type { PortalSite } from './types';

interface InstallTabProps {
  site: PortalSite;
}

const PLATFORMS = [
  {
    id: 'wordpress',
    name: 'WordPress',
    steps: [
      'Install and activate the free WPCode (or Insert Headers & Footers) plugin.',
      'Open Code Snippets -> Header & Footer in your WordPress admin sidebar.',
      'Paste the 1-line script snippet into the Footer box.',
      'Click Save Changes. Clear any page cache plugin if used.'
    ]
  },
  {
    id: 'shopify',
    name: 'Shopify',
    steps: [
      'In Shopify Admin, go to Online Store -> Themes.',
      'Click ... -> Edit Code on your active theme.',
      'Open Layout -> theme.liquid and scroll to </body> at the bottom.',
      'Paste the snippet right above </body> and click Save.'
    ]
  },
  {
    id: 'wix',
    name: 'Wix',
    steps: [
      'Open your Wix Dashboard -> Settings -> Custom Code.',
      'Click + Add Custom Code at the top right.',
      'Paste the snippet, set Place Code in -> Body - end, choose All Pages, and Apply.'
    ]
  },
  {
    id: 'squarespace',
    name: 'Squarespace',
    steps: [
      'Go to Website -> Website Tools -> Code Injection.',
      'Scroll to the Footer section.',
      'Paste your snippet and click Save.'
    ]
  },
  {
    id: 'webflow',
    name: 'Webflow',
    steps: [
      'Open Project Settings -> Custom Code tab.',
      'Paste the snippet into the Footer Code box.',
      'Save Changes and Publish your site.'
    ]
  },
  {
    id: 'html',
    name: 'HTML / GTM',
    steps: [
      'Plain HTML: Paste right before the closing </body> tag.',
      'Google Tag Manager: Create a Custom HTML tag -> Trigger: All Pages (Window Loaded) -> Submit & Publish.'
    ]
  }
];

export default function InstallTab({ site }: InstallTabProps) {
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState('wordpress');
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    foundOnPage?: boolean;
    installed?: boolean;
    message?: string;
  } | null>(null);

  const snippet = `<script src="https://localsurgeseo.com/widget.js" data-site-id="${site.id}" defer></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCheckInstall = async () => {
    setChecking(true);
    try {
      const res = await checkSiteInstall(site.id);
      setCheckResult(res);
    } finally {
      setChecking(false);
    }
  };

  const activeGuide = PLATFORMS.find((p) => p.id === platform) || PLATFORMS[0];

  return (
    <div className="space-y-6">
      {/* Snippet Card */}
      <div className="bg-white border border-[#dfded4] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#151716] flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#123e35]" />
              <span>Your 1-Line Install Script</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Runs inside an isolated Shadow DOM so it never breaks your site fonts or styles.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#123e35] text-white text-xs font-bold hover:bg-[#195347] cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Snippet'}</span>
          </button>
        </div>

        <pre className="bg-[#0f172a] text-emerald-300 p-4 rounded-xl text-xs font-mono overflow-x-auto select-all">
          {snippet}
        </pre>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-600">
            Status:{' '}
            <strong className={site.installed_at ? 'text-emerald-700' : 'text-amber-700'}>
              {site.installed_at ? 'Live traffic detected' : 'Awaiting first visit'}
            </strong>
            {site.last_seen_origin && (
              <span className="text-slate-400"> ({site.last_seen_origin})</span>
            )}
          </div>
          <button
            type="button"
            disabled={checking}
            onClick={handleCheckInstall}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#dfded4] bg-[#f7f6f2] hover:bg-[#efede5] text-xs font-bold text-[#151716] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Scanning Homepage...' : 'Check Installation'}</span>
          </button>
        </div>

        {checkResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              checkResult.foundOnPage || checkResult.installed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {checkResult.foundOnPage || checkResult.installed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{checkResult.message}</span>
          </div>
        )}
      </div>

      {/* Platform Guides */}
      <div className="bg-white border border-[#dfded4] rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-black text-[#151716]">Platform Installation Guides</h3>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlatform(p.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                platform === p.id
                  ? 'bg-[#123e35] text-white'
                  : 'bg-[#f7f6f2] text-slate-700 hover:bg-[#ebe9df]'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700 bg-[#f7f6f2] border border-[#dfded4] rounded-xl p-4">
          {activeGuide.steps.map((s, idx) => (
            <li key={idx}>{s}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
