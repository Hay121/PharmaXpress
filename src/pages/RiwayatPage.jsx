import React, { useState } from 'react';
import { ArchiveBoxIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

export function RiwayatPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Safe, static dummy array. Never undefined.
  const riwayatData = [
    { id: 'RX-260830-101', patient: 'Budi Santoso', doctor: 'dr. Hendra', timestamp: '2026-08-30 08:15', status: 'Selesai', items: 2 },
    { id: 'RX-260830-102', patient: 'Sari Wulandari', doctor: 'dr. Dewi', timestamp: '2026-08-30 09:30', status: 'Selesai', items: 4 },
    { id: 'RX-260830-103', patient: 'Andi Setiawan', doctor: 'dr. Hendra', timestamp: '2026-08-30 10:45', status: 'Selesai', items: 1 },
    { id: 'RX-260830-104', patient: 'Dewi Lestari', doctor: 'dr. Budi', timestamp: '2026-08-30 11:20', status: 'Selesai', items: 3 },
  ];

  const filteredData = riwayatData.filter(d => 
    d.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.patient.toLowerCase().includes(searchTerm.toLowerCase())
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
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-150 align-middle">
                  <td className="py-4 px-6 text-sm font-mono font-medium text-slate-900 whitespace-nowrap align-middle">{item.id}</td>
                  <td className="py-4 px-6 text-sm font-bold text-slate-900 whitespace-nowrap align-middle">{item.patient}</td>
                  <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap align-middle">{item.doctor}</td>
                  <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap tabular-nums align-middle">{item.timestamp}</td>
                  <td className="py-4 px-6 text-sm font-semibold text-slate-800 text-right tabular-nums whitespace-nowrap align-middle">{item.items}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-center align-middle">
                    <span className="inline-flex items-center justify-center px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-sm text-slate-500">
                    Tidak ada riwayat yang ditemukan.
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
