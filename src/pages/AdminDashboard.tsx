import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  Layers, 
  ShieldAlert, 
  Settings, 
  PieChart, 
  Lock, 
  RefreshCw,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsSummary, AuditLog } from '../types';
import StatCard from '../components/StatCard';

export default function AdminDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdminData = async () => {
    try {
      setRefreshing(true);
      const ana = await api.getAnalytics();
      setSummary(ana);

      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to pre-verify admin files', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="font-mono text-xs text-slate-500">Retrieving institutional ledger...</p>
        </div>
      </div>
    );
  }

  // Distribution chart variables
  const statusDist = summary?.statusDistribution || { Pending: 0, Verified: 0, Approved: 0, Rejected: 0 };
  const totalApps = summary?.metrics.totalApplications || 1;

  const chartStatusItems = [
    { key: 'Pending', label: 'Pending Review', color: 'bg-amber-500 text-amber-700', value: statusDist.Pending },
    { key: 'Verified', label: 'Transcripts-Verified', color: 'bg-indigo-500 text-indigo-700', value: statusDist.Verified },
    { key: 'Approved', label: 'Approved Admissions', color: 'bg-emerald-500 text-emerald-700', value: statusDist.Approved },
    { key: 'Rejected', label: 'Rejected Files', color: 'bg-rose-500 text-rose-700', value: statusDist.Rejected }
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      
      {/* Title head container */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-sans text-xl font-bold tracking-tight text-slate-900">
            Institutional Control & Operations Dashboard
          </h2>
          <p className="font-sans text-xs text-slate-500">
            Monitor real-time candidate applications flow, vacancy allocations, and system security ledgers.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-sans text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Syncing...' : 'Sync Logs'}
        </button>
      </div>

      {/* stat cards array */}
      {summary && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            id="admin_stat_students"
            title="Registered Candidates"
            value={summary.metrics.totalStudents}
            description="Active portal academic profiles"
            icon={Users}
            gradient="from-indigo-600 to-indigo-500"
          />
          <StatCard
            id="admin_stat_applications"
            title="Total Applications"
            value={summary.metrics.totalApplications}
            description="Program enrollment submissions"
            icon={FileText}
            gradient="from-sky-600 to-sky-500"
          />
          <StatCard
            id="admin_stat_pending"
            title="Pending Verification"
            value={summary.metrics.pendingVerification}
            description="Admissions desks backlog"
            icon={Clock}
            gradient="from-amber-600 to-amber-500"
          />
          <StatCard
            id="admin_stat_approved"
            title="Approved Admissions"
            value={summary.metrics.approvedTotal}
            description="Secured vacancies allocations"
            icon={CheckCircle}
            gradient="from-emerald-600 to-emerald-500"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Status distribution chart (Beautiful Native Bar visualizer) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-sans text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <PieChart className="h-4 w-4 text-indigo-600" />
              Applications status distribution
            </h3>
            <p className="font-sans text-[11px] text-slate-400">Proportional classification ratios in real-time</p>
          </div>

          <div className="space-y-4 pt-2">
            {chartStatusItems.map((item) => {
              const pct = totalApps > 0 ? (item.value / totalApps) * 100 : 0;
              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex justify-between font-sans text-xs">
                    <span className="text-slate-600">{item.label}</span>
                    <strong className="text-slate-950 font-mono">
                      {item.value} ({Math.round(pct)}%)
                    </strong>
                  </div>
                  <div className="h-4 w-full bg-slate-50 border border-slate-100 rounded-lg overflow-hidden">
                    <div
                      className={`h-full rounded-lg transition-all duration-500 ${item.color.split(' ')[0]}`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vacancies tracking per program */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-sans text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-indigo-600" />
                Department vacancy roster
              </h3>
              <span className="rounded bg-slate-50 border border-slate-100 px-1.5 py-0.5 font-mono text-[9px] text-slate-500 font-bold uppercase">
                Active seats
              </span>
            </div>

            <div className="mt-4 space-y-3.5 overflow-y-auto max-h-52">
              {summary?.courseSeats.map((cs, idx) => (
                <div key={idx} className="flex justify-between items-center font-sans text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800">{cs.courseName}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Vacancies: {cs.availableSeats} Left</span>
                  </div>
                  <div className="text-right">
                    <span className="rounded px-1.5 py-0.5 font-mono text-[10px] bg-sky-50 text-sky-700 border border-sky-100 font-bold">
                      {cs.filledSeats}/{cs.totalSeats} Filled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] font-sans text-slate-400">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span>Vacancy distributions updated on admissions status transitions</span>
          </div>
        </div>

      </div>

      {/* Security transaction Audit trails log table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-sans text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              Automated admissions transaction Audit trails
            </h3>
            <p className="font-sans text-[11px] text-slate-400">Security journals logging administrative edits and logins</p>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
            <Lock className="h-3 w-3" />
            <span>SECURED RELATIONAL LOG</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full border-collapse font-sans text-xs text-slate-600">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase font-bold text-left border-b border-slate-100">
                <th className="p-3">Reference index</th>
                <th className="p-3">Audit Event Action</th>
                <th className="p-3">Logged Details</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">Timestamp (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-mono text-[11px] text-slate-400">#AD-0{log.id}</td>
                  <td className="p-3 font-semibold text-slate-900">{log.action}</td>
                  <td className="p-3 text-slate-600">{log.details}</td>
                  <td className="p-3 font-mono text-[10px]">{log.ipAddress}</td>
                  <td className="p-3 font-mono text-[10.5px] text-slate-550">
                    {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
