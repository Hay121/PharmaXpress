import React, { useState } from 'react';
import { BarChart4, Download, FileText, Calendar, Filter, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { CustomSelect } from '../components/CustomSelect.jsx';
import { useStore } from '../store.js';

export function LaporanPage() {
  const [jenisLaporan, setJenisLaporan] = useState('Dispensing Harian');
  const [isGenerating, setIsGenerating] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const transactionHistory = useStore(s => s.transactions) || [];
  
  const filteredLaporan = transactionHistory.filter(t => {
    const isCorrectType = jenisLaporan === 'Stok Masuk' ? t.type === 'RESTOCK' : t.type === 'DISPENSE';
    if (!isCorrectType) return false;
    if (!startDate || !endDate) return true;
    
    const txDate = new Date(t.date).setHours(0,0,0,0);
    const start = new Date(startDate).setHours(0,0,0,0);
    const end = new Date(endDate).setHours(0,0,0,0);
    
    return txDate >= start && txDate <= end;
  });

  const exportToCSV = (filename, data) => {
    if (data.length === 0) {
      toast.error('Tidak ada data untuk diekspor!');
      return;
    }
    const processedData = data.map(l => {
      if (l.type === 'DISPENSE') {
        return {
          Tanggal: new Date(l.date).toLocaleDateString('id-ID'),
          'Nomor Resep': l.id,
          Pasien: l.patient,
          'Asal Poli': l.poli,
          Durasi: l.duration,
          Status: 'Selesai'
        };
      } else {
        return {
          Tanggal: new Date(l.date).toLocaleDateString('id-ID'),
          'Nomor Surat (SP)': l.id,
          'Asal Depo': l.source,
          'Item Diterima': l.items?.map(item => item.nama).join('; '),
          'Total Qty': l.items?.reduce((sum, item) => sum + item.qty, 0),
          Status: 'Selesai'
        };
      }
    });

    const headers = Object.keys(processedData[0]).join(',');
    const csv = [headers, ...processedData.map(row => Object.values(row).map(val => `"${val}"`).join(','))].join('\n');
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
              <CustomSelect 
                value={jenisLaporan}
                onChange={(val) => setJenisLaporan(val)}
                options={[
                  { value: 'Dispensing Harian', label: 'Laporan Dispensing Harian' },
                  { value: 'Stok Masuk', label: 'Laporan Stok Masuk (Restock)' }
                ]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rentang Tanggal</label>
            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="appearance-none [color-scheme:light] w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-4 py-2.5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 font-medium transition-all" 
                />
              </div>
              <span className="text-slate-400 font-medium">-</span>
              <div className="relative w-full">
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="appearance-none [color-scheme:light] w-full bg-white border border-slate-300 text-slate-800 rounded-xl px-4 py-2.5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 font-medium transition-all" 
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm h-[42px] whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : <><Download className="w-4 h-4 mr-2" /> Ekspor Data (CSV)</>}
          </button>
        </div>

        {/* Data Grid Preview */}
        <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm relative z-0">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm font-bold text-slate-700">Preview: {jenisLaporan}</span>
          </div>
          <table className="min-w-full table-auto divide-y divide-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Tanggal</th>
                  {jenisLaporan === 'Dispensing Harian' ? (
                    <>
                      <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Nomor Resep</th>
                      <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Pasien</th>
                      <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Asal Poli</th>
                      <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Durasi</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Nomor Surat (SP)</th>
                      <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Asal Depo</th>
                      <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Item Diterima</th>
                      <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total Qty</th>
                    </>
                  )}
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLaporan.map((l, i) => (
                  <tr key={l.id || i} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="py-3 px-6 text-sm text-slate-600 whitespace-nowrap">{new Date(l.date).toLocaleDateString('id-ID')}</td>
                    {jenisLaporan === 'Dispensing Harian' ? (
                      <>
                        <td className="py-3 px-6 text-sm font-mono font-medium text-slate-800 whitespace-nowrap">{l.id}</td>
                        <td className="py-3 px-6 text-sm font-bold text-slate-900 whitespace-nowrap">{l.patient}</td>
                        <td className="py-3 px-6 text-sm text-slate-600 whitespace-nowrap">{l.poli}</td>
                        <td className="py-3 px-6 text-sm font-semibold text-slate-700 text-right whitespace-nowrap">{l.duration}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-6 text-sm font-mono font-medium text-slate-800 whitespace-nowrap">{l.id}</td>
                        <td className="py-3 px-6 text-sm text-slate-600 whitespace-nowrap">{l.source}</td>
                        <td className="py-3 px-6 text-sm text-slate-600 max-w-[200px] truncate">{l.items?.map(item => item.nama).join(', ')}</td>
                        <td className="py-3 px-6 text-sm font-semibold text-slate-700 text-right whitespace-nowrap">
                          {l.items?.reduce((sum, item) => sum + item.qty, 0)}
                        </td>
                      </>
                    )}
                    <td className="py-3 px-6 text-center whitespace-nowrap">
                      <span className="inline-flex px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold">
                        Selesai
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
