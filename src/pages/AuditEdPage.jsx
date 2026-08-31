import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, ShieldAlert, Search, AlertTriangle } from 'lucide-react';
import { GLOBAL_DRUG_DATABASE } from '../data/mockDatabase.js';

export function AuditEdPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Sort to show closest ED first for drama
    const sorted = [...GLOBAL_DRUG_DATABASE].sort((a, b) => {
      return new Date(a.tanggal_kadaluarsa) - new Date(b.tanggal_kadaluarsa);
    });
    setInventory(sorted);
    setLoading(false);
  }, []);

  const filteredInventory = inventory.filter(d => 
    d.nama_dagang.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.kode_obat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEdStatus = (dateStr) => {
    if (!dateStr) return { label: 'Karantina / Kosong', color: 'red', icon: ShieldAlert };
    
    const edDate = new Date(dateStr);
    const today = new Date();
    const diffTime = edDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Karantina (Kedaluwarsa)', color: 'red', icon: ShieldAlert };
    if (diffDays < 90) return { label: 'Mendekati ED', color: 'amber', icon: AlertCircle };
    return { label: 'Aman', color: 'emerald', icon: ShieldCheck };
  };

  return (
    <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-primary" />
              Audit Kedaluwarsa
            </h1>
            <p className="text-slate-500 mt-1">Pemantauan keamanan inventori klinis real-time.</p>
          </div>
          
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari obat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none min-w-[280px]"
            />
          </div>
        </div>

        {/* Data Grid */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kode Obat</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Obat</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Batch</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Stok Sisa</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal ED</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">Memuat data...</td>
                  </tr>
                ) : (
                  filteredInventory.map((item, idx) => {
                    const status = getEdStatus(item.tanggal_kadaluarsa);
                    
                    // Conditional row highlights
                    let rowClass = "hover:bg-slate-50 transition-colors duration-150";
                    if (status.color === 'red') rowClass = "bg-rose-50/50 hover:bg-rose-50";
                    else if (status.color === 'amber') rowClass = "bg-amber-50/30 hover:bg-amber-50/50";

                    return (
                      <tr key={item.id} className={rowClass}>
                        <td className="py-4 px-6 text-sm font-mono text-slate-500">{item.kode_obat}</td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-bold text-slate-900">{item.nama_dagang}</div>
                          <div className="text-xs text-slate-500">{item.bentuk_sediaan} {item.kekuatan_dosis}</div>
                        </td>
                        <td className="py-4 px-6 text-sm font-mono text-slate-500">BTH-{item.kode_obat.split('-')[1]}-{String(idx+1).padStart(3, '0')}</td>
                        <td className="py-4 px-6 text-sm font-semibold tabular-nums text-right text-slate-700">{item.stok_saat_ini} {item.satuan}</td>
                        <td className="py-4 px-6 text-sm tabular-nums font-medium text-slate-700">
                          {item.tanggal_kadaluarsa ? new Date(item.tanggal_kadaluarsa).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'}) : '-'}
                        </td>
                        <td className="py-4 px-6">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border
                            ${status.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                            ${status.color === 'amber' ? 'bg-amber-100 text-amber-800 border-amber-300' : ''}
                            ${status.color === 'red' ? 'bg-rose-100 text-rose-800 border-rose-300' : ''}
                          `}>
                            <status.icon className="w-3.5 h-3.5 shrink-0" />
                            {status.label}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
