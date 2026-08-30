import React, { useState } from 'react';
import { Box, Search, Plus, Download, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function MasterObatPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeAction, setActiveAction] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const dummyDrugs = [
    { id: 'OBT-0001', nama: 'Amoxicillin Trihydrate 500mg', kategori: 'Antibiotik', stok: 450, satuan: 'Kapsul', harga: 850, status: 'Aman' },
    { id: 'OBT-0002', nama: 'Paracetamol 500mg', kategori: 'Analgesik', stok: 12, satuan: 'Tablet', harga: 250, status: 'Menipis' },
    { id: 'OBT-0003', nama: 'Omeprazole 20mg', kategori: 'Antasida', stok: 0, satuan: 'Kapsul', harga: 1200, status: 'Kosong' },
    { id: 'OBT-0004', nama: 'Amlodipine Besylate 5mg', kategori: 'Antihipertensi', stok: 820, satuan: 'Tablet', harga: 400, status: 'Aman' },
    { id: 'OBT-0005', nama: 'Metformin HCl 500mg', kategori: 'Antidiabetes', stok: 310, satuan: 'Tablet', harga: 300, status: 'Aman' },
    { id: 'OBT-0006', nama: 'Simvastatin 10mg', kategori: 'Antikolesterol', stok: 55, satuan: 'Tablet', harga: 600, status: 'Menipis' },
  ];

  const exportToCSV = (filename, data) => {
    const csv = data.map(row => Object.values(row).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    toast.success('Berhasil diunduh!');
  };

  const handleAction = (action, msg) => {
    setActiveAction(action);
    setTimeout(() => {
      setActiveAction(null);
      if (action === 'ekspor') {
        exportToCSV('master-obat.csv', dummyDrugs);
      } else if (action === 'tambah') {
        setShowAddModal(true);
      } else {
        toast.success(msg);
      }
    }, 500);
  };


  return (
    <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Top Action Bar */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Box className="w-6 h-6 text-primary" />
              Master Inventori Obat
            </h1>
            <p className="text-slate-500 mt-1">Kelola data dasar obat, kategori, dan harga.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Cari nama atau kode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none min-w-[240px]"
              />
            </div>
            <button 
              onClick={() => handleAction('filter', 'Filter diterapkan')}
              disabled={activeAction !== null}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {activeAction === 'filter' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
              {activeAction === 'filter' ? 'Memproses...' : 'Filter'}
            </button>
            <button 
              onClick={() => handleAction('ekspor', 'Data inventori berhasil diekspor')}
              disabled={activeAction !== null}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {activeAction === 'ekspor' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {activeAction === 'ekspor' ? 'Memproses...' : 'Ekspor'}
            </button>
            <button 
              onClick={() => handleAction('tambah', 'Formulir tambah obat siap (Mock)')}
              disabled={activeAction !== null}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {activeAction === 'tambah' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {activeAction === 'tambah' ? 'Memproses...' : 'Tambah Obat'}
            </button>
          </div>
        </div>

        {/* Pixel-Perfect Table */}
        <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full table-auto divide-y divide-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Kode</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Nama Obat / Generik</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Kategori</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Stok Fisik</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Harga Beli</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dummyDrugs.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="py-4 px-6 text-sm font-mono text-slate-500 whitespace-nowrap">{d.id}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{d.nama}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">{d.kategori}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-slate-800 text-right tabular-nums whitespace-nowrap">{d.stok} {d.satuan}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-600 text-right tabular-nums whitespace-nowrap">Rp {d.harga.toLocaleString('id-ID')}</td>
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      {d.status === 'Aman' && <span className="inline-flex px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold">Aman</span>}
                      {d.status === 'Menipis' && <span className="inline-flex px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-bold">Menipis</span>}
                      {d.status === 'Kosong' && <span className="inline-flex px-2 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-xs font-bold">Kosong</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>

        {/* Tambah Obat Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Tambah Obat Baru</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Obat</label>
                  <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Masukkan nama..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white">
                    <option>Antibiotik</option>
                    <option>Analgesik</option>
                    <option>Vitamin</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Stok Awal</label>
                    <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" defaultValue={0} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Satuan</label>
                    <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Box/Tablet" />
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors">Batal</button>
                <button onClick={() => { setShowAddModal(false); toast.success('Obat berhasil ditambahkan (Mock)'); }} className="px-4 py-2 font-semibold text-white bg-primary hover:bg-teal-700 rounded-lg shadow-sm transition-colors">Simpan Obat</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
