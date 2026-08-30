// ═══════════════════════════════════════════
// PharmaXpress — Zustand Store
// ═══════════════════════════════════════════
import { create } from 'zustand';

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
