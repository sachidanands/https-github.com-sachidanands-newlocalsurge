import React, { useState } from 'react';
import { Check, Save, Sparkles } from 'lucide-react';
import { updatePortalSettings } from './api';
import { FRONTDESK_ICON_PRESETS, PresetSvgIcon } from './iconPresets';
import type { PortalSite } from './types';

interface AppearanceTabProps {
  site: PortalSite;
  onSiteUpdated: (site: PortalSite) => void;
}

const COLOR_SWATCHES = [
  '#123e35',
  '#bc5f40',
  '#0f766e',
  '#1d4ed8',
  '#7c3aed',
  '#be123c',
  '#d97706',
  '#1e293b'
];

export default function AppearanceTab({ site, onSiteUpdated }: AppearanceTabProps) {
  const wc = site.widget_config;
  const [themeColor, setThemeColor] = useState(wc.themeColor || '#123e35');
  const [iconPreset, setIconPreset] = useState(wc.iconPreset || 'chat');
  const [iconUrl, setIconUrl] = useState(wc.iconUrl || '');
  const [assistantName, setAssistantName] = useState(wc.assistantName || 'AI Assistant');
  const [greeting, setGreeting] = useState(wc.greeting || '');
  const [position, setPosition] = useState<'right' | 'left'>(
    wc.position === 'left' ? 'left' : 'right'
  );
  const [chipsText, setChipsText] = useState((wc.quickChips || []).join('\n'));
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedChips = chipsText
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedNotice(false);
    try {
      const res = await updatePortalSettings(site.id, {
        widget_config: {
          themeColor,
          iconPreset,
          iconUrl: iconUrl.trim() || '',
          assistantName: assistantName.trim() || 'AI Assistant',
          greeting: greeting.trim(),
          position,
          quickChips: parsedChips
        }
      });
      if (!res.ok) {
        setError(res.error || 'Could not save appearance changes.');
      } else if (res.site) {
        onSiteUpdated(res.site);
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Configuration Form */}
      <form
        onSubmit={handleSave}
        className="lg:col-span-7 bg-white border border-[#dfded4] rounded-2xl p-6 space-y-5"
      >
        <div>
          <h2 className="text-lg font-black text-[#151716]">Customize Theme &amp; Icon</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Changes update your live website widget immediately.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
        )}

        {/* Brand Color */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase text-slate-600">Brand Color</label>
          <div className="flex flex-wrap items-center gap-2.5">
            {COLOR_SWATCHES.map((hex) => (
              <button
                key={hex}
                type="button"
                aria-label={`Select color ${hex}`}
                onClick={() => setThemeColor(hex)}
                className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-transform ${
                  themeColor.toLowerCase() === hex ? 'border-slate-900 scale-110' : 'border-white shadow-xs'
                }`}
                style={{ backgroundColor: hex }}
              />
            ))}
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(themeColor) ? themeColor : '#123e35'}
              onChange={(e) => setThemeColor(e.target.value)}
              className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer"
            />
            <input
              type="text"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              placeholder="#123e35"
              className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
            />
          </div>
        </div>

        {/* Chatbot Icon Picker (8 Presets) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase text-slate-600">Chatbot Launcher Icon</label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {FRONTDESK_ICON_PRESETS.map((preset) => {
              const selected = iconPreset === preset.id && !iconUrl.trim();
              return (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.label}
                  onClick={() => {
                    setIconPreset(preset.id);
                    setIconUrl('');
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                    selected
                      ? 'border-[#123e35] bg-emerald-50 text-[#123e35] ring-2 ring-[#123e35]/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <PresetSvgIcon preset={preset.id} className="w-5 h-5" />
                </button>
              );
            })}
          </div>
          <div className="pt-1">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Or paste a custom HTTPS logo URL (optional)
            </label>
            <input
              type="url"
              placeholder="https://yoursite.com/logo-icon.png"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
        </div>

        {/* Assistant Name & Corner Position */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Assistant Name</label>
            <input
              type="text"
              maxLength={50}
              value={assistantName}
              onChange={(e) => setAssistantName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Widget Corner</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPosition('right')}
                className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                  position === 'right'
                    ? 'bg-[#123e35] text-white border-[#123e35]'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Bottom Right
              </button>
              <button
                type="button"
                onClick={() => setPosition('left')}
                className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                  position === 'left'
                    ? 'bg-[#123e35] text-white border-[#123e35]'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Bottom Left
              </button>
            </div>
          </div>
        </div>

        {/* Greeting Message */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Greeting Message</label>
          <textarea
            rows={2}
            maxLength={280}
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
          />
        </div>

        {/* Quick Reply Chips */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
            Quick Reply Prompts (1 per line, max 4)
          </label>
          <textarea
            rows={3}
            value={chipsText}
            onChange={(e) => setChipsText(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#123e35] text-white font-bold text-sm hover:bg-[#195347] disabled:opacity-50 cursor-pointer"
          >
            {savedNotice ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : savedNotice ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </form>

      {/* Live Preview Panel */}
      <div className="lg:col-span-5 bg-white border border-[#dfded4] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#bc5f40]" />
            <span>Live Widget Preview</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {position === 'left' ? 'bottom-left' : 'bottom-right'}
          </span>
        </div>

        {/* Simulated Chat Drawer */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-lg bg-slate-50">
          <div
            className="p-4 text-white flex items-center justify-between"
            style={{ backgroundColor: themeColor }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {iconUrl.trim().startsWith('https://') ? (
                  <img src={iconUrl.trim()} alt="" className="w-full h-full object-cover" />
                ) : (
                  <PresetSvgIcon preset={iconPreset} className="w-4 h-4 text-white" />
                )}
              </div>
              <div>
                <div className="font-bold text-sm leading-tight">{site.business_name}</div>
                <div className="text-[11px] opacity-90">{assistantName || 'AI Assistant'} Online</div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3 min-h-[160px]">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs p-3 text-xs text-slate-800 max-w-[85%] shadow-xs">
              {greeting || `Hi! How can we help you today?`}
            </div>
          </div>

          {parsedChips.length > 0 && (
            <div className="px-3 py-2 bg-white border-t border-slate-200 flex flex-wrap gap-1.5">
              {parsedChips.map((chip, i) => (
                <span
                  key={i}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}

          <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <span>Ask a question...</span>
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: themeColor }}
            >
              &rarr;
            </span>
          </div>
        </div>

        {/* Launcher Bubble Preview */}
        <div className={`flex ${position === 'left' ? 'justify-start' : 'justify-end'}`}>
          <div
            className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg overflow-hidden"
            style={{ backgroundColor: themeColor }}
          >
            {iconUrl.trim().startsWith('https://') ? (
              <img src={iconUrl.trim()} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <PresetSvgIcon preset={iconPreset} className="w-6 h-6" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
