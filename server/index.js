import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import fastifyFormbody from '@fastify/formbody';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { getDb } from './db.js';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Re-seed DB automatically on every server start for fresh demo data
try {
  console.log('🔄 Mengatur ulang database dengan data simulasi segar...');
  execSync('node seed.js', { cwd: __dirname, stdio: 'inherit' });
} catch (err) {
  console.error('Gagal me-reset database:', err);
}

const PORT = process.env.PORT || 3000;

const fastify = Fastify({ logger: false });

// ── Plugins ──
await fastify.register(cors, { origin: true });
await fastify.register(fastifyFormbody);
await fastify.register(fastifyWebsocket);

// Serve static build in production
const distPath = path.join(__dirname, '..', 'dist');
try {
  await fastify.register(fastifyStatic, { root: distPath, prefix: '/' });
} catch { /* dist may not exist in dev */ }

// ── DB ──
const db = getDb();

// ── WebSocket connections ──
const wsClients = new Set();

fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, (socket, req) => {
    wsClients.add(socket);
    socket.on('close', () => wsClients.delete(socket));
    socket.on('error', () => wsClients.delete(socket));
  });
});

function broadcast(event, data) {
  const msg = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
  for (const client of wsClients) {
    try { client.send(msg); } catch { wsClients.delete(client); }
  }
}

// ═══════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════

// ── GET /api/v1/stats ──
fastify.get('/api/v1/stats', async (req, reply) => {
  const today = new Date().toISOString().split('T')[0];
  const stats = db.prepare(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
      COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress,
      COUNT(*) FILTER (WHERE status = 'DISPENSED' AND date(waktu_selesai) = ?) as dispensed_today,
      COALESCE(AVG(durasi_proses_detik) FILTER (WHERE status = 'DISPENSED' AND date(waktu_selesai) = ?), 0) as avg_duration
    FROM prescriptions
  `).get(today, today);

  // SQLite doesn't support FILTER, use CASE WHEN
  const statsAlt = db.prepare(`
    SELECT
      SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'DISPENSED' AND date(waktu_selesai) = ? THEN 1 ELSE 0 END) as dispensed_today,
      COALESCE(AVG(CASE WHEN status = 'DISPENSED' AND date(waktu_selesai) = ? THEN durasi_proses_detik END), 0) as avg_duration
    FROM prescriptions
  `).get(today, today);

  return { success: true, data: statsAlt };
});

// ── GET /api/v1/prescriptions ──
fastify.get('/api/v1/prescriptions', async (req, reply) => {
  const { status, limit = 50 } = req.query;

  let query = `
    SELECT p.*, 
           pt.nama_lengkap as patient_nama, pt.no_rekam_medis,
           u.nama_lengkap as doctor_nama,
           u2.nama_lengkap as pharmacist_nama
    FROM prescriptions p
    JOIN patients pt ON p.patient_id = pt.id
    JOIN users u ON p.prescribing_doctor_id = u.id
    LEFT JOIN users u2 ON p.dispensing_pharmacist_id = u2.id
  `;
  const params = [];

  if (status) {
    if (status === 'ACTIVE') {
      query += ` WHERE p.status IN ('PENDING', 'IN_PROGRESS')`;
    } else {
      query += ` WHERE p.status = ?`;
      params.push(status);
    }
  }

  query += ` ORDER BY 
    CASE p.priority 
      WHEN 'CITO' THEN 0 
      WHEN 'RAWAT_INAP' THEN 1 
      WHEN 'RAWAT_JALAN' THEN 2 
    END,
    p.waktu_masuk ASC
    LIMIT ?`;
  params.push(Number(limit));

  const prescriptions = db.prepare(query).all(...params);

  // Attach items for each prescription
  const itemsStmt = db.prepare(`
    SELECT pi.*, 
           inv.nama_dagang, inv.nama_generik, inv.kekuatan_dosis, inv.bentuk_sediaan,
           inv.stok_saat_ini, inv.satuan, inv.harga_satuan, inv.lokasi_rak, inv.kode_bpjs
    FROM prescription_items pi
    JOIN pharmacy_inventory inv ON pi.drug_id = inv.id
    WHERE pi.prescription_id = ?
  `);

  const subsStmt = db.prepare(`
    SELECT ds.*, inv.nama_dagang, inv.nama_generik, inv.kekuatan_dosis, 
           inv.stok_saat_ini, inv.harga_satuan, inv.satuan
    FROM drug_substitutions ds
    JOIN pharmacy_inventory inv ON ds.substitute_drug_id = inv.id
    WHERE ds.drug_id = ? AND ds.is_active = 1
    ORDER BY ds.urutan_prioritas ASC
  `);

  for (const rx of prescriptions) {
    rx.items = itemsStmt.all(rx.id);
    for (const item of rx.items) {
      // Recompute stock status
      if (item.stok_saat_ini <= 0) item.stock_status = 'OUT_OF_STOCK';
      else if (item.stok_saat_ini < item.quantity_prescribed) item.stock_status = 'INSUFFICIENT';
      else if (item.stok_saat_ini <= 20) item.stock_status = 'LOW';
      else item.stock_status = 'OK';

      // Attach substitutions for problematic items
      if (item.stock_status === 'OUT_OF_STOCK' || item.stock_status === 'INSUFFICIENT') {
        item.substitutions = subsStmt.all(item.drug_id);
      } else {
        item.substitutions = [];
      }
    }
  }

  return { success: true, data: prescriptions };
});

// ── GET /api/v1/prescriptions/:id ──
fastify.get('/api/v1/prescriptions/:id', async (req, reply) => {
  const rx = db.prepare(`
    SELECT p.*, 
           pt.nama_lengkap as patient_nama, pt.no_rekam_medis, pt.no_bpjs as patient_bpjs,
           u.nama_lengkap as doctor_nama,
           u2.nama_lengkap as pharmacist_nama
    FROM prescriptions p
    JOIN patients pt ON p.patient_id = pt.id
    JOIN users u ON p.prescribing_doctor_id = u.id
    LEFT JOIN users u2 ON p.dispensing_pharmacist_id = u2.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!rx) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Resep tidak ditemukan' } });

  const items = db.prepare(`
    SELECT pi.*, 
           inv.nama_dagang, inv.nama_generik, inv.kekuatan_dosis, inv.bentuk_sediaan,
           inv.stok_saat_ini, inv.satuan, inv.harga_satuan, inv.lokasi_rak, inv.kode_bpjs
    FROM prescription_items pi
    JOIN pharmacy_inventory inv ON pi.drug_id = inv.id
    WHERE pi.prescription_id = ?
  `).all(req.params.id);

  const subsStmt = db.prepare(`
    SELECT ds.*, inv.nama_dagang, inv.nama_generik, inv.kekuatan_dosis,
           inv.stok_saat_ini, inv.harga_satuan, inv.satuan
    FROM drug_substitutions ds
    JOIN pharmacy_inventory inv ON ds.substitute_drug_id = inv.id
    WHERE ds.drug_id = ? AND ds.is_active = 1
    ORDER BY ds.urutan_prioritas ASC
  `);

  for (const item of items) {
    if (item.stok_saat_ini <= 0) item.stock_status = 'OUT_OF_STOCK';
    else if (item.stok_saat_ini < item.quantity_prescribed) item.stock_status = 'INSUFFICIENT';
    else if (item.stok_saat_ini <= 20) item.stock_status = 'LOW';
    else item.stock_status = 'OK';
    item.substitutions = (item.stock_status === 'OUT_OF_STOCK' || item.stock_status === 'INSUFFICIENT')
      ? subsStmt.all(item.drug_id)
      : [];
  }

  rx.items = items;
  return { success: true, data: rx };
});

// ── POST /api/v1/prescriptions ──
fastify.post('/api/v1/prescriptions', async (req, reply) => {
  const { patient_id, prescribing_doctor_id, priority = 'RAWAT_JALAN', asal_poli, catatan_dokter, items } = req.body;

  if (!patient_id || !prescribing_doctor_id || !items || items.length === 0) {
    return reply.code(400).send({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'patient_id, prescribing_doctor_id, dan items wajib diisi' }
    });
  }

  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patient_id);
  if (!patient) return reply.code(404).send({ success: false, error: { code: 'PATIENT_NOT_FOUND', message: 'Pasien tidak ditemukan' } });

  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const count = db.prepare("SELECT COUNT(*) as c FROM prescriptions WHERE nomor_resep LIKE ?").get(`RX-${today}-%`);
  const nomor = `RX-${today}-${String((count.c || 0) + 1).padStart(4, '0')}`;

  const rxId = uuidv4();
  const now = new Date().toISOString();

  const txn = db.transaction(() => {
    db.prepare(`
      INSERT INTO prescriptions (id, nomor_resep, patient_id, prescribing_doctor_id, priority, status, catatan_dokter, asal_poli, waktu_masuk)
      VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?, ?)
    `).run(rxId, nomor, patient_id, prescribing_doctor_id, priority, catatan_dokter || null, asal_poli || null, now);

    for (const item of items) {
      const drug = db.prepare('SELECT * FROM pharmacy_inventory WHERE id = ?').get(item.drug_id);
      let statusItem = 'READY';
      if (!drug || drug.stok_saat_ini <= 0) statusItem = 'OUT_OF_STOCK';
      else if (drug.stok_saat_ini < item.quantity_prescribed) statusItem = 'OUT_OF_STOCK';

      db.prepare(`
        INSERT INTO prescription_items (id, prescription_id, drug_id, quantity_prescribed, dosis_instruksi, status_item)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), rxId, item.drug_id, item.quantity_prescribed, item.dosis_instruksi || null, statusItem);
    }
  });

  txn();

  // Fetch the full created prescription
  const created = db.prepare(`
    SELECT p.*, pt.nama_lengkap as patient_nama, pt.no_rekam_medis
    FROM prescriptions p
    JOIN patients pt ON p.patient_id = pt.id
    WHERE p.id = ?
  `).get(rxId);

  created.items = db.prepare(`
    SELECT pi.*, inv.nama_dagang, inv.nama_generik, inv.kekuatan_dosis, inv.stok_saat_ini, inv.harga_satuan, inv.satuan, inv.lokasi_rak
    FROM prescription_items pi
    JOIN pharmacy_inventory inv ON pi.drug_id = inv.id
    WHERE pi.prescription_id = ?
  `).all(rxId);

  broadcast('prescription:new', { id: rxId, nomor, priority, patient_nama: created.patient_nama });

  return reply.code(201).send({ success: true, data: created });
});

// ── POST /api/v1/prescriptions/:id/dispense ──
fastify.post('/api/v1/prescriptions/:id/dispense', async (req, reply) => {
  const { id } = req.params;
  const { dispensing_pharmacist_id, items } = req.body;

  if (!dispensing_pharmacist_id || !items || items.length === 0) {
    return reply.code(400).send({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'dispensing_pharmacist_id dan items wajib diisi' }
    });
  }

  const rx = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id);
  if (!rx) return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Resep tidak ditemukan' } });
  if (rx.status === 'DISPENSED') {
    return reply.code(422).send({
      success: false,
      error: { code: 'ALREADY_DISPENSED', message: `Resep ${rx.nomor_resep} sudah didispensing`, idempotency: true }
    });
  }

  const stockAlerts = [];
  const dispensedItems = [];

  const txn = db.transaction(() => {
    const now = new Date().toISOString();

    for (const item of items) {
      const drugId = item.drug_id;
      const drug = db.prepare('SELECT * FROM pharmacy_inventory WHERE id = ?').get(drugId);
      if (!drug) throw new Error(`Obat ${drugId} tidak ditemukan`);

      if (drug.stok_saat_ini < item.quantity_dispensed) {
        throw { 
          statusCode: 409,
          error: {
            code: 'STOCK_INSUFFICIENT',
            message: 'Stok tidak mencukupi',
            details: [{
              drug_id: drugId,
              nama_obat: `${drug.nama_dagang} ${drug.kekuatan_dosis}`,
              quantity_requested: item.quantity_dispensed,
              stok_tersedia: drug.stok_saat_ini,
              selisih: drug.stok_saat_ini - item.quantity_dispensed
            }]
          }
        };
      }

      const stokBefore = drug.stok_saat_ini;
      const stokAfter = stokBefore - item.quantity_dispensed;

      // Deduct stock
      db.prepare('UPDATE pharmacy_inventory SET stok_saat_ini = ?, updated_at = ? WHERE id = ?')
        .run(stokAfter, now, drugId);

      // Update prescription item
      const updateFields = item.action === 'SUBSTITUTE'
        ? 'quantity_dispensed = ?, status_item = ?, substituted_from_drug_id = ?, drug_id = ?, catatan_apoteker = ?'
        : 'quantity_dispensed = ?, status_item = ?';

      if (item.action === 'SUBSTITUTE') {
        db.prepare(`UPDATE prescription_items SET ${updateFields} WHERE id = ?`)
          .run(item.quantity_dispensed, 'SUBSTITUTED', item.original_drug_id, drugId, item.catatan_apoteker || null, item.prescription_item_id);
      } else {
        db.prepare(`UPDATE prescription_items SET ${updateFields} WHERE id = ?`)
          .run(item.quantity_dispensed, 'DISPENSED', item.prescription_item_id);
      }

      // Record stock transaction
      db.prepare(`
        INSERT INTO stock_transactions (id, drug_id, tipe_transaksi, quantity, stok_sebelum, stok_sesudah, reference_id, performed_by, catatan)
        VALUES (?, ?, 'DISPENSE', ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), drugId, -item.quantity_dispensed, stokBefore, stokAfter, item.prescription_item_id, dispensing_pharmacist_id, null);

      dispensedItems.push({
        nama_obat: `${drug.nama_dagang} ${drug.kekuatan_dosis}`,
        quantity_dispensed: item.quantity_dispensed,
        stok_sebelum: stokBefore,
        stok_sesudah: stokAfter,
        status: item.action === 'SUBSTITUTE' ? 'SUBSTITUTED' : 'DISPENSED',
        substituted_from: item.original_drug_id ? db.prepare('SELECT nama_dagang, kekuatan_dosis FROM pharmacy_inventory WHERE id = ?').get(item.original_drug_id) : null
      });

      if (stokAfter <= 0) {
        stockAlerts.push({ drug_id: drugId, nama_obat: `${drug.nama_dagang} ${drug.kekuatan_dosis}`, alert_type: 'OUT_OF_STOCK', stok_saat_ini: stokAfter });
      } else if (stokAfter <= 20) {
        stockAlerts.push({ drug_id: drugId, nama_obat: `${drug.nama_dagang} ${drug.kekuatan_dosis}`, alert_type: 'LOW_STOCK', stok_saat_ini: stokAfter });
      }
    }

    const waktuMulai = rx.waktu_mulai_proses || now;
    const durasi = Math.round((new Date(now).getTime() - new Date(waktuMulai).getTime()) / 1000);

    db.prepare(`
      UPDATE prescriptions SET status = 'DISPENSED', dispensing_pharmacist_id = ?, waktu_mulai_proses = ?, waktu_selesai = ?, durasi_proses_detik = ?, updated_at = ?
      WHERE id = ?
    `).run(dispensing_pharmacist_id, waktuMulai, now, durasi, now, id);

    return durasi;
  });

  try {
    const durasi = txn();

    const pharmacist = db.prepare('SELECT nama_lengkap FROM users WHERE id = ?').get(dispensing_pharmacist_id);

    broadcast('prescription:dispensed', { id, nomor_resep: rx.nomor_resep });
    broadcast('stock:updated', { alerts: stockAlerts });

    return {
      success: true,
      data: {
        prescription_id: id,
        nomor_resep: rx.nomor_resep,
        status: 'DISPENSED',
        dispensing_pharmacist: pharmacist?.nama_lengkap || 'Unknown',
        waktu_selesai: new Date().toISOString(),
        durasi_proses_detik: durasi,
        items_dispensed: dispensedItems,
        stock_alerts: stockAlerts,
      }
    };
  } catch (err) {
    if (err.statusCode === 409) {
      return reply.code(409).send({ success: false, ...err });
    }
    throw err;
  }
});

// ── POST /api/v1/prescriptions/:id/start ──
fastify.post('/api/v1/prescriptions/:id/start', async (req, reply) => {
  const { id } = req.params;
  const { pharmacist_id } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE prescriptions SET status = 'IN_PROGRESS', dispensing_pharmacist_id = ?, waktu_mulai_proses = ?, updated_at = ?
    WHERE id = ? AND status = 'PENDING'
  `).run(pharmacist_id, now, now, id);

  broadcast('prescription:started', { id });
  return { success: true };
});

// ── POST /api/v1/prescriptions/:id/return ──
fastify.post('/api/v1/prescriptions/:id/return', async (req, reply) => {
  const { id } = req.params;
  const { catatan } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE prescriptions SET status = 'RETURNED', catatan_dokter = COALESCE(catatan_dokter, '') || ? , updated_at = ?
    WHERE id = ?
  `).run(`\n[RETURNED] ${catatan || 'Dikembalikan oleh apoteker'}`, now, id);

  broadcast('prescription:returned', { id });
  return { success: true };
});

// ── GET /api/v1/inventory ──
fastify.get('/api/v1/inventory', async (req, reply) => {
  const drugs = db.prepare(`
    SELECT * FROM pharmacy_inventory WHERE is_active = 1 ORDER BY nama_dagang ASC
  `).all();
  return { success: true, data: drugs };
});

// ── GET /api/v1/inventory/search ──
fastify.get('/api/v1/inventory/search', async (req, reply) => {
  const { q = '', limit = 20 } = req.query;
  if (q.length < 1) return { success: true, data: [] };

  const term = `%${q}%`;
  const drugs = db.prepare(`
    SELECT * FROM pharmacy_inventory 
    WHERE is_active = 1 AND (
      nama_dagang LIKE ? OR nama_generik LIKE ? OR zat_aktif LIKE ? OR kode_obat LIKE ? OR kode_bpjs LIKE ?
    )
    ORDER BY nama_dagang ASC
    LIMIT ?
  `).all(term, term, term, term, term, Number(limit));

  return { success: true, data: drugs };
});

// ── GET /api/v1/patients ──
fastify.get('/api/v1/patients', async (req, reply) => {
  const { q = '', limit = 20 } = req.query;
  if (q.length < 1) {
    const patients = db.prepare('SELECT * FROM patients ORDER BY nama_lengkap ASC LIMIT ?').all(Number(limit));
    return { success: true, data: patients };
  }
  const term = `%${q}%`;
  const patients = db.prepare(`
    SELECT * FROM patients WHERE nama_lengkap LIKE ? OR no_rekam_medis LIKE ? OR nik LIKE ? ORDER BY nama_lengkap ASC LIMIT ?
  `).all(term, term, term, Number(limit));
  return { success: true, data: patients };
});

// ── GET /api/v1/users ──
fastify.get('/api/v1/users', async (req, reply) => {
  const { role } = req.query;
  let query = 'SELECT id, nama_lengkap, username, role FROM users WHERE is_active = 1';
  const params = [];
  if (role) { query += ' AND role = ?'; params.push(role); }
  query += ' ORDER BY nama_lengkap ASC';
  return { success: true, data: db.prepare(query).all(...params) };
});

// ── SPA fallback ──
fastify.setNotFoundHandler((req, reply) => {
  if (req.url.startsWith('/api/')) {
    return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint tidak ditemukan' } });
  }
  // SPA routing fallback
  return reply.sendFile('index.html');
});

// ── Start ──
try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`\n🏥 PharmaXpress Server berjalan di http://localhost:${PORT}\n`);
} catch (err) {
  console.error(err);
  process.exit(1);
}
