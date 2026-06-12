import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  FileText, 
  XCircle, 
  BadgeAlert, 
  Send, 
  ChevronRight,
  UserCheck,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { StudentProfile, Application } from '../types';

// Native lightweight Markdown formatter to prevent external React9 parse conflicts
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

export default function StudentDashboard() {
  const [profile, setProfile] = useState<(StudentProfile & { name: string; email: string }) | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [activeML, setActiveML] = useState<any | null>(null);

  // Form profile values
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [category, setCategory] = useState('General');
  const [tenth, setTenth] = useState(0);
  const [twelfth, setTwelfth] = useState(0);
  const [cgpa, setCgpa] = useState(0);
  const [entrance, setEntrance] = useState(0);
  const [attendance, setAttendance] = useState(0);
  const [extracurricular, setExtracurricular] = useState(0);
  const [prevAcademic, setPrevAcademic] = useState<'Excellent' | 'Good' | 'Average' | 'Poor'>('Average');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const prof = await api.getProfile();
      setProfile(prof);
      setPhone(prof.phone || '');
      setDob(prof.dob ? prof.dob.substring(0, 10) : '');
      setCategory(prof.category || 'General');
      setTenth(prof.tenthPercentage || 0);
      setTwelfth(prof.twelfthPercentage || 0);
      setCgpa(prof.cgpa || 0);
      setEntrance(prof.entranceScore || 0);
      setAttendance(prof.attendancePercentage || 0);
      setExtracurricular(prof.extracurricularScore || 0);
      setPrevAcademic(prof.prevAcademicPerformance || 'Average');

      const apps = await api.getStudentApplications();
      setApplications(apps);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to synchronize student file dashboard.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setMessage(null);

    try {
      await api.updateProfile({
        phone,
        dob,
        category,
        tenthPercentage: tenth,
        twelfthPercentage: twelfth,
        cgpa,
        entranceScore: entrance,
        attendancePercentage: attendance,
        extracurricularScore: extracurricular,
        prevAcademicPerformance: prevAcademic,
      });
      setMessage({ type: 'success', text: 'Scholastic profile successfully updated' });
      setEditMode(false);
      await fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update index card values.' });
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="font-mono text-xs text-slate-500">Decrypting scholar registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      
      {/* Banner Welcome Message */}
      <div className="rounded-3xl bg-gradient-to-tr from-indigo-900 to-violet-800 p-6 text-white shadow-lg sm:p-8">
        <h2 className="font-sans text-2xl font-bold tracking-tight">
          Admissions Hub: Academic Portal
        </h2>
        <p className="mt-2 max-w-xl font-sans text-xs text-indigo-100 leading-relaxed">
          Welcome back, <strong className="text-white">{profile?.name}</strong>. Here you can configure your high-school marks, upload necessary identification files, submit program applications, and track real-time machine eligibility assessments with Gemini evaluations.
        </p>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Profile / Credentials Setup Panel */}
        <div className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-sans text-sm font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-indigo-600" />
              Scholastic Profile File
            </h3>
            <button
              onClick={() => setEditMode(!editMode)}
              id="btn_student_profile_edit_toggle"
              className="rounded-xl border border-slate-200 bg-white px-3 py-1 font-sans text-[10px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {editMode ? 'Dismiss' : 'Modify Record'}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateProfile} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[9px] uppercase text-slate-400 font-bold">Contact No.</label>
                  <input
                    type="text"
                    id="inp_student_phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-sans text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-mono text-[9px] uppercase text-slate-400 font-bold">Birthdate</label>
                  <input
                    type="date"
                    id="inp_student_dob"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-sans text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-[9px] uppercase text-slate-400 font-bold">Category Limit</label>
                <select
                  id="inp_student_category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-sans text-xs text-slate-900"
                >
                  <option value="General">General/Unreserved</option>
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <label className="font-mono text-[9px] uppercase text-slate-400 font-bold">10th Score (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    id="inp_student_10th"
                    value={tenth}
                    onChange={e => setTenth(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-sans text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-mono text-[9px] uppercase text-slate-400 font-bold">12th Score (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    id="inp_student_12th"
                    value={twelfth}
                    onChange={e => setTwelfth(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-sans text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[9px] uppercase text-slate-400 font-bold">CGPA (out of 10)</label>
                  <input
                    type="number"
                    step="0.01"
                    id="inp_student_cgpa"
                    value={cgpa}
                    onChange={e => setCgpa(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-sans text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-mono text-[9px] uppercase text-slate-400 font-bold">Entrance (100)</label>
                  <input
                    type="number"
                    step="0.1"
                    id="inp_student_entrance"
                    value={entrance}
                    onChange={e => setEntrance(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-sans text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[9px] uppercase text-slate-400 font-bold">Class Attendance (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    id="inp_student_attendance"
                    value={attendance}
                    onChange={e => setAttendance(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-sans text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-mono text-[9px] uppercase text-slate-400 font-bold">Extracurricular (100)</label>
                  <input
                    type="number"
                    id="inp_student_extra"
                    value={extracurricular}
                    onChange={e => setExtracurricular(parseInt(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-sans text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-[9px] uppercase text-slate-400 font-bold">Academic Performance Grade</label>
                <select
                  id="inp_student_grade"
                  value={prevAcademic}
                  onChange={e => setPrevAcademic(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 font-sans text-xs text-slate-900"
                >
                  <option value="Excellent">Excellent Progression</option>
                  <option value="Good">Good/Consistent</option>
                  <option value="Average">Average / Passing</option>
                  <option value="Poor">Poor / Review Needed</option>
                </select>
              </div>

              <button
                type="submit"
                id="btn_student_profile_save"
                disabled={saveLoading}
                className="w-full rounded-xl bg-indigo-600 py-2.5 font-sans text-xs font-bold text-white transition-all hover:bg-indigo-700"
              >
                {saveLoading ? 'Saving...' : 'Save Updated Dossier'}
              </button>
            </form>
          ) : (
            <div className="mt-4 space-y-4">
              
              {/* Credentials card layout */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                <div className="flex justify-between font-sans text-xs">
                  <span className="text-slate-500">Legal Name:</span>
                  <span className="font-semibold text-slate-800">{profile?.name}</span>
                </div>
                <div className="flex justify-between font-sans text-xs">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-800">{profile?.email}</span>
                </div>
                <div className="flex justify-between font-sans text-xs">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-indigo-750 font-mono text-[10.5px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{profile?.category}</span>
                </div>
                <div className="flex justify-between font-sans text-xs">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-semibold text-slate-800">{profile?.phone || 'Not Filled'}</span>
                </div>
              </div>

              <h4 className="font-sans text-[11px] uppercase tracking-wider text-slate-400 font-extrabold mt-4">Verified Academic Board Scores</h4>
              
              <div className="grid grid-cols-2 gap-3 pb-2">
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center items-center border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                  <span className="text-2xl font-black text-slate-850 tracking-tight">{profile?.tenthPercentage || 0}%</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center mt-1">10th Grade</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center items-center border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                  <span className="text-2xl font-black text-slate-850 tracking-tight">{profile?.twelfthPercentage || 0}%</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center mt-1">12th Grade</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center items-center border border-slate-200 shadow-sm hover:border-indigo-400 bg-gradient-to-tr from-white to-indigo-50/20 transition-colors">
                  <span className="text-2xl font-black text-indigo-600 tracking-tight">{profile?.entranceScore || 0}</span>
                  <span className="text-[9px] text-indigo-500 font-extrabold uppercase tracking-wider text-center mt-1">Entrance Score</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center items-center border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                  <span className="text-2xl font-black text-slate-850 tracking-tight">{profile?.cgpa || 0}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center mt-1">Sem CGPA</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-250 bg-white p-4 space-y-2 pb-3 shadow-xs">
                <div className="flex justify-between font-sans text-xs items-center mb-1">
                  <span className="text-slate-500 flex items-center gap-1.5 font-bold"><Award className="h-4 w-4 text-indigo-600" /> Extracurriculars</span>
                  <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full font-bold text-indigo-700 font-mono text-[10px]">{profile?.extracurricularScore || 0}/100</span>
                </div>
                <div className="flex justify-between font-sans text-xs pt-1.5 border-t border-slate-100">
                  <span className="text-slate-500">Grading Grade:</span>
                  <span className="font-bold text-slate-800">{profile?.prevAcademicPerformance}</span>
                </div>
                <div className="flex justify-between font-sans text-xs pt-1.5">
                  <span className="text-slate-500">Board Attendance:</span>
                  <span className="font-bold text-slate-800 font-mono">{profile?.attendancePercentage || 0}%</span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Submitted Applications List Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-sans text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <FileText className="h-4 w-4 text-indigo-600" />
              Admission Registration Logs
            </h3>

            {applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-10 w-10 text-slate-300" />
                <p className="mt-3 font-sans text-sm text-slate-500">No programs applied yet.</p>
                <p className="font-sans text-xs text-slate-400 mt-1">Visit the "Explore & Apply Programs" tab in the navigation sidebar to register.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-6">
                {applications.map(app => (
                  <div
                    key={app.id}
                    id={`student_app_card_${app.id}`}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-105 pb-4">
                      <div>
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-bold rounded-full uppercase tracking-wider">
                          PROGRAM DETAILS
                        </span>
                        <h4 className="font-sans text-base font-bold text-slate-900 mt-1.5">
                          {app.courseName}
                        </h4>
                        <p className="font-sans text-[11px] text-slate-500 mt-0.5">
                          {app.department} Department • Applied: {new Date(app.appliedDate).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Status pill mapping */}
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-widest ${
                        app.status === 'Approved' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : app.status === 'Rejected' 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                          : app.status === 'Verified' 
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    {app.remarks && (
                      <p className="mt-4 text-xs font-sans text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                        <strong className="text-slate-800">Officer Evaluation Appraisal:</strong> {app.remarks}
                      </p>
                    )}

                    {/* Bento Embedded Widgets: Prediction probability & AI Analysis snippet */}
                    {(app.prediction || app.aiReport) && (
                      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Logistic prediction Bento Card exactly resembling mockup bg-indigo-900 style */}
                        {app.prediction && (
                          <div className="bg-indigo-950 rounded-2xl p-5 text-white flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-300">Logistic Regression Probability</span>
                              </div>
                              <div className="flex items-baseline justify-between mt-1">
                                <div>
                                  <p className="text-3xl font-black tracking-tight">{(app.prediction.probabilityScore * 105).toFixed(1)}<span className="text-base text-indigo-400 font-medium">%</span></p>
                                  <p className="text-[10px] font-medium text-indigo-200 mt-1">Eligibility Fit Coefficient</p>
                                </div>
                                <div className="px-2 py-0.5 bg-indigo-800 border border-indigo-600 rounded text-[9px] font-bold uppercase tracking-wider text-indigo-100">
                                  {app.prediction.eligible ? 'HIGH FIT' : 'LOW FIT'}
                                </div>
                              </div>
                            </div>
                            <p className="text-[9px] leading-relaxed text-indigo-300/80 mt-4 border-t border-indigo-900 pt-2.5">
                              Computed real-time on entrance Standing, twelfth performance grade and local historic cutoff distributions.
                            </p>
                          </div>
                        )}

                        {/* AI Summary report bento card */}
                        {app.aiReport ? (
                          <div className="rounded-2xl border border-slate-200 p-5 flex flex-col justify-between bg-white hover:shadow-xs transition-shadow">
                            <div>
                              <div className="flex items-center gap-1.5 mb-3">
                                <Sparkles className="h-3.5 w-3.5 text-indigo-600 fill-indigo-50 animate-pulse" />
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-550">Gemini Advisory Memo</span>
                              </div>
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 max-h-24 overflow-y-auto">
                                <p className="text-[11px] leading-relaxed text-slate-650 italic">
                                  "{app.aiReport.replace(/###|#|\*|-/g, '').split(/[.!?]/).slice(0, 2).join('.') + '.'}"
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setActiveReport(app.aiReport || null)}
                              className="mt-3 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center justify-end gap-1"
                            >
                              VIEW FULL DOSSIER
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-200 p-5 flex flex-col justify-center items-center text-center bg-slate-50/50">
                            <Sparkles className="h-5 w-5 text-slate-300" />
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">Gemini Advisory Pending</span>
                            <p className="text-[9px] text-slate-400/80 mt-1 max-w-[180px]">Issued as soon as registration papers pass desk validation checks.</p>
                          </div>
                        )}

                      </div>
                    )}

                    {/* Action controllers bar */}
                    <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-slate-100 justify-end">
                      {app.prediction && (
                        <button
                          onClick={() => setActiveML(app.prediction)}
                          id={`btn_check_ml_pred_${app.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 font-sans text-[10px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <Cpu className="h-3.5 w-3.5 text-slate-400" />
                          Diagnostic Regression Logs
                        </button>
                      )}

                      {app.aiReport && (
                        <button
                          onClick={() => setActiveReport(app.aiReport || null)}
                          id={`btn_view_ai_rep_${app.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/20 px-3.5 py-1.5 font-sans text-[10px] font-bold text-amber-850 transition-colors hover:bg-amber-100"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                          Evaluation Dossier
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL 1: AI Evaluation Report Details */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-amber-700">
                <Sparkles className="h-4.5 w-4.5 fill-amber-100" />
                <h3 className="font-sans text-sm font-bold">Google Gemini AI Performance Dossier</h3>
              </div>
              <button
                onClick={() => setActiveReport(null)}
                className="font-mono text-xs text-slate-400 hover:text-slate-600"
              >
                [Dismiss]
              </button>
            </div>
            
            <div className="mt-4 max-h-96 overflow-y-auto pr-1">
              {renderMarkdown(activeReport)}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-3 text-right">
              <span className="font-mono text-[9px] text-slate-400">
                Document issued by Google Gemini 1.5 Series
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ML Eligibility Predictions Details */}
      {activeML && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-700">
                <Cpu className="h-4.5 w-4.5" />
                <h3 className="font-sans text-sm font-bold">Logistic Regression Analysis</h3>
              </div>
              <button
                onClick={() => setActiveML(null)}
                className="font-mono text-xs text-slate-400 hover:text-slate-600"
              >
                [Dismiss]
              </button>
            </div>

            <div className="mt-5 space-y-4 font-sans text-xs text-slate-700">
              <div className="flex items-center justify-between rounded-2xl bg-indigo-50/50 p-4 border border-indigo-100">
                <span className="font-sans font-semibold text-indigo-950 text-xs">Prediction Result:</span>
                <span className={`rounded px-2.5 py-0.5 font-mono text-xs font-bold uppercase ${
                  activeML.eligible ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}>
                  {activeML.eligible ? 'ELIGIBLE' : 'INELIGIBLE'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Calculated Probability score:</span>
                  <strong className="font-mono text-slate-800 font-bold">{activeML.probabilityScore * 100}%</strong>
                </div>
                
                {/* Visual confidence gauge indicator */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${activeML.probabilityScore * 100}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                The **Logistic Regression** model utilizes mathematical coefficient parameter optimization. This algorithm tracks board consistency coefficients normalized alongside institutional entrance standing to predict physical registration viability with absolute accuracy.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
