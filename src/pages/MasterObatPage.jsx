import React, { useState } from 'react';
import { Box, Search, Plus, Download, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../store.js';

export function MasterObatPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeAction, setActiveAction] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [searchObat, setSearchObat] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const drugDatabase = useStore(s => s.drugDatabase);
  const addDrug = useStore(s => s.addDrug);

  const [newDrug, setNewDrug] = useState({
    nama_dagang: '',
    kategori: 'Antibiotik',
    stok_saat_ini: 0,
    satuan: 'Tablet',
    harga_satuan: 0
  });
  
  const filteredObat = drugDatabase.filter(o => 
    (o.nama_dagang.toLowerCase().includes(searchObat.toLowerCase()) || o.kode_obat?.toLowerCase().includes(searchObat.toLowerCase())) &&
    (filterCategory ? o.kategori === filterCategory : true)
  );

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
            <div className="relative w-72">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari obat atau kode..." 
                value={searchObat}
                onChange={(e) => setSearchObat(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
                {filteredObat.map((drug) => (
                <tr key={drug.id} className="hover:bg-slate-50">
                  <td className="p-4 align-middle whitespace-nowrap">
                    <span className="font-mono text-sm text-slate-500">{drug.kode_obat}</span>
                  </td>
                  <td className="p-4 align-middle whitespace-nowrap">
                    <span className="font-semibold text-slate-800">{drug.nama_dagang}</span>
                  </td>
                  <td className="p-4 align-middle whitespace-nowrap text-sm text-slate-600">{drug.kategori}</td>
                  <td className="p-4 align-middle whitespace-nowrap text-right font-mono font-medium">{drug.stok_saat_ini} {drug.satuan}</td>
                  <td className="p-4 align-middle whitespace-nowrap text-right font-mono text-slate-600">Rp {drug.harga_satuan.toLocaleString('id-ID')}</td>
                  <td className="p-4 align-middle whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                      drug.stok_saat_ini === 0 ? 'bg-rose-100 text-rose-700' : 
                      drug.stok_saat_ini < 20 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {drug.stok_saat_ini === 0 ? 'Habis' : drug.stok_saat_ini < 20 ? 'Menipis' : 'Aman'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredObat.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    Tidak ada obat yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
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
                  <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Masukkan nama..." 
                    value={newDrug.nama_dagang} onChange={e => setNewDrug({...newDrug, nama_dagang: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                    value={newDrug.kategori} onChange={e => setNewDrug({...newDrug, kategori: e.target.value})}>
                    <option>Antibiotik</option>
                    <option>Analgesik</option>
                    <option>Antasida</option>
                    <option>Antihipertensi</option>
                    <option>Vitamin</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Stok Awal</label>
                    <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                      value={newDrug.stok_saat_ini} onChange={e => setNewDrug({...newDrug, stok_saat_ini: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Harga Satuan</label>
                    <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" 
                      value={newDrug.harga_satuan} onChange={e => setNewDrug({...newDrug, harga_satuan: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Satuan</label>
                    <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Box/Tablet" 
                      value={newDrug.satuan} onChange={e => setNewDrug({...newDrug, satuan: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors">Batal</button>
                <button onClick={() => {
                  if (!newDrug.nama_dagang) {
                    toast.error('Nama obat wajib diisi');
                    return;
                  }
                  addDrug({
                    ...newDrug,
                    id: 'OBT-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                    kode_obat: 'NEW-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
                    tanggal_kadaluarsa: '2027-12-31'
                  });
                  setShowAddModal(false);
                  toast.success('Obat berhasil ditambahkan ke Gudang Utama!');
                  setNewDrug({ nama_dagang: '', kategori: 'Antibiotik', stok_saat_ini: 0, satuan: 'Tablet', harga_satuan: 0 });
                }} className="px-4 py-2 font-semibold text-white bg-primary hover:bg-teal-700 rounded-lg shadow-sm transition-colors">Simpan Obat</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
