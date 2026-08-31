import React, { useState } from 'react';
import { ArchiveBoxIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon, FaceFrownIcon } from '@heroicons/react/24/outline';
import { useStore } from '../store.js';

export function RiwayatPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const transactions = useStore(s => s.transactions) || [];
  
  const riwayatDispense = transactions.filter(t => t.type === 'DISPENSE');
  
  const filteredData = riwayatDispense.filter(d => 
    d.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.patient?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-7xl w-full mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ArchiveBoxIcon className="w-6 h-6 text-primary" />
            Riwayat Penyerahan
          </h1>
          <p className="text-slate-500 mt-1">Daftar resep yang telah berhasil diproses dan diserahkan ke pasien.</p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nomor resep atau nama pasien..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <AdjustmentsHorizontalIcon className="w-5 h-5" /> Filter
          </button>
        </div>

        {/* Minimalist Data Grid */}
        <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Nomor Resep</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Pasien</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Dokter Perujuk</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Waktu Selesai</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Jumlah Item</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr 
                      onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
                      className="hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                    >
                      <td className="py-4 px-6 text-sm font-mono font-medium text-slate-800 whitespace-nowrap">{row.id}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-900 whitespace-nowrap">{row.patient}</td>
                      <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">{row.poli || '-'}</td>
                      <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">{new Date(row.date).toLocaleString('id-ID')}</td>
                      <td className="py-4 px-6 text-sm font-semibold text-slate-700 text-right whitespace-nowrap">{row.itemsCount || 1}</td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold shadow-sm">
                          Selesai
                        </span>
                      </td>
                    </tr>
                    {expandedId === row.id && (
                      <tr>
                        <td colSpan="6" className="p-4 bg-slate-50 border-b border-slate-200">
                          <div className="border border-slate-200 rounded bg-white p-4">
                            <h4 className="font-semibold text-sm mb-2">Rincian Item:</h4>
                            <ul className="space-y-2 mt-2">
                              {row.items?.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0"></span>
                                  <div>
                                    <span className="font-semibold">{item.nama}</span> 
                                    <span className="text-slate-500"> — {item.dosis || 'Sesuai resep'} ({item.qty} {item.satuan || 'Item'})</span>
                                    {item.catatan && <p className="text-xs text-amber-600 mt-0.5">Catatan: {item.catatan}</p>}
                                  </div>
                                </li>
                              ))} 
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <FaceFrownIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <div className="text-slate-500 font-medium">Belum ada resep yang diserahkan hari ini.</div>
                    </td>
                  </tr>
                )}
              </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
