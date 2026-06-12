import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  UploadCloud, 
  Layers, 
  Settings, 
  ShieldAlert, 
  History,
  GraduationCap
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ user, activeTab, setActiveTab }: SidebarProps) {
  
  const getMenuItems = () => {
    switch (user.role) {
      case 'student':
        return [
          { id: 'dashboard', label: 'My Admissions Dashboard', icon: LayoutDashboard },
          { id: 'courses', label: 'Explore & Apply Programs', icon: GraduationCap },
          { id: 'documents', label: 'Credentials & Document Vault', icon: UploadCloud },
        ];
      case 'officer':
        return [
          { id: 'officer-dashboard', label: 'Applicant Board & Predictions', icon: LayoutDashboard },
        ];
      case 'admin':
        return [
          { id: 'admin-dashboard', label: 'Institutional Controller', icon: LayoutDashboard },
          { id: 'admin-courses', label: 'Department Configuration', icon: Layers },
          { id: 'admin-audit', label: 'Authentication Security Audit', icon: ShieldAlert },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-full shrink-0 border-b border-slate-200 bg-slate-50 md:h-[calc(100vh-4rem)] md:w-64 md:border-r md:bg-white">
      <div className="flex flex-col gap-4 p-4 md:py-6">
        <h2 className="hidden md:block px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation Rail
        </h2>
        
        {/* Dynamic Nav Rail Items list */}
        <nav className="flex flex-row flex-wrap gap-1 md:flex-col">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar_tab_${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 font-sans text-xs font-semibold tracking-tight transition-all md:flex-initial ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
