// ═══════════════════════════════════════════
// Sidebar — Prescription Queue + Stats
// ═══════════════════════════════════════════
import React, { useMemo } from 'react';
import { useStore } from '../store.js';
import { ElapsedTimer } from './ElapsedTimer.jsx';
import { UserIcon, BuildingOffice2Icon, CheckCircleIcon } from '@heroicons/react/24/outline';

export function Sidebar() {
  const prescriptions = useStore(s => s.prescriptions);
  const selectedRxId = useStore(s => s.selectedRxId);
  const setSelectedRxId = useStore(s => s.setSelectedRxId);
  const stats = useStore(s => s.stats);

  const grouped = useMemo(() => {
    const groups = {
      CITO: [],
      IN_PROGRESS: [],
      RAWAT_INAP: [],
      RAWAT_JALAN: [],
    };
    for (const rx of prescriptions) {
      if (rx.status === 'IN_PROGRESS') {
        groups.IN_PROGRESS.push(rx);
      } else if (rx.priority === 'CITO') {
        groups.CITO.push(rx);
      } else if (rx.priority === 'RAWAT_INAP') {
        groups.RAWAT_INAP.push(rx);
      } else {
        groups.RAWAT_JALAN.push(rx);
      }
    }
    return groups;
  }, [prescriptions]);

  const renderGroup = (label, dotClass, items) => {
    if (items.length === 0) return null;
    return (
      <div key={label} className="mb-4 last:mb-0">
        <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <span className={`w-2 h-2 rounded-full ${dotClass}`} />
          {label} ({items.length})
        </div>
        <div className="flex flex-col gap-1 mt-1">
          {items.map(rx => {
            const isActive = selectedRxId === rx.id;
            const isCito = rx.priority === 'CITO' && rx.status !== 'IN_PROGRESS';
            return (
              <div
                key={rx.id}
                className={`group flex flex-col p-3 rounded-lg cursor-pointer transition-all duration-200 ease-fluid border-l-4 ${
                  isActive 
                    ? `bg-surface shadow-sm border-l-primary ring-1 ring-slate-200` 
                    : `hover:bg-surface hover:shadow-sm border-l-transparent hover:border-l-slate-300 hover:ring-1 hover:ring-slate-200`
                } ${isCito && isActive ? '!border-l-red-500 bg-red-50 ring-red-100' : ''} ${isCito && !isActive ? '!border-l-red-400' : ''}`}
                onClick={() => setSelectedRxId(rx.id)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-semibold text-slate-700">{rx.nomor_resep}</span>
                  <ElapsedTimer since={rx.waktu_masuk} />
                </div>
                <div className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-slate-900 group-hover:text-primary'}`}>
                  {(rx.patient_nama || '').replace('[SYNTHETIC] ', '')}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 font-medium">
                  <div className="flex items-center gap-1.5"><BuildingOffice2Icon className="w-3.5 h-3.5 mr-1"/> {rx.asal_poli}</div>
                  <div className="flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5 mr-1"/> {(rx.doctor_nama || '').replace('[SYNTHETIC] ', '')}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-[320px] bg-canvas border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-surface">
        <span className="text-sm font-semibold text-slate-700 tracking-wide uppercase">Antrean Resep</span>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{prescriptions.length} total</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {prescriptions.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm font-medium flex flex-col items-center gap-2">
            <CheckCircleIcon className="w-8 h-8 text-slate-300"/> Tidak ada resep menunggu
          </div>
        ) : (
          <>
            {renderGroup('CITO / Urgent', 'bg-red-500', grouped.CITO)}
            {renderGroup('Dalam Proses', 'bg-blue-500', grouped.IN_PROGRESS)}
            {renderGroup('Rawat Inap', 'bg-amber-500', grouped.RAWAT_INAP)}
            {renderGroup('Rawat Jalan', 'bg-emerald-500', grouped.RAWAT_JALAN)}
          </>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 grid grid-cols-3 gap-3 bg-surface">
        <div className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
          <div className="text-lg font-bold font-mono text-primary tabular-nums">{stats.dispensed_today || 0}</div>
          <div className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 mt-0.5">Selesai</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
          <div className="text-lg font-bold font-mono text-slate-700 tabular-nums">{(stats.pending || 0) + (stats.in_progress || 0)}</div>
          <div className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 mt-0.5">Pending</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100">
          <div className="text-lg font-bold font-mono text-slate-700 tabular-nums">{Math.round(stats.avg_duration || 0)}s</div>
          <div className="text-[10px] uppercase tracking-wide font-semibold text-slate-500 mt-0.5">Rata-rata</div>
        </div>
      </div>
    </aside>
  );
}
