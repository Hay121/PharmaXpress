// ═══════════════════════════════════════════
// PharmaXpress — Main App Shell
// ═══════════════════════════════════════════
import React, { useEffect, useCallback, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store.js';
import { api } from './api.js';
import { LoginPage } from './components/LoginPage.jsx';
import { TopBar } from './components/TopBar.jsx';
import { Sidebar } from './components/Sidebar.jsx'; // This is the Queue Sidebar
import { Workspace } from './components/Workspace.jsx';
import { BottomBar } from './components/BottomBar.jsx';
import { SearchModal } from './components/SearchModal.jsx';
import { NewRxForm } from './components/NewRxForm.jsx';
import { ConfirmDialog } from './components/ConfirmDialog.jsx';
import { Toaster } from 'sonner';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useLiveSimulation } from './hooks/useLiveSimulation.js';

// New MPA Components
import { AppSidebar } from './components/AppSidebar.jsx';
import { AuditEdPage } from './pages/AuditEdPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { MasterObatPage } from './pages/MasterObatPage.jsx';
import { LaporanPage } from './pages/LaporanPage.jsx';
import { SuratPermintaanPage } from './pages/SuratPermintaanPage.jsx';
import { PengaturanPage } from './pages/PengaturanPage.jsx';
import { RiwayatPage } from './pages/RiwayatPage.jsx';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { ListTodo } from 'lucide-react';

export default function App() {
  const currentUser = useStore(s => s.currentUser);
  const searchOpen = useStore(s => s.searchOpen);
  const setSubPanelItemId = useStore(s => s.setSubPanelItemId);
  const [queueSearchTerm, setQueueSearchTerm] = useState('');
  const newRxFormOpen = useStore(s => s.newRxFormOpen);
  const setNewRxFormOpen = useStore(s => s.setNewRxFormOpen);
  const confirmDialog = useStore(s => s.confirmDialog);
  const setPrescriptions = useStore(s => s.setPrescriptions);
  const setStats = useStore(s => s.setStats);
  const setInventory = useStore(s => s.setInventory);
  const addPrescription = useStore(s => s.addPrescription);
  const selectedRxId = useStore(s => s.selectedRxId);
  const setSelectedRxDetail = useStore(s => s.setSelectedRxDetail);

  // Initialize Live Simulation Engine
  useLiveSimulation();

  // Load initial data after login
  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser]);

  const loadData = useCallback(async () => {
    try {
      const [rxRes, statsRes, invRes] = await Promise.all([
        api.getPrescriptions({ status: 'ACTIVE', limit: 50 }),
        api.getStats(),
        api.getInventory(),
      ]);
      setPrescriptions(rxRes.data);
      setStats(statsRes.data);
      setInventory(invRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, []);

  // Load selected prescription detail
  useEffect(() => {
    if (!selectedRxId) {
      setSelectedRxDetail(null);
      return;
    }
    
    // Bypassing API for LIVE SIMULATED prescriptions
    const localRx = useStore.getState().prescriptions.find(p => p.id === selectedRxId);
    if (localRx && localRx.is_simulated) {
      setSelectedRxDetail(localRx);
      return;
    }

    api.getPrescription(selectedRxId).then(res => {
      setSelectedRxDetail(res.data);
    }).catch(console.error);
  }, [selectedRxId]);

  // Global keyboard shortcuts
  useEffect(() => {
    if (!currentUser) return;

    const handleKeyDown = (e) => {
      // Ctrl+K — Search (Disabled global modal, focus input locally if needed)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('queue-search-input')?.focus();
      }
      // Alt+N — New prescription
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setNewRxFormOpen(true);
      }
      // Escape — close modals (priority chain)
      if (e.key === 'Escape') {
        if (confirmDialog) {
          e.preventDefault();
          useStore.getState().setConfirmDialog(null);
        } else if (searchOpen) {
          e.preventDefault();
          setSearchOpen(false);
        } else if (newRxFormOpen) {
          e.preventDefault();
          setNewRxFormOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser, searchOpen, newRxFormOpen, confirmDialog]);

  // WebSocket for real-time updates
  useEffect(() => {
    if (!currentUser) return;
    let ws;
    let reconnectTimer;

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === 'prescription:new') {
            loadData();
          } else if (msg.event === 'prescription:dispensed' || msg.event === 'prescription:returned') {
            loadData();
          } else if (msg.event === 'stock:updated') {
            api.getInventory().then(res => setInventory(res.data)).catch(() => {});
          }
        } catch { }
      };

      ws.onclose = () => {
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    }

    connect();
    return () => {
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [currentUser]);

  // Periodic refresh
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen w-full bg-white overflow-hidden">
        
        {/* MILESTONE 1: The Enterprise App Shell (Left Sidebar) */}
        <AppSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          <TopBar />
          
          {/* Main Routing Area */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            <Routes>
              {/* Default Redirect to Antrean */}
              <Route path="/" element={<Navigate to="/antrean" replace />} />
              
              {/* MILESTONE 2: The Core Routing Preservation */}
              <Route path="/antrean" element={
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="h-16 w-full bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <ListTodo className="w-6 h-6 text-teal-600" />
                      <h1 className="text-xl font-bold text-slate-800 capitalize">Antrean Resep</h1>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-[400px] relative">
                        <MagnifyingGlassIcon className="w-4 h-4 shrink-0 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          id="queue-search-input"
                          type="text" 
                          value={queueSearchTerm}
                          onChange={(e) => setQueueSearchTerm(e.target.value)}
                          placeholder="Cari antrean (nama pasien, no resep)..." 
                          className="appearance-none w-full bg-white border border-slate-300 text-slate-800 rounded-xl pl-10 pr-4 py-2.5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 font-medium transition-all"
                        />
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-[11px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-400 shrink-0 pointer-events-none">Ctrl+K</kbd>
                      </div>
                      <div>
                        {currentUser?.role === 'DOKTER' ? (
                          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-sm font-semibold shadow-sm transition-colors h-[42px]" onClick={() => setNewRxFormOpen(true)}>
                            <PlusIcon className="w-4 h-4 shrink-0" />
                            Resep Baru <span className="bg-white/20 px-1 rounded text-[10px] ml-1">Alt+N</span>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex min-h-0 overflow-hidden">
                    <div className="w-[340px] flex-shrink-0 border-r border-slate-100 bg-white overflow-y-auto">
                      <Sidebar queueSearchTerm={queueSearchTerm} />
                    </div>
                    <div className="flex-1 bg-white overflow-y-auto p-6">
                      <Workspace onRefresh={loadData} />
                    </div>
                  </div>
                </div>
              } />

              {/* MILESTONE 3: The Counter-Attack Module */}
              <Route path="/audit-ed" element={<AuditEdPage />} />

              {/* MILESTONE 4: Premium WIP States (Now Fully Functional) */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/riwayat" element={<RiwayatPage />} />
              <Route path="/master-obat" element={<MasterObatPage />} />
              <Route path="/surat-permintaan" element={<SuratPermintaanPage />} />
              <Route path="/laporan" element={<LaporanPage />} />
              <Route path="/pengaturan" element={<PengaturanPage />} />
              
            </Routes>
          </main>
          
        </div>

        {/* Global Overlays & Modals */}
        {searchOpen && <SearchModal />}
        {newRxFormOpen && <NewRxForm onCreated={loadData} />}
        {confirmDialog && <ConfirmDialog />}
        <Toaster 
          position="bottom-right" 
          offset={40}
          toastOptions={{
            className: '!bg-white !border !border-slate-200 !shadow-[0_12px_40px_-10px_rgba(0,0,0,0.12)] !rounded-xl !p-4 !items-start',
            classNames: {
              title: '!text-sm !font-semibold !text-slate-900',
              description: '!text-sm !text-slate-500 !font-medium',
              icon: '!mt-0.5',
              content: '!flex-1 !gap-0.5'
            }
          }}
          icons={{
            success: <CheckCircleIcon className="w-5 h-5 text-emerald-500" />,
            error: <XCircleIcon className="w-5 h-5 text-red-500" />,
          }}
        />
      </div>
    </BrowserRouter>
  );
}
