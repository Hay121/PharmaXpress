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
  const substitutions = useStore(s => s.substitutions);
  const addSubstitution = useStore(s => s.addSubstitution);
  const clearSubstitutions = useStore(s => s.clearSubstitutions);
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
        try {
          const res = await api.dispensePrescription(rx.id, {
            dispensing_pharmacist_id: currentUser.id,
            items: dispenseItems,
          });
          toast.success(`Dispensing Berhasil: ${rx.nomor_resep}`, {
            description: `Durasi proses: ${res.data.durasi_proses_detik} detik`,
          });
          setTimeout(() => {
            onRefresh();
          }, 1000);
        } catch (err) {
          console.error('Dispense error:', err);
          toast.error('Gagal Dispensing', {
            description: err?.error?.message || 'Terjadi kesalahan saat dispensing. Coba lagi.'
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
    <div className="h-full flex flex-col gap-6">
      {/* Prescription Header */}
      <div className="rx-header">
        <div className="rx-header__patient">
          <div className="rx-header__patient-name">
            {patientName}
            {renderHeaderPill(rx.priority)}
            {statusBadge(rx.status)}
          </div>
          <div className="rx-header__patient-meta">
            <span>Resep: <strong style={{ fontFamily: 'var(--font-mono)' }}>{rx.nomor_resep}</strong></span>
            <span>·</span>
            <span>Dokter: {doctorName}</span>
            <span>·</span>
            <span>Poli: {rx.asal_poli || '-'}</span>
            {rx.no_rekam_medis && (
              <>
                <span>·</span>
                <span>RM: <span className="text-mono">{rx.no_rekam_medis}</span></span>
              </>
            )}
          </div>
        </div>
        <LargeTimer since={rx.waktu_masuk} />
      </div>

      {/* Clinical Decision Support (CDS) Banner */}
      {patientName.includes('Budi') && (
        <div className="mx-6 mt-4 mb-2 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md flex items-start gap-3 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 w-5 h-5 shrink-0 mt-0.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M12 8v4"/>
            <path d="M12 16h.01"/>
          </svg>
          <div>
            <div className="text-amber-800 font-semibold text-sm">Peringatan Sistem Klinis</div>
            <div className="text-amber-700 text-sm mt-1">Alergi Amlodipine - Risiko Anafilaksis</div>
          </div>
        </div>
      )}

      {/* Drug Table */}
      <div className="flex-1 overflow-y-auto bg-surface flex justify-center">
        <div className="w-full max-w-7xl px-6 py-4">
          <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">
                <tr>
                  <th className="py-4 px-6 w-[40px]">#</th>
                  <th className="py-4 px-6">Nama Obat</th>
                  <th className="py-4 px-6">Aturan Pakai</th>
                  <th className="py-4 px-6 text-right w-[80px]">Qty</th>
                  <th className="py-4 px-6 text-right w-[90px]">Stok</th>
                  <th className="py-4 px-6 w-[140px] text-center">Status</th>
                  <th className="py-4 px-6 text-center w-[80px]">Rak</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(rx.items || []).map((item, idx) => {
              const sub = substitutions[item.id];
              const stockStatus = sub ? 'OK' : item.stock_status;
              const isFocused = idx === focusedItemIdx;
              const isSubOpen = subPanelItemId === item.id;

              let rowClass = '';
              if (isFocused) rowClass += ' --focused';
              if (stockStatus === 'OUT_OF_STOCK' || stockStatus === 'INSUFFICIENT') rowClass += ' --out-of-stock';
              else if (stockStatus === 'LOW') rowClass += ' --low-stock';
              if (sub) rowClass += ' --substituted';

              return (
                <React.Fragment key={item.id}>
                  <tr className={`${rowClass} cursor-pointer transition-colors duration-200 ease-fluid hover:bg-slate-50 align-middle`} onClick={() => setFocusedItemIdx(idx)}>
                    <td className="py-4 px-6 font-mono text-slate-500 tabular-nums align-middle">{idx + 1}</td>
                    <td className="py-4 px-6 whitespace-nowrap align-middle">
                      <div className="text-sm font-bold text-slate-900">
                        {sub ? sub.nama_dagang : item.nama_dagang} {sub ? sub.kekuatan_dosis : item.kekuatan_dosis}
                        {sub && <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"><ArrowPathIcon className="w-3 h-3 text-current"/> Substitusi</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-sm font-medium whitespace-nowrap align-middle">{item.dosis_instruksi || '-'}</td>
                    <td className="py-4 px-6 text-slate-900 tabular-nums text-base font-bold text-right whitespace-nowrap align-middle">{item.quantity_prescribed}</td>
                    <td className="py-4 px-6 text-slate-600 tabular-nums text-sm font-semibold text-right whitespace-nowrap align-middle">{sub ? sub.stok_saat_ini : item.stok_saat_ini}</td>
                    <td className="py-4 px-6 whitespace-nowrap text-center align-middle">
                      {stockStatus === 'OK' && <span className="inline-flex px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold items-center gap-1"><CheckCircleSolidIcon className="w-3.5 h-3.5 text-current"/> OK</span>}
                      {stockStatus === 'LOW' && <span className="inline-flex px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-bold items-center gap-1"><ExclamationTriangleSolidIcon className="w-3.5 h-3.5 text-current"/> Stok Rendah</span>}
                      {(stockStatus === 'OUT_OF_STOCK' || stockStatus === 'INSUFFICIENT') && (
                        <button
                          className="inline-flex px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-md text-xs font-bold items-center gap-1 transition-colors"
                          onClick={(e) => { e.stopPropagation(); setSubPanelItemId(isSubOpen ? null : item.id); }}
                          title="Klik untuk Substitusi"
                        >
                          <XCircleSolidIcon className="w-3.5 h-3.5 text-current"/> {item.stok_saat_ini <= 0 ? 'HABIS' : 'KURANG'} <ArrowPathIcon className="w-3 h-3 ml-0.5 text-current"/>
                        </button>
                      )}
                      {sub && <span className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-bold items-center gap-1 mt-1 block w-max mx-auto"><ArrowPathIcon className="w-3.5 h-3.5 text-current"/> Disubstitusi</span>}
                    </td>
                    <td className="py-4 px-6 font-mono text-sm text-slate-500 text-center tabular-nums whitespace-nowrap align-middle">{item.lokasi_rak || '-'}</td>
                  </tr>

                  {/* Inline Substitution Panel */}
                  {isSubOpen && item.substitutions && item.substitutions.length > 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: 0 }}>
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
                      <td colSpan="7" style={{ padding: 0 }}>
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
      </div>

      {/* Bottom Panel — Doctor Notes + Actions */}
      {isDispensable && (
      <div className="bg-surface border-t border-slate-200 p-6 shrink-0 flex items-start gap-8 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex-1">
          <div className="text-xs font-bold text-amber-600 tracking-wider mb-2 flex items-center gap-1.5 uppercase">
            <DocumentTextIcon className="w-4 h-4"/> Catatan Dokter
          </div>
          {rx.status === 'COMPLETED' && (
            <div className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5">
              <CheckCircleIcon className="w-4 h-4 text-current"/> Resep sudah selesai didispensing
            </div>
          )}
          <div className="text-slate-700 text-sm leading-relaxed border-l-4 border-amber-300 pl-4 py-1 bg-amber-50/50 rounded-r-md">
            {rx.catatan_dokter || <span className="italic text-slate-400">Tidak ada catatan khusus.</span>}
          </div>
        </div>

        <div className="flex flex-col gap-3 min-w-[280px]">
          {rx.status !== 'COMPLETED' ? (
            currentUser?.role === 'APOTEKER' ? (
              <>
                <button 
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-base shadow-sm transition-all duration-200 ease-fluid active:scale-[0.98] focus:ring-4 focus:ring-primary/20 disabled:opacity-50" 
                  onClick={handleApprove} 
                  disabled={!currentUser}
                >
                  <span className="inline-flex items-center gap-1.5"><CheckCircleIcon className="w-5 h-5 text-current"/> Approve & Dispense </span>
                  <kbd className="ml-2 bg-black/10 border-black/20 text-white/90 shadow-none px-1.5 py-0.5 text-xs rounded">Alt+A</kbd>
                </button>
                <button 
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 rounded-xl font-semibold text-sm transition-all duration-200 ease-fluid active:scale-[0.98] focus:ring-4 focus:ring-red-100" 
                  onClick={handleReturn}
                >
                  <span className="inline-flex items-center gap-1.5"><ArrowUturnLeftIcon className="w-4 h-4 text-current"/> Kembalikan </span>
                  <kbd className="ml-2 font-sans text-[11px] px-1.5 py-0.5 bg-red-100 rounded font-medium">Alt+R</kbd>
                </button>
              </>
            ) : (
              <div className="text-center p-4 bg-slate-100 text-slate-500 rounded-lg font-semibold border border-slate-200">
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
