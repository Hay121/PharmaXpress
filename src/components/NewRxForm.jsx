// ═══════════════════════════════════════════
// NewRxForm — New Prescription Form (Ctrl+N)
// ═══════════════════════════════════════════
import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useStore } from '../store.js';
import { api } from '../api.js';
import { CustomSelect } from './CustomSelect.jsx';
import { ClipboardDocumentCheckIcon, CheckIcon } from '@heroicons/react/24/outline';

export function NewRxForm({ onCreated }) {
  const setNewRxFormOpen = useStore(s => s.setNewRxFormOpen);
  const inventory = useStore(s => s.inventory);
  const currentUser = useStore(s => s.currentUser);

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [priority, setPriority] = useState('RAWAT_JALAN');
  const [poli, setPoli] = useState('Poli Umum');
  const [catatan, setCatatan] = useState('');
  const [items, setItems] = useState([]);
  const [drugSearch, setDrugSearch] = useState('');
  const [drugQty, setDrugQty] = useState('10');
  const [drugDosis, setDrugDosis] = useState('3x1 tablet setelah makan');
  const [submitting, setSubmitting] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');

  const fuse = useMemo(() => new Fuse(inventory, {
    keys: ['nama_dagang', 'nama_generik', 'kode_obat'],
    threshold: 0.35,
  }), [inventory]);

  const drugResults = useMemo(() => {
    if (!drugSearch.trim()) return [];
    return fuse.search(drugSearch).slice(0, 8).map(r => r.item);
  }, [drugSearch, fuse]);

  useEffect(() => {
    api.getPatients('').then(r => setPatients(r.data)).catch(() => {});
    api.getUsers('DOKTER').then(r => {
      setDoctors(r.data);
      // Auto-fill: jika user login adalah dokter, pilih dirinya sendiri
      if (currentUser?.role === 'DOKTER') {
        const self = r.data.find(d => d.id === currentUser.id);
        if (self) {
          setDoctorId(self.id);
        } else if (r.data.length > 0) {
          setDoctorId(r.data[0].id);
        }
      } else if (r.data.length > 0) {
        setDoctorId(r.data[0].id);
      }
    }).catch(() => {});
  }, []);

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients.slice(0, 20);
    const lower = patientSearch.toLowerCase();
    return patients.filter(p =>
      p.nama_lengkap.toLowerCase().includes(lower) || p.no_rekam_medis.toLowerCase().includes(lower)
    ).slice(0, 20);
  }, [patients, patientSearch]);

  const addDrug = (drug) => {
    // Validasi: tolak obat dengan stok 0
    if (drug.stok_saat_ini <= 0) return;

    const qty = Number(drugQty) || 1;
    const existing = items.find(i => i.drug_id === drug.id);
    if (existing) {
      // Duplikat → increment kuantitas alih-alih memblokir
      setItems(items.map(i =>
        i.drug_id === drug.id
          ? { ...i, quantity_prescribed: i.quantity_prescribed + qty }
          : i
      ));
    } else {
      setItems([...items, {
        drug_id: drug.id,
        nama: `${drug.nama_dagang} ${drug.kekuatan_dosis}`,
        quantity_prescribed: qty,
        dosis_instruksi: drugDosis,
        stok: drug.stok_saat_ini,
      }]);
    }
    setDrugSearch('');
  };

  const removeDrug = (drugId) => {
    setItems(items.filter(i => i.drug_id !== drugId));
  };

  const handleSubmit = async () => {
    if (!patientId || !doctorId || items.length === 0) return;
    setSubmitting(true);
    try {
      await api.createPrescription({
        patient_id: patientId,
        prescribing_doctor_id: doctorId,
        priority,
        asal_poli: poli,
        catatan_dokter: catatan || null,
        items: items.map(i => ({
          drug_id: i.drug_id,
          quantity_prescribed: i.quantity_prescribed,
          dosis_instruksi: i.dosis_instruksi,
        })),
      });
      setNewRxFormOpen(false);
      onCreated();
    } catch (err) {
      console.error(err);
      alert('Gagal membuat resep: ' + (err?.error?.message || 'Error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Escape key — tutup form
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setNewRxFormOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="form-overlay" onClick={() => setNewRxFormOpen(false)}>
      <div className="form-modal" onClick={e => e.stopPropagation()}>
        <div className="form-modal__header">
          <span className="form-modal__title inline-flex items-center gap-2"><ClipboardDocumentCheckIcon className="w-5 h-5 text-primary"/> Resep Baru</span>
          <button className="btn btn--ghost" onClick={() => setNewRxFormOpen(false)} style={{ padding: '4px 8px' }}>✕</button>
        </div>

        <div className="form-modal__body">
          {/* Patient */}
          <div className="form-group">
            <label>Pasien</label>
            <input
              className="form-input"
              type="text"
              placeholder="Cari pasien (nama / no. RM)..."
              value={patientSearch}
              onChange={e => setPatientSearch(e.target.value)}
            />
            {(patientSearch || !patientId) && (
              <div style={{ maxHeight: 120, overflowY: 'auto', marginTop: 4, background: 'var(--bg-primary)', borderRadius: 6, border: '1px solid var(--border)' }}>
                {filteredPatients.map(p => (
                  <div
                    key={p.id}
                    style={{ padding: '6px 10px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border-subtle)' }}
                    className={patientId === p.id ? 'search-result --focused' : 'search-result'}
                    onClick={() => { setPatientId(p.id); setPatientSearch(p.nama_lengkap.replace('[SYNTHETIC] ', '') + ' — ' + p.no_rekam_medis); }}
                  >
                    <div className="search-result__info">
                      <span className="search-result__name">{p.nama_lengkap.replace('[SYNTHETIC] ', '')}</span>
                      <span className="search-result__detail" style={{ marginLeft: 8 }}>{p.no_rekam_medis}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Doctor + Priority */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <CustomSelect
              label="Dokter"
              value={doctorId}
              onChange={setDoctorId}
              options={doctors.map(d => ({ value: d.id, label: d.nama_lengkap.replace('[SYNTHETIC] ', '') }))}
            />
            <CustomSelect
              label="Prioritas"
              value={priority}
              onChange={setPriority}
              options={[
                { value: 'RAWAT_JALAN', label: <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Rawat Jalan</span> },
                { value: 'RAWAT_INAP', label: <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Rawat Inap</span> },
                { value: 'CITO', label: <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> CITO (Urgent)</span> },
              ]}
            />
          </div>

          {/* Poli */}
          <div className="mb-4">
            <CustomSelect
              label="Asal Poli"
              value={poli}
              onChange={setPoli}
              options={['Poli Umum', 'Poli Gigi', 'Poli Anak', 'Poli Dalam', 'Poli Bedah', 'Poli Mata', 'Poli THT', 'Poli Kulit', 'Poli Saraf', 'Poli Jantung', 'IGD', 'Rawat Inap'].map(p => ({ value: p, label: p }))}
            />
          </div>

          {/* Catatan */}
          <div className="form-group">
            <label>Catatan Dokter (opsional)</label>
            <textarea className="form-textarea" value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Alergi, instruksi khusus..." />
          </div>

          {/* Drug search + add */}
          <div className="form-group">
            <label>Tambah Obat</label>
            <div className="drug-add-row">
              <div className="form-group" style={{ flex: 2 }}>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Cari obat..."
                  value={drugSearch}
                  onChange={e => setDrugSearch(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ flex: 0, minWidth: 70 }}>
                <input
                  className="form-input"
                  type="number"
                  min={1}
                  value={drugQty}
                  onFocus={e => { if (e.target.value === '0') setDrugQty(''); }}
                  onChange={e => {
                    const raw = e.target.value;
                    // Strip leading zeros: "09" → "9", allow empty for typing
                    if (raw === '') { setDrugQty(''); return; }
                    const cleaned = String(Number(raw));
                    setDrugQty(cleaned === 'NaN' ? '' : cleaned);
                  }}
                  onBlur={() => { if (!drugQty || Number(drugQty) < 1) setDrugQty('1'); }}
                  style={{ width: 70 }}
                />
              </div>
            </div>
            {drugResults.length > 0 && (
              <div style={{ maxHeight: 150, overflowY: 'auto', marginTop: 4, background: 'var(--bg-primary)', borderRadius: 6, border: '1px solid var(--border)' }}>
                {drugResults.map(d => {
                  const isOutOfStock = d.stok_saat_ini <= 0;
                  return (
                    <div
                      key={d.id}
                      className={`search-result ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !isOutOfStock && addDrug(d)}
                      style={{ padding: '6px 10px', fontSize: 13 }}
                    >
                      <div className="search-result__info">
                        <span className="search-result__name">{d.nama_dagang} {d.kekuatan_dosis}</span>
                        <span className="search-result__detail" style={{ marginLeft: 8 }}>
                          {isOutOfStock
                            ? <span style={{ color: 'var(--danger)', fontWeight: 600 }}>⊘ Stok Habis</span>
                            : `Stok: ${d.stok_saat_ini}`
                          }
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {items.length > 0 && (
              <div className="added-drugs-list">
                {items.map(item => (
                  <div key={item.drug_id} className="added-drug-chip">
                    <span className="added-drug-chip__name">{item.nama}</span>
                    <span className="added-drug-chip__qty">×{item.quantity_prescribed}</span>
                    <button 
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md px-1.5 py-0.5 transition-all duration-200 ease-fluid text-sm font-medium" 
                      onClick={() => removeDrug(item.drug_id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-modal__footer">
          <button className="btn btn--ghost" onClick={() => setNewRxFormOpen(false)}>Batal</button>
          <button 
            className="bg-primary text-white font-bold py-2.5 px-5 rounded-lg shadow-[0_2px_8px_rgba(15,118,110,0.25),inset_0_1px_0_rgba(255,255,255,0.15)] border border-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 ease-fluid disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            onClick={handleSubmit} 
            disabled={!patientId || !doctorId || items.length === 0 || submitting}
          >
            {submitting ? 'Mengirim...' : <span className="inline-flex items-center gap-2"><CheckIcon className="w-4 h-4 text-current"/> Submit Resep</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
