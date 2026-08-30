// ═══════════════════════════════════════════
// ElapsedTimer — Live elapsed time display
// ═══════════════════════════════════════════
import React, { useState, useEffect } from 'react';

const SlaBadge = () => (
  <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-sm">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    SLA TERLAMPAUI
  </span>
);

export function ElapsedTimer({ since }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!since) return;
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(since).getTime()) / 1000);
      setElapsed(Math.max(0, diff));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [since]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const display = `${mins}m ${String(secs).padStart(2, '0')}s`;

  let cls = 'font-mono text-xs tabular-nums transition-colors duration-300';
  if (mins >= 30) cls += ' text-red-600 font-semibold';
  else if (mins >= 15) cls += ' text-amber-600 font-medium';
  else cls += ' text-slate-400';

  const isSlaViolated = mins >= 60;

  return (
    <div className="flex items-center gap-2">
      {isSlaViolated && <SlaBadge />}
      <span className={cls}>{display}</span>
    </div>
  );
}

export function LargeTimer({ since }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!since) return;
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(since).getTime()) / 1000);
      setElapsed(Math.max(0, diff));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [since]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const display = `${mins}:${String(secs).padStart(2, '0')}`;

  let colorClass = 'text-slate-500';
  if (mins >= 30) colorClass = 'text-red-600 font-medium';
  else if (mins >= 15) colorClass = 'text-amber-600 font-medium';

  const isSlaViolated = mins >= 60;

  return (
    <div className="flex items-center gap-4">
      {isSlaViolated && <SlaBadge />}
      <div className="flex flex-col items-end">
        <div className={`font-mono text-lg tabular-nums transition-colors duration-300 ${colorClass}`}>
          {display}
        </div>
        <div className="text-xs text-slate-400 font-medium tracking-wide uppercase">waktu berlalu</div>
      </div>
    </div>
  );
}
