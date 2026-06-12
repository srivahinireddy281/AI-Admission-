import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id: string;
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  gradient: string;
}

export default function StatCard({ id, title, value, description, icon: Icon, gradient }: StatCardProps) {
  return (
    <div
      id={id}
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            {title}
          </p>
          <h3 className="mt-2 font-sans text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
          {description && (
            <p className="mt-1 font-sans text-xs text-slate-400">
              {description}
            </p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr text-white shadow-inner ${gradient}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      {/* Structural visual aesthetic overlay lines */}
      <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-slate-50 opacity-40 blur-lg" />
    </div>
  );
}
