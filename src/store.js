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
  
  transactions: [
    { id: 'RX-123', type: 'DISPENSE', date: new Date().toISOString(), patient: 'Ira', poli: 'IGD', itemsCount: 2, duration: '12m' },
    { id: 'SP-999', type: 'RESTOCK', date: new Date().toISOString(), source: 'Gudang Pusat', items: [{nama: 'Amoxicillin', qty: 50}] }
  ],

  addTransaction: (transaction) => set((s) => ({
    transactions: [transaction, ...s.transactions]
  })),

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
          id: `SP-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          type: 'RESTOCK',
          date: new Date().toISOString(),
          source: 'Gudang Pusat',
          items: [{ nama: cartItem.nama_dagang || cartItem.nama, qty: parseInt(cartItem.qty) || 0 }]
        });
      }
    });

    return { 
      drugDatabase: updatedDb,
      transactions: [...newTransactions, ...s.transactions]
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
