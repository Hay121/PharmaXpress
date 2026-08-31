import React, { useState } from 'react';
import { BarChart4, Download, FileText, Calendar, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../store.js';

export function LaporanPage() {
  const [jenisLaporan, setJenisLaporan] = useState('Laporan Dispensing Harian');
  const [isGenerating, setIsGenerating] = useState(false);

  const transactionHistory = useStore(s => s.transactionHistory);
  
  const filteredLaporan = transactionHistory.filter(t => t.type === jenisLaporan);

  const exportToCSV = (filename, data) => {
    if (data.length === 0) {
      toast.error('Tidak ada data untuk diekspor!');
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const csv = [headers, ...data.map(row => Object.values(row).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    toast.success('Laporan berhasil diekspor sebagai CSV!');
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      exportToCSV(`laporan-${jenisLaporan.replace(/ /g, '-').toLowerCase()}.csv`, filteredLaporan);
    }, 1500);
  };

  return (
    <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart4 className="w-6 h-6 text-primary" />
            Laporan Kinerja & Rekapitulasi
          </h1>
          <p className="text-slate-500 mt-1">Ekspor laporan operasional instalasi farmasi untuk audit manajemen.</p>
        </div>

        {/* Engine Controls */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jenis Laporan</label>
            <div className="relative z-50">
              <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={jenisLaporan}
                onChange={(e) => setJenisLaporan(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none font-medium cursor-pointer"
              >
                <option value="Dispensing Harian">Laporan Dispensing Harian</option>
                <option value="Stok Masuk">Laporan Stok Masuk (Restock)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rentang Tanggal</label>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="date" defaultValue="2026-08-30" className="pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
              </div>
              <span className="text-slate-400">-</span>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="date" defaultValue="2026-08-30" className="pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
              </div>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm h-[42px] whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : <><Download className="w-4 h-4" /> Generate & Export PDF</>}
          </button>
        </div>

        {/* Data Grid Preview */}
        <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm relative z-0">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm font-bold text-slate-700">Preview: {jenisLaporan}</span>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-teal-700">
              <Filter className="w-3.5 h-3.5" /> Opsi Tabel
            </button>
          </div>
          <table className="min-w-full table-auto divide-y divide-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Tanggal</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Nomor Resep</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Pasien</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Asal Poli</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Durasi Dispensing</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLaporan.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="py-3 px-6 text-sm text-slate-600 whitespace-nowrap">{l.tanggal}</td>
                    <td className="py-3 px-6 text-sm font-mono font-medium text-slate-800 whitespace-nowrap">{l.nomor}</td>
                    <td className="py-3 px-6 text-sm font-bold text-slate-900 whitespace-nowrap">{l.pasien}</td>
                    <td className="py-3 px-6 text-sm text-slate-600 whitespace-nowrap">{l.poli}</td>
                    <td className="py-3 px-6 text-sm font-semibold text-slate-700 text-right whitespace-nowrap">{l.waktu}</td>
                    <td className="py-3 px-6 text-center whitespace-nowrap">
                      <span className="inline-flex px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold">
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLaporan.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500 font-medium">
                      Tidak ada data laporan untuk kriteria ini.
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
