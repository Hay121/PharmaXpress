import React, { useState } from 'react';
import { FileText, Search, Send, Clock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function SuratPermintaanPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draft, setDraft] = useState([]);
  
  const dummyItems = [
    { id: 'OBT-001', nama: 'Paracetamol 500mg', satuan: 'Tablet', stok: 12 },
    { id: 'OBT-002', nama: 'Amoxicillin 500mg', satuan: 'Kapsul', stok: 450 },
    { id: 'OBT-003', nama: 'Omeprazole 20mg', satuan: 'Kapsul', stok: 0 },
    { id: 'OBT-004', nama: 'Cefadroxil 500mg', satuan: 'Kapsul', stok: 120 },
    { id: 'OBT-005', nama: 'Ibuprofen 400mg', satuan: 'Tablet', stok: 85 },
  ];

  const addToDraft = (item) => {
    if (!draft.find(d => d.id === item.id)) {
      setDraft(prev => [...prev, { ...item, qty: 100 }]);
    }
  };

  const removeFromDraft = (id) => {
    setDraft(prev => prev.filter(d => d.id !== id));
  };

  const updateQty = (id, val) => {
    setDraft(prev => prev.map(d => d.id === id ? { ...d, qty: val } : d));
  };

  const handleKirim = () => {
    if (draft.length === 0) {
      toast.error('Draft masih kosong!');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setDraft([]);
      toast.success('Surat Permintaan (SP) berhasil dikirim ke Gudang Utama');
    }, 1500);
  };

  return (
    <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Surat Permintaan (SP)
          </h1>
          <p className="text-slate-500 mt-1">Formulir permintaan perbekalan farmasi ke Gudang Utama.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Column: Search & Select */}
          <div className="w-full lg:w-1/2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800 mb-3">Pilih Item</h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari nama obat atau kode..." 
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {dummyItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-colors group cursor-pointer">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{item.nama}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Stok Depo: {item.stok} {item.satuan}</div>
                  </div>
                  <button 
                    onClick={() => addToDraft(item)}
                    className="p-1.5 rounded bg-slate-100 text-slate-500 hover:bg-primary hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: SP Details */}
          <div className="w-full lg:w-1/2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Draft SP</h3>
              <div className="text-xs font-mono text-slate-500 bg-slate-200 px-2 py-1 rounded">SP-260830-001</div>
            </div>

            <div className="p-4 border-b border-slate-100 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Depo Tujuan</label>
                <select className="appearance-none w-full bg-white border border-slate-300 rounded-md py-2 pl-3 pr-10 shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm font-medium">
                  <option>Gudang Farmasi Utama</option>
                  <option>Gudang Logistik Non-Medis</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {draft.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <FileText className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm font-medium">Belum ada item dipilih</p>
                </div>
              ) : (
                draft.map(d => (
                  <div key={d.id} className="flex items-start justify-between gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900">{d.nama}</div>
                      <div className="text-xs text-slate-500 mt-1">Stok depo: {d.stok} {d.satuan}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={d.qty}
                        onChange={(e) => updateQty(d.id, parseInt(e.target.value) || 0)}
                        className="w-20 p-1.5 border border-slate-300 rounded text-sm text-center tabular-nums outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                      />
                      <span className="text-sm text-slate-500">{d.satuan}</span>
                      <button 
                        onClick={() => removeFromDraft(d.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <button 
                onClick={handleKirim}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-teal-700 text-white rounded-lg font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Kirim Permintaan
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
