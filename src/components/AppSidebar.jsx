import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListOrdered, 
  History, 
  Box, 
  AlertTriangle, 
  FileText, 
  BarChart4, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    <aside className={`bg-white border-r border-slate-200 h-screen flex flex-col z-20 transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative flex-shrink-0 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="absolute -right-3.5 top-6 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 hover:scale-110 transition-all shadow-md z-50"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4 text-slate-500" /> : <ChevronLeft className="w-4 h-4 text-slate-500" />}
      </button>

      {/* Brand Header */}
      <div className={`flex items-center h-16 border-b border-slate-200 ${isCollapsed ? 'justify-center flex-col gap-1' : 'gap-2 px-6'}`}>
        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5 text-teal-600" />
        </div>
        {!isCollapsed ? (
          <span className="text-xl font-bold tracking-tight text-slate-800 whitespace-nowrap">Pharma<span className="text-teal-600">Xpress</span></span>
        ) : (
          <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">Pharma</span>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-6 overflow-y-auto ${isCollapsed ? 'p-2 py-4' : 'p-4'}`}>
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            {!isCollapsed && (
              <div className="px-3 mb-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                {group.title}
              </div>
            )}
            <div className={`space-y-1 ${isCollapsed ? 'flex flex-col items-center gap-2' : ''}`}>
              {group.items.map((item, iIdx) => (
                <NavLink
                  key={iIdx}
                  to={item.path}
                  title={item.name}
                  className={({ isActive }) => 
                    `flex items-center rounded-lg text-sm font-semibold transition-colors duration-200 ${
                      isActive 
                        ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                    } ${isCollapsed ? 'justify-center p-3 w-12 h-12' : 'gap-3 py-2.5 px-3 pl-2'}`
                  }
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.name}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer System Status */}
      <div className={`border-t border-slate-200 bg-slate-50 shrink-0 ${isCollapsed ? 'p-2 flex justify-center py-4' : 'p-4'}`}>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500" title="Sistem Online (Latensi: 12ms)">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
          {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Sistem Online (Latensi: 12ms)</span>}
        </div>
      </div>
    </aside>
  );
}
