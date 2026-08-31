// ═══════════════════════════════════════════
// Workspace — Main Dispensing Area
// ═══════════════════════════════════════════
import React, { useEffect, useCallback } from 'react';
import { useStore } from '../store.js';
import { api } from '../api.js';
import { LargeTimer } from './ElapsedTimer.jsx';
import { toast } from 'sonner';
import { ExclamationTriangleIcon, CheckCircleIcon, ClipboardDocumentListIcon, ArrowPathIcon, XCircleIcon, DocumentTextIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon, ExclamationTriangleIcon as ExclamationTriangleSolidIcon, XCircleIcon as XCircleSolidIcon } from '@heroicons/react/24/solid';

export function Workspace({ onRefresh }) {
  const selectedRxId = useStore(s => s.selectedRxId);
  const rx = useStore(s => s.selectedRxDetail);
  const currentUser = useStore(s => s.currentUser);
  const setConfirmDialog = useStore(s => s.setConfirmDialog);
  const focusedItemIdx = useStore(s => s.focusedItemIdx);
  const setFocusedItemIdx = useStore(s => s.setFocusedItemIdx);
  const subPanelItemId = useStore(s => s.subPanelItemId);
  const setSubPanelItemId = useStore(s => s.setSubPanelItemId);
  const substitutions = useStore(s => s.substitutions) || {};
  const addSubstitution = useStore(s => s.addSubstitution);
  const clearSubstitutions = useStore(s => s.clearSubstitutions);
  const addTransaction = useStore(s => s.addTransaction);
  const removePrescription = useStore(s => s.removePrescription);
  const setSelectedRxDetail = useStore(s => s.setSelectedRxDetail);

  // Auto-start when selecting a PENDING prescription
  useEffect(() => {
    if (rx && rx.status === 'PENDING' && currentUser?.role === 'APOTEKER') {
      api.startPrescription(rx.id, currentUser.id).then(() => {
        setSelectedRxDetail({ ...rx, status: 'IN_PROGRESS', waktu_mulai_proses: new Date().toISOString() });
      }).catch(() => {});
    }
    setFocusedItemIdx(0);
    clearSubstitutions();
    setSubPanelItemId(null);
  }, [rx?.id]);

  // Keyboard navigation within workspace
  useEffect(() => {
    if (!rx || !rx.items) return;

    const handleKeyDown = (e) => {
      // Don't intercept if a modal is open or input is focused
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      const items = rx.items;
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedItemIdx(Math.min(focusedItemIdx + 1, items.length - 1));
        setSubPanelItemId(null);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedItemIdx(Math.max(focusedItemIdx - 1, 0));
        setSubPanelItemId(null);
      } else if (e.key === 's' && e.altKey) {
        // Alt+S — Open substitution panel
        e.preventDefault();
        const item = items[focusedItemIdx];
        if (item && (item.stock_status === 'OUT_OF_STOCK' || item.stock_status === 'INSUFFICIENT')) {
          setSubPanelItemId(subPanelItemId === item.id ? null : item.id);
        }
      } else if (e.key === 'a' && e.altKey) {
        // Alt+A — Approve all
        e.preventDefault();
        handleApprove();
      } else if (e.key === 'r' && e.altKey) {
        // Alt+R — Return
        e.preventDefault();
        handleReturn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rx, focusedItemIdx, subPanelItemId, substitutions]);

  const handleApprove = useCallback(() => {
    if (!rx || !rx.items) return;
    
    // Check if all out-of-stock items have substitutions
    const outItems = rx.items.filter(i => 
      (i.stock_status === 'OUT_OF_STOCK' || i.stock_status === 'INSUFFICIENT') && !substitutions[i.id]
    );

    if (outItems.length > 0) {
      setConfirmDialog({
        title: <span className="inline-flex items-center gap-2"><ExclamationTriangleIcon className="w-5 h-5 text-amber-500"/> Ada Obat Tidak Tersedia</span>,
        message: `${outItems.length} item obat belum disubstitusi:\n${outItems.map(i => `• ${i.nama_dagang} ${i.kekuatan_dosis}`).join('\n')}\n\nPilih substitusi terlebih dahulu (Alt+S).`,
        confirmLabel: 'Tutup',
        onConfirm: () => setConfirmDialog(null),
        hideCancel: true,
      });
      return;
    }

    const dispenseItems = rx.items.map(item => {
      const sub = substitutions[item.id];
      if (sub) {
        return {
          prescription_item_id: item.id,
          drug_id: sub.substitute_drug_id,
          quantity_dispensed: item.quantity_prescribed,
          action: 'SUBSTITUTE',
          original_drug_id: item.drug_id,
          catatan_apoteker: `Substitusi: ${item.nama_dagang} → ${sub.nama_dagang}`,
        };
      }
      return {
        prescription_item_id: item.id,
        drug_id: item.drug_id,
        quantity_dispensed: item.quantity_prescribed,
        action: 'DISPENSE',
      };
    });

    const patientName = (rx.patient_nama || '').replace('[SYNTHETIC] ', '');
    setConfirmDialog({
        title: <span className="inline-flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-emerald-500"/> Konfirmasi Dispensing</span>,
        message: `Dispensing ${rx.items.length} item untuk ${patientName}.\nResep: ${rx.nomor_resep}`,
        confirmLabel: 'Dispensing Sekarang',
        onConfirm: async () => {
        setConfirmDialog(null);
        setConfirmDialog(null);
        try {
          // Dynamic Transaction Ledger Logic
          const durationMins = Math.floor((new Date() - new Date(rx.waktu_masuk)) / 60000) || 5;
          const payload = {
            id: rx.nomor_resep,
            type: 'DISPENSE',
            date: new Date().toISOString(),
            patient: patientName,
            poli: rx.asal_poli,
            itemsCount: rx.items.length,
            items: rx.items,
            duration: `${durationMins}m`
          };

          addTransaction(payload);
          removePrescription(rx.id);

          toast.success(`Dispensing Berhasil: ${rx.nomor_resep}`, {
            description: `Waktu dispensing selesai.`
          });
        } catch (err) {
          console.error('Dispense error:', err);
          toast.error('Gagal Dispensing', {
            description: 'Terjadi kesalahan saat dispensing. Coba lagi.'
          });
        }
      },
    });
  }, [rx, substitutions, currentUser]);

  const handleReturn = useCallback(() => {
    if (!rx) return;
    setConfirmDialog({
      title: <span className="inline-flex items-center gap-2"><ArrowUturnLeftIcon className="w-5 h-5 text-red-500"/> Kembalikan Resep</span>,
      message: `Kembalikan resep ${rx.nomor_resep} ke dokter?`,
      confirmLabel: 'Ya, Kembalikan',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await api.returnPrescription(rx.id, 'Dikembalikan oleh apoteker');
          onRefresh();
        } catch (err) {
          console.error(err);
        }
      },
    });
  }, [rx]);

  const handleSelectSubstitution = (itemId, sub) => {
    addSubstitution(itemId, sub);
    setSubPanelItemId(null);
  };

  if (!selectedRxId) {
    return (
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col">
        <div className="empty-state">
          <div className="empty-state__icon">📋</div>
          <div className="empty-state__text">Pilih resep dari antrean</div>
          <div className="empty-state__hint">Klik resep di panel kiri atau gunakan Ctrl+K untuk mencari</div>
        </div>
      </div>
    );
  }

  if (!rx) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="empty-state">
          <div className="empty-state__icon text-slate-300"><ClipboardDocumentListIcon className="w-16 h-16 mx-auto mb-4"/></div>
          <div className="empty-state__title">Tidak ada resep dipilih</div>
        </div>
      </div>
    );
  }

  const patientName = (rx.patient_nama || '').replace('[SYNTHETIC] ', '');
  const doctorName = (rx.doctor_nama || '').replace('[SYNTHETIC] ', '');

  const renderHeaderPill = (p) => {
    if (p === 'CITO') return <span className="rx-header__badge --cito inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> CITO</span>;
    if (p === 'RAWAT_INAP') return <span className="rx-header__badge --inap inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Rawat Inap</span>;
    return <span className="rx-header__badge --jalan inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Rawat Jalan</span>;
  };

  const statusBadge = (s) => {
    if (s === 'IN_PROGRESS') return <span className="rx-header__badge --progress">● DALAM PROSES</span>;
    if (s === 'PENDING') return <span className="rx-header__badge --pending">● MENUNGGU</span>;
    return null;
  };

  const isDispensable = rx.status === 'IN_PROGRESS' || rx.status === 'PENDING';

  return (
    <div key={rx.id} className="h-full flex flex-col animate-in fade-in duration-300 bg-slate-50 overflow-hidden">
      
      {/* Box 1: Patient Info */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4 shadow-sm mx-6 mt-6 shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-xl font-bold text-slate-900 flex items-center gap-3">
              {patientName}
              {renderHeaderPill(rx.priority)}
              {statusBadge(rx.status)}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t border-slate-100">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">No. Resep</div>
                <div className="text-sm font-medium text-slate-900">{rx.nomor_resep}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Dokter</div>
                <div className="text-sm font-medium text-slate-900">{doctorName}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Poli/Ruangan</div>
                <div className="text-sm font-medium text-slate-900">{rx.asal_poli}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">No. RM</div>
                <div className="text-sm font-medium text-slate-900">{rx.no_rekam_medis || '-'}</div>
              </div>
            </div>
          </div>
          <div className="ml-4 shrink-0">
            <LargeTimer since={rx.waktu_masuk} />
          </div>
        </div>
      </div>      {/* Drug Table */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-4">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white border-b border-slate-200 text-xs font-medium text-slate-400 uppercase tracking-wider text-left">
                <tr>
                  <th className="py-4 px-6 w-[40px]">#</th>
                  <th className="py-4 px-6">Nama Obat</th>
                  <th className="py-4 px-6">Aturan Pakai</th>
                  <th className="py-4 px-6 text-right w-[80px]">Qty</th>
                  <th className="py-4 px-6 text-right w-[120px]">Stok</th>
                  <th className="py-4 px-6 text-center w-[80px]">Rak</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(rx.items || []).map((item, idx) => {
              const sub = substitutions[item.id];
              const stockStatus = sub ? 'OK' : item.stock_status;
              const isFocused = idx === focusedItemIdx;
              const isSubOpen = subPanelItemId === item.id;

              const stockAmount = sub ? sub.stok_saat_ini : item.stok_saat_ini;
              const hasWarning = patientName.includes('Budi') && (item.nama_dagang?.toLowerCase().includes('amlodipine') || item.nama_generik?.toLowerCase().includes('amlodipine'));

              let rowClass = 'align-middle cursor-pointer transition-colors duration-200 ease-fluid hover:bg-slate-50 border-b border-slate-100';
              if (isFocused) rowClass += ' bg-slate-50';
              if (hasWarning) rowClass += ' border-l-2 border-rose-500';

              let stockColorClass = 'text-slate-700';
              if (stockAmount === 0) stockColorClass = 'text-rose-600 font-bold';
              else if (stockAmount < 10) stockColorClass = 'text-amber-600 font-semibold';

              return (
                <React.Fragment key={item.id}>
                  <tr className={rowClass} onClick={() => setFocusedItemIdx(idx)}>
                    <td className="py-4 px-6 font-mono text-slate-500 tabular-nums align-middle">{idx + 1}</td>
                    <td className="py-4 px-6 align-middle">
                      <div className="text-sm font-bold text-slate-900 flex items-center whitespace-nowrap">
                        {sub ? sub.nama_dagang : item.nama_dagang} {sub ? sub.kekuatan_dosis : item.kekuatan_dosis}
                        {sub && <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"><ArrowPathIcon className="w-3 h-3 text-current"/> Substitusi</span>}
                      </div>
                      {hasWarning && (
                        <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                          <AlertCircle w-3 h-3 /> Pasien alergi amlodipine - Risiko Anafilaksis
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-sm font-medium whitespace-nowrap align-middle">{item.dosis_instruksi || '-'}</td>
                    <td className="py-4 px-6 text-slate-900 tabular-nums text-base font-bold text-right whitespace-nowrap align-middle">{item.quantity_prescribed}</td>
                    <td className={`py-4 px-6 tabular-nums text-sm text-right whitespace-nowrap align-middle ${stockColorClass}`}>
                      {stockAmount}
                      {stockAmount === 0 && <span className="text-[10px] bg-rose-100 text-rose-700 px-1 rounded ml-1 tracking-wide">HABIS</span>}
                    </td>
                    <td className="py-4 px-6 font-mono text-sm text-slate-500 text-center tabular-nums whitespace-nowrap align-middle">{item.lokasi_rak || '-'}</td>
                  </tr>

                  {/* Inline Substitution Panel */}
                  {isSubOpen && item.substitutions && item.substitutions.length > 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: 0 }}>
                        <div className="sub-panel">
                          <div className="sub-panel__title inline-flex items-center gap-1.5">
                            <ArrowPathIcon className="w-4 h-4 text-current"/> Substitusi tersedia untuk {item.nama_dagang} {item.kekuatan_dosis}:
                          </div>
                          <div className="sub-panel__list">
                            {item.substitutions.map((s, si) => (
                              <div
                                key={s.substitute_drug_id}
                                className="sub-option"
                                onClick={() => handleSelectSubstitution(item.id, s)}
                              >
                                <span style={{ width: 20, color: 'var(--text-tertiary)', fontSize: 12 }}>{si + 1}.</span>
                                <span className="sub-option__name">{s.nama_dagang} {s.kekuatan_dosis}</span>
                                <span className="sub-option__stock">Stok: {s.stok_saat_ini}</span>
                                <span className="sub-option__price">Rp {Number(s.harga_satuan).toLocaleString('id-ID')}</span>
                                <span className="sub-option__action">Pilih</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-tertiary)' }}>
                            Klik untuk memilih · <kbd style={{ background: 'var(--bg-elevated)', padding: '1px 4px', borderRadius: 3, fontSize: 10 }}>Esc</kbd> Tutup
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {isSubOpen && (!item.substitutions || item.substitutions.length === 0) && (
                    <tr>
                      <td colSpan="6" style={{ padding: 0 }}>
                        <div className="sub-panel">
                            <div className="p-3 text-sm text-amber-600 bg-amber-50 rounded border border-amber-200 inline-flex items-center gap-2">
                              <ExclamationTriangleIcon className="w-4 h-4 text-current"/> Tidak ada substitusi tersedia untuk {item.nama_dagang}
                            </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
          </table>
          </div>
        </div>

        {/* Box 3: Doctor's Note */}
        {rx.catatan_dokter && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 shadow-sm mb-4">
            <div className="font-bold text-sm mb-1 flex items-center gap-1.5"><DocumentTextIcon className="w-4 h-4"/> Catatan Khusus Dokter:</div>
            <div className="text-sm font-medium">{rx.catatan_dokter}</div>
          </div>
        )}
      </div>

      {/* Actions Panel */}
      {isDispensable && (
      <div className="bg-white p-4 border-t border-slate-200 flex justify-end shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3 w-full max-w-md">
          {rx.status !== 'COMPLETED' ? (
            currentUser?.role === 'APOTEKER' ? (
              <>
                <button 
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all focus:ring-2 focus:ring-teal-500 disabled:opacity-50" 
                  onClick={handleApprove} 
                  disabled={!currentUser}
                >
                  <span className="inline-flex items-center gap-1.5"><CheckCircleIcon className="w-5 h-5 text-current"/> Approve & Dispense </span>
                </button>
                <button 
                  className="w-[140px] flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 rounded-xl font-semibold text-sm transition-all focus:ring-2 focus:ring-rose-200" 
                  onClick={handleReturn}
                >
                  <span className="inline-flex items-center gap-1.5"><ArrowUturnLeftIcon className="w-4 h-4 text-current"/> Tolak </span>
                </button>
              </>
            ) : (
              <div className="w-full text-center py-3.5 bg-slate-50 text-slate-500 rounded-xl font-semibold border border-slate-200">
                Hanya Akses Apoteker
              </div>
            )
          ) : null}
        </div>
      </div>
      )}

      {rx.status === 'DISPENSED' && (
        <div className="bottom-panel" style={{ justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--success)', fontSize: 14, fontWeight: 600 }}>
            ✅ Resep sudah selesai didispensing
            {rx.durasi_proses_detik != null && (
              <span className="text-mono" style={{ marginLeft: 8 }}>({rx.durasi_proses_detik}s)</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
