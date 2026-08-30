import { useEffect } from 'react';
import { useStore } from '../store.js';
import { toast } from 'sonner';

// SIMULATION CONFIGURATION
const SIMULATION_ENABLED = true;
const MIN_INTERVAL_MS = 20000; // 20 seconds
const MAX_INTERVAL_MS = 45000; // 45 seconds

export function useLiveSimulation() {
  const addPrescription = useStore(s => s.addPrescription);
  const inventory = useStore(s => s.inventory);
  const currentUser = useStore(s => s.currentUser);

  useEffect(() => {
    // Only run simulation if enabled and user is logged in
    if (!SIMULATION_ENABLED || !currentUser || !inventory || inventory.length === 0) return;

    let timer;

    const scheduleNext = () => {
      const delay = Math.floor(Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS + 1) + MIN_INTERVAL_MS);
      timer = setTimeout(() => {
        injectSimulatedPrescription();
        scheduleNext();
      }, delay);
    };

    const injectSimulatedPrescription = () => {
      // 1. Generate Cryptographically Unique IDs
      const rxId = crypto.randomUUID();
      
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const num = Math.floor(Math.random() * 9000) + 1000;
      const nomor = `RX-${dateStr}-${num}`;
      
      // Patient Data
      const firstNames = ['Budi', 'Sari', 'Andi', 'Dewi', 'Rudi', 'Siti', 'Eko', 'Rina', 'Joko', 'Ayu'];
      const lastNames = ['Santoso', 'Wulandari', 'Setiawan', 'Lestari', 'Saputra', 'Rahayu', 'Wijaya', 'Kusuma'];
      const patientName = `[LIVE] ${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      
      // Doctor Data
      const doctors = ['dr. Sari Wulandari, Sp.PD', 'dr. Budi Santoso', 'dr. Rina Kusuma, Sp.A', 'dr. Ahmad Fauzi', 'dr. Hendra Wijaya, Sp.JP'];
      const doctorName = doctors[Math.floor(Math.random() * doctors.length)];
      
      // Origin
      const poliList = ['Poli Umum', 'Poli Gigi', 'Poli Anak', 'Poli Dalam', 'Poli Bedah', 'IGD', 'Rawat Inap'];
      const poli = poliList[Math.floor(Math.random() * poliList.length)];
      
      const priority = poli === 'IGD' ? 'CITO' : (poli === 'Rawat Inap' ? 'RAWAT_INAP' : 'RAWAT_JALAN');
      
      // 2. Select 1-3 random drugs from real inventory
      const numDrugs = Math.floor(Math.random() * 3) + 1;
      const items = [];
      const usedIds = new Set();
      
      for (let i = 0; i < numDrugs; i++) {
        let drug;
        do {
          drug = inventory[Math.floor(Math.random() * inventory.length)];
        } while (usedIds.has(drug.id));
        usedIds.add(drug.id);
        
        items.push({
          id: crypto.randomUUID(),
          prescription_id: rxId,
          drug_id: drug.id,
          nama_dagang: drug.nama_dagang,
          nama_generik: drug.nama_generik,
          kekuatan_dosis: drug.kekuatan_dosis,
          bentuk_sediaan: drug.bentuk_sediaan,
          stok_saat_ini: drug.stok_saat_ini,
          satuan: drug.satuan,
          harga_satuan: drug.harga_satuan,
          lokasi_rak: drug.lokasi_rak,
          kode_bpjs: drug.kode_bpjs,
          quantity_prescribed: [7, 10, 14, 20, 30][Math.floor(Math.random() * 5)],
          dosis_instruksi: '3x1 tablet setelah makan',
          stock_status: drug.stok_saat_ini > 0 ? 'OK' : 'OUT_OF_STOCK',
        });
      }
      
      // 3. Construct the Payload
      const newRx = {
        id: rxId,
        is_simulated: true, // Flag to bypass API fetch in Workspace
        nomor_resep: nomor,
        patient_id: crypto.randomUUID(),
        patient_nama: patientName,
        no_rekam_medis: `RM-2024-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
        prescribing_doctor_id: crypto.randomUUID(),
        doctor_nama: doctorName,
        priority: priority,
        status: 'PENDING',
        asal_poli: poli,
        waktu_masuk: new Date().toISOString(), // STEP 1: Time-relative timestamp
        items: items,
      };
      
      // 4. Zero-Collision State Update
      // Uses functional state update defined in store.js: set((s) => ({ prescriptions: [rx, ...s.prescriptions] }))
      addPrescription(newRx);
      
      // 5. Visual Feedback
      toast('🔔 Resep Baru (Live Simulation)', {
        description: `${patientName} dari ${poli}`,
        className: '!bg-indigo-50 !border-indigo-200 !text-indigo-900',
      });
    };

    // Start simulation
    scheduleNext();

    // Cleanup to prevent memory leaks
    return () => clearTimeout(timer);
  }, [inventory, currentUser, addPrescription]);
}
