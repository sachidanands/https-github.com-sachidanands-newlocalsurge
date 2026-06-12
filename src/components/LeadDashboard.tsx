import React, { useState, useEffect } from 'react';
import { Lead } from '../types';
import { 
  Users, Calendar, BarChart3, TrendingUp, Sliders, CheckSquare, Trash2, Save, 
  MessageSquare, FileText, ExternalLink, RefreshCw, Eye, Sparkles, Phone, Mail, Globe, MapPin
} from 'lucide-react';

interface LeadDashboardProps {
  leads: Lead[];
  onUpdateLeads: () => void;
}

export default function LeadDashboard({ leads: initialLeads, onUpdateLeads }: LeadDashboardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  
  // Note/Status updates
  const [currentNotes, setCurrentNotes] = useState<string>('');
  const [currentStatus, setCurrentStatus] = useState<Lead['status']>('new');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [pdfGenerating, setPdfGenerating] = useState<string | null>(null);

  useEffect(() => {
    setLeads(initialLeads);
    if (selectedLead) {
      const updatedSelected = initialLeads.find(l => l.id === selectedLead.id);
      if (updatedSelected) {
        setSelectedLead(updatedSelected);
        setCurrentNotes(updatedSelected.notes || '');
        setCurrentStatus(updatedSelected.status);
      }
    }
  }, [initialLeads]);

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setCurrentNotes(lead.notes || '');
    setCurrentStatus(lead.status);
  };

  const handleSaveLeadUpdates = async () => {
    if (!selectedLead) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/leads/${selectedLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: currentStatus,
          notes: currentNotes
        })
      });

      if (response.ok) {
        onUpdateLeads();
      } else {
        alert('Failed saving updates. Check connection.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend API.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLead = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you absolutely sure you want to delete this lead?')) return;
    
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        if (selectedLead?.id === leadId) setSelectedLead(null);
        onUpdateLeads();
      } else {
        alert('Failed deleting lead.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulatePDF = (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPdfGenerating(leadId);
    setTimeout(() => {
      setPdfGenerating(null);
      alert('📄 Success: Optimized Local SEO Strategy Brief PDF generated and sent to printer queue!');
    }, 1500);
  };

  // Stats
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const onboardedLeads = leads.filter(l => l.status === 'onboarded').length;
  const avgSeoScore = totalLeads > 0 
    ? Math.round(leads.reduce((acc, l) => acc + (l.aiAudit?.overallScore || 0), 0) / leads.filter(l => l.aiAudit).length || 65)
    : 0;

  // Filter & Search
  const filteredLeads = leads.filter(lead => {
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesSearch = 
      lead.input.businessName.toLowerCase().includes(search.toLowerCase()) ||
      lead.input.contactName.toLowerCase().includes(search.toLowerCase()) ||
      lead.input.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.input.industry.toLowerCase().includes(search.toLowerCase()) ||
      lead.input.location.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div id="lead-dashboard-panel" className="bg-[#f7f6f2] min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black font-display text-[#151716] tracking-tight leading-none whitespace-normal">
              Lead Management Board 📊
            </h1>
            <p className="text-[#4e524f] font-semibold text-sm mt-1">
              Analyze incoming business SEO inquiries, view Gemini-driven strategy briefs, and manage your manual onboarding sales flow.
            </p>
          </div>
          <button 
            onClick={onUpdateLeads}
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold bg-white text-[#4e524f] hover:text-[#1a1c1a] shadow-xs border border-[#dfded4] cursor-pointer transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Leads
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-[#dfded4] p-6 rounded-2xl flex items-center gap-4 hover:shadow-xs transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#123e35]/10 flex items-center justify-center text-[#123e35] shrink-0 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black font-display text-[#1a1c1a] tracking-tight block leading-none">{totalLeads}</span>
              <span className="text-[10px] font-bold text-[#4e524f] font-mono tracking-wider uppercase mt-1.5 block">Total captured</span>
            </div>
          </div>
          
          <div className="bg-white border border-[#dfded4] p-6 rounded-2xl flex items-center gap-4 hover:shadow-xs transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#123e35]/10 flex items-center justify-center text-[#123e35] shrink-0 font-bold">
              <Sparkles className="w-5 h-5 text-[#bc5f40]" />
            </div>
            <div>
              <span className="text-2xl font-black font-display text-[#1a1c1a] tracking-tight block leading-none">{avgSeoScore}%</span>
              <span className="text-[10px] font-bold text-[#4e524f] font-mono tracking-wider uppercase mt-1.5 block">Avg SEO Score</span>
            </div>
          </div>

          <div className="bg-white border border-[#dfded4] p-6 rounded-2xl flex items-center gap-4 hover:shadow-xs transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#123e35]/10 flex items-center justify-center text-[#123e35] shrink-0 font-bold">
              <Sliders className="w-5 h-5 select-none" />
            </div>
            <div>
              <span className="text-2xl font-black font-display text-[#1a1c1a] tracking-tight block leading-none">{newLeads}</span>
              <span className="text-[10px] font-bold text-[#4e524f] font-mono tracking-wider uppercase mt-1.5 block">New Inquiries</span>
            </div>
          </div>

          <div className="bg-white border border-[#dfded4] p-6 rounded-2xl flex items-center gap-4 hover:shadow-xs transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#123e35]/10 flex items-center justify-center text-[#123e35] shrink-0 font-bold">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black font-display text-[#1a1c1a] tracking-tight block leading-none">{onboardedLeads}</span>
              <span className="text-[10px] font-bold text-[#4e524f] font-mono tracking-wider uppercase mt-1.5 block">Onboarded Clients</span>
            </div>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* List panel */}
          <div className="lg:col-span-1 bg-white border border-[#dfded4] rounded-2xl overflow-hidden flex flex-col h-[650px] shadow-xs">
            {/* Filter controls */}
            <div className="p-4 border-b border-[#dfded4] space-y-4 bg-[#faf9f6]">
              <div className="flex gap-2 flex-wrap">
                {['all', 'new', 'audit_prepared', 'onboarded', 'archived'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer transition-all ${
                      filterStatus === status
                        ? 'bg-[#123e35] text-white shadow-xs'
                        : 'bg-white border border-[#dfded4] text-[#4e524f] hover:bg-[#faf9f6]'
                    }`}
                  >
                    {status === 'all' && 'All'}
                    {status === 'new' && 'New'}
                    {status === 'audit_prepared' && 'Audits'}
                    {status === 'onboarded' && 'Active'}
                    {status === 'archived' && 'Archived'}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border border-[#dfded4] rounded-xl w-full px-4 py-2 text-xs text-[#1a1c1a] placeholder-[#888b88] focus:outline-none focus:border-[#bc5f40]"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#dfded4]">
              {filteredLeads.length === 0 ? (
                <div className="py-20 text-center text-[#888b88] text-xs font-mono">
                  No matching business leads found.
                </div>
              ) : (
                filteredLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => handleSelectLead(lead)}
                    className={`w-full text-left p-4.5 hover:bg-[#faf9f6]/95 transition-all flex justify-between items-start cursor-pointer ${
                      selectedLead?.id === lead.id ? 'bg-[#123e35]/10 border-l-4 border-[#bc5f40] text-[#1a1c1a]' : ''
                    }`}
                  >
                    <div className="space-y-1.5 pr-2">
                      <span className="px-1.5 py-0.5 text-[8px] font-bold tracking-wide uppercase bg-[#bc5f40]/10 border border-[#bc5f40]/15 text-[#bc5f40] rounded">
                        {lead.input.planName}
                      </span>
                      <h4 className="font-extrabold text-sm text-[#151716] leading-tight">
                        {lead.input.businessName}
                      </h4>
                      <p className="text-xs text-[#4e524f] leading-none font-semibold">
                        {lead.input.contactName} • {lead.input.location}
                      </p>
                      <span className="text-[10px] text-[#888b88] block font-mono">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase font-mono tracking-wider rounded border ${
                        lead.status === 'new' ? 'bg-[#bc5f40]/10 text-[#bc5f40] border-[#bc5f40]/25' :
                        lead.status === 'audit_prepared' ? 'bg-[#123e35]/10 text-[#123e35] border-[#123e35]/25' :
                        lead.status === 'onboarded' ? 'bg-[#123e35]/15 text-[#123e35] border-[#123e35]/30' :
                        'bg-[#faf9f6] text-[#4e524f] border-[#dfded4]'
                      }`}>
                        {lead.status === 'new' ? 'New' :
                         lead.status === 'audit_prepared' ? 'Strategy Built' :
                         lead.status === 'onboarded' ? 'Active' :
                         lead.status}
                      </span>
                      
                      <button
                        onClick={(e) => handleDeleteLead(lead.id, e)}
                        className="text-[#888b88] hover:text-[#bc5f40] transition-colors p-1"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Details panel */}
          <div className="lg:col-span-2 bg-white border border-[#dfded4] rounded-2xl overflow-hidden flex flex-col h-[650px] shadow-xs">
            {selectedLead ? (
              <div className="flex-1 overflow-y-auto flex flex-col">
                {/* Detail Header */}
                <div className="p-6 bg-[#faf9f6] border-b border-[#dfded4] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="px-2.5 py-1 text-[9px] font-bold font-mono tracking-widest bg-[#123e35]/10 text-[#123e35] border border-[#123e35]/20 uppercase rounded">
                      Package: {selectedLead.input.planName}
                    </span>
                    <h2 className="text-xl font-black font-display text-[#151716] mt-2 whitespace-normal leading-tight">
                      {selectedLead.input.businessName}
                    </h2>
                    <p className="text-xs text-[#4e524f] font-semibold mt-0.5">
                      Submitted on {new Date(selectedLead.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleSimulatePDF(selectedLead.id, e)}
                      disabled={pdfGenerating === selectedLead.id}
                      className="bg-white hover:bg-[#faf9f6]/95 border border-[#dfded4] text-xs font-bold text-[#4e524f] px-3.5 py-2.5 rounded-xl shrink-0 cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      {pdfGenerating === selectedLead.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Building...
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5 text-[#bc5f40]" />
                          Draft Strategy PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                  
                  {/* Grid fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1 */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-[#bc5f40] uppercase font-mono tracking-wider">Contact Info</h3>
                      
                      <div className="bg-[#faf9f6]/95 border border-[#dfded4] p-4 rounded-xl space-y-3">
                        <div className="flex items-center gap-2.5 text-xs text-[#2d2f2d] font-semibold">
                          <Users className="w-4 h-4 text-[#888b88] shrink-0" />
                          <div>
                            <p className="text-[9px] text-[#4e524f] font-bold uppercase leading-none">Contact Person</p>
                            <p className="mt-1 text-[#1a1c1a]">{selectedLead.input.contactName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 text-xs text-[#2d2f2d] font-semibold">
                          <Mail className="w-4 h-4 text-[#888b88] shrink-0" />
                          <div>
                            <p className="text-[9px] text-[#4e524f] font-bold uppercase leading-none">Email Address</p>
                            <a href={`mailto:${selectedLead.input.email}`} className="mt-1 block text-[#123e35] font-bold hover:underline">{selectedLead.input.email}</a>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 text-xs text-[#2d2f2d] font-semibold">
                          <Phone className="w-4 h-4 text-[#888b88] shrink-0" />
                          <div>
                            <p className="text-[9px] text-[#4e524f] font-bold uppercase leading-none">Phone Number</p>
                            <a href={`tel:${selectedLead.input.phone}`} className="mt-1 block text-[#123e35] font-bold hover:underline">{selectedLead.input.phone}</a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-[#bc5f40] uppercase font-mono tracking-wider">Business Context</h3>

                      <div className="bg-[#faf9f6]/95 border border-[#dfded4] p-4 rounded-xl space-y-3">
                        <div className="flex items-center gap-2.5 text-xs text-[#2d2f2d] font-semibold">
                          <Globe className="w-4 h-4 text-[#888b88] shrink-0" />
                          <div>
                            <p className="text-[9px] text-[#4e524f] font-bold uppercase leading-none">Website</p>
                            {selectedLead.input.hasWebsite ? (
                              <a href={selectedLead.input.website} target="_blank" rel="noreferrer" className="mt-1 text-[#123e35] font-bold hover:underline flex items-center gap-1">
                                {selectedLead.input.website}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <p className="mt-1 text-[#bc5f40] font-bold">Needs Complete Build</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 text-xs text-[#2d2f2d] font-semibold">
                          <MapPin className="w-4 h-4 text-[#888b88] shrink-0" />
                          <div>
                            <p className="text-[9px] text-[#4e524f] font-bold uppercase leading-none">Niche & Region Focus</p>
                            <p className="mt-1 text-[#1a1c1a]">{selectedLead.input.industry} • <span className="font-bold text-[#123e35]">{selectedLead.input.location}</span></p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 text-xs text-[#2d2f2d] font-semibold">
                          <Sliders className="w-4 h-4 text-[#888b88] shrink-0" />
                          <div>
                            <p className="text-[9px] text-[#4e524f] font-bold uppercase leading-none font-mono">GBP Listing Status</p>
                            {selectedLead.input.hasGBP ? (
                              <p className="mt-1 text-[#1a1c1a] break-all font-semibold">{selectedLead.input.gbpLink}</p>
                            ) : (
                              <p className="mt-1 text-[#bc5f40] font-bold">Needs GMB Setup</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Keywords block */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-[#bc5f40] uppercase font-mono tracking-wider">Target Keywords & Services</h3>
                    <p className="text-xs text-[#4e524f] bg-[#faf9f6]/95 border border-[#dfded4] p-3.5 rounded-xl font-semibold">
                      {selectedLead.input.keywords}
                    </p>
                  </div>

                  {/* Sales logs and Notes editor */}
                  <div className="p-4.5 bg-[#123e35]/10 border border-[#123e35]/20 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#123e35] uppercase font-mono tracking-wide mb-1.5">
                        Lifecycle Status
                      </label>
                      <select
                        value={currentStatus}
                        onChange={(e) => setCurrentStatus(e.target.value as Lead['status'])}
                        className="bg-white border border-[#dfded4] rounded-xl w-full px-3 py-2 text-xs font-bold text-[#1a1c1a] cursor-pointer focus:outline-none focus:border-[#bc5f40]"
                      >
                        <option value="new">New Lead</option>
                        <option value="contacted">Lead Contacted</option>
                        <option value="audit_prepared">Strategy Prepared</option>
                        <option value="onboarded">Onboarded Client</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div className="flex flex-col justify-between">
                      <label className="block text-xs font-bold text-[#123e35] uppercase font-mono tracking-wide mb-1.5">
                        Internal Call Logs & Sales Notes
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={currentNotes}
                          onChange={(e) => setCurrentNotes(e.target.value)}
                          placeholder="e.g., Left voicemail. Set call for 10am tomorrow."
                          className="bg-white border border-[#dfded4] rounded-xl w-full px-3.5 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#bc5f40]"
                        />
                        <button
                          onClick={handleSaveLeadUpdates}
                          disabled={isSaving}
                          className="bg-[#123e35] hover:bg-[#185246] hover:shadow-xs text-white rounded-xl text-xs font-bold px-4 py-2 shrink-0 cursor-pointer flex items-center gap-1 transition-all"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Generated Audit Strategy */}
                  {selectedLead.aiAudit && (
                    <div className="border border-[#dfded4] rounded-2xl p-4 bg-[#faf9f6] space-y-4 shadow-xs">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-semibold text-[#bc5f40] uppercase font-mono tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#bc5f40]" />
                          Gemini Strategy Brief (Attached score: {selectedLead.aiAudit.overallScore}%)
                        </h4>
                      </div>
                      
                      <div className="text-xs font-semibold text-[#4e524f] leading-relaxed">
                        <span className="font-black text-[#151716] block mb-1">Strategic Outlook Summary:</span>
                        <span>{selectedLead.aiAudit.executiveSummary}</span>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#faf9f6]">
                <div className="w-16 h-16 rounded-full bg-white border border-[#dfded4] flex items-center justify-center text-[#888b88] mb-4 shadow-xs">
                  <Eye className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#151716]">No Lead Selected</h4>
                <p className="text-xs text-[#4e524f] font-semibold max-w-sm mt-1">
                  Select a business submission card on the left panel to examine business parameters, view strategy parameters, edit logs, and change onboarding status.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
