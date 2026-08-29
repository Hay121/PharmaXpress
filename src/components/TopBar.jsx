// ═══════════════════════════════════════════
// TopBar — Global navigation bar
// ═══════════════════════════════════════════
import React from 'react';
import { useStore } from '../store.js';
import { MagnifyingGlassIcon, ClipboardDocumentListIcon, PlusIcon, ClockIcon } from '@heroicons/react/24/outline';

export function TopBar() {
  const currentUser = useStore(s => s.currentUser);
  const stats = useStore(s => s.stats);
  const setSearchOpen = useStore(s => s.setSearchOpen);
  const setNewRxFormOpen = useStore(s => s.setNewRxFormOpen);
  const pendingCount = (stats.pending || 0) + (stats.in_progress || 0);

  const getShiftLabel = () => {
    const h = new Date().getHours();
    if (h >= 6 && h < 14) return 'Pagi';
    if (h >= 14 && h < 22) return 'Siang';
    return 'Malam';
  };

  const initials = (currentUser?.nama_lengkap || '')
    .replace('[SYNTHETIC] ', '')
    .split(' ')
    .filter(w => !w.startsWith('Apt') && !w.startsWith('dr'))
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-[56px] bg-surface border-b border-slate-200 shadow-sm flex items-center px-6 gap-6 shrink-0 z-50 sticky top-0">
      <div className="flex items-center gap-3 font-bold text-lg text-primary tracking-tight">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" className="fill-primary"/>
          <path d="M8 16h6l2-6 4 12 2-6h6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        PharmaXpress
      </div>

      <div className="w-[1px] h-6 bg-slate-200 shrink-0" />

      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${pendingCount > 15 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-primary-subtle text-primary border-primary/20'}`}>
        <ClipboardDocumentListIcon className="w-4 h-4" />
        Antrean: {pendingCount} resep
      </div>

      <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-500 text-sm hover:bg-slate-100 hover:text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary min-w-[240px]" onClick={() => setSearchOpen(true)}>
        <MagnifyingGlassIcon className="w-4 h-4" />
        Cari obat, pasien...
        <kbd className="ml-auto font-sans text-[11px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-400">Ctrl+K</kbd>
      </button>

      <button className="btn btn--primary !py-1.5 !px-3 !text-xs flex items-center gap-1.5" onClick={() => setNewRxFormOpen(true)}>
        <PlusIcon className="w-4 h-4" />
        Resep Baru <span className="bg-white/20 px-1 rounded text-[10px] ml-1">Alt+N</span>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-md text-xs font-medium text-slate-500 border border-slate-100">
        <ClockIcon className="w-4 h-4" />
        Shift {getShiftLabel()}
      </div>

      <div className="flex items-center gap-3 text-sm text-slate-700 font-medium border-l border-slate-200 pl-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center font-bold text-xs text-white shadow-sm ring-2 ring-white">
          {initials}
        </div>
        <span>{(currentUser?.nama_lengkap || '').replace('[SYNTHETIC] ', '')}</span>
      </div>
    </header>
  );
}
