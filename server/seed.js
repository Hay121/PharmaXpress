import { faker } from '@faker-js/faker/locale/id_ID';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from './db.js';

const db = getDb();

// ============================================
// DATA OBAT REALISTIS INDONESIA
// ============================================
const DRUG_CATALOG = [
  { nama_dagang: 'Amoxicillin', nama_generik: 'Amoxicillin', zat_aktif: 'Amoxicillin trihydrate', kekuatan: '500mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 850, bpjs: 'OBT-001' },
  { nama_dagang: 'Amoxicillin Sirup', nama_generik: 'Amoxicillin', zat_aktif: 'Amoxicillin trihydrate', kekuatan: '125mg/5ml', bentuk: 'SIRUP', satuan: 'BOTOL', harga: 12500, bpjs: 'OBT-002' },
  { nama_dagang: 'Paracetamol', nama_generik: 'Paracetamol', zat_aktif: 'Paracetamol', kekuatan: '500mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 350, bpjs: 'OBT-003' },
  { nama_dagang: 'Paracetamol Sirup', nama_generik: 'Paracetamol', zat_aktif: 'Paracetamol', kekuatan: '120mg/5ml', bentuk: 'SIRUP', satuan: 'BOTOL', harga: 8500, bpjs: 'OBT-004' },
  { nama_dagang: 'Omeprazole', nama_generik: 'Omeprazole', zat_aktif: 'Omeprazole', kekuatan: '20mg', bentuk: 'KAPSUL', satuan: 'KAPSUL', harga: 1700, bpjs: 'OBT-005' },
  { nama_dagang: 'Lansoprazole', nama_generik: 'Lansoprazole', zat_aktif: 'Lansoprazole', kekuatan: '30mg', bentuk: 'KAPSUL', satuan: 'KAPSUL', harga: 1500, bpjs: 'OBT-006' },
  { nama_dagang: 'Esomeprazole', nama_generik: 'Esomeprazole', zat_aktif: 'Esomeprazole magnesium', kekuatan: '20mg', bentuk: 'KAPSUL', satuan: 'KAPSUL', harga: 2800, bpjs: null },
  { nama_dagang: 'Pantoprazole', nama_generik: 'Pantoprazole', zat_aktif: 'Pantoprazole sodium', kekuatan: '40mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 2200, bpjs: 'OBT-008' },
  { nama_dagang: 'Metformin', nama_generik: 'Metformin HCl', zat_aktif: 'Metformin hydrochloride', kekuatan: '500mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 450, bpjs: 'OBT-009' },
  { nama_dagang: 'Metformin XR', nama_generik: 'Metformin HCl', zat_aktif: 'Metformin hydrochloride', kekuatan: '750mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 1200, bpjs: 'OBT-010' },
  { nama_dagang: 'Amlodipine', nama_generik: 'Amlodipine', zat_aktif: 'Amlodipine besylate', kekuatan: '5mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 650, bpjs: 'OBT-011' },
  { nama_dagang: 'Amlodipine', nama_generik: 'Amlodipine', zat_aktif: 'Amlodipine besylate', kekuatan: '10mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 950, bpjs: 'OBT-012' },
  { nama_dagang: 'Captopril', nama_generik: 'Captopril', zat_aktif: 'Captopril', kekuatan: '25mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 380, bpjs: 'OBT-013' },
  { nama_dagang: 'Captopril', nama_generik: 'Captopril', zat_aktif: 'Captopril', kekuatan: '12.5mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 300, bpjs: 'OBT-014' },
  { nama_dagang: 'Lisinopril', nama_generik: 'Lisinopril', zat_aktif: 'Lisinopril', kekuatan: '10mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 720, bpjs: 'OBT-015' },
  { nama_dagang: 'Simvastatin', nama_generik: 'Simvastatin', zat_aktif: 'Simvastatin', kekuatan: '20mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 900, bpjs: 'OBT-016' },
  { nama_dagang: 'Atorvastatin', nama_generik: 'Atorvastatin', zat_aktif: 'Atorvastatin calcium', kekuatan: '20mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 1400, bpjs: 'OBT-017' },
  { nama_dagang: 'Cetirizine', nama_generik: 'Cetirizine', zat_aktif: 'Cetirizine dihydrochloride', kekuatan: '10mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 550, bpjs: 'OBT-018' },
  { nama_dagang: 'Loratadine', nama_generik: 'Loratadine', zat_aktif: 'Loratadine', kekuatan: '10mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 600, bpjs: 'OBT-019' },
  { nama_dagang: 'Dexamethasone', nama_generik: 'Dexamethasone', zat_aktif: 'Dexamethasone', kekuatan: '0.5mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 420, bpjs: 'OBT-020' },
  { nama_dagang: 'Methylprednisolone', nama_generik: 'Methylprednisolone', zat_aktif: 'Methylprednisolone', kekuatan: '4mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 1100, bpjs: 'OBT-021' },
  { nama_dagang: 'Ciprofloxacin', nama_generik: 'Ciprofloxacin', zat_aktif: 'Ciprofloxacin hydrochloride', kekuatan: '500mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 1300, bpjs: 'OBT-022' },
  { nama_dagang: 'Cefadroxil', nama_generik: 'Cefadroxil', zat_aktif: 'Cefadroxil monohydrate', kekuatan: '500mg', bentuk: 'KAPSUL', satuan: 'KAPSUL', harga: 1800, bpjs: 'OBT-023' },
  { nama_dagang: 'Cefixime', nama_generik: 'Cefixime', zat_aktif: 'Cefixime trihydrate', kekuatan: '200mg', bentuk: 'KAPSUL', satuan: 'KAPSUL', harga: 2500, bpjs: 'OBT-024' },
  { nama_dagang: 'Azithromycin', nama_generik: 'Azithromycin', zat_aktif: 'Azithromycin dihydrate', kekuatan: '500mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 3200, bpjs: 'OBT-025' },
  { nama_dagang: 'Erythromycin', nama_generik: 'Erythromycin', zat_aktif: 'Erythromycin stearate', kekuatan: '500mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 1600, bpjs: 'OBT-026' },
  { nama_dagang: 'Ranitidine', nama_generik: 'Ranitidine', zat_aktif: 'Ranitidine hydrochloride', kekuatan: '150mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 500, bpjs: 'OBT-027' },
  { nama_dagang: 'Domperidone', nama_generik: 'Domperidone', zat_aktif: 'Domperidone', kekuatan: '10mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 650, bpjs: 'OBT-028' },
  { nama_dagang: 'Ondansetron', nama_generik: 'Ondansetron', zat_aktif: 'Ondansetron hydrochloride', kekuatan: '4mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 1200, bpjs: 'OBT-029' },
  { nama_dagang: 'Ibuprofen', nama_generik: 'Ibuprofen', zat_aktif: 'Ibuprofen', kekuatan: '400mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 500, bpjs: 'OBT-030' },
  { nama_dagang: 'Mefenamic Acid', nama_generik: 'Asam Mefenamat', zat_aktif: 'Mefenamic acid', kekuatan: '500mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 600, bpjs: 'OBT-031' },
  { nama_dagang: 'Ketorolac', nama_generik: 'Ketorolac', zat_aktif: 'Ketorolac tromethamine', kekuatan: '10mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 1500, bpjs: null },
  { nama_dagang: 'Diazepam', nama_generik: 'Diazepam', zat_aktif: 'Diazepam', kekuatan: '5mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 700, bpjs: 'OBT-033' },
  { nama_dagang: 'Alprazolam', nama_generik: 'Alprazolam', zat_aktif: 'Alprazolam', kekuatan: '0.5mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 850, bpjs: 'OBT-034' },
  { nama_dagang: 'Salbutamol', nama_generik: 'Salbutamol', zat_aktif: 'Salbutamol sulfate', kekuatan: '2mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 400, bpjs: 'OBT-035' },
  { nama_dagang: 'Salbutamol Inhaler', nama_generik: 'Salbutamol', zat_aktif: 'Salbutamol sulfate', kekuatan: '100mcg', bentuk: 'INHALER', satuan: 'UNIT', harga: 35000, bpjs: 'OBT-036' },
  { nama_dagang: 'Ambroxol', nama_generik: 'Ambroxol', zat_aktif: 'Ambroxol hydrochloride', kekuatan: '30mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 450, bpjs: 'OBT-037' },
  { nama_dagang: 'N-Acetylcysteine', nama_generik: 'Acetylcysteine', zat_aktif: 'Acetylcysteine', kekuatan: '200mg', bentuk: 'KAPSUL', satuan: 'KAPSUL', harga: 1100, bpjs: 'OBT-038' },
  { nama_dagang: 'Antasida DOEN', nama_generik: 'Antasida', zat_aktif: 'Aluminium hydroxide + Magnesium hydroxide', kekuatan: '400mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 300, bpjs: 'OBT-039' },
  { nama_dagang: 'Sucralfate Sirup', nama_generik: 'Sucralfate', zat_aktif: 'Sucralfate', kekuatan: '500mg/5ml', bentuk: 'SIRUP', satuan: 'BOTOL', harga: 25000, bpjs: 'OBT-040' },
  { nama_dagang: 'Glimepiride', nama_generik: 'Glimepiride', zat_aktif: 'Glimepiride', kekuatan: '2mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 950, bpjs: 'OBT-041' },
  { nama_dagang: 'Glibenclamide', nama_generik: 'Glibenclamide', zat_aktif: 'Glibenclamide', kekuatan: '5mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 350, bpjs: 'OBT-042' },
  { nama_dagang: 'Acarbose', nama_generik: 'Acarbose', zat_aktif: 'Acarbose', kekuatan: '50mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 1800, bpjs: 'OBT-043' },
  { nama_dagang: 'Furosemide', nama_generik: 'Furosemide', zat_aktif: 'Furosemide', kekuatan: '40mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 400, bpjs: 'OBT-044' },
  { nama_dagang: 'Hydrochlorothiazide', nama_generik: 'HCT', zat_aktif: 'Hydrochlorothiazide', kekuatan: '25mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 350, bpjs: 'OBT-045' },
  { nama_dagang: 'Spironolactone', nama_generik: 'Spironolactone', zat_aktif: 'Spironolactone', kekuatan: '25mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 800, bpjs: 'OBT-046' },
  { nama_dagang: 'Bisoprolol', nama_generik: 'Bisoprolol', zat_aktif: 'Bisoprolol fumarate', kekuatan: '5mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 1200, bpjs: 'OBT-047' },
  { nama_dagang: 'Propranolol', nama_generik: 'Propranolol', zat_aktif: 'Propranolol hydrochloride', kekuatan: '40mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 500, bpjs: 'OBT-048' },
  { nama_dagang: 'Warfarin', nama_generik: 'Warfarin', zat_aktif: 'Warfarin sodium', kekuatan: '2mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 750, bpjs: 'OBT-049' },
  { nama_dagang: 'Clopidogrel', nama_generik: 'Clopidogrel', zat_aktif: 'Clopidogrel bisulfate', kekuatan: '75mg', bentuk: 'TABLET', satuan: 'TABLET', harga: 1600, bpjs: 'OBT-050' },
];

// Substitution groups (drugs that can replace each other)
const SUBSTITUTION_GROUPS = [
  // PPI group
  ['Omeprazole', 'Lansoprazole', 'Esomeprazole', 'Pantoprazole'],
  // Antihistamines
  ['Cetirizine', 'Loratadine'],
  // ACE inhibitors / ARB
  ['Captopril', 'Lisinopril'],
  // Statins
  ['Simvastatin', 'Atorvastatin'],
  // NSAIDs
  ['Ibuprofen', 'Mefenamic Acid'],
  // Antidiabetics (sulfonylurea)
  ['Glimepiride', 'Glibenclamide'],
  // Beta blockers
  ['Bisoprolol', 'Propranolol'],
  // Corticosteroids
  ['Dexamethasone', 'Methylprednisolone'],
  // Anti-emetics
  ['Domperidone', 'Ondansetron'],
  // Mucolytics
  ['Ambroxol', 'N-Acetylcysteine'],
  // Antibiotics (macrolides)
  ['Azithromycin', 'Erythromycin'],
  // Cephalosporins
  ['Cefadroxil', 'Cefixime'],
  // Diuretics
  ['Furosemide', 'Hydrochlorothiazide'],
  // Metformin variants
  ['Metformin', 'Metformin XR'],
  // Anticoagulants
  ['Warfarin', 'Clopidogrel'],
];

const POLI_LIST = ['Poli Umum', 'Poli Gigi', 'Poli Anak', 'Poli Dalam', 'Poli Bedah', 'Poli Mata', 'Poli THT', 'Poli Kulit', 'Poli Saraf', 'Poli Jantung', 'IGD', 'Rawat Inap'];

const DOSIS_TEMPLATES = [
  '3x1 tablet setelah makan',
  '2x1 tablet setelah makan',
  '1x1 tablet sebelum tidur',
  '3x1 kapsul setelah makan',
  '2x1 kapsul sesudah makan',
  '1x1 tablet pagi hari',
  '3x1 sendok teh (5ml) setelah makan',
  '2x1 sendok teh (5ml)',
  '1x1 tablet saat perut kosong',
  '3x1 tablet sebelum makan',
  'Bila perlu (prn), max 3x sehari',
  '2x1 tablet pagi dan sore',
];

const CATATAN_DOKTER_TEMPLATES = [
  'Pasien alergi penisilin. Gunakan alternatif jika tersedia.',
  'Monitoring tekanan darah rutin.',
  'Pasien hamil trimester 2, perhatikan kontraindikasi.',
  'Riwayat gangguan lambung, berikan pelindung lambung.',
  'Kontrol ulang 1 minggu.',
  'Dosis disesuaikan dengan berat badan pasien.',
  'Pasien diabetes, perhatikan interaksi obat.',
  null, null, null, null, null, // many prescriptions have no notes
];

function seed() {
  console.log('🌱 Memulai seeding data sintetis...\n');

  // Clear existing data
  db.exec(`
    DELETE FROM stock_transactions;
    DELETE FROM drug_substitutions;
    DELETE FROM prescription_items;
    DELETE FROM prescriptions;
    DELETE FROM pharmacy_inventory;
    DELETE FROM patients;
    DELETE FROM users;
  `);

  // ── USERS ──
  console.log('👤 Membuat users...');
  const users = [];

  const doctors = [
    { nama: 'dr. Sari Wulandari, Sp.PD', username: 'dr.sari', role: 'DOKTER' },
    { nama: 'dr. Budi Santoso', username: 'dr.budi', role: 'DOKTER' },
    { nama: 'dr. Rina Kusuma, Sp.A', username: 'dr.rina', role: 'DOKTER' },
    { nama: 'dr. Ahmad Fauzi', username: 'dr.ahmad', role: 'DOKTER' },
    { nama: 'dr. Dewi Anggraeni, Sp.B', username: 'dr.dewi', role: 'DOKTER' },
    { nama: 'dr. Hendra Wijaya, Sp.JP', username: 'dr.hendra', role: 'DOKTER' },
  ];

  const pharmacists = [
    { nama: 'Apt. Siti Nurhaliza', username: 'apt.siti', role: 'APOTEKER' },
    { nama: 'Apt. Reza Firmansyah', username: 'apt.reza', role: 'APOTEKER' },
    { nama: 'Apt. Maya Putri', username: 'apt.maya', role: 'APOTEKER' },
  ];

  const admins = [
    { nama: 'Abdul Rokhim', username: 'admin', role: 'ADMIN' },
  ];

  const allUsers = [...doctors, ...pharmacists, ...admins];
  const insertUser = db.prepare(`
    INSERT INTO users (id, nama_lengkap, username, role) VALUES (?, ?, ?, ?)
  `);

  for (const u of allUsers) {
    const id = uuidv4();
    insertUser.run(id, `[SYNTHETIC] ${u.nama}`, u.username, u.role);
    users.push({ id, ...u });
  }
  console.log(`   ✅ ${users.length} users dibuat`);

  // ── PATIENTS ──
  console.log('🏥 Membuat pasien sintetis...');
  const patients = [];
  const insertPatient = db.prepare(`
    INSERT INTO patients (id, nama_lengkap, no_rekam_medis, nik, tanggal_lahir, jenis_kelamin, alamat, no_telepon, no_bpjs, is_synthetic)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  for (let i = 0; i < 200; i++) {
    const id = uuidv4();
    const gender = faker.helpers.arrayElement(['L', 'P']);
    const sex = gender === 'L' ? 'male' : 'female';
    const nama = `[SYNTHETIC] ${faker.person.fullName({ sex })}`;
    const noRM = `RM-${String(2024).padStart(4, '0')}-${String(i + 1).padStart(5, '0')}`;
    const nik = faker.string.numeric(16);
    const tglLahir = faker.date.birthdate({ min: 1, max: 85, mode: 'age' }).toISOString().split('T')[0];
    const alamat = `${faker.location.streetAddress()}, ${faker.location.city()}, Jawa Tengah`;
    const telp = `08${faker.string.numeric(10)}`;
    const bpjs = faker.helpers.maybe(() => faker.string.numeric(13), { probability: 0.7 });

    insertPatient.run(id, nama, noRM, nik, tglLahir, gender, alamat, telp, bpjs || null);
    patients.push({ id, nama, noRM });
  }
  console.log(`   ✅ ${patients.length} pasien dibuat`);

  // ── PHARMACY INVENTORY ──
  console.log('💊 Membuat katalog obat...');
  const drugs = [];
  const racks = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2', 'D3'];
  const insertDrug = db.prepare(`
    INSERT INTO pharmacy_inventory (id, kode_obat, nama_dagang, nama_generik, zat_aktif, kekuatan_dosis, bentuk_sediaan, stok_saat_ini, stok_minimum, satuan, harga_satuan, kode_bpjs, lokasi_rak, tanggal_kadaluarsa, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  for (let i = 0; i < DRUG_CATALOG.length; i++) {
    const d = DRUG_CATALOG[i];
    const id = uuidv4();
    const kode = `OBT-${String(i + 1).padStart(4, '0')}`;
    // Some drugs have 0 stock to test out-of-stock flow
    let stok;
    if (i === 4) stok = 0; // Omeprazole - out of stock for demo
    else if (i === 2) stok = 12; // Paracetamol - low stock for demo
    else stok = faker.number.int({ min: 50, max: 800 });

    const rak = `Rak ${faker.helpers.arrayElement(racks)}-${faker.number.int({ min: 1, max: 5 })}`;
    const exp = faker.date.future({ years: 2 }).toISOString().split('T')[0];

    insertDrug.run(id, kode, d.nama_dagang, d.nama_generik || null, d.zat_aktif || null, d.kekuatan || null, d.bentuk, stok, 20, d.satuan, d.harga, d.bpjs || null, rak || null, exp || null);
    drugs.push({ id, nama: d.nama_dagang, kode, stok, kekuatan: d.kekuatan });
  }
  console.log(`   ✅ ${drugs.length} obat dibuat`);

  // ── DRUG SUBSTITUTIONS ──
  console.log('🔄 Membuat tabel substitusi obat...');
  const insertSub = db.prepare(`
    INSERT INTO drug_substitutions (id, drug_id, substitute_drug_id, urutan_prioritas, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  let subCount = 0;
  for (const group of SUBSTITUTION_GROUPS) {
    // Find drug IDs for this group
    const groupDrugs = group.map(name => drugs.find(d => d.nama === name)).filter(Boolean);
    for (let i = 0; i < groupDrugs.length; i++) {
      for (let j = 0; j < groupDrugs.length; j++) {
        if (i !== j) {
          insertSub.run(uuidv4(), groupDrugs[i].id, groupDrugs[j].id, j < i ? j + 1 : j);
          subCount++;
        }
      }
    }
  }
  console.log(`   ✅ ${subCount} substitusi obat dibuat`);

  // ── PRESCRIPTIONS ──
  console.log('📋 Membuat resep...');
  const doctorUsers = users.filter(u => u.role === 'DOKTER');
  const pharmacistUsers = users.filter(u => u.role === 'APOTEKER');

  const insertRx = db.prepare(`
    INSERT INTO prescriptions (id, nomor_resep, patient_id, prescribing_doctor_id, dispensing_pharmacist_id, priority, status, catatan_dokter, asal_poli, waktu_masuk, waktu_mulai_proses, waktu_selesai, durasi_proses_detik)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRxItem = db.prepare(`
    INSERT INTO prescription_items (id, prescription_id, drug_id, quantity_prescribed, quantity_dispensed, dosis_instruksi, status_item)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const prescriptions = [];
  const today = new Date();
  let rxCounter = 1;

  // Create historical dispensed prescriptions (past)
  for (let i = 0; i < 40; i++) {
    const rxId = uuidv4();
    const nomor = `RX-${today.toISOString().split('T')[0].replace(/-/g, '')}-${String(rxCounter++).padStart(4, '0')}`;
    const patient = faker.helpers.arrayElement(patients);
    const doctor = faker.helpers.arrayElement(doctorUsers);
    const pharmacist = faker.helpers.arrayElement(pharmacistUsers);
    const priority = faker.helpers.weightedArrayElement([
      { value: 'RAWAT_JALAN', weight: 60 },
      { value: 'RAWAT_INAP', weight: 25 },
      { value: 'CITO', weight: 15 },
    ]);
    const poli = faker.helpers.arrayElement(POLI_LIST);
    const catatan = faker.helpers.arrayElement(CATATAN_DOKTER_TEMPLATES);

    const minutesAgo = faker.number.int({ min: 60, max: 480 });
    const waktuMasuk = new Date(today.getTime() - minutesAgo * 60 * 1000).toISOString();
    const durasi = faker.number.int({ min: 25, max: 120 });
    const waktuMulai = new Date(new Date(waktuMasuk).getTime() + faker.number.int({ min: 30, max: 300 }) * 1000).toISOString();
    const waktuSelesai = new Date(new Date(waktuMulai).getTime() + durasi * 1000).toISOString();

    insertRx.run(rxId, nomor, patient.id, doctor.id, pharmacist.id, priority, 'DISPENSED', catatan, poli, waktuMasuk, waktuMulai, waktuSelesai, durasi);

    const itemCount = faker.number.int({ min: 1, max: 5 });
    const usedDrugs = new Set();
    for (let j = 0; j < itemCount; j++) {
      let drug;
      do { drug = faker.helpers.arrayElement(drugs); } while (usedDrugs.has(drug.id));
      usedDrugs.add(drug.id);

      const qty = faker.helpers.arrayElement([7, 10, 14, 20, 30]);
      const dosis = faker.helpers.arrayElement(DOSIS_TEMPLATES);
      insertRxItem.run(uuidv4(), rxId, drug.id, qty, qty, dosis, 'DISPENSED');
    }
    prescriptions.push({ id: rxId, nomor, status: 'DISPENSED' });
  }

  // Create PENDING prescriptions (current queue)
  for (let i = 0; i < 8; i++) {
    const rxId = uuidv4();
    const nomor = `RX-${today.toISOString().split('T')[0].replace(/-/g, '')}-${String(rxCounter++).padStart(4, '0')}`;
    const patient = faker.helpers.arrayElement(patients);
    const doctor = faker.helpers.arrayElement(doctorUsers);
    const priority = i === 0 ? 'CITO' : faker.helpers.weightedArrayElement([
      { value: 'RAWAT_JALAN', weight: 55 },
      { value: 'RAWAT_INAP', weight: 30 },
      { value: 'CITO', weight: 15 },
    ]);
    const poli = priority === 'CITO' ? 'IGD' : faker.helpers.arrayElement(POLI_LIST);
    const catatan = faker.helpers.arrayElement(CATATAN_DOKTER_TEMPLATES);
    const minutesAgo = faker.number.int({ min: 1, max: 25 });
    const waktuMasuk = new Date(today.getTime() - minutesAgo * 60 * 1000).toISOString();

    insertRx.run(rxId, nomor, patient.id, doctor.id, null, priority, 'PENDING', catatan, poli, waktuMasuk, null, null, null);

    const itemCount = faker.number.int({ min: 1, max: 4 });
    const usedDrugs = new Set();
    for (let j = 0; j < itemCount; j++) {
      let drug;
      do { drug = faker.helpers.arrayElement(drugs); } while (usedDrugs.has(drug.id));
      usedDrugs.add(drug.id);

      const qty = faker.helpers.arrayElement([7, 10, 14, 20, 30]);
      const dosis = faker.helpers.arrayElement(DOSIS_TEMPLATES);

      let statusItem = 'READY';
      if (drug.stok === 0) statusItem = 'OUT_OF_STOCK';
      else if (drug.stok < qty) statusItem = 'OUT_OF_STOCK';

      insertRxItem.run(uuidv4(), rxId, drug.id, qty, 0, dosis, statusItem);
    }
    prescriptions.push({ id: rxId, nomor, status: 'PENDING' });
  }

  // Create 2 IN_PROGRESS prescriptions
  for (let i = 0; i < 2; i++) {
    const rxId = uuidv4();
    const nomor = `RX-${today.toISOString().split('T')[0].replace(/-/g, '')}-${String(rxCounter++).padStart(4, '0')}`;
    const patient = faker.helpers.arrayElement(patients);
    const doctor = faker.helpers.arrayElement(doctorUsers);
    const pharmacist = faker.helpers.arrayElement(pharmacistUsers);
    const priority = faker.helpers.arrayElement(['RAWAT_JALAN', 'RAWAT_INAP']);
    const poli = faker.helpers.arrayElement(POLI_LIST);
    const minutesAgo = faker.number.int({ min: 2, max: 8 });
    const waktuMasuk = new Date(today.getTime() - minutesAgo * 60 * 1000).toISOString();
    const waktuMulai = new Date(new Date(waktuMasuk).getTime() + 30 * 1000).toISOString();

    insertRx.run(rxId, nomor, patient.id, doctor.id, pharmacist.id, priority, 'IN_PROGRESS', null, poli, waktuMasuk, waktuMulai, null, null);

    const itemCount = faker.number.int({ min: 2, max: 4 });
    const usedDrugs = new Set();
    for (let j = 0; j < itemCount; j++) {
      let drug;
      do { drug = faker.helpers.arrayElement(drugs); } while (usedDrugs.has(drug.id));
      usedDrugs.add(drug.id);
      const qty = faker.helpers.arrayElement([7, 10, 14, 20, 30]);
      const dosis = faker.helpers.arrayElement(DOSIS_TEMPLATES);
      insertRxItem.run(uuidv4(), rxId, drug.id, qty, 0, dosis, 'READY');
    }
    prescriptions.push({ id: rxId, nomor, status: 'IN_PROGRESS' });
  }

  console.log(`   ✅ ${prescriptions.length} resep dibuat (${prescriptions.filter(p => p.status === 'PENDING').length} pending, ${prescriptions.filter(p => p.status === 'IN_PROGRESS').length} in-progress, ${prescriptions.filter(p => p.status === 'DISPENSED').length} selesai)`);

  console.log('\n🎉 Seeding selesai!\n');
  console.log('   Database: server/pharmaxpress.db');
  console.log('   Jalankan: npm run dev\n');
}

seed();
