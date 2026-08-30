// ═══════════════════════════════════════════
// TopBar — Global navigation bar
// ═══════════════════════════════════════════
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store.js';
import { MagnifyingGlassIcon, ClipboardDocumentListIcon, PlusIcon, ClockIcon, ChevronDownIcon, ArrowRightOnRectangleIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';

// ── Live Shift Indicator ──
function LiveShiftIndicator() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getShift = (hours) => {
    if (hours >= 7 && hours < 14) return 'Shift Pagi';
    if (hours >= 14 && hours < 21) return 'Shift Siang';
    return 'Shift Malam';
  };

  const hours = time.getHours();
  const shift = getShift(hours);

  // Format date: e.g., "30 Ags 2026"
  const dateStr = time.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Format time: e.g., "14:05:30"
  const timeStr = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\./g, ':'); // some locales use dot for time, ensure colon

  return (
    <div className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 flex items-center gap-2 text-sm font-medium text-slate-600 shadow-sm transition-all duration-300">
      <ClockIcon className="w-4 h-4 text-slate-500 shrink-0" />
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span>{dateStr},</span>
        <span className="tabular-nums font-mono text-slate-700 font-semibold">{timeStr}</span>
        <span className="text-slate-300">•</span>
        <span className="text-primary font-bold">{shift}</span>
      </div>
    </div>
  );
}

export function TopBar() {
  const currentUser = useStore(s => s.currentUser);
  const setCurrentUser = useStore(s => s.setCurrentUser);
  const stats = useStore(s => s.stats);
  const setSearchOpen = useStore(s => s.setSearchOpen);
  const setNewRxFormOpen = useStore(s => s.setNewRxFormOpen);
  const pendingCount = (stats.pending || 0) + (stats.in_progress || 0);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    setCurrentUser(null);
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

      <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-500 text-sm hover:bg-slate-100 hover:text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus-within:ring-2 focus-within:ring-teal-500 min-w-[240px]" onClick={() => setSearchOpen(true)}>
        <MagnifyingGlassIcon className="w-4 h-4" />
        Cari obat, pasien...
        <kbd className="ml-auto font-sans text-[11px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-400">Ctrl+K</kbd>
      </button>

      <button className="btn btn--primary !py-1.5 !px-3 !text-xs flex items-center gap-1.5" onClick={() => setNewRxFormOpen(true)}>
        <PlusIcon className="w-4 h-4" />
        Resep Baru <span className="bg-white/20 px-1 rounded text-[10px] ml-1">Alt+N</span>
      </button>

      <div className="flex-1" />

      {/* Live Shift & Clock Indicator */}
      <LiveShiftIndicator />

      {/* User Profile Dropdown */}
      <div className="relative border-l border-slate-200 pl-4" ref={dropdownRef}>
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 text-sm text-slate-700 font-medium p-1.5 pr-2 rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center font-bold text-xs text-white shadow-sm ring-2 ring-white">
            {initials}
          </div>
          <span>{(currentUser?.nama_lengkap || '').replace('[SYNTHETIC] ', '')}</span>
          <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Panel */}
        <div 
          className={`absolute right-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 py-1.5 transition-all duration-150 origin-top-right z-50
            ${dropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
        >
          <div className="px-4 py-2 border-b border-slate-100/80 mb-1">
            <div className="text-sm font-semibold text-slate-900">{(currentUser?.nama_lengkap || '').replace('[SYNTHETIC] ', '')}</div>
            <div className="text-xs text-slate-500">{currentUser?.role || 'Apoteker'}</div>
          </div>
          
          <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Cog8ToothIcon className="w-4 h-4" />
            Pengaturan Akun
          </button>
          
          <div className="h-px bg-slate-100 my-1" />
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 group-hover:text-red-600 transition-colors" />
            Keluar Sistem
          </button>
        </div>
      </div>
    </header>
  );
}
