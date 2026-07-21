import React, { useState, useEffect } from 'react';
import { BlogDraftItem } from '../types';
import ClientMicroToolWidget from './ClientMicroToolWidget';
import { 
  Sparkles, Plus, CheckCircle2, RefreshCw, Trash2, Eye, Edit3, Send, BookOpen, FileText, Check
} from 'lucide-react';

export default function BlogStudioDashboard() {
  const [drafts, setDrafts] = useState<BlogDraftItem[]>([]);
  const [published, setPublished] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Selected draft for editing/previewing
  const [selectedDraft, setSelectedDraft] = useState<BlogDraftItem | null>(null);

  const fetchDraftsAndPublished = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const [draftRes, pubRes] = await Promise.all([
        fetch('/api/blog/drafts', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/blog/published')
      ]);

      if (draftRes.ok) {
        setDrafts(await draftRes.json());
      }
      if (pubRes.ok) {
        setPublished(await pubRes.json());
      }
    } catch (err) {
      console.error('Error fetching blog drafts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDraftsAndPublished();
  }, []);

  const handleGenerateNewToolBlog = async () => {
    setGenerating(true);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const res = await fetch('/api/blog/generate-tool-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        await fetchDraftsAndPublished();
      }
    } catch (err) {
      console.error('Error generating tool blog:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveDraft = async (id: string) => {
    setApprovingId(id);
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const res = await fetch(`/api/blog/approve/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        await fetchDraftsAndPublished();
        if (selectedDraft?.id === id) setSelectedDraft(null);
      }
    } catch (err) {
      console.error('Error approving draft:', err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleDeleteDraft = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this blog draft?')) return;

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const res = await fetch(`/api/blog/drafts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        if (selectedDraft?.id === id) setSelectedDraft(null);
        await fetchDraftsAndPublished();
      }
    } catch (err) {
      console.error('Error deleting draft:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Controls Banner */}
      <div className="bg-white border border-[#dfded4] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#151716] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#bc5f40]" />
            AI Blog & Micro-Tool Studio
          </h2>
          <p className="text-xs text-[#4e524f] mt-0.5">
            Discover local SEO technical gaps, generate full educational articles, and embed 100% client-side scanner widgets (zero server overhead).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDraftsAndPublished}
            className="px-3.5 py-2 text-xs font-bold bg-[#f7f6f2] hover:bg-[#e8e7e1] text-[#151716] rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={handleGenerateNewToolBlog}
            disabled={generating}
            className="px-5 py-2.5 bg-[#bc5f40] hover:bg-[#a34d31] text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Generating Topic & Widget...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> 1-Click Generate Tool-Blog
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pending Drafts Section */}
      <div className="bg-white border border-[#dfded4] rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-[#123e35] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#bc5f40]" />
          Drafts Awaiting Admin Review ({drafts.length})
        </h3>

        {drafts.length === 0 ? (
          <div className="text-center py-10 text-[#888b88] space-y-1">
            <BookOpen className="w-8 h-8 mx-auto opacity-40" />
            <p className="text-xs font-bold">No draft tool-blogs currently pending review.</p>
            <p className="text-[11px]">Click "1-Click Generate Tool-Blog" above to generate a new post & scanner widget!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map(draft => (
              <div
                key={draft.id}
                onClick={() => setSelectedDraft(draft)}
                className="bg-[#faf9f6] border border-[#dfded4] hover:border-[#123e35]/40 rounded-xl p-4 transition cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#123e35]/10 text-[#123e35] rounded font-mono uppercase">
                      {draft.category}
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Pending Approval
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-[#151716] truncate">{draft.title}</h4>
                  <p className="text-xs text-[#4e524f] truncate">{draft.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setSelectedDraft(draft)}
                    className="px-3 py-1.5 text-xs font-bold bg-white border border-[#dfded4] hover:bg-[#f0efea] text-[#151716] rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview & Edit
                  </button>
                  <button
                    onClick={() => handleApproveDraft(draft.id)}
                    disabled={approvingId === draft.id}
                    className="px-4 py-1.5 text-xs font-bold bg-[#123e35] hover:bg-[#0d2e27] text-white rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    {approvingId === draft.id ? 'Publishing...' : 'Approve & Publish Live'}
                  </button>
                  <button
                    onClick={e => handleDeleteDraft(draft.id, e)}
                    className="p-1.5 text-[#ae3b1b] hover:bg-red-50 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Published Dynamic Articles */}
      <div className="bg-white border border-[#dfded4] rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-[#123e35] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Live Published Tool Articles ({published.length})
        </h3>

        {published.length === 0 ? (
          <p className="text-xs text-[#888b88] italic">No dynamic tool-blogs currently published live.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {published.map(pub => (
              <div key={pub.slug} className="bg-[#faf9f6] border border-[#dfded4] p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-[#bc5f40] font-mono uppercase">{pub.category}</span>
                <h4 className="font-bold text-sm text-[#151716]">{pub.title}</h4>
                <p className="text-xs text-[#4e524f] line-clamp-2">{pub.description}</p>
                <a
                  href={`/blog/${pub.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#123e35] hover:underline pt-1"
                >
                  View Live Article on /blog →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview & Edit Modal */}
      {selectedDraft && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#dfded4] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#dfded4] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#bc5f40] font-mono">Article & Tool Preview</span>
                <h3 className="text-base font-black text-[#151716]">{selectedDraft.title}</h3>
              </div>
              <button onClick={() => setSelectedDraft(null)} className="text-[#888b88] hover:text-[#151716] font-bold cursor-pointer">✕</button>
            </div>

            {/* Render Sections & Embedded Widget Preview */}
            <div className="space-y-4 text-xs text-[#1a1c1a] leading-relaxed">
              {selectedDraft.sections.map((sec, idx) => {
                if (sec.type === 'micro-tool' && sec.toolConfig) {
                  return (
                    <div key={idx} className="my-4">
                      <h4 className="font-bold text-xs text-[#123e35] mb-1 uppercase font-mono">Embedded Client-Side Widget Preview:</h4>
                      <ClientMicroToolWidget config={sec.toolConfig} />
                    </div>
                  );
                }
                if (sec.type === 'heading') return <h3 key={idx} className="font-bold text-sm text-[#151716] pt-2">{sec.content}</h3>;
                return <p key={idx} className="text-[#4e524f]">{sec.content}</p>;
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#dfded4]">
              <button
                onClick={() => setSelectedDraft(null)}
                className="px-4 py-2 text-xs font-bold bg-[#f7f6f2] hover:bg-[#e8e7e1] text-[#151716] rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => handleApproveDraft(selectedDraft.id)}
                disabled={approvingId === selectedDraft.id}
                className="px-6 py-2 text-xs font-extrabold bg-[#123e35] hover:bg-[#0d2e27] text-white rounded-xl shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Approve & Publish Live
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
