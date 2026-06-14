import React, { useState, useEffect } from 'react';
import { Lead } from '../types';
import { 
  Users, Calendar, BarChart3, TrendingUp, Sliders, CheckSquare, Trash2, Save, 
  MessageSquare, FileText, ExternalLink, RefreshCw, Eye, Sparkles, Phone, Mail, Globe, MapPin,
  Plus, Minus, Settings, ListChecks, Lock
} from 'lucide-react';

interface LeadDashboardProps {
  leads: Lead[];
  onUpdateLeads: () => void;
  pdfTemplates?: any;
  onUpdateTemplates?: () => void;
  onGeneratePDF?: (planId: string, name: string, email: string) => string;
  onLock?: () => void;
}

export default function LeadDashboard({ 
  leads: initialLeads, 
  onUpdateLeads,
  pdfTemplates,
  onUpdateTemplates,
  onGeneratePDF,
  onLock
}: LeadDashboardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  
  // Tab control
  const [activeTab, setActiveTab ] = useState<'leads' | 'pdf-customizer'>('leads');
  
  // Note/Status updates
  const [currentNotes, setCurrentNotes] = useState<string>('');
  const [currentStatus, setCurrentStatus] = useState<Lead['status']>('new');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [pdfGenerating, setPdfGenerating] = useState<string | null>(null);

  // Editable PDF parameters local state
  const [localTemplates, setLocalTemplates] = useState<any>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('single-page');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Input holders for additions
  const [newDelivText, setNewDelivText] = useState('');
  const [newActionText, setNewActionText] = useState('');

  // Sync templates on prop load
  useEffect(() => {
    if (pdfTemplates) {
      setLocalTemplates(JSON.parse(JSON.stringify(pdfTemplates)));
    }
  }, [pdfTemplates]);

  // Handle saving modified templates and triggering root reload
  const handleSaveTemplates = async () => {
    if (!localTemplates) return;
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/pdf-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localTemplates)
      });
      if (response.ok) {
        setSaveStatus('success');
        if (onUpdateTemplates) {
          onUpdateTemplates();
        }
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  // Modify individual deliverable item
  const handleEditDeliverable = (index: number, val: string) => {
    if (!localTemplates) return;
    const updated = { ...localTemplates };
    updated[selectedPlanId].deliverables[index] = val;
    setLocalTemplates(updated);
  };

  // Remove deliverable item
  const handleRemoveDeliverable = (index: number) => {
    if (!localTemplates) return;
    const updated = { ...localTemplates };
    updated[selectedPlanId].deliverables.splice(index, 1);
    setLocalTemplates(updated);
  };

  // Add deliverable item
  const handleAddDeliverable = () => {
    if (!newDelivText.trim() || !localTemplates) return;
    const updated = { ...localTemplates };
    if (!updated[selectedPlanId].deliverables) {
      updated[selectedPlanId].deliverables = [];
    }
    updated[selectedPlanId].deliverables.push(newDelivText.trim());
    setLocalTemplates(updated);
    setNewDelivText('');
  };

  // Modify onboarding action step
  const handleEditAction = (index: number, val: string) => {
    if (!localTemplates) return;
    const updated = { ...localTemplates };
    updated[selectedPlanId].actions[index] = val;
    setLocalTemplates(updated);
  };

  // Remove onboarding action step
  const handleRemoveAction = (index: number) => {
    if (!localTemplates) return;
    const updated = { ...localTemplates };
    updated[selectedPlanId].actions.splice(index, 1);
    setLocalTemplates(updated);
  };

  // Add onboarding action step
  const handleAddAction = () => {
    if (!newActionText.trim() || !localTemplates) return;
    const updated = { ...localTemplates };
    if (!updated[selectedPlanId].actions) {
      updated[selectedPlanId].actions = [];
    }
    updated[selectedPlanId].actions.push(newActionText.trim());
    setLocalTemplates(updated);
    setNewActionText('');
  };

  // Modify the timeline text
  const handleEditTimeline = (val: string) => {
    if (!localTemplates) return;
    const updated = { ...localTemplates };
    updated[selectedPlanId].timeline = val;
    setLocalTemplates(updated);
  };

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

  const handleMarkLeadCompleted = async (leadId: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          notes: currentNotes || 'Flagged as completed.'
        })
      });
      if (response.ok) {
        onUpdateLeads();
      } else {
        alert('Failed updating lead status.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulatePDF = (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    
    setPdfGenerating(leadId);
    setTimeout(() => {
      try {
        if (onGeneratePDF) {
          onGeneratePDF(
            lead.input.planId || 'custom',
            lead.input.contactName,
            lead.input.email
          );
        } else {
          alert('📄 Success: Optimized Local SEO Strategy Brief PDF generated and sent to printer queue!');
        }
      } catch (err) {
        console.error('Error generating strategy PDF:', err);
        alert('Could not compile PDF: ' + String(err));
      } finally {
        setPdfGenerating(null);
      }
    }, 1200);
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
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button 
              onClick={onUpdateLeads}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold bg-white text-[#4e524f] hover:text-[#1a1c1a] shadow-xs border border-[#dfded4] cursor-pointer transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Leads
            </button>
            {onLock && (
              <button 
                onClick={onLock}
                className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold bg-[#ae3b1b]/10 text-[#ae3b1b] hover:bg-[#ae3b1b]/20 hover:text-[#8e290f] shadow-xs border border-[#ae3b1b]/20 cursor-pointer transition-all"
                title="Lock admin board and log out"
              >
                <Lock className="w-3.5 h-3.5" />
                Lock Board
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#dfded4] pb-px gap-6 block mt-4 select-none">
          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-3 px-1 text-sm font-bold border-b-2 cursor-pointer transition-all ${
              activeTab === 'leads'
                ? 'border-[#123e35] text-[#123e35]'
                : 'border-transparent text-[#888b88] hover:text-[#1a1c1a]'
            }`}
          >
            📋 Customer Leads List
          </button>
          <button
            onClick={() => setActiveTab('pdf-customizer')}
            className={`pb-3 px-1 text-sm font-bold border-b-2 cursor-pointer transition-all ${
              activeTab === 'pdf-customizer'
                ? 'border-[#123e35] text-[#123e35]'
                : 'border-transparent text-[#888b88] hover:text-[#1a1c1a]'
            }`}
          >
            ⚙️ PDF Strategy Blueprint Customizer
          </button>
        </div>

        {activeTab === 'leads' ? (
          <>
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
                {['all', 'pending', 'completed', 'new', 'onboarded', 'archived'].map((status) => (
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
                    {status === 'pending' && 'Pending'}
                    {status === 'completed' && 'Completed'}
                    {status === 'new' && 'New'}
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
                        lead.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                        lead.status === 'completed' ? 'bg-emerald-100/90 text-emerald-800 border-emerald-300' :
                        lead.status === 'audit_prepared' ? 'bg-[#123e35]/10 text-[#123e35] border-[#123e35]/25' :
                        lead.status === 'onboarded' ? 'bg-[#123e35]/15 text-[#123e35] border-[#123e35]/30' :
                        'bg-[#faf9f6] text-[#4e524f] border-[#dfded4]'
                      }`}>
                        {lead.status === 'new' ? 'New' :
                         lead.status === 'pending' ? 'Pending' :
                         lead.status === 'completed' ? 'Completed' :
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
                    {selectedLead.status !== 'completed' ? (
                      <button
                        onClick={() => handleMarkLeadCompleted(selectedLead.id)}
                        disabled={isSaving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shrink-0 cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        Mark Completed
                      </button>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 font-mono">
                        ✓ Completed
                      </span>
                    )}

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
                        <option value="pending">Pending Inquiry</option>
                        <option value="completed">Completed / Solved</option>
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
          </>
        ) : (
          <div className="bg-white border border-[#dfded4] rounded-2xl p-6 sm:p-8 space-y-8 tracking-tight">
            <div className="border-[#dfded4] border-b pb-6">
              <h2 className="text-xl font-bold font-display text-[#151716] flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#123e35]" />
                Interactive PDF Proposal Template Editor
              </h2>
              <p className="text-xs text-[#4e524f] font-semibold mt-1">
                Customize the real-time generated PDF Strategy Brief structure by toggling pricing plans, updating estimated delivery timelines, and building bullet lists of deliverables or actions.
              </p>
            </div>

            {/* Plan Tier Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#151716] uppercase tracking-wider block">
                1. Select Pricing Tier to Edit:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { id: 'single-page', label: 'Single-Page (Free Plan)', price: '$0 / Free' },
                  { id: 'starter', label: 'Starter Boost Plan', price: '$999/mo' },
                  { id: 'premium', label: 'Premium Surge Plan', price: '$1,999/mo' },
                  { id: 'custom', label: 'Custom Enterprise Setup', price: 'Bespoke' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedPlanId(tier.id)}
                    className={`p-4 rounded-xl text-left border cursor-pointer transition-all ${
                      selectedPlanId === tier.id
                        ? 'border-[#123e35] bg-[#123e35]/5 shadow-xs'
                        : 'border-[#dfded4] bg-white hover:bg-[#faf9f6]'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#4e524f] block">{tier.price}</span>
                    <span className="font-bold text-[#151716] text-sm mt-0.5 block">{tier.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Local Template Editing Fields */}
            {localTemplates && localTemplates[selectedPlanId] ? (
              <div className="space-y-8">
                
                {/* Timeline and delivery */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#151716] uppercase tracking-wider block">
                    2. Blueprint Estimated Timeline & Turnaround:
                  </label>
                  <p className="text-[11px] text-[#4e524f] font-medium font-sans">
                    This text replaces the default schedule text under the "CHOSEN GROWTH BLUEPRINT SUMMARY" section of the document.
                  </p>
                  <input
                    type="text"
                    value={localTemplates[selectedPlanId].timeline || ''}
                    onChange={(e) => handleEditTimeline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#dfded4] focus:outline-none focus:ring-1 focus:ring-[#123e35] text-sm text-[#151716] font-semibold bg-white"
                    placeholder="Enter estimated turnaround description..."
                  />
                </div>

                {/* Deliverables and Services Included */}
                <div className="space-y-4">
                  <div className="border-[#dfded4] border-b pb-2">
                    <label className="text-sm font-bold text-[#151716] flex items-center gap-1.5 uppercase tracking-wider">
                      <ListChecks className="w-4 h-4 text-[#123e35]" />
                      3. Deliverables & Services Included:
                    </label>
                    <p className="text-[11px] text-[#4e524f] font-semibold mt-1">
                      Manage bullet points appearing dynamically in the "DELIVERABLES AND SERVICES INCLUDED WITH PLAN:" section.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {localTemplates[selectedPlanId].deliverables?.map((item: string, index: number) => (
                      <div key={index} className="flex gap-2 items-center">
                        <span className="text-xs font-mono text-[#888b88] w-6 shrink-0 text-right">#{index + 1}</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleEditDeliverable(index, e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-[#dfded4] text-xs font-semibold text-[#151716] focus:outline-none focus:ring-1 focus:ring-[#123e35] bg-white"
                        />
                        <button
                          onClick={() => handleRemoveDeliverable(index)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 cursor-pointer transition-all shrink-0"
                          title="Remove Bullet"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(!localTemplates[selectedPlanId].deliverables || localTemplates[selectedPlanId].deliverables.length === 0) && (
                      <p className="text-xs text-amber-600 font-semibold italic bg-amber-50 p-3 rounded-lg border border-amber-100">
                        No custom deliverables added for this tier yet. Add some below to display in the PDF.
                      </p>
                    )}
                  </div>

                  {/* Add Deliverable Form */}
                  <div className="flex gap-2 p-3 bg-[#faf9f6] rounded-xl border border-[#dfded4]">
                    <input
                      type="text"
                      value={newDelivText}
                      onChange={(e) => setNewDelivText(e.target.value)}
                      placeholder="Type a new high-impact deliverable bullet and click 'Add'..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[#dfded4] text-xs font-semibold text-[#151716] focus:outline-none focus:ring-1 focus:ring-[#123e35] bg-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDeliverable();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddDeliverable}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#123e35] hover:bg-[#1c5046] text-white text-xs font-bold cursor-pointer transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Bullet
                    </button>
                  </div>
                </div>

                {/* Immediate Onboarding Timeline & Next Actions */}
                <div className="space-y-4">
                  <div className="border-[#dfded4] border-b pb-2">
                    <label className="text-sm font-bold text-[#151716] flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-[#123e35]" />
                      4. Immediate Onboarding Timeline & Next Actions:
                    </label>
                    <p className="text-[11px] text-[#4e524f] font-semibold mt-1">
                      Manage bullet steps appearing in the "IMMEDIATE ONBOARDING TIMELINE & NEXT ACTIONS:" section.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {localTemplates[selectedPlanId].actions?.map((item: string, index: number) => (
                      <div key={index} className="flex gap-2 items-center">
                        <span className="text-xs font-mono text-[#888b88] w-6 shrink-0 text-right">Step {index + 1}</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleEditAction(index, e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-[#dfded4] text-xs font-semibold text-[#151716] focus:outline-none focus:ring-1 focus:ring-[#123e35] bg-white"
                        />
                        <button
                          onClick={() => handleRemoveAction(index)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 cursor-pointer transition-all shrink-0"
                          title="Remove Action Step"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(!localTemplates[selectedPlanId].actions || localTemplates[selectedPlanId].actions.length === 0) && (
                      <p className="text-xs text-amber-600 font-semibold italic bg-amber-50 p-3 rounded-lg border border-amber-100">
                        No custom onboarding steps added for this tier yet. Add some below to display in the PDF.
                      </p>
                    )}
                  </div>

                  {/* Add action Form */}
                  <div className="flex gap-2 p-3 bg-[#faf9f6] rounded-xl border border-[#dfded4]">
                    <input
                      type="text"
                      value={newActionText}
                      onChange={(e) => setNewActionText(e.target.value)}
                      placeholder="Type a new onboarding setup step and click 'Add'..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[#dfded4] text-xs font-semibold text-[#151716] focus:outline-none focus:ring-1 focus:ring-[#123e35] bg-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddAction();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddAction}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#123e35] hover:bg-[#1c5046] text-white text-xs font-bold cursor-pointer transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Step
                    </button>
                  </div>
                </div>

                {/* Submission save panel */}
                <div className="border-[#dfded4] border-t pt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#151716] block font-sans">Save Changes to Database</span>
                    <span className="text-[11px] text-[#4e524f] font-semibold mt-0.5 block">
                      Sync edits so that future custom generated strategy briefs inherit these modifications in real time.
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {saveStatus === 'success' && (
                      <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 font-sans">
                        ✓ Templates Saved Successfully
                      </span>
                    )}
                    {saveStatus === 'error' && (
                      <span className="text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 font-sans">
                        ⚠️ Error encountered during save. Try again.
                      </span>
                    )}
                    <button
                      onClick={handleSaveTemplates}
                      disabled={saveStatus === 'saving'}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#123e35] hover:bg-[#1c5046] disabled:bg-[#888b88] text-white font-bold text-xs shadow-xs cursor-pointer transition-all font-sans"
                    >
                      {saveStatus === 'saving' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Save Dynamic Template Setup
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center bg-[#faf9f6] rounded-xl border border-[#dfded4] space-y-2">
                <RefreshCw className="w-8 h-8 text-[#888b88] animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-[#151716]">Loading active setup parameters...</h4>
                <p className="text-xs text-[#4e524f] font-medium max-w-sm mx-auto">
                  Pulling configuration templates from database for real-time validation.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
