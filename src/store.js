// ═══════════════════════════════════════════
// PharmaXpress — Zustand Store
// ═══════════════════════════════════════════
import { create } from 'zustand';
import { GLOBAL_DRUG_DATABASE } from './data/mockDatabase.js';

export const useStore = create((set, get) => ({
  // Auth — restored from sessionStorage on init
  currentUser: (() => {
    try {
      const saved = sessionStorage.getItem('pharmaxpress_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  })(),
  setCurrentUser: (user) => {
    if (user) {
      sessionStorage.setItem('pharmaxpress_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('pharmaxpress_user');
    }
    set({ currentUser: user });
  },

  // Prescriptions queue
  prescriptions: [],
  setPrescriptions: (prescriptions) => set({ prescriptions }),
  updatePrescription: (id, updates) => set((s) => ({
    prescriptions: s.prescriptions.map(p => p.id === id ? { ...p, ...updates } : p),
  })),
  removePrescription: (id) => set((s) => ({
    prescriptions: s.prescriptions.filter(p => p.id !== id),
    selectedRxId: s.selectedRxId === id ? null : s.selectedRxId,
  })),
  addPrescription: (rx) => set((s) => ({
    prescriptions: [rx, ...s.prescriptions],
  })),

  // Selected prescription
  selectedRxId: null,
  setSelectedRxId: (id) => set({ selectedRxId: id }),

  // Selected prescription detail (full data with items)
  selectedRxDetail: null,
  setSelectedRxDetail: (detail) => set({ selectedRxDetail: detail }),

  // Inventory (for client-side fuzzy search)
  inventory: [],
  setInventory: (inventory) => set({ inventory }),

  // Stats
  stats: { pending: 0, in_progress: 0, dispensed_today: 0, avg_duration: 0 },
  setStats: (stats) => set({ stats }),

  // UI state
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),

  newRxFormOpen: false,
  setNewRxFormOpen: (open) => set({ newRxFormOpen: open }),

  confirmDialog: null, // { title, message, onConfirm }
  setConfirmDialog: (dialog) => set({ confirmDialog: dialog }),

  // ═══════════════════════════════════════════
  // THE GLOBAL BRAIN (MVP MOCK DB)
  // ═══════════════════════════════════════════
  
  drugDatabase: GLOBAL_DRUG_DATABASE,
  
  transactionHistory: [
    { id: 1, tanggal: '2026-08-30', nomor: 'RX-20260830-1045', pasien: 'Budi Santoso', poli: 'IGD', waktu: '12 menit', status: 'Selesai', type: 'Dispensing Harian' },
    { id: 2, tanggal: '2026-08-30', nomor: 'RX-20260830-1046', pasien: 'Sari Wulandari', poli: 'Rawat Jalan', waktu: '8 menit', status: 'Selesai', type: 'Dispensing Harian' },
    { id: 3, tanggal: '2026-08-30', nomor: 'RX-20260830-1047', pasien: 'Andi Setiawan', poli: 'Rawat Inap', waktu: '24 menit', status: 'Selesai', type: 'Dispensing Harian' },
    { id: 4, tanggal: '2026-08-30', nomor: 'RX-20260830-1048', pasien: 'Dewi Lestari', poli: 'Rawat Jalan', waktu: '15 menit', status: 'Selesai', type: 'Dispensing Harian' },
  ],

  addDrug: (newDrug) => set((s) => ({
    drugDatabase: [newDrug, ...s.drugDatabase]
  })),

  restockDrugs: (cartItems) => set((s) => {
    const updatedDb = [...s.drugDatabase];
    const newTransactions = [];
    
    cartItems.forEach(cartItem => {
      const idx = updatedDb.findIndex(d => d.id === cartItem.id);
      if (idx !== -1) {
        updatedDb[idx] = {
          ...updatedDb[idx],
          stok_saat_ini: updatedDb[idx].stok_saat_ini + (parseInt(cartItem.qty) || 0)
        };
        newTransactions.push({
          id: Date.now() + Math.random(),
          tanggal: new Date().toISOString().split('T')[0],
          nomor: `RESTOCK-${cartItem.id}`,
          pasien: 'Gudang Pusat',
          poli: '-',
          waktu: '-',
          status: `+${cartItem.qty} ${cartItem.satuan}`,
          type: 'Stok Masuk'
        });
      }
    });

    return { 
      drugDatabase: updatedDb,
      transactionHistory: [...newTransactions, ...s.transactionHistory]
    };
  }),

  successAnimation: null, // { nomor_resep, durasi }
  setSuccessAnimation: (anim) => set({ successAnimation: anim }),

  // Focused drug row in dispense table
  focusedItemIdx: 0,
  setFocusedItemIdx: (idx) => set({ focusedItemIdx: idx }),

  // Substitution panel open for which item
  subPanelItemId: null,
  setSubPanelItemId: (id) => set({ subPanelItemId: id }),

  // Substitutions made (track original -> substitute mapping)
  substitutions: {}, // { [prescription_item_id]: { substitute_drug_id, nama_obat, ... } }
  addSubstitution: (itemId, sub) => set((s) => ({
    substitutions: { ...s.substitutions, [itemId]: sub },
  })),
  clearSubstitutions: () => set({ substitutions: {} }),
}));
