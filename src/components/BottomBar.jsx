// ═══════════════════════════════════════════
// BottomBar — Contextual keyboard shortcut hints
// ═══════════════════════════════════════════
import React from 'react';
import { useStore } from '../store.js';

export function BottomBar() {
  const selectedRxId = useStore(s => s.selectedRxId);

  return (
    <footer className="bottombar">
      <div className="bottombar__hint">
        <kbd>Ctrl+K</kbd> Cari
      </div>

      <div className="bottombar__hint">
        <kbd>Alt+N</kbd> Resep Baru
      </div>
      {selectedRxId && (
        <>
          <div className="bottombar__hint">
            <kbd>↑↓</kbd> Navigasi Item
          </div>
          <div className="bottombar__hint">
            <kbd>Alt+S</kbd> Substitusi
          </div>
          <div className="bottombar__hint">
            <kbd>Alt+A</kbd> Approve
          </div>
          <div className="bottombar__hint">
            <kbd>Alt+R</kbd> Return
          </div>
        </>
      )}
      <div style={{ flex: 1 }} />
      <div className="bottombar__hint flex items-center gap-1.5 text-amber-600 bg-amber-50/50 px-2 py-0.5 rounded border border-amber-200/50 font-semibold tracking-wider">
        <svg className="w-3.5 h-3.5 text-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        DATA SINTETIS
      </div>
    </footer>
  );
}
