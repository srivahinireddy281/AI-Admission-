import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  GraduationCap, 
  Layers, 
  Tag, 
  ArrowRight, 
  CheckCircle2, 
  BadgeHelp,
  AlertTriangle,
  Send,
  Ticket
} from 'lucide-react';
import { api } from '../services/api';
import { Course, StudentProfile, Application } from '../types';

export default function StudentApplicationForm() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [appliedCourseIds, setAppliedCourseIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Download listings
  const fetchData = async () => {
    try {
      setLoading(true);
      const courseList = await api.getCourses();
      setCourses(courseList);

      const studentProf = await api.getProfile();
      setProfile(studentProf);

      const apps = await api.getStudentApplications();
      setAppliedCourseIds(apps.map(a => a.courseId));
    } catch (err) {
      console.error('Failed to pre-verify courses list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (courseId: number) => {
    setSubmitLoading(courseId);
    setMessage(null);

    try {
      const res = await api.submitApplication(courseId);
      setMessage({ type: 'success', text: 'Application successfully registered and queued for evaluation!' });
      // Update locally
      setAppliedCourseIds(prev => [...prev, courseId]);
      await fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Admissions filing refused.' });
    } finally {
      setSubmitLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="font-mono text-xs text-slate-500">Retrieving course prospectus...</p>
        </div>
      </div>
    );
  }

  // Segment courses by departmental division
  const departments = courses.reduce((acc: any, c) => {
    if (!acc[c.department]) acc[c.department] = [];
    acc[c.department].push(c);
    return acc;
  }, {});

  const hasIncompleteMetrics = !profile?.tenthPercentage || !profile?.twelfthPercentage || !profile?.entranceScore;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      
      <div>
        <h2 className="font-sans text-xl font-bold tracking-tight text-slate-900">
          Academic Prospectus & Curriculum Portal
        </h2>
        <p className="font-sans text-xs text-slate-500">
          Browse active institutional divisions, verify matching cutoffs, and register file applications.
        </p>
      </div>

      {message && (
        <div className={`rounded-2xl border px-4 py-3 font-sans text-xs ${
          message.type === 'success' 
            ? 'border-emerald-100 bg-emerald-50 text-emerald-800 animate-pulse' 
            : 'border-rose-100 bg-rose-50 text-rose-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Safety Guard Warning block if profile metrics are empty */}
      {hasIncompleteMetrics && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <AlertTriangle className="h-8 w-8 text-amber-600 shrink-0" />
          <div>
            <h4 className="font-sans text-sm font-bold text-amber-900">Incomplete Scholastic Dossier</h4>
            <p className="font-sans text-xs text-amber-700 leading-relaxed max-w-2xl mt-1">
              You must update your physical percentages (10th, 12th marks averages) and entrance scores on the **Admissions Dashboard** profile section before you can submit registrations.
            </p>
          </div>
        </div>
      )}

      {/* Primary prospect list partitioned by department */}
      <div className="space-y-8">
        {Object.keys(departments).map(dept => (
          <div key={dept} className="space-y-4">
            <h3 className="font-sans text-xs font-bold text-indigo-700 uppercase tracking-widest border-l-2 border-indigo-600 pl-2.5">
              Division of {dept}
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {departments[dept].map((c: Course) => {
                const isApplied = appliedCourseIds.includes(c.id);
                // Check if student twelfth board score meets academic cutoffs
                const isBelowCutoff = profile && profile.twelfthPercentage < c.cutoffPercentage;

                return (
                  <div
                    key={c.id}
                    className={`relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition-all hover:shadow-md ${
                      isApplied ? 'border-indigo-100' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-sans text-sm font-bold text-slate-900">{c.courseName}</h4>
                        <p className="font-sans text-[11px] text-slate-400 mt-0.5">Program Duration: {c.durationYears} Years</p>
                      </div>
                      
                      <div className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-1 flex items-center gap-1 font-mono text-[9px] font-bold text-slate-600 uppercase">
                        <Tag className="h-3 w-3" />
                        Cutoff: {c.cutoffPercentage}%
                      </div>
                    </div>

                    {/* Vacancy visual bar */}
                    <div className="mt-5 space-y-1.5">
                      <div className="flex justify-between font-mono text-[9px] text-slate-400">
                        <span>Total Seats: {c.totalSeats}</span>
                        <span className="font-bold text-slate-600">Available Vacancies: {c.availableSeats}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${(c.availableSeats / c.totalSeats) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-4">
                      {isBelowCutoff ? (
                        <div className="flex items-center gap-1 text-[10px] font-sans font-semibold text-rose-600">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Scores below course cutoff
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-sans">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Eligible to Apply
                        </div>
                      )}

                      {isApplied ? (
                        <span className="rounded-xl bg-indigo-50 px-3 py-1.5 font-sans text-[10px] font-bold text-indigo-700">
                          Applied & Pending Review
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(c.id)}
                          disabled={hasIncompleteMetrics || c.availableSeats <= 0 || submitLoading === c.id}
                          className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-1.5 font-sans text-[10px] font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-40"
                        >
                          {submitLoading === c.id 
                            ? 'Queuing File...' 
                            : c.availableSeats <= 0 
                            ? 'Seats Full' 
                            : 'Submit Application'}
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
