import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListOrdered, 
  History, 
  Box, 
  AlertTriangle, 
  FileText, 
  BarChart4, 
  Settings 
} from 'lucide-react';

export function AppSidebar() {
  const menuGroups = [
    {
      title: 'PELAYANAN',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Antrean Resep', path: '/antrean', icon: ListOrdered },
        { name: 'Riwayat Penyerahan', path: '/riwayat', icon: History },
      ]
    },
    {
      title: 'INVENTORI & GUDANG',
      items: [
        { name: 'Master Obat', path: '/master-obat', icon: Box },
        { name: 'Audit Kedaluwarsa (ED)', path: '/audit-ed', icon: AlertTriangle },
        { name: 'Surat Permintaan', path: '/surat-permintaan', icon: FileText },
      ]
    },
    {
      title: 'SISTEM',
      items: [
        { name: 'Laporan Kinerja', path: '/laporan', icon: BarChart4 },
        { name: 'Pengaturan & RBAC', path: '/pengaturan', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-[260px] bg-white border-r border-slate-200 h-screen flex flex-col shrink-0 overflow-y-auto">
      {/* Brand Header */}
      <div className="h-[56px] border-b border-slate-200 flex items-center px-6 shrink-0 bg-slate-50">
        <div className="flex items-center gap-3 font-bold text-lg text-slate-900 tracking-tight">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" className="fill-primary"/>
            <path d="M8 16h6l2-6 4 12 2-6h6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          SIMRS
          <span className="text-primary font-black">XPRESS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-8">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <div className="px-3 mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map((item, iIdx) => (
                <NavLink
                  key={iIdx}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                      isActive 
                        ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600 pl-2' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent pl-2'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          Sistem Online (Latensi: 12ms)
        </div>
      </div>
    </aside>
  );
}
