import React, { useState, useEffect } from 'react';
import { OutreachProspect, OutreachPitchItem } from '../types';
import { 
  Search, Send, Trash2, RefreshCw, Eye, Sparkles, CheckCircle2, AlertTriangle, 
  Mail, ExternalLink, ShieldCheck, Zap, Bot, FileText, Check, Clock, MousePointer, XCircle
} from 'lucide-react';

export default function OutreachDashboard() {
  const [niche, setNiche] = useState('Plumbing & Rooter');
  const [location, setLocation] = useState('San Jose, CA');
  const [scanning, setScanning] = useState(false);
  const [prospects, setProspects] = useState<OutreachProspect[]>([]);
  const [queue, setQueue] = useState<OutreachPitchItem[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [generatingPitchId, setGeneratingPitchId] = useState<string | null>(null);
  const [approvingPitchId, setApprovingPitchId] = useState<string | null>(null);

  // Selected pitch for editing/viewing
  const [selectedPitch, setSelectedPitch] = useState<OutreachPitchItem | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  const fetchQueue = async () => {
    setLoadingQueue(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const res = await fetch('/api/outreach/queue', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQueue(data);
      }
    } catch (err) {
      console.error('Error fetching outreach queue:', err);
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleRunProspectScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim() || !location.trim()) return;

    setScanning(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const res = await fetch('/api/outreach/prospect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ niche: niche.trim(), location: location.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setProspects(data.prospects || []);
      }
    } catch (err) {
      console.error('Error running prospect scan:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleGeneratePitch = async (prospect: OutreachProspect) => {
    setGeneratingPitchId(prospect.id);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const res = await fetch('/api/outreach/generate-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prospect })
      });

      if (res.ok) {
        await fetchQueue();
        // Remove prospect from found list once queued
        setProspects(prev => prev.filter(p => p.id !== prospect.id));
      }
    } catch (err) {
      console.error('Error generating pitch:', err);
    } finally {
      setGeneratingPitchId(null);
    }
  };

  const handleOpenPitchModal = (pitch: OutreachPitchItem) => {
    setSelectedPitch(pitch);
    setEditSubject(pitch.emailSubject);
    setEditBody(pitch.emailBody);
  };

  const handleApprovePitch = async (pitchId: string) => {
    setApprovingPitchId(pitchId);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const res = await fetch('/api/outreach/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pitchId,
          emailSubject: editSubject || undefined,
          emailBody: editBody || undefined
        })
      });

      if (res.ok) {
        await fetchQueue();
        if (selectedPitch?.id === pitchId) {
          setSelectedPitch(null);
        }
      }
    } catch (err) {
      console.error('Error approving pitch:', err);
    } finally {
      setApprovingPitchId(null);
    }
  };

  const handleRejectPitch = async (pitchId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to remove this pitch from the queue?')) return;

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const res = await fetch(`/api/outreach/reject/${pitchId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        if (selectedPitch?.id === pitchId) setSelectedPitch(null);
        await fetchQueue();
      }
    } catch (err) {
      console.error('Error rejecting pitch:', err);
    }
  };

  const getStatusBadge = (status: OutreachPitchItem['status']) => {
    switch (status) {
      case 'queued':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1"><Clock className="w-3 h-3" /> Queued for Review</span>;
      case 'approved':
      case 'sent':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1"><Send className="w-3 h-3" /> Sent</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Delivered</span>;
      case 'opened':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 flex items-center gap-1"><Eye className="w-3 h-3" /> Opened by Prospect</span>;
      case 'clicked':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-900 border border-green-300 flex items-center gap-1"><MousePointer className="w-3 h-3" /> Clicked Brief / Link</span>;
      case 'bounced':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 flex items-center gap-1"><XCircle className="w-3 h-3" /> Hard Bounced</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Sourcing Panel */}
      <div className="bg-white border border-[#dfded4] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#dfded4] pb-4">
          <div>
            <h2 className="text-lg font-black text-[#151716] flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#bc5f40]" />
              Automated Business Prospecting Engine
            </h2>
            <p className="text-xs text-[#4e524f] mt-0.5">
              Query local business directories by industry and city. Automatically checks MX email validity & local schema gaps.
            </p>
          </div>
          <button
            onClick={fetchQueue}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f7f6f2] hover:bg-[#e8e7e1] text-[#151716] transition cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingQueue ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>

        <form onSubmit={handleRunProspectScan} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#151716] mb-1">Target Niche / Industry</label>
            <input
              type="text"
              value={niche}
              onChange={e => setNiche(e.target.value)}
              placeholder="e.g. Plumbing Services, Dental, HVAC"
              className="w-full px-3 py-2 text-xs border border-[#dfded4] rounded-xl focus:outline-none focus:border-[#123e35] bg-[#faf9f6]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#151716] mb-1">Target City / Metro Area</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. San Jose, CA"
              className="w-full px-3 py-2 text-xs border border-[#dfded4] rounded-xl focus:outline-none focus:border-[#123e35] bg-[#faf9f6]"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={scanning}
              className="w-full py-2 px-4 bg-[#123e35] hover:bg-[#0d2e27] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Scanning Local Businesses...
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  Find Prospects & Audit Gaps
                </>
              )}
            </button>
          </div>
        </form>

        {/* Found Prospects List */}
        {prospects.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase text-[#123e35] tracking-wider">
              Discovered Business Prospects ({prospects.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {prospects.map(p => (
                <div key={p.id} className="bg-[#faf9f6] border border-[#dfded4] rounded-xl p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#151716] truncate">{p.businessName}</h4>
                      {p.emailValid && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          MX Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#4e524f] flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#888b88]" /> {p.email}
                    </p>
                    <p className="text-xs text-[#4e524f] flex items-center gap-1 truncate">
                      <ExternalLink className="w-3 h-3 text-[#888b88]" /> {p.website}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-[#2d2f2d]">
                      <span className="font-semibold bg-[#123e35]/5 px-2 py-0.5 rounded text-[#123e35]">{p.mapRanking}</span>
                      <span>NAP Score: {p.napScore}/100</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleGeneratePitch(p)}
                    disabled={generatingPitchId === p.id}
                    className="w-full py-1.5 bg-[#bc5f40] hover:bg-[#a34d31] text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    {generatingPitchId === p.id ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Generating Audit & Teaser...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        Generate AI Audit & Queue Pitch
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Outreach Queue Section */}
      <div className="bg-white border border-[#dfded4] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#dfded4] pb-4">
          <div>
            <h2 className="text-lg font-black text-[#151716] flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#123e35]" />
              Outreach Pitch Queue ({queue.length})
            </h2>
            <p className="text-xs text-[#4e524f] mt-0.5">
              Review hyper-personalized teaser emails, preview attached PDF strategy briefs, and dispatch approved pitches.
            </p>
          </div>
        </div>

        {queue.length === 0 ? (
          <div className="text-center py-12 text-[#888b88] space-y-2">
            <Mail className="w-8 h-8 mx-auto opacity-50" />
            <p className="text-sm font-semibold">No pitches currently queued in your outbound review board.</p>
            <p className="text-xs">Run a prospect scan above or trigger the CLI automation runner to populate pitches.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map(item => (
              <div
                key={item.id}
                onClick={() => handleOpenPitchModal(item)}
                className="bg-[#faf9f6] border border-[#dfded4] hover:border-[#123e35]/40 rounded-xl p-4.5 transition cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-bold text-sm text-[#151716] truncate">{item.prospect.businessName}</h3>
                    {getStatusBadge(item.status)}
                    <span className="text-xs font-semibold text-[#888b88]">
                      SEO Score: <strong className="text-[#123e35]">{item.auditScore}/100</strong>
                    </span>
                  </div>
                  <p className="text-xs text-[#4e524f] font-medium truncate">
                    Subject: {item.emailSubject}
                  </p>
                  <p className="text-[11px] text-[#888b88] truncate">
                    Recipient: {item.prospect.email} • Location: {item.prospect.location}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenPitchModal(item)}
                    className="px-3 py-1.5 text-xs font-bold bg-white border border-[#dfded4] hover:bg-[#f0efea] text-[#151716] rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Review / Edit
                  </button>

                  {item.status === 'queued' && (
                    <button
                      onClick={() => handleApprovePitch(item.id)}
                      disabled={approvingPitchId === item.id}
                      className="px-3.5 py-1.5 text-xs font-bold bg-[#123e35] hover:bg-[#0d2e27] text-white rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {approvingPitchId === item.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Approve & Send
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={e => handleRejectPitch(item.id, e)}
                    className="p-1.5 text-[#ae3b1b] hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review / Edit Modal */}
      {selectedPitch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#dfded4] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#dfded4] pb-4">
              <div>
                <h3 className="text-base font-black text-[#151716]">
                  Review Pitch: {selectedPitch.prospect.businessName}
                </h3>
                <p className="text-xs text-[#888b88]">
                  Recipient: {selectedPitch.prospect.email} • Target: {selectedPitch.prospect.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedPitch(null)}
                className="text-[#888b88] hover:text-[#151716] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 3-Point Teaser Summary */}
            <div className="bg-[#eff4f1] border border-[#dfded4] rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#123e35] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#bc5f40]" />
                Identified Local SEO Gaps (3-Point Teaser)
              </h4>
              <ul className="text-xs text-[#1a1c1a] space-y-1 pl-4 list-disc">
                {selectedPitch.teaserPoints.map((tp, idx) => (
                  <li key={idx}>{tp}</li>
                ))}
              </ul>
            </div>

            {/* Subject Input */}
            <div>
              <label className="block text-xs font-bold text-[#151716] mb-1">Email Subject Line</label>
              <input
                type="text"
                value={editSubject}
                onChange={e => setEditSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#dfded4] rounded-xl focus:outline-none focus:border-[#123e35] bg-[#faf9f6]"
              />
            </div>

            {/* Body Input */}
            <div>
              <label className="block text-xs font-bold text-[#151716] mb-1">Personalized Email Body</label>
              <textarea
                rows={8}
                value={editBody}
                onChange={e => setEditBody(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#dfded4] rounded-xl focus:outline-none focus:border-[#123e35] bg-[#faf9f6] font-mono leading-relaxed"
              />
            </div>

            <div className="bg-[#faf9f6] border border-[#dfded4] rounded-xl p-3 text-xs text-[#4e524f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#123e35] shrink-0" />
                <span>
                  <strong>PDF Brief & Live Demo:</strong> Strategy PDF attached + Live demo at <code className="text-[#123e35] font-bold">/demo/{(selectedPitch.prospect.businessName + '-' + selectedPitch.prospect.location).toLowerCase().replace(/[^a-z0-9]/g, '-')}</code>
                </span>
              </div>
              <a
                href={`/demo/${(selectedPitch.prospect.businessName + '-' + selectedPitch.prospect.location).toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#123e35] text-white font-bold rounded-lg hover:bg-[#0d2e27] transition flex items-center gap-1 shrink-0"
              >
                <ExternalLink className="w-3 h-3" /> Preview Live Demo Site
              </a>
            </div>


            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedPitch(null)}
                className="px-4 py-2 text-xs font-bold bg-[#f7f6f2] hover:bg-[#e8e7e1] text-[#151716] rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprovePitch(selectedPitch.id)}
                disabled={approvingPitchId === selectedPitch.id}
                className="px-5 py-2 text-xs font-bold bg-[#123e35] hover:bg-[#0d2e27] text-white rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {approvingPitchId === selectedPitch.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Sending Email & PDF...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Approve & Dispatch Pitch
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
