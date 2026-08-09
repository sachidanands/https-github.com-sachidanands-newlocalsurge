import React from 'react';
import { Bot, ShieldCheck, Check, X, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WebMcpTool } from '../utils/webmcp';

interface WebMcpConsentModalProps {
  isOpen: boolean;
  tool: WebMcpTool | null;
  params: Record<string, any> | null;
  onApprove: () => void;
  onDecline: () => void;
  isExecuting?: boolean;
}

export default function WebMcpConsentModal({
  isOpen,
  tool,
  params,
  onApprove,
  onDecline,
  isExecuting
}: WebMcpConsentModalProps) {
  if (!isOpen || !tool || !params) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#151716]/65 backdrop-blur-xs"
          onClick={onDecline}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-[#faf9f6] border border-[#dfded4] rounded-3xl w-full max-w-lg p-6 sm:p-8 relative z-10 shadow-2xl space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#dfded4] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#123e35] text-white flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="px-2 py-0.5 text-[9px] font-bold font-mono uppercase tracking-wider bg-[#bc5f40]/10 text-[#bc5f40] border border-[#bc5f40]/25 rounded">
                  WebMCP Protocol • User Consent Prompt
                </span>
                <h3 className="text-lg font-black font-display text-[#151716] tracking-tight mt-0.5">
                  AI Agent Requests Action Authorization
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onDecline}
              className="text-[#888b88] hover:text-[#151716] bg-white border border-[#dfded4] rounded-full p-1.5 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description Callout */}
          <div className="bg-white border border-[#dfded4] p-4.5 rounded-2xl space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black font-mono text-[#123e35] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#bc5f40]" />
                Tool: <code className="bg-[#faf9f6] px-1.5 py-0.5 rounded border border-[#dfded4]">{tool.name}</code>
              </span>
              <span className={`text-[9px] font-black font-mono uppercase px-2 py-0.5 rounded border ${
                tool.riskLevel === 'high' 
                  ? 'bg-red-50 text-red-700 border-red-200' 
                  : tool.riskLevel === 'medium' 
                    ? 'bg-amber-50 text-amber-800 border-amber-200' 
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {tool.riskLevel} risk action
              </span>
            </div>
            <p className="text-xs text-[#5c605d] font-semibold leading-relaxed">
              {tool.description}
            </p>
          </div>

          {/* Parameters Payload Inspection */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4e524f] font-mono">
              Inspect Agent Payload Data:
            </label>
            <div className="bg-[#151716] text-[#fbfaf8] p-3.5 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto border border-[#2d2f2d] max-h-[160px]">
              <pre className="whitespace-pre-wrap">{JSON.stringify(params, null, 2)}</pre>
            </div>
          </div>

          {/* User Security Notice */}
          <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl text-amber-900 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-amber-900">
              WebMCP enforces human-in-the-loop validation. By clicking <strong>Authorize Action</strong>, you permit your AI assistant to execute this request on <code>localsurgeseo.com</code>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-3 border-t border-[#dfded4]">
            <button
              type="button"
              onClick={onDecline}
              disabled={isExecuting}
              className="px-5 py-2.5 bg-white hover:bg-[#dfded4]/40 border border-[#dfded4] text-[#151716] text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Decline Action
            </button>
            <button
              type="button"
              onClick={onApprove}
              disabled={isExecuting}
              className="px-6 py-2.5 bg-[#123e35] hover:bg-[#185246] text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 uppercase font-mono tracking-wider shadow-2xs disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#bc5f40]" />
                  <span>Authorize & Execute</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
