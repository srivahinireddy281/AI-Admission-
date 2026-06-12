import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Search, 
  Clock, 
  Calendar, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';

export default function AuditLogReview() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const syncLogs = async () => {
    try {
      setRefreshing(true);
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    syncLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.ipAddress.includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="font-mono text-xs text-slate-500">Decrypting security logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      
      {/* Title head block */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-sans text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-5.5 w-5.5 text-rose-600 animate-pulse" />
            Authentication Security Audit Terminal
          </h2>
          <p className="font-sans text-xs text-slate-500">
            Immutable tracking archive of database seeds, credentials logins, profile updates, and admissions actions.
          </p>
        </div>

        <button
          onClick={syncLogs}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-sans text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
          {refreshing ? 'Refreshing...' : 'Verify Ledger'}
        </button>
      </div>

      {/* Filter and stats indicator panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 border border-slate-200 p-4 rounded-3xl">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search action keyword, audit details or request IP address..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 font-sans text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-rose-700 font-mono text-[9.5px] font-bold uppercase bg-rose-50 border border-rose-150 px-2.5 py-1 rounded-xl">
          <Lock className="h-3.5 w-3.5" />
          <span>Secured Encrypted SSL Vault • {filteredLogs.length} Records</span>
        </div>
      </div>

      {/* wide details table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
        <table className="w-full border-collapse font-sans text-xs text-slate-600">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-mono text-[9px] uppercase font-bold text-left border-b border-slate-200">
              <th className="p-4">Reference ID</th>
              <th className="p-4">Event Action Type</th>
              <th className="p-4">Detailed Description</th>
              <th className="p-4">Client Request IP</th>
              <th className="p-4">Chronological Timestamp (UTC)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  No security logs matching search parameters were found.
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="p-4 font-mono text-[11px] text-slate-400">#AD-0{log.id}</td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-950 block">{log.action}</span>
                  </td>
                  <td className="p-4 text-slate-600 leading-relaxed font-sans">{log.details}</td>
                  <td className="p-4 font-mono text-[10px] text-slate-500">{log.ipAddress}</td>
                  <td className="p-4 font-mono text-[10.5px] text-slate-550">
                    {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
