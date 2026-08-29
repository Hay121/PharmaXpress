# 🏥 PharmaXpress — High-Velocity Pharmacy Workflow Engine

**RS Indriati Boyolali · Open Hospital Challenge**

> Sistem manajemen farmasi berkecepatan tinggi yang dirancang untuk menggantikan sistem Java legacy. Target: memangkas waktu proses resep dari ~4-6 menit menjadi di bawah 45 detik.

---

## ⚡ Quick Start (3 langkah)

```bash
# 1. Install dependencies
npm install

# 2. Seed database dengan data sintetis
npm run seed

# 3. Jalankan development server
npm run dev
```

Buka **http://localhost:5173** di browser.

> ⚠️ **DATA SINTETIS:** Seluruh data pasien, obat, dan resep adalah data buatan (Faker.js). Tidak ada data medis asli.

---

## 📋 Fitur Utama

### 🔥 Predictive Stock Validation
- Stok obat divalidasi otomatis saat resep masuk ke antrean
- Obat habis langsung ditandai merah dengan opsi substitusi generik
- Zero kejadian "sudah diproses, ternyata habis"

### 🔍 Zero-Latency Fuzzy Search (Ctrl+K)
- Pencarian obat instan (<50ms) di sisi klien menggunakan Fuse.js
- Toleran typo: "amksilin" tetap menemukan "Amoxicillin"
- Mencari berdasarkan nama dagang, generik, zat aktif, kode obat, kode BPJS

### 📊 Smart Priority Queue
- Resep otomatis dikategorikan: 🔴 CITO / 🟡 Rawat Inap / 🟢 Rawat Jalan
- Timer elapsed real-time per resep
- Notifikasi visual untuk resep urgent

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Aksi |
|:---|:---|
| `Ctrl+K` | Buka pencarian global |
| `Ctrl+N` | Buat resep baru |
| `↑` / `↓` | Navigasi item obat |
| `Alt+S` | Buka panel substitusi |
| `Alt+A` | Approve & Dispense |
| `Alt+R` | Kembalikan resep ke dokter |
| `Enter` | Konfirmasi dialog |
| `Escape` | Tutup modal/dialog |

---

## 🛠️ Tech Stack

| Layer | Teknologi | Justifikasi |
|:---|:---|:---|
| Frontend | React 18 + Vite | SPA cepat, ekosistem besar |
| State | Zustand | Minimal, zero boilerplate |
| Search | Fuse.js | Client-side fuzzy search |
| Backend | Fastify (Node.js) | ~3x lebih cepat dari Express |
| Database | SQLite (better-sqlite3) | Zero config, file-based, WAL mode |
| Real-time | WebSocket | Push notification untuk resep baru |

---

## 📁 Struktur Proyek

```
pharmaxpress/
├── server/
│   ├── index.js          # Fastify API server
│   ├── db.js             # Database setup & schema
│   ├── seed.js           # Data sintetis generator
│   └── pharmaxpress.db   # SQLite database (auto-created)
├── src/
│   ├── main.jsx          # React entry
│   ├── App.jsx           # Root component
│   ├── api.js            # API client
│   ├── store.js          # Zustand store
│   ├── index.css         # Design system
│   └── components/
│       ├── LoginPage.jsx
│       ├── TopBar.jsx
│       ├── Sidebar.jsx
│       ├── Workspace.jsx
│       ├── SearchModal.jsx
│       ├── NewRxForm.jsx
│       ├── ConfirmDialog.jsx
│       ├── SuccessAnimation.jsx
│       ├── ElapsedTimer.jsx
│       └── BottomBar.jsx
├── package.json
├── vite.config.js
└── README.md
```

---

## 🐳 Docker Deployment

```bash
docker compose up -d
# Akses: http://localhost:3000
```

---

## 📊 Metrik Target

| Metrik | Legacy Java | PharmaXpress |
|:---|:---|:---|
| Waktu proses resep | 4-6 menit | <45 detik |
| Pencarian obat | ~25 detik | <3 detik |
| Resep CITO | ~8-10 menit | <2 menit |
| "Obat habis saat proses" | ~15x/hari | 0x/hari |

---

## 👥 Tim & Lisensi

Dibangun untuk **Open Hospital Challenge** — RS Indriati Boyolali, diorganisir oleh Helden Inc.

Seluruh data bersifat sintetis. Tidak ada data medis asli yang digunakan.
