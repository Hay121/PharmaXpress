// ═══════════════════════════════════════════
// PharmaXpress — API Client
// ═══════════════════════════════════════════

const BASE = import.meta.env.VITE_API_URL || '/api/v1';

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 
      'Content-Type': 'application/json',
      'X-Pinggy-No-Screen': 'true',
      'ngrok-skip-browser-warning': 'true',
      ...options.headers 
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

export const api = {
  // Prescriptions
  getPrescriptions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/prescriptions${qs ? `?${qs}` : ''}`);
  },
  getPrescription: (id) => request(`/prescriptions/${id}`),
  createPrescription: (body) => request('/prescriptions', { method: 'POST', body: JSON.stringify(body) }),
  startPrescription: (id, pharmacistId) => request(`/prescriptions/${id}/start`, { method: 'POST', body: JSON.stringify({ pharmacist_id: pharmacistId }) }),
  dispensePrescription: (id, body) => request(`/prescriptions/${id}/dispense`, { method: 'POST', body: JSON.stringify(body) }),
  returnPrescription: (id, catatan) => request(`/prescriptions/${id}/return`, { method: 'POST', body: JSON.stringify({ catatan }) }),

  // Inventory
  getInventory: () => request('/inventory'),
  searchInventory: (q) => request(`/inventory/search?q=${encodeURIComponent(q)}`),

  // Stats
  getStats: () => request('/stats'),

  // Users
  getUsers: (role) => request(`/users${role ? `?role=${role}` : ''}`),

  // Patients
  getPatients: (q = '') => request(`/patients?q=${encodeURIComponent(q)}&limit=30`),
};
