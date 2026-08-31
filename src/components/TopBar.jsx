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
      <div className="flex items-center gap-1.5 whitespace-nowrap hidden sm:flex">
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

  const getInitials = (name) => (name || '')
    .replace('[SYNTHETIC] ', '')
    .split(' ')
    .filter(w => !w.startsWith('Apt') && !w.startsWith('dr'))
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 flex-1 flex items-center justify-end px-6 bg-white border-b border-slate-200 z-50 flex-shrink-0">
      
      {/* Right: Shift & Profile */}
      <div className="flex items-center gap-6 whitespace-nowrap flex-shrink-0">
        
        {/* Live Shift & Clock Indicator */}
        <LiveShiftIndicator />

        <div className="w-[1px] h-6 bg-slate-200 shrink-0 hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 text-sm text-slate-700 font-medium p-1 pr-2 rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <div className="text-right hidden md:block whitespace-nowrap flex-shrink-0 min-w-max">
              <div className="text-sm font-bold text-slate-900 leading-tight">{(currentUser?.nama_lengkap || '').replace('[SYNTHETIC] ', '')}</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{currentUser?.role || 'Apoteker'}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center font-bold text-xs text-white shadow-sm ring-2 ring-white shrink-0">
              {getInitials(currentUser?.nama_lengkap)}
            </div>
            <ChevronDownIcon className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Panel */}
          <div 
            className={`absolute right-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 py-1.5 transition-all duration-150 origin-top-right z-50
              ${dropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
          >
            <div className="px-4 py-2 border-b border-slate-100/80 mb-1 whitespace-nowrap">
              <div className="text-sm font-semibold text-slate-900 truncate">{(currentUser?.nama_lengkap || '').replace('[SYNTHETIC] ', '')}</div>
              <div className="text-xs text-slate-500 truncate">{currentUser?.role || 'Apoteker'}</div>
            </div>
            
            <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <Cog8ToothIcon className="w-4 h-4 shrink-0" />
              Pengaturan Akun
            </button>
            
            <div className="h-px bg-slate-100 my-1" />
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 shrink-0 group-hover:text-red-600 transition-colors" />
              Keluar Sistem
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
