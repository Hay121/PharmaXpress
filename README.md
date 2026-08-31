# 🚀 PharmaXpress

<p align="center">
  <b>Sistem Informasi Manajemen Farmasi & Apotek Next-Gen.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
</p>

---

## 🎯 Visi & Filosofi

**PharmaXpress** bukanlah sekadar prototipe MVP; ini adalah mahakarya rekayasa antarmuka standar *Enterprise* yang dirancang untuk mengatasi latensi operasional di lingkungan medis bertekanan tinggi. 

> *Kesehatan pasien tidak bisa menunggu. Setiap detik latensi perangkat lunak adalah risiko medis.*

Dibangun dengan prinsip desain **SaaS kelas dunia**, PharmaXpress berfokus pada kecepatan, sinkronisasi *state* tanpa celah (zero-latency), dan reduksi beban kognitif (menggunakan prinsip *Gestalt UI*). Kami mengeliminasi kekacauan visual untuk meminimalkan *human error* dan memastikan perbekalan farmasi dikelola dengan presisi absolut.

---

## ✨ Arsitektur Inti & Fitur Unggulan

Kami tidak menggunakan sekadar *mockup* mati. Di bawah kap mesinnya, PharmaXpress memiliki ekosistem logika yang bernafas dan bereaksi secara instan:

* 🧠 **The Global Brain (State Management):** Menggunakan kekuatan *React Context API* sebagai *ledger* transaksi waktu nyata (*real-time transaction ledger*). Setiap tindakan dispensing, penambahan stok, dan pembuatan resep divalidasi dan direfleksikan secara instan tanpa perlu memuat ulang halaman.
* 🎨 **Gestalt Unification UX:** Desain minimalis tanpa batas (*borderless*) yang dirancang khusus untuk mengurangi beban kognitif. Estetika dan hierarki tipografi mencerminkan standar perangkat lunak modern tingkat tinggi (setara dengan Vercel atau Linear).
* 📦 **Supply Chain Sync:** Sinkronisasi rantai pasokan otomatis. Permintaan ulang stok (*Restock*) melalui modul Surat Permintaan langsung mengubah dan merevisi data pada Master Inventori secara absolut dan akurat.
* ⚡ **Real-Time Analytics:** Indikator Kinerja Utama (KPI) pada *Dashboard* dan diagram beban kerja (*workload charts*) bersifat dinamis. Metrik merespons secara langsung setiap kali ada obat yang didispensasi atau resep baru yang masuk.
* 🔐 **RBAC (Role-Based Access Control):** Batasan operasional yang tegas antara **Dokter** (Kewenangan Penulisan Resep Klinis) dan **Apoteker** (Kewenangan Dispensing & Manajemen Inventori), mensimulasikan kepatuhan total terhadap protokol keamanan rumah sakit.

---

## 💻 Tumpukan Teknologi (Tech Stack)

| Komponen | Teknologi |
| --- | --- |
| **Frontend Framework** | React.js |
| **Styling Engine** | Tailwind CSS |
| **State Management** | React Context API (*Single Source of Truth*) |
| **Icons & Assets** | Lucide React |
| **Data Export** | Native JavaScript Blob / CSV Generation Engine |

---

## 🚀 Memulai (Local Setup)

Untuk menjalankan ekosistem PharmaXpress di mesin lokal Anda, ikuti langkah instalasi standar berikut:

```bash
# 1. Klon repositori
git clone https://github.com/Hay121/PharmaXpress.git

# 2. Masuk ke dalam direktori proyek
cd pharmaxpress

# 3. Instalasi dependensi
npm install

# 4. Jalankan server pengembangan lokal (Vite)
npm run dev
```

---

## 👥 Tim & Kredit

Mahakarya MVP ini dikembangkan melalui kolaborasi komprehensif tanpa batasan hierarki.

* **Ahmad Fahmi Haykal**
* **Tangguh Reksa Hfiy**

**Event:** Solusi inovatif ini dibangun dan diserahkan secara khusus untuk kompetisi **Maua 72 Hackathon Vol.5**.
