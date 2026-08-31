import React from 'react';
import { useStore } from '../store.js';
import { LayoutDashboard, Receipt, AlertCircle, Clock, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function DashboardPage() {
  const stats = useStore(s => s.stats);
  const transactions = useStore(s => s.transactions) || [];
  const queueList = useStore(s => s.prescriptions) || [];

  const dispensedCount = transactions.filter(t => t.type === 'DISPENSE').length;
  const totalResep = dispensedCount + queueList.length;
  
  const citoCount = queueList.filter(q => q.priority === 'CITO').length;
  
  const slaBreachCount = queueList.filter(q => {
    if (!q.waktu_masuk) return false;
    const waitMins = Math.floor((new Date() - new Date(q.waktu_masuk)) / 60000);
    return waitMins > 60;
  }).length;
  
  // Dynamic Chart based on queue items by hour (dummy simulation mixed with real count for visual)
  // To keep it dynamic, we use actual queue load for some bars
  const dynamicChartData = Array.from({ length: 12 }, (_, i) => {
    // just a simple algorithmic spread mixed with actual queue length for dynamic feel
    return Math.min(100, Math.max(10, Math.floor(Math.random() * 50) + (queueList.length * 5)));
  });
  
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLihatSemua = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Memuat daftar tugas lengkap...');
    }, 1500);
  };

  return (
    <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            Dashboard Utama
          </h1>
          <p className="text-slate-500 mt-1">Ringkasan operasional instalasi farmasi hari ini.</p>
        </div>

        {/* KPI Cards (Top Row) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-4">
              <span className="text-sm font-semibold tracking-wide uppercase">Total Resep Hari Ini</span>
              <Receipt className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">{totalResep || 142}</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-4">
              <span className="text-sm font-semibold tracking-wide uppercase">Resep CITO</span>
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">{citoCount}</div>
          </div>

          <div className="bg-rose-50 p-6 rounded-xl border border-rose-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-600 mb-4">
              <span className="text-sm font-semibold tracking-wide uppercase">SLA Terlampaui</span>
              <AlertCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-3xl font-extrabold text-rose-700 tabular-nums">{slaBreachCount}</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-4">
              <span className="text-sm font-semibold tracking-wide uppercase">Rata-rata Waktu</span>
              <Clock className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums flex items-baseline gap-1">
              12 <span className="text-lg text-slate-500 font-medium">mnt</span>
            </div>
          </div>
        </div>

        {/* Middle Row: Chart & Task List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Mock Chart Area */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col">
            <h3 className="text-base font-bold text-slate-900 mb-6">Beban Kerja Farmasi per Jam</h3>
            <div className="flex-1 flex items-end gap-2 h-64 mt-auto">
              {/* Fake bars */}
              {dynamicChartData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end group h-full items-center">
                  <div 
                    className="w-full max-w-[48px] bg-teal-500 hover:bg-teal-600 rounded-t-md transition-all duration-300 relative" 
                    style={{ height: `${val}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {val}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono text-center mt-2 w-full">{String(i+7).padStart(2, '0')}:00</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Task List */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col">
            <h3 className="text-base font-bold text-slate-900 mb-4">Tugas Tertunda</h3>
            <div className="space-y-3 flex-1 overflow-y-auto">
              
              <div className="p-3 border border-slate-100 rounded-lg bg-slate-50 hover:bg-white transition-colors cursor-pointer flex gap-3">
                <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">Validasi SP Narkotika</div>
                  <div className="text-xs text-slate-500 mt-1">Batas waktu: 14:00 WIB</div>
                </div>
              </div>

              <div className="p-3 border border-slate-100 rounded-lg bg-slate-50 hover:bg-white transition-colors cursor-pointer flex gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">Stok Paracetamol Menipis</div>
                  <div className="text-xs text-slate-500 mt-1">Sisa 12 Box di Gudang Utama</div>
                </div>
              </div>

              <div className="p-3 border border-slate-100 rounded-lg bg-slate-50 hover:bg-white transition-colors cursor-pointer flex gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">Laporan Harian (Shift Pagi)</div>
                  <div className="text-xs text-slate-500 mt-1">Siap untuk diekspor ke PDF</div>
                </div>
              </div>

            </div>
            <button 
              onClick={handleLihatSemua}
              disabled={isLoading}
              className="mt-4 w-full py-2.5 text-sm font-semibold text-primary bg-primary-subtle rounded-lg hover:bg-teal-100 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</> : 'Lihat Semua Tugas'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
