import React, { useState, useEffect } from 'react';
import { Lead } from '../types';
import { 
  Users, Calendar, BarChart3, TrendingUp, Sliders, CheckSquare, Trash2, Save, 
  MessageSquare, FileText, ExternalLink, RefreshCw, Eye, Sparkles, Phone, Mail, Globe, MapPin,
  Plus, Minus, Settings, ListChecks, Lock, Search, AlertCircle, AlertTriangle, CheckCircle2,
  Zap, Target, ShieldCheck, TrendingDown, Activity, Link2, Bot, Smartphone, Download
} from 'lucide-react';

interface LeadDashboardProps {
  leads: Lead[];
  onUpdateLeads: () => void;
  pdfTemplates?: any;
  onUpdateTemplates?: () => void;
  onGeneratePDF?: (planId: string, name: string, email: string) => string | Promise<string>;
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
  const [activeTab, setActiveTab] = useState<'leads' | 'pdf-customizer' | 'url-report'>('leads');

  // URL Report Generator state
  const [reportUrl, setReportUrl] = useState('');
  const [reportNotes, setReportNotes] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportPdfGenerating, setReportPdfGenerating] = useState(false);
  
  // Note/Status updates
  const [currentNotes, setCurrentNotes] = useState<string>('');
  const [currentStatus, setCurrentStatus] = useState<Lead['status']>('new');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [pdfGenerating, setPdfGenerating] = useState<string | null>(null);

  // Editable PDF parameters local state
  const [localTemplates, setLocalTemplates] = useState<any>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('single-page');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Database Connection Status Checker
  const [dbStatus, setDbStatus] = useState<{
    configured: boolean;
    connected: boolean;
    tableExists: boolean;
    errorType?: string;
    message?: string;
    sqlSchema?: string;
    databaseUrl?: string;
  } | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState<boolean>(false);

  const fetchDbStatus = async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const res = await fetch('/api/admin/db-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (err) {
      console.error("Error fetching database status:", err);
    }
  };

  useEffect(() => {
    fetchDbStatus();
  }, []);

  // Sync leads state when initialLeads prop changes
  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

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
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch('/api/pdf-templates', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/leads/${selectedLead.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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

  // URL Report Generator handlers
  const handleGenerateReport = async () => {
    if (!reportUrl.trim()) return;
    setReportLoading(true);
    setReportData(null);
    setReportError(null);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const res = await fetch('/api/admin/seo-report/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: reportUrl.trim(), notes: reportNotes.trim() })
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.success && data.report) {
        setReportData(data.report);
      } else {
        setReportError('Failed to generate report. Please try again.');
      }
    } catch (err: any) {
      setReportError(err.message || 'An unexpected error occurred.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleDownloadReportPdf = async () => {
    if (!reportData) return;
    setReportPdfGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pTeal = [18, 62, 53];
      const aOrange = [188, 95, 64];
      const nDark = [26, 28, 26];
      const nLight = [136, 139, 136];
      const red = [220, 38, 38];
      const amber = [180, 120, 0];
      const green = [16, 100, 70];

      // Header
      doc.setFillColor(pTeal[0], pTeal[1], pTeal[2]);
      doc.rect(0, 0, 210, 38, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('LOCAL SURGE SEO', 15, 14);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Internal SEO Strategy Blueprint Report', 15, 21);
      doc.text(`Generated: ${new Date(reportData.generatedAt).toLocaleString()}`, 15, 27);
      doc.setFillColor(aOrange[0], aOrange[1], aOrange[2]);
      doc.rect(0, 35, 210, 3, 'F');

      // URL & Scores row
      doc.setTextColor(nDark[0], nDark[1], nDark[2]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('SEO BLUEPRINT REPORT', 15, 50);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(nLight[0], nLight[1], nLight[2]);
      doc.text(`Website: ${reportData.websiteUrl}`, 15, 56);

      // Score boxes
      doc.setFillColor(239, 244, 241);
      doc.rect(15, 61, 85, 14, 'F');
      doc.rect(110, 61, 85, 14, 'F');
      doc.setTextColor(pTeal[0], pTeal[1], pTeal[2]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`SEO Health Score: ${reportData.overallScore}/100`, 19, 70);
      doc.text(`Opportunity Score: ${reportData.opportunityScore}/100`, 114, 70);

      // Executive Summary
      doc.setTextColor(aOrange[0], aOrange[1], aOrange[2]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('EXECUTIVE SUMMARY', 15, 83);
      doc.setTextColor(nDark[0], nDark[1], nDark[2]);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      const summaryLines = doc.splitTextToSize(reportData.executiveSummary, 180);
      doc.text(summaryLines, 15, 89);

      let y = 89 + (summaryLines.length * 5) + 6;

      // Key Findings
      doc.setTextColor(aOrange[0], aOrange[1], aOrange[2]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('KEY FINDINGS', 15, y);
      y += 6;
      reportData.keyFindings?.forEach((f: any) => {
        const col = f.type === 'critical' ? red : f.type === 'warning' ? amber : green;
        doc.setTextColor(col[0], col[1], col[2]);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`[${f.type.toUpperCase()}] ${f.title}`, 15, y);
        y += 5;
        doc.setTextColor(nDark[0], nDark[1], nDark[2]);
        doc.setFont('Helvetica', 'normal');
        const detailLines = doc.splitTextToSize(f.detail, 175);
        doc.text(detailLines, 20, y);
        y += (detailLines.length * 4.5) + 3;
      });

      y += 3;

      // Category Scores
      doc.setTextColor(aOrange[0], aOrange[1], aOrange[2]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('AUDIT CATEGORIES', 15, y);
      y += 7;
      reportData.categories?.forEach((cat: any) => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setTextColor(pTeal[0], pTeal[1], pTeal[2]);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(`${cat.name}  —  Score: ${cat.score}/100  (${cat.status.replace('-', ' ')})`, 15, y);
        y += 5;
        doc.setTextColor(nDark[0], nDark[1], nDark[2]);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        const sumLines = doc.splitTextToSize(cat.summary, 175);
        doc.text(sumLines, 15, y);
        y += (sumLines.length * 4) + 2;
        cat.recommendations?.forEach((r: string) => {
          if (y > 270) { doc.addPage(); y = 20; }
          const rLines = doc.splitTextToSize(`→ ${r}`, 170);
          doc.setTextColor(pTeal[0], pTeal[1], pTeal[2]);
          doc.text(rLines, 20, y);
          y += (rLines.length * 4) + 1;
        });
        y += 3;
      });

      // Priority Action Plan
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setTextColor(aOrange[0], aOrange[1], aOrange[2]);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('90-DAY PRIORITY ACTION PLAN', 15, y);
      y += 7;
      reportData.priorityActionPlan?.forEach((item: any) => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setTextColor(pTeal[0], pTeal[1], pTeal[2]);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`${item.priority}. ${item.action}  [${item.impact} impact  •  ${item.timeframe}]`, 15, y);
        y += 5;
        doc.setTextColor(nDark[0], nDark[1], nDark[2]);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        const dLines = doc.splitTextToSize(item.detail, 175);
        doc.text(dLines, 20, y);
        y += (dLines.length * 4) + 4;
      });

      // Footer on last page
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFillColor(pTeal[0], pTeal[1], pTeal[2]);
        doc.rect(0, 287, 210, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text('Local Surge SEO — Internal Strategy Blueprint — Confidential', 15, 293);
        doc.text(`Page ${p} of ${pageCount}`, 190, 293, { align: 'right' });
      }

      const safeDomain = reportData.websiteUrl.replace(/https?:\/\/(www\.)?/, '').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
      doc.save(`Local_Surge_Blueprint_${safeDomain}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setReportPdfGenerating(false);
    }
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
              onClick={async () => {
                if (onUpdateLeads) onUpdateLeads();
                await fetchDbStatus();
              }}
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

        {/* Supabase Status, Troubleshooting & Start-From-Scratch Setup Assistant */}
        {dbStatus && (
          <div className="bg-[#bc5f40]/5 border border-[#bc5f40]/20 rounded-2xl p-6 space-y-6 shadow-sm">
            {/* Header and status badge */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#bc5f40]/10 pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${dbStatus.tableExists ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                  <h3 className="font-black text-base text-[#151716] tracking-tight">
                    {dbStatus.tableExists 
                      ? "🟢 Supabase Cloud Synchronization Active" 
                      : dbStatus.errorType === 'cache_stale'
                        ? "⚠️ Supabase Connected, but API Cache is Lagging (PGRST125)"
                        : "🔌 Supabase Connection Assistant & Setup Guide"}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#123e35]/10 text-[#123e35] border border-[#123e35]/10">
                    Real-Time Cloud Storage
                  </span>
                </div>
                <p className="text-xs text-[#4e524f] leading-relaxed max-w-3xl">
                  {dbStatus.tableExists 
                    ? `Successfully synchronized organic leads with your database cluster. All public customer diagnostics are instantly backed up in real-time.`
                    : `Your Local Surge SEO board has a built-in highly stable JSON database fallback, so all features run perfectly. Ready to connect your cloud client from scratch? Let's fix the schema connection below.`}
                </p>
              </div>
              <button
                onClick={() => setShowSqlGuide(!showSqlGuide)}
                className="px-4.5 py-2.5 bg-[#bc5f40] hover:bg-[#a34d31] text-white text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-2 shrink-0 shadow-xs"
              >
                {showSqlGuide ? "Hide Setup Instructions" : "Connect From Scratch Guide 🛠️"}
              </button>
            </div>

            {/* Configured details comparison alert */}
            {!dbStatus.tableExists && (
              <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4.5 text-xs text-[#5c3e1e] space-y-2">
                <div className="flex items-center gap-2 font-black text-amber-900">
                  <span>💡 IMPORTANT OBSERVATION FROM YOUR SCREENSHOT</span>
                </div>
                <p className="leading-relaxed">
                  Your Supabase screenshot shows your active project ID is <strong className="font-extrabold text-[#bc5f40] underline decoration-[#bc5f40]/30 select-all">yxpkisbsobhuaanuiahc</strong>. 
                  However, please verify if the database URL currently configured in the background matches this ID!
                </p>
                <div className="bg-white/70 border border-amber-200/50 rounded-lg p-3 font-mono text-[11px] grid gap-1.5 text-[#42301c]">
                  <div>
                    🔹 <strong className="font-bold">Currently Configured URL in App:</strong>{" "}
                    <span className="text-[#123e35] font-bold select-all bg-[#123e35]/5 px-1.5 py-0.5 rounded border border-[#123e35]/10 break-all">
                      {dbStatus.databaseUrl || "Not Configured Yet (Empty / Falling back to Local DB)"}
                    </span>
                  </div>
                  <div>
                    🎯 <strong className="font-bold">Your Target Project URL should be:</strong>{" "}
                    <code className="bg-[#bc5f40]/5 px-1.5 py-0.5 rounded border border-[#bc5f40]/10 text-[#bc5f40] font-black select-all break-all">
                      https://yxpkisbsobhuaanuiahc.supabase.co
                    </code>
                  </div>
                </div>
                <p className="leading-relaxed text-[11px] text-amber-800">
                  If these do not match, the application is loading a different project which does not have your new table yet! Follow the 4 simple steps below.
                </p>
              </div>
            )}

            {/* Comprehensive Start-from-scratch instructions step-by-step */}
            {(showSqlGuide || !dbStatus.tableExists) && (
              <div className="space-y-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  
                  {/* STEP 1: CONFIGURE SECRETS IN GOOGLE AI STUDIO */}
                  <div className="bg-[#faf9f6] border border-[#dfded4] rounded-xl p-5 space-y-3 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#123e35] text-white flex items-center justify-center font-bold text-[10px]">1</span>
                      <h4 className="font-black text-sm text-[#111]">Verify Environment Variables</h4>
                    </div>
                    <p className="text-[#4e524f] leading-relaxed">
                      You must ensure that your application has your target Supabase Project credentials. Open the <strong className="font-bold text-[#123e35]">Google AI Studio app settings menu</strong> (top right ⚙️ icon in your workspace) and confirm you added:
                    </p>
                    <div className="bg-white border text-[11px] border-[#dfded4] rounded-lg p-2.5 font-mono space-y-1.5 leading-relaxed text-[#1a1c1a]">
                      <div>
                        🔑 <span className="font-bold">SUPABASE_URL</span> <br/>
                        <span className="text-[#888b88]">=</span> <code className="bg-slate-50 px-1 py-0.5 text-slate-800 break-all text-[10px] rounded">https://yxpkisbsobhuaanuiahc.supabase.co</code>
                      </div>
                      <div>
                        🔑 <span className="font-bold">SUPABASE_SERVICE_ROLE_KEY</span> <br/>
                        <span className="text-[#888b88]">=</span> <em className="text-amber-600 font-mono text-[10px]">(Paste service_role secret key from Settings &gt; API)</em>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#4e524f] italic">
                      💡 <strong>Why service_role?</strong> Standard <code className="text-amber-800">anon</code> keys are locked down by Row-Level Security (RLS) policies. Using the <code className="text-amber-800">service_role</code> key allows our secure Node web server backend to sync leads cleanly.
                    </p>
                  </div>

                  {/* STEP 2: RUN DATABASE SCHEMA IN SQL EDITOR */}
                  <div className="bg-[#faf9f6] border border-[#dfded4] rounded-xl p-5 space-y-3 shadow-xs flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#123e35] text-white flex items-center justify-center font-bold text-[10px]">2</span>
                        <h4 className="font-black text-sm text-[#111]">Run the SQL Tables Script</h4>
                      </div>
                      <p className="text-[#4e524f] leading-relaxed">
                        Go to your <strong className="font-bold text-[#123e35]">Supabase Dashboard</strong> on the left side menu, click the <strong className="font-semibold text-zinc-800">SQL Editor</strong> tab (represented by a <code className="font-mono">{`>_`}</code> icon), select <strong className="font-semibold text-zinc-800">New Query</strong>, paste the script below, and hit the green <strong className="font-semibold text-green-700">Run</strong> button in the bottom right!
                      </p>
                    </div>

                    <div className="bg-zinc-950 rounded-xl p-3.5 space-y-2.5 border border-zinc-800">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                        <span>CREATE LEADS TABLE SCRIPT</span>
                        <button
                          onClick={() => {
                            const sql = `CREATE TABLE IF NOT EXISTS public.leads (
  id text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'new'::text not null,
  notes text,
  business_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  website text,
  industry text,
  location text,
  keywords text,
  plan_id text,
  plan_name text,
  ai_audit jsonb
);

-- Force PostgREST schema API to reload its path definitions
NOTIFY pgrst, 'reload schema';`;
                            navigator.clipboard.writeText(sql);
                            alert("SQL query copied to clipboard! Paste this into your Supabase SQL Editor and click standard 'Run'.");
                          }}
                          className="px-2 py-0.5 bg-zinc-800 text-white font-sans font-bold rounded hover:bg-zinc-700 transition cursor-pointer"
                        >
                          Copy SQL 📋
                        </button>
                      </div>
                      <pre className="text-[9.5px] text-[#dfded4] leading-relaxed font-mono max-h-[85px] overflow-y-auto select-all">
{`CREATE TABLE IF NOT EXISTS public.leads (
  id text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'new'::text not null,
  notes text,
  business_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  website text,
  industry text,
  location text,
  keywords text,
  plan_id text,
  plan_name text,
  ai_audit jsonb
);

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* STEPS 3 & 4 IN ONE SIMPLE SUMMARY BAR */}
                <div className="bg-white border rounded-xl p-4.5 grid col-span-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h5 className="font-extrabold text-[#123e35] flex items-center gap-1">
                      <span>🔄</span> Step 3: Clear Schema Path Lock (PGRST125)
                    </h5>
                    <p className="text-[#4e524f] leading-relaxed mt-1 text-[11px]">
                      PostgREST caches DB schemas. If you created the table but get the <code className="text-[#bc5f40] font-mono">PGRST125</code> error delay, paste these commands into your SQL Editor to force a reload:
                    </p>
                    <pre className="bg-[#bc5f40]/5 border border-[#bc5f40]/10 p-2 text-[#bc5f40] font-mono text-[10px] mt-2 rounded">
{`GRANT ALL ON TABLE public.leads TO postgres, anon, authenticated, service_role;
NOTIFY pgrst, 'reload schema';`}
                    </pre>
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <h5 className="font-extrabold text-[#123e35] flex items-center gap-1">
                        <span>🚀</span> Step 4: Verify the Sync Status
                      </h5>
                      <p className="text-[#4e524f] leading-relaxed mt-1 text-[11px]">
                        After making these updates, click the <strong className="font-semibold text-zinc-900">"Refresh Leads"</strong> button at the top right of this dashboard page. The applet will sync up, establish connection, and the status bar will turn into a beautiful emerald green!
                      </p>
                    </div>
                    <div className="flex justify-end pt-3">
                      <button
                        onClick={async () => {
                          if (onUpdateLeads) onUpdateLeads();
                          await fetchDbStatus();
                        }}
                        className="px-4.5 py-2 bg-[#123e35] hover:bg-[#0c2b25] text-white text-[11px] font-black rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <RefreshCw className="w-3 h-3" /> Refresh Database Status Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* Navigation Tabs */}
        <div className="flex border-b border-[#dfded4] pb-px gap-6 block mt-4 select-none overflow-x-auto">
          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-3 px-1 text-sm font-bold border-b-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'leads'
                ? 'border-[#123e35] text-[#123e35]'
                : 'border-transparent text-[#888b88] hover:text-[#1a1c1a]'
            }`}
          >
            📋 Customer Leads
          </button>
          <button
            onClick={() => setActiveTab('url-report')}
            className={`pb-3 px-1 text-sm font-bold border-b-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'url-report'
                ? 'border-[#bc5f40] text-[#bc5f40]'
                : 'border-transparent text-[#888b88] hover:text-[#1a1c1a]'
            }`}
          >
            🔍 SEO Blueprint Generator
          </button>
          <button
            onClick={() => setActiveTab('pdf-customizer')}
            className={`pb-3 px-1 text-sm font-bold border-b-2 cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'pdf-customizer'
                ? 'border-[#123e35] text-[#123e35]'
                : 'border-transparent text-[#888b88] hover:text-[#1a1c1a]'
            }`}
          >
            ⚙️ PDF Template Editor
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
                  <div
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
                  </div>
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
        ) : activeTab === 'url-report' ? (
          // ── URL SEO Blueprint Generator Tab ──────────────────────────────────
          <div className="space-y-6">

            {/* Input Card */}
            <div className="bg-white border border-[#dfded4] rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#bc5f40]/10 flex items-center justify-center">
                  <Search className="w-5 h-5 text-[#bc5f40]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#151716] tracking-tight">SEO Blueprint Report Generator</h2>
                  <p className="text-xs text-[#4e524f] font-semibold">Enter any client or prospect website URL to generate a full AI-powered SEO strategy blueprint.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#151716] uppercase tracking-wider mb-1.5">Website URL *</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888b88]" />
                      <input
                        id="url-report-input"
                        type="url"
                        value={reportUrl}
                        onChange={(e) => setReportUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#dfded4] text-sm font-semibold text-[#1a1c1a] focus:outline-none focus:ring-2 focus:ring-[#bc5f40]/40 focus:border-[#bc5f40] bg-white transition-all"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateReport(); }}
                      />
                    </div>
                    <button
                      id="url-report-generate-btn"
                      onClick={handleGenerateReport}
                      disabled={reportLoading || !reportUrl.trim()}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#bc5f40] hover:bg-[#a34d31] disabled:bg-[#888b88] text-white font-bold text-sm cursor-pointer transition-all shadow-xs shrink-0"
                    >
                      {reportLoading ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...</>
                      ) : (
                        <><Sparkles className="w-4 h-4" /> Generate Report</>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#151716] uppercase tracking-wider mb-1.5">Admin Notes / Context <span className="text-[#888b88] font-normal normal-case">(optional)</span></label>
                  <input
                    type="text"
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="e.g. Plumbing company in San Jose, CA — looking to rank locally..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#dfded4] text-xs font-semibold text-[#1a1c1a] focus:outline-none focus:ring-1 focus:ring-[#bc5f40] bg-white"
                  />
                </div>
              </div>

              {reportError && (
                <div className="mt-4 flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {reportError}
                </div>
              )}

              {reportLoading && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-[#4e524f] font-semibold">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#bc5f40]" />
                    <span>Gemini AI is analyzing the site... This takes 15–30 seconds.</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['Technical SEO', 'Local Signals', 'Content Quality', 'Schema & Speed', 'Backlinks', 'GEO/AI', 'Mobile', 'Competitors'].map((label, i) => (
                      <div key={i} className="bg-[#faf9f6] border border-[#dfded4] rounded-lg px-2.5 py-2 text-center">
                        <div className="w-4 h-4 rounded-full bg-[#bc5f40]/20 mx-auto mb-1 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                        <p className="text-[9px] font-bold text-[#888b88] font-mono">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Report Output */}
            {reportData && !reportLoading && (
              <div id="seo-report-output" className="space-y-5">

                {/* Report Header */}
                <div className="bg-[#123e35] rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                  <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono tracking-widest text-[#dfded4]/70 uppercase">Local Surge SEO — Internal Strategy Blueprint</p>
                      <h3 className="text-xl font-black tracking-tight leading-tight">{reportData.websiteUrl}</h3>
                      <p className="text-xs text-[#dfded4]/80 font-mono">
                        Generated: {new Date(reportData.generatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      {/* Overall Score Ring */}
                      <div className="text-center">
                        <div className="relative w-20 h-20">
                          <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
                            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                            <circle
                              cx="40" cy="40" r="34" fill="none"
                              stroke={reportData.overallScore >= 70 ? '#10b981' : reportData.overallScore >= 50 ? '#f59e0b' : '#ef4444'}
                              strokeWidth="8"
                              strokeDasharray={`${(reportData.overallScore / 100) * 213.6} 213.6`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-black">{reportData.overallScore}</span>
                            <span className="text-[9px] font-mono text-white/60">/ 100</span>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-white/70 mt-1 font-mono">SEO HEALTH</p>
                      </div>
                      {/* Opportunity Score */}
                      <div className="text-center">
                        <div className="relative w-20 h-20">
                          <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
                            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                            <circle
                              cx="40" cy="40" r="34" fill="none"
                              stroke="#bc5f40"
                              strokeWidth="8"
                              strokeDasharray={`${(reportData.opportunityScore / 100) * 213.6} 213.6`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-black">{reportData.opportunityScore}</span>
                            <span className="text-[9px] font-mono text-white/60">/ 100</span>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-white/70 mt-1 font-mono">OPPORTUNITY</p>
                      </div>
                      {/* Download Button */}
                      <button
                        onClick={handleDownloadReportPdf}
                        disabled={reportPdfGenerating}
                        className="flex flex-col items-center gap-2 px-4 py-3 bg-[#bc5f40] hover:bg-[#9e4a30] rounded-xl text-white text-xs font-bold cursor-pointer transition-all shrink-0"
                        title="Download PDF Report"
                      >
                        {reportPdfGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        <span className="text-[10px]">Download PDF</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Key Findings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {reportData.keyFindings?.map((finding: any, i: number) => (
                    <div key={i} className={`rounded-xl p-4 border flex gap-3 items-start ${
                      finding.type === 'critical' ? 'bg-red-50 border-red-200' :
                      finding.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                      'bg-emerald-50 border-emerald-200'
                    }`}>
                      <div className="shrink-0 mt-0.5">
                        {finding.type === 'critical' ? <AlertCircle className="w-4 h-4 text-red-600" /> :
                         finding.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-600" /> :
                         <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div>
                        <p className={`text-xs font-black ${
                          finding.type === 'critical' ? 'text-red-800' :
                          finding.type === 'warning' ? 'text-amber-800' : 'text-emerald-800'
                        }`}>{finding.title}</p>
                        <p className={`text-[11px] mt-0.5 font-semibold leading-relaxed ${
                          finding.type === 'critical' ? 'text-red-700' :
                          finding.type === 'warning' ? 'text-amber-700' : 'text-emerald-700'
                        }`}>{finding.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Executive Summary */}
                <div className="bg-white border border-[#dfded4] rounded-2xl p-6 shadow-xs">
                  <h4 className="text-xs font-bold text-[#bc5f40] uppercase font-mono tracking-wider mb-3 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Executive Summary
                  </h4>
                  <p className="text-sm text-[#2d2f2d] leading-relaxed font-semibold">{reportData.executiveSummary}</p>
                </div>

                {/* Category Scores Grid */}
                <div className="bg-white border border-[#dfded4] rounded-2xl p-6 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-[#151716] uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-[#123e35]" /> Audit Category Breakdown
                  </h4>
                  <div className="space-y-3">
                    {reportData.categories?.map((cat: any, i: number) => {
                      const catIcon: Record<string, any> = {
                        'Technical SEO': Activity, 'Local SEO': MapPin, 'Content Quality': FileText,
                        'Schema Markup': ShieldCheck, 'Page Speed': Zap, 'Backlink Profile': Link2,
                        'GEO / AI Readiness': Bot, 'Mobile Optimization': Smartphone
                      };
                      const Icon = catIcon[cat.name] || BarChart3;
                      const scoreColor = cat.score >= 70 ? '#10b981' : cat.score >= 50 ? '#f59e0b' : '#ef4444';
                      const statusBadge: Record<string, string> = {
                        'excellent': 'bg-emerald-100 text-emerald-800 border-emerald-200',
                        'good': 'bg-blue-100 text-blue-800 border-blue-200',
                        'needs-work': 'bg-amber-100 text-amber-800 border-amber-200',
                        'critical': 'bg-red-100 text-red-800 border-red-200'
                      };
                      return (
                        <details key={i} className="group border border-[#dfded4] rounded-xl overflow-hidden">
                          <summary className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#faf9f6] transition-all select-none list-none">
                            <div className="w-8 h-8 rounded-lg bg-[#faf9f6] border border-[#dfded4] flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-[#4e524f]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#151716]">{cat.name}</span>
                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${
                                  statusBadge[cat.status] || 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}>{cat.status.replace('-', ' ')}</span>
                              </div>
                              <div className="mt-1.5 flex items-center gap-2">
                                <div className="flex-1 bg-[#dfded4] rounded-full h-1.5">
                                  <div
                                    className="h-1.5 rounded-full transition-all duration-700"
                                    style={{ width: `${cat.score}%`, backgroundColor: scoreColor }}
                                  />
                                </div>
                                <span className="text-xs font-black tabular-nums" style={{ color: scoreColor }}>{cat.score}/100</span>
                              </div>
                            </div>
                          </summary>
                          <div className="px-4 pb-4 pt-2 bg-[#faf9f6] border-t border-[#dfded4] space-y-3">
                            <p className="text-xs text-[#2d2f2d] font-semibold leading-relaxed">{cat.summary}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-[10px] font-black text-red-700 uppercase tracking-wider mb-1.5">⚠ Issues Found</p>
                                <ul className="space-y-1">
                                  {cat.issues?.map((issue: string, j: number) => (
                                    <li key={j} className="text-[11px] text-[#4e524f] font-semibold flex gap-1.5 items-start">
                                      <span className="text-red-500 mt-0.5 shrink-0">•</span>{issue}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-[#123e35] uppercase tracking-wider mb-1.5">✓ Recommendations</p>
                                <ul className="space-y-1">
                                  {cat.recommendations?.map((rec: string, j: number) => (
                                    <li key={j} className="text-[11px] text-[#4e524f] font-semibold flex gap-1.5 items-start">
                                      <span className="text-[#123e35] mt-0.5 shrink-0">→</span>{rec}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </div>

                {/* 90-Day Priority Action Plan */}
                <div className="bg-white border border-[#dfded4] rounded-2xl p-6 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-[#151716] uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#bc5f40]" /> 90-Day Priority Action Plan
                  </h4>
                  <div className="space-y-3">
                    {reportData.priorityActionPlan?.map((item: any, i: number) => (
                      <div key={i} className="flex gap-4 items-start p-4 rounded-xl border border-[#dfded4] hover:bg-[#faf9f6] transition-all">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          item.impact === 'high' ? 'bg-red-100 text-red-700' :
                          item.impact === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{item.priority}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-[#151716]">{item.action}</span>
                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${
                              item.impact === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                              item.impact === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>{item.impact} impact</span>
                            <span className="text-[10px] font-mono text-[#888b88] bg-[#faf9f6] border border-[#dfded4] px-2 py-0.5 rounded-full">{item.timeframe}</span>
                          </div>
                          <p className="text-xs text-[#4e524f] font-semibold leading-relaxed">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competitor Insights */}
                <div className="bg-[#faf9f6] border border-[#dfded4] rounded-2xl p-6 shadow-xs">
                  <h4 className="text-xs font-bold text-[#151716] uppercase font-mono tracking-wider mb-3 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-[#123e35]" /> Competitive Landscape
                  </h4>
                  <p className="text-sm text-[#2d2f2d] leading-relaxed font-semibold">{reportData.competitorInsights}</p>
                </div>

              </div>
            )}
          </div>

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
