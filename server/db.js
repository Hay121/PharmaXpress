import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'pharmaxpress.db');

let db;

export function getDb() {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');
    db.exec('PRAGMA busy_timeout = 5000');
    
    // Polyfill for transaction
    db.transaction = (fn) => {
      return (...args) => {
        db.exec('BEGIN IMMEDIATE');
        try {
          const result = fn(...args);
          db.exec('COMMIT');
          return result;
        } catch (err) {
          db.exec('ROLLBACK');
          throw err;
        }
      };
    };

    initSchema(db);
  }
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nama_lengkap TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL CHECK (role IN ('APOTEKER', 'DOKTER', 'ADMIN')),
      is_active INTEGER NOT NULL DEFAULT 1,
      last_login TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      nama_lengkap TEXT NOT NULL,
      no_rekam_medis TEXT NOT NULL UNIQUE,
      nik TEXT NOT NULL UNIQUE,
      tanggal_lahir TEXT NOT NULL,
      jenis_kelamin TEXT NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
      alamat TEXT,
      no_telepon TEXT,
      no_bpjs TEXT,
      is_synthetic INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pharmacy_inventory (
      id TEXT PRIMARY KEY,
      kode_obat TEXT NOT NULL UNIQUE,
      nama_dagang TEXT NOT NULL,
      nama_generik TEXT,
      zat_aktif TEXT,
      kekuatan_dosis TEXT,
      bentuk_sediaan TEXT NOT NULL,
      stok_saat_ini INTEGER NOT NULL DEFAULT 0,
      stok_minimum INTEGER NOT NULL DEFAULT 20,
      satuan TEXT NOT NULL,
      harga_satuan REAL NOT NULL DEFAULT 0,
      kode_bpjs TEXT,
      lokasi_rak TEXT,
      tanggal_kadaluarsa TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      nomor_resep TEXT NOT NULL UNIQUE,
      patient_id TEXT NOT NULL REFERENCES patients(id),
      prescribing_doctor_id TEXT NOT NULL REFERENCES users(id),
      dispensing_pharmacist_id TEXT REFERENCES users(id),
      priority TEXT NOT NULL DEFAULT 'RAWAT_JALAN' CHECK (priority IN ('CITO', 'RAWAT_INAP', 'RAWAT_JALAN')),
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'DISPENSED', 'RETURNED', 'CANCELLED')),
      catatan_dokter TEXT,
      asal_poli TEXT,
      waktu_masuk TEXT NOT NULL DEFAULT (datetime('now')),
      waktu_mulai_proses TEXT,
      waktu_selesai TEXT,
      durasi_proses_detik INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prescription_items (
      id TEXT PRIMARY KEY,
      prescription_id TEXT NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
      drug_id TEXT NOT NULL REFERENCES pharmacy_inventory(id),
      substituted_from_drug_id TEXT REFERENCES pharmacy_inventory(id),
      quantity_prescribed INTEGER NOT NULL,
      quantity_dispensed INTEGER NOT NULL DEFAULT 0,
      dosis_instruksi TEXT,
      status_item TEXT NOT NULL DEFAULT 'READY' CHECK (status_item IN ('READY', 'OUT_OF_STOCK', 'SUBSTITUTED', 'DISPENSED')),
      catatan_apoteker TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS stock_transactions (
      id TEXT PRIMARY KEY,
      drug_id TEXT NOT NULL REFERENCES pharmacy_inventory(id),
      tipe_transaksi TEXT NOT NULL CHECK (tipe_transaksi IN ('DISPENSE', 'RESTOCK', 'ADJUSTMENT', 'RETURN')),
      quantity INTEGER NOT NULL,
      stok_sebelum INTEGER NOT NULL,
      stok_sesudah INTEGER NOT NULL,
      reference_id TEXT,
      performed_by TEXT NOT NULL REFERENCES users(id),
      catatan TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS drug_substitutions (
      id TEXT PRIMARY KEY,
      drug_id TEXT NOT NULL REFERENCES pharmacy_inventory(id),
      substitute_drug_id TEXT NOT NULL REFERENCES pharmacy_inventory(id),
      urutan_prioritas INTEGER NOT NULL DEFAULT 1,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_patients_nama ON patients(nama_lengkap);
    CREATE INDEX IF NOT EXISTS idx_patients_no_rm ON patients(no_rekam_medis);
    CREATE INDEX IF NOT EXISTS idx_inventory_nama ON pharmacy_inventory(nama_dagang);
    CREATE INDEX IF NOT EXISTS idx_inventory_generik ON pharmacy_inventory(nama_generik);
    CREATE INDEX IF NOT EXISTS idx_inventory_kode ON pharmacy_inventory(kode_obat);
    CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
    CREATE INDEX IF NOT EXISTS idx_prescriptions_priority ON prescriptions(priority, waktu_masuk);
    CREATE INDEX IF NOT EXISTS idx_rx_items_prescription ON prescription_items(prescription_id);
    CREATE INDEX IF NOT EXISTS idx_stock_tx_drug ON stock_transactions(drug_id, created_at);
  `);
}

export default getDb;
