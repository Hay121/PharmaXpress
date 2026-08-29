// ═══════════════════════════════════════════
// PharmaXpress — Main App
// ═══════════════════════════════════════════
import React, { useEffect, useCallback, useRef } from 'react';
import { useStore } from './store.js';
import { api } from './api.js';
import { LoginPage } from './components/LoginPage.jsx';
import { TopBar } from './components/TopBar.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { Workspace } from './components/Workspace.jsx';
import { BottomBar } from './components/BottomBar.jsx';
import { SearchModal } from './components/SearchModal.jsx';
import { NewRxForm } from './components/NewRxForm.jsx';
import { ConfirmDialog } from './components/ConfirmDialog.jsx';
import { Toaster } from 'sonner';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
export default function App() {
  const currentUser = useStore(s => s.currentUser);
  const searchOpen = useStore(s => s.searchOpen);
  const setSearchOpen = useStore(s => s.setSearchOpen);
  const newRxFormOpen = useStore(s => s.newRxFormOpen);
  const setNewRxFormOpen = useStore(s => s.setNewRxFormOpen);
  const confirmDialog = useStore(s => s.confirmDialog);
  const setPrescriptions = useStore(s => s.setPrescriptions);
  const setStats = useStore(s => s.setStats);
  const setInventory = useStore(s => s.setInventory);
  const addPrescription = useStore(s => s.addPrescription);
  const selectedRxId = useStore(s => s.selectedRxId);
  const setSelectedRxDetail = useStore(s => s.setSelectedRxDetail);

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
    api.getPrescription(selectedRxId).then(res => {
      setSelectedRxDetail(res.data);
    }).catch(console.error);
  }, [selectedRxId]);

  // Global keyboard shortcuts
  useEffect(() => {
    if (!currentUser) return;

    const handleKeyDown = (e) => {
      // Ctrl+K — Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      // Alt+N — New prescription
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setNewRxFormOpen(true);
      }
      // Escape — close modals
      if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false);
        else if (newRxFormOpen) setNewRxFormOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser, searchOpen, newRxFormOpen]);

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
            // Reload the queue
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
    <div className="app-layout">
      <TopBar />
      <div className="main-content">
        <Sidebar />
        <Workspace onRefresh={loadData} />
      </div>
      <BottomBar />

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
  );
}
