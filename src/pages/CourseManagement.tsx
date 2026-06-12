import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Layers, 
  GraduationCap, 
  Clock, 
  Save, 
  X,
  PlusCircle,
  Hash
} from 'lucide-react';
import { api } from '../services/api';
import { Course } from '../types';

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [dept, setDept] = useState('Engineering');
  const [duration, setDuration] = useState(3);
  const [seats, setSeats] = useState(60);
  const [cutoff, setCutoff] = useState(75);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await api.getCourses();
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await api.addCourse({
        courseName: name,
        department: dept,
        durationYears: duration,
        totalSeats: seats,
        cutoffPercentage: cutoff,
      });
      setMessage({ type: 'success', text: 'New scholastic program successfully registered!' });
      setAdding(false);
      clearForm();
      await fetchCourses();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Forbidden: Cannot create program.' });
    }
  };

  const clearForm = () => {
    setName('');
    setDept('Engineering');
    setDuration(3);
    setSeats(60);
    setCutoff(75);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you absolutely sure you want to delete this program from curriculum database? This is irreversible.')) return;
    setMessage(null);
    try {
      await api.deleteCourse(id);
      setMessage({ type: 'success', text: 'Program successfully deleted.' });
      await fetchCourses();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Forbidden: Cannot remove program.' });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="font-mono text-xs text-slate-500">Unlocking curriculum registers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      
      {/* Title block */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-sans text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5 animate-fade-in">
            <Layers className="h-5.5 w-5.5 text-indigo-600 animate-pulse" />
            Institutional Departmental Configuration
          </h2>
          <p className="font-sans text-xs text-slate-500">
            Define degree durations, program seat quotas, and high school board cutoffs.
          </p>
        </div>

        <button
          onClick={() => setAdding(!adding)}
          id="btn_admin_add_course_toggle"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 font-sans text-xs font-bold text-white transition-all hover:bg-slate-800"
        >
          {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {adding ? 'Dismiss Form' : 'Register New Program'}
        </button>
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

      {/* Adding curriculum program inline card block */}
      {adding && (
        <form onSubmit={handleCreate} className="rounded-3xl border border-indigo-150 bg-indigo-50/5 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-1.5 text-indigo-800 border-b border-slate-100 pb-2">
            <PlusCircle className="h-4.5 w-4.5" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">Register Academic Program</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Course Name</label>
              <input
                type="text"
                required
                id="inp_course_name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="B.Tech Artificial Intelligence"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-sans text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Academic Department</label>
              <select
                id="inp_course_dept"
                value={dept}
                onChange={e => setDept(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-sans text-xs text-slate-900"
              >
                <option value="Engineering">Engineering & Technology</option>
                <option value="Sciences">Sciences & Humanities</option>
                <option value="Management">Business Administrations</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Duration</label>
                <input
                  type="number"
                  required
                  id="inp_course_duration"
                  value={duration}
                  onChange={e => setDuration(parseInt(e.target.value) || 3)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-sans text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Seats</label>
                <input
                  type="number"
                  required
                  id="inp_course_seats"
                  value={seats}
                  onChange={e => setSeats(parseInt(e.target.value) || 60)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-sans text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Cutoff (%)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  id="inp_course_cutoff"
                  value={cutoff}
                  onChange={e => setCutoff(parseFloat(e.target.value) || 75)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 font-sans text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 justify-end">
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                clearForm();
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-sans text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="inp_course_submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 font-sans text-xs font-bold text-white hover:bg-indigo-700"
            >
              Save New Course record
            </button>
          </div>
        </form>
      )}

      {/* Roster matrix cards display */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {courses.map(c => (
          <div
            key={c.id}
            id={`course_mgmt_card_${c.id}`}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-sans text-sm font-bold text-slate-900">{c.courseName}</h4>
                  <span className="font-mono text-[9px] text-indigo-700 font-bold tracking-wider uppercase bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                    {c.department} Division
                  </span>
                </div>

                <div className="flex items-center gap-1 text-slate-400 hover:text-rose-600">
                  <button
                    onClick={() => handleDelete(c.id)}
                    id={`btn_delete_course_${c.id}`}
                    type="button"
                    className="p-1.5 rounded-xl hover:bg-rose-50 border border-slate-100"
                    title="Delete program"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Seats allocation bars */}
              <div className="grid grid-cols-3 gap-2.5 mt-5 border-t border-slate-100 pt-4 text-center">
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="font-mono text-[8px] text-slate-400 block font-bold">TOTAL SEATS</span>
                  <strong className="font-sans text-sm font-bold text-slate-800">{c.totalSeats}</strong>
                </div>
                <div className="bg-sky-50/50 p-2.5 rounded-xl">
                  <span className="font-mono text-[8px] text-sky-450 block font-bold">VACANT SEATS</span>
                  <strong className="font-sans text-sm font-bold text-sky-700">{c.availableSeats}</strong>
                </div>
                <div className="bg-amber-50/50 p-2.5 rounded-xl">
                  <span className="font-mono text-[8px] text-amber-450 block font-bold">XII CUTOFF</span>
                  <strong className="font-sans text-sm font-bold text-amber-800">{c.cutoffPercentage}%</strong>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center font-mono text-[9px] text-slate-400">
              <span>Program Duration: {c.durationYears} Years</span>
              <span className="text-slate-300">Index ID: #CRS-0{c.id}</span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
