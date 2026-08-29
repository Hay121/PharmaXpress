// ═══════════════════════════════════════════
// ElapsedTimer — Live elapsed time display
// ═══════════════════════════════════════════
import React, { useState, useEffect } from 'react';

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

  return <span className={cls}>{display}</span>;
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

  return (
    <div className="flex flex-col items-end">
      <div className={`font-mono text-lg tabular-nums transition-colors duration-300 ${colorClass}`}>
        {display}
      </div>
      <div className="text-xs text-slate-400 font-medium tracking-wide uppercase">waktu berlalu</div>
    </div>
  );
}
