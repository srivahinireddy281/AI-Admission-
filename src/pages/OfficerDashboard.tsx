import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  GraduationCap, 
  Layers, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Sparkles, 
  Cpu, 
  UserCheck, 
  ClipboardCheck, 
  FileCheck,
  AlertTriangle,
  Lock,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { Application, DocumentInfo } from '../types';

function renderMarkdown(text: string) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-4 font-sans text-xs text-slate-700 leading-relaxed">
      {lines.map((line, idx) => {
        if (line.startsWith('###')) {
          return (
            <h4 key={idx} className="font-sans text-xs font-bold text-slate-900 border-b border-slate-100 pb-1 mt-3">
              {line.replace('###', '').trim()}
            </h4>
          );
        }
        if (line.startsWith('-') || line.startsWith('*')) {
          const content = line.substring(1).trim();
          return (
            <ul key={idx} className="list-disc pl-4 space-y-1 my-1 text-slate-600">
              <li>{content}</li>
            </ul>
          );
        }
        if (line.trim().length === 0) return null;
        return <p key={idx} className="my-1">{line}</p>;
      })}
    </div>
  );
}

export default function OfficerDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [activeDocs, setActiveDocs] = useState<DocumentInfo | null>(null);
  const [docsLoading, setDocsLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState<'Verified' | 'Approved' | 'Rejected' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const [mlMetrics, setMlMetrics] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const list = await api.getAllApplications();
      setApplications(list);

      // Fetch sample ML metadata
      const metrics = await api.getAnalytics();
      setMlMetrics(metrics.machineLearningMetrics);
    } catch (err) {
      console.error('Failed to sync officer dossiers list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectApp = async (app: Application) => {
    setActiveApp(app);
    setActiveDocs(null);
    setRemarks(app.remarks || '');
    setMessage(null);

    // Download candidate transcripts in the background
    if (app.studentProfile?.id) {
      try {
        setDocsLoading(true);
        const files = await api.getStudentDocuments(app.studentProfile.id);
        setActiveDocs(files);
      } catch (err) {
        console.error('Failed to fetch applicant file', err);
      } finally {
        setDocsLoading(false);
      }
    }
  };

  const handleDecision = async (status: 'Verified' | 'Approved' | 'Rejected') => {
    if (!activeApp) return;
    setActionLoading(status);
    setMessage(null);

    try {
      await api.updateApplicationStatus(activeApp.id, status, remarks);
      setMessage({ type: 'success', text: `Candidate portal file successfully updated to ${status}!` });
      await fetchData();
      
      // Update local active app object matching DB updates
      setActiveApp(prev => prev ? { ...prev, status, remarks } : null);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Decision routing failed.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Extract unique departments for convenient filtering
  const departments = ['All', ...new Set(applications.map(a => a.department))];

  // Apply filters
  const filteredApps = applications.filter(app => {
    const matchDept = filterDept === 'All' || app.department === filterDept;
    const matchStatus = filterStatus === 'All' || app.status === filterStatus;
    return matchDept && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="font-mono text-xs text-slate-500">Decrypting institutional ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:h-[calc(100vh-4rem)] md:grid-cols-3 overflow-hidden">
      
      {/* 1. Left Section: Applicant Selection Rail */}
      <div className="md:col-span-1 border-b border-slate-200 bg-slate-50 p-4 md:border-b-0 md:border-r overflow-y-auto">
        <div className="space-y-4">
          <div>
            <h2 className="font-sans text-base font-bold text-slate-900">Applicant Dossier Board</h2>
            <p className="font-sans text-[11px] text-slate-500">Filter admissions records and grade student files.</p>
          </div>

          {/* Scikit-Learn Model parameters info panel */}
          {mlMetrics && (
            <div className="rounded-2xl border border-indigo-150 bg-indigo-50/50 p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-800">
                <Cpu className="h-3.5 w-3.5" />
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider">Predictor Model: Logistic Regression</span>
              </div>
              <div className="grid grid-cols-4 gap-1 pt-1.5 text-center font-mono text-[9px]">
                <div className="bg-white border border-slate-100 p-1 rounded">
                  <span className="text-slate-400 block font-bold">ACCURACY</span>
                  <span className="text-indigo-700 font-bold">{(mlMetrics.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-white border border-slate-100 p-1 rounded">
                  <span className="text-slate-400 block font-bold">PRECISION</span>
                  <span className="text-indigo-700 font-bold">{mlMetrics.precision.toFixed(3)}</span>
                </div>
                <div className="bg-white border border-slate-100 p-1 rounded">
                  <span className="text-slate-400 block font-bold">RECALL</span>
                  <span className="text-indigo-700 font-bold">{mlMetrics.recall.toFixed(3)}</span>
                </div>
                <div className="bg-white border border-slate-100 p-1 rounded">
                  <span className="text-slate-400 block font-bold">F1-SCORE</span>
                  <span className="text-indigo-700 font-bold">{mlMetrics.f1Score.toFixed(3)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Filtering controllers */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold">Department</label>
              <select
                value={filterDept}
                onChange={e => setFilterDept(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 font-sans text-xs text-slate-800"
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold">Status Code</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 font-sans text-xs text-slate-800"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Verified">VerifiedOnly</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Lists layout */}
          <div className="space-y-2 pt-2">
            {filteredApps.length === 0 ? (
              <div className="text-center py-8 font-sans text-xs text-slate-400">
                No dossiers match chosen filters.
              </div>
            ) : (
              filteredApps.map(app => {
                const isSelected = activeApp?.id === app.id;
                return (
                  <button
                    key={app.id}
                    id={`officer_select_app_${app.id}`}
                    onClick={() => handleSelectApp(app)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      isSelected 
                        ? 'border-indigo-600 bg-white shadow-md' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-sans text-xs font-bold text-slate-900">{app.studentName}</h4>
                        <p className="font-sans text-[10px] text-slate-500 mt-0.5">{app.courseName}</p>
                      </div>
                      
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[83%] font-bold uppercase tracking-wider ${
                        app.status === 'Approved' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : app.status === 'Rejected' 
                          ? 'bg-rose-50 text-rose-700' 
                          : app.status === 'Verified' 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 font-mono text-[9px] text-slate-400">
                      <span>Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                      {app.prediction && (
                        <span className={`font-bold ${app.prediction.eligible ? 'text-emerald-600' : 'text-slate-500'}`}>
                          ML Eli-Score: {Math.round(app.prediction.probabilityScore * 100)}%
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 2 & 3. Middle/Right Sections: Applicant Details & Mark-sheet workspace */}
      <div className="md:col-span-2 overflow-y-auto bg-white p-6">
        {activeApp ? (
          <div className="space-y-6">
            
            {/* Applicant Profile Brief */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-5 gap-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold">Active Candidate dossier</span>
                <h3 className="font-sans text-xl font-bold text-slate-950">{activeApp.studentName}</h3>
                <p className="font-sans text-xs text-slate-500 mt-0.5">Contact: {activeApp.studentEmail} • Quota: {activeApp.studentProfile?.category || 'General'}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-500">Review Status:</span>
                <span className={`rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${
                  activeApp.status === 'Approved' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : activeApp.status === 'Rejected' 
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : activeApp.status === 'Verified' 
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {activeApp.status}
                </span>
              </div>
            </div>

            {message && (
              <div className={`rounded-2xl border px-4 py-3 font-sans text-xs ${
                message.type === 'success' 
                  ? 'border-emerald-100 bg-emerald-50 text-emerald-800' 
                  : 'border-rose-100 bg-rose-50 text-rose-800'
              }`}>
                {message.text}
              </div>
            )}

            {/* Dual Panel Workspace: academic Metrics vs Predictions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* academic metrics */}
              <div className="rounded-3xl border border-slate-200 p-5 space-y-4">
                <h4 className="font-sans text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ClipboardCheck className="h-4 w-4 text-indigo-600" />
                  Academic Merits Card
                </h4>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                    <span className="font-mono text-[9px] text-slate-400 block font-bold">10TH CLASS SCORE</span>
                    <strong className="font-sans text-base text-slate-850 block font-bold mt-0.5">{activeApp.studentProfile?.tenthPercentage || 0}%</strong>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                    <span className="font-mono text-[9px] text-slate-400 block font-bold">12TH CLASS SCORE</span>
                    <strong className="font-sans text-base text-slate-850 block font-bold mt-0.5">{activeApp.studentProfile?.twelfthPercentage || 0}%</strong>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                    <span className="font-mono text-[9px] text-slate-400 block font-bold">CUMULATIVE CGPA</span>
                    <strong className="font-sans text-base text-slate-850 block font-bold mt-0.5">{activeApp.studentProfile?.cgpa || 0}/10</strong>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5">
                    <span className="font-mono text-[9px] text-slate-400 block font-bold">ENTRANCE LEVEL</span>
                    <strong className="font-sans text-base text-slate-850 block font-bold mt-0.5">{activeApp.studentProfile?.entranceScore || 0}%</strong>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-150 p-3.5 font-sans text-xs text-slate-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Prior Progression standing:</span>
                    <strong className="text-slate-950">{activeApp.studentProfile?.prevAcademicPerformance}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Class Attendance rate:</span>
                    <strong className="text-slate-950 font-mono">{activeApp.studentProfile?.attendancePercentage}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Extracurricular Score:</span>
                    <strong className="text-slate-950 font-mono">{activeApp.studentProfile?.extracurricularScore}/100</strong>
                  </div>
                </div>
              </div>

              {/* predictive modeling details */}
              <div className="rounded-3xl border border-slate-200 p-5 space-y-4 bg-slate-50/50">
                <h4 className="font-sans text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-indigo-600" />
                  Algorithmic Eligibility Prediction
                </h4>

                {activeApp.prediction ? (
                  <div className="space-y-3.5 font-sans text-xs">
                    <div className="flex items-center justify-between rounded-2xl bg-white p-3 border border-slate-200">
                      <span>Regression eligibility class:</span>
                      <strong className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase font-bold ${
                        activeApp.prediction.eligible ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                      }`}>
                        {activeApp.prediction.eligible ? 'ELIGIBLE' : 'REVIEW LIST'}
                      </strong>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-[10px] text-slate-500">
                        <span>Regression probability index:</span>
                        <strong className="text-slate-800">{(activeApp.prediction.probabilityScore * 100).toFixed(1)}%</strong>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${activeApp.prediction.probabilityScore * 100}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-relaxed bg-white border border-slate-100 rounded-xl p-3">
                      This calculation normalizes entrance standing and high school board scores mathematically, eliminating standard subjective admissions bias.
                    </p>
                  </div>
                ) : (
                  <div className="text-center font-sans text-xs text-slate-500 py-6">
                    No active prediction recorded. Check profiles configuration parameters.
                  </div>
                )}
              </div>

            </div>

            {/* Applicant documents Vault (Dr. Robert can review physical sheets inline!) */}
            <div className="rounded-3xl border border-slate-200 p-5 space-y-4">
              <h4 className="font-sans text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <FileCheck className="h-4 w-4 text-indigo-600" />
                Physical Document Verification Desk
              </h4>

              {docsLoading ? (
                <div className="text-center font-mono text-[10px] text-slate-400 animate-pulse py-4">
                  Decrypting candidate vault documents...
                </div>
              ) : activeDocs && Object.keys(activeDocs).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(activeDocs).map(([key, val]) => {
                    const cleanLabel = key.replace(/([A-Z])/g, ' $1').trim();
                    return val ? (
                      <button
                        key={key}
                        onClick={() => {
                          setPreviewBase64(val);
                          setPreviewTitle(cleanLabel);
                        }}
                        id={`btn_officer_preview_doc_${key}`}
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-sans text-[11px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                        Verify: {cleanLabel}
                      </button>
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center font-sans text-xs text-slate-500">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                  Candidate has not uploaded transcripts to their secure credential vault.
                </div>
              )}
            </div>

            {/* Google Gemini AI summary report card */}
            {activeApp.aiReport && (
              <div className="rounded-3xl border border-amber-100 bg-amber-50/5 p-5 space-y-3.5">
                <div className="flex items-center gap-1.5 text-amber-800 border-b border-amber-100 pb-3">
                  <Sparkles className="h-4.5 w-4.5 fill-amber-100" />
                  <h4 className="font-sans text-xs font-bold">Deep Gemini Evaluation Dossier</h4>
                </div>
                <div>
                  {renderMarkdown(activeApp.aiReport)}
                </div>
              </div>
            )}

            {/* Grading Assessment form */}
            <div className="rounded-3xl border border-slate-200 p-5 space-y-4">
              <h4 className="font-sans text-xs font-bold text-slate-800">Assessing Admissions Desk Resolution</h4>
              
              <div>
                <label className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Assessor Review Remarks</label>
                <textarea
                  id="inp_officer_remarks"
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Record transcripts status, math validation keys, and direct/conditional eligibility reasoning..."
                  className="mt-1.5 w-full h-24 rounded-xl border border-slate-200 p-3 font-sans text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleDecision('Verified')}
                  disabled={actionLoading !== null}
                  id="btn_officer_verify"
                  className="rounded-xl border border-indigo-250 bg-indigo-50 px-4 py-2 font-sans text-xs font-bold text-indigo-800 hover:bg-indigo-100"
                >
                  {actionLoading === 'Verified' ? 'Routing...' : 'Mark as Transcripts-Verified'}
                </button>
                <button
                  onClick={() => handleDecision('Approved')}
                  disabled={actionLoading !== null}
                  id="btn_officer_approve"
                  className="rounded-xl bg-slate-900 px-4 py-2 font-sans text-xs font-bold text-white hover:bg-slate-800"
                >
                  {actionLoading === 'Approved' ? 'Routing...' : 'Approve Program Admission'}
                </button>
                <button
                  onClick={() => handleDecision('Rejected')}
                  disabled={actionLoading !== null}
                  id="btn_officer_reject"
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 font-sans text-xs font-bold text-rose-700 hover:bg-rose-100"
                >
                  {actionLoading === 'Rejected' ? 'Routing...' : 'Reject File'}
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center p-8">
            <ClipboardCheck className="h-12 w-12 text-slate-300" />
            <h3 className="mt-4 font-sans text-base font-bold text-slate-700">Admissions Assessor desk</h3>
            <p className="mt-1 max-w-sm font-sans text-xs text-slate-500 leading-relaxed">
              Select any candidate dossier from the left panel to examine academic scores, verify transcripts, and trigger Google Gemini performance reports.
            </p>
          </div>
        )}
      </div>

      {/* MODAL: Dossier Base64 file rendering pane */}
      {previewBase64 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl h-[85vh] rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2 text-indigo-700">
                <FileCheck className="h-5 w-5" />
                <h3 className="font-sans text-sm font-bold">{previewTitle}</h3>
              </div>
              <button
                onClick={() => {
                  setPreviewBase64(null);
                  setPreviewTitle('');
                }}
                className="font-mono text-xs text-slate-400 hover:text-slate-600"
              >
                [Dismiss]
              </button>
            </div>

            {/* Render preview inside sandbox container */}
            <div className="flex-1 mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center relative">
              {previewBase64.startsWith('data:application/pdf') ? (
                <iframe
                  src={previewBase64}
                  className="w-full h-full"
                  title="PDF Viewer"
                />
              ) : (
                <img
                  src={previewBase64}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain"
                  alt="Dossier Transcript"
                />
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 justify-end text-slate-400 font-mono text-[9px] shrink-0">
              <Lock className="h-3 w-3" />
              <span>Transmitted via secured Sandboxed SSL protocols</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
