# EXECUTIVE & TECHNICAL DECISION NOTE (ADR)
## ARSITEKTUR SISTEM INFORMASI MANAJEMEN FARMASI

### 1. DOCUMENT METADATA

| Atribut | Keterangan |
| :--- | :--- |
| **Dokumen ID** | ADR-PHARMAXPRESS-2026-08 |
| **Status Dokumen** | PRODUCTION-READY MVP (RECOMMENDED FOR DEPLOYMENT) |
| **Event Submission** | Maua 72 Hackatahon Vol.5 |
| **Target Pengguna** | Apoteker, Dokter Perujuk, Kepala Farmasi, Manajemen RS |
| **Disusun Oleh** | Ahmad Fahmi Haykal & Tangguh Reksa Hfiy |
| **Tanggal Efektif** | 31 Agustus 2026 |

---

### 2. EXECUTIVE SUMMARY & PROBLEM STATEMENT

Sistem Informasi Manajemen Rumah Sakit (SIMRS) konvensional dan modul farmasi warisan (*legacy*) sering kali terjebak dalam masalah *Cognitive Load* (beban kognitif) yang luar biasa tinggi dan fenomena *Mockup Mirage* (silo data di mana antarmuka tidak merefleksikan realitas inventori yang sesungguhnya). Tampilan antarmuka yang dipenuhi dengan elemen navigasi berlebihan, tabel statis, dan proses pemuatan halaman (*page reload*) yang berulang-ulang menciptakan latensi operasional yang berujung pada risiko *medical error* (kesalahan pengobatan) dan inefisiensi yang fatal dalam alur kerja kefarmasian. 

**PharmaXpress** hadir sebagai solusi komprehensif berupa *Single Page Application (SPA)* berbasis React.js. Dengan mengimplementasikan *Global Context API* sebagai *Single Source of Truth*, sistem ini menjamin visibilitas rantai pasokan waktu nyata (*real-time supply chain visibility*) dan status operasi tanpa latensi (*zero-latency state*). Setiap klik, penambahan stok, dan validasi resep langsung terekam dan direfleksikan ke seluruh instansi modul (Dashboard, Riwayat, Laporan) seketika itu juga, menghapus sama sekali batas antara input data pengguna dan pembaruan antarmuka.

---

### 3. PRINSIP DESAIN & ARSITEKTUR KOGNITIF

#### Blok Diagram Arsitektur

```text
+-------------------------------------------------------------+
|                     PHARMAXPRESS APP SHELL                  |
|  +-------------------------------------------------------+  |
|  |             GLOBAL CONTEXT API (ZUSTAND/REACT)        |  |
|  |                [Single Source of Truth]               |  |
|  +----+-------------------------+-------------------+----+  |
|       |                         |                   |       |
|       v                         v                   v       |
| +-----------+          +-----------------+  +-------------+ |
| | Master    | <------- | Dynamic Trans.  |  | Real-Time   | |
| | Inventory | -------> | Ledger (Logger) |  | UI / Charts | |
| +-----------+          +-----------------+  +-------------+ |
+-------------------------------------------------------------+
```

#### 4 Security & Stability Pillars

1. **The Global Brain State (Data Consistency):** Memusatkan seluruh logika antrean, stok obat, dan rekam medis ke dalam satu state manager terpusat. Manipulasi di satu titik (misalnya pengurangan stok di antrean) terhubung secara absolut dengan halaman master inventori dan laporan operasional.
2. **Gestalt Unification UX (Borderless Design):** Antarmuka dirancang mengikuti prinsip *Gestalt*, menyingkirkan garis-garis batas yang tidak perlu (*borderless*), dan memanfaatkan hirarki tipografi modern (kelas SaaS Enterprise). Mengurangi distraksi visual sehingga dokter dan apoteker dapat berfokus 100% pada data klinis pasien.
3. **Dynamic Transaction Ledger:** Jantung dari sistem log aktivitas. Semua aktivitas, baik `DISPENSE` maupun `RESTOCK`, dicatat ke dalam satu buku besar transaksional secara *real-time*. Tabel laporan tidak lagi menempelkan kolom statis secara buta, melainkan merespons dan me-render secara cerdas berdasarkan jenis objek transaksi.
4. **Zero-Latency Analytics:** Menghancurkan kebutuhan untuk penarikan data berulang (*polling/refresh*). *Dashboard KPI* dan grafik diagram batang memproses *state* terpusat pada detik yang sama transaksi terjadi, memberikan kepastian beban kerja absolut bagi kepala farmasi dan pengambil keputusan.

---

### 4. MATRIKS KELAYAKAN & EVALUASI

| Kriteria | Legacy SIMRS Modules | PharmaXpress Architecture |
| :--- | :--- | :--- |
| **Beban Kognitif** | Tinggi. UI penuh sesak, form manual multi-halaman. | Rendah. Desain Gestalt minimalis, aksi *headless*, tanpa *page-reload*. |
| **Latensi Data** | Memerlukan *refresh browser* atau AJAX *polling* lambat. | Instan. Modifikasi *Global Context* merekonsiliasi DOM seketika. |
| **Mitigasi Medical Error** | Rentan. Data stok obat bisa telat ter-sinkronisasi (Over-dispensing). | Presisi. Stok terkunci dan diverifikasi seketika sebelum tombol *Submit* aktif. |
| **Waktu Deployment** | Berminggu-minggu, dependensi *server-side rendering* yang berat. | Singkat (Produksi kilat dengan Vite, *build size* < 500KB). |

---

### 5. FITUR UNGGULAN & NILAI TAMBAH OPERASIONAL

| Fitur Repositori (Codebase Feature) | Dampak Klinis & Finansial |
| :--- | :--- |
| **Expandable Transaction Ledger** | **100% Auditability:** Detail riwayat penyerahan dengan rincian *batch* dan item obat dapat diekspansi secara instan tanpa membebani tabel utama. |
| **Real-Time Supply Chain Sync** | **Eliminates Stockouts:** Penambahan stok (SP) langsung disuntikkan ke Master Obat dan status ambang batas diperbarui seketika. Mencegah kerugian finansial akibat kekosongan tak terduga. |
| **Native Blob CSV Generation** | **Instant Offline Reporting:** Fitur ekspor langsung memproses data array JSON menjadi *buffer blob* dalam *browser*, menghasilkan dokumen CSV siap audit tanpa beban *server*. |
| **Headless UI Component Injection** | **Stabilitas Cross-Platform:** Mengganti kontrol *select* dan *input* bawaan sistem operasi dengan modul kontrol *React* buatan sendiri (Tailwind). Menjamin konsistensi estetika dan *behavior* bebas bug di perangkat dan layar mana pun. |
| **High-Fidelity Static RBAC Matrix** | **Kepatuhan Protokol Akses:** Matriks pengawasan yang memisahkan ranah akses antara Dokter, Apoteker, dan Administrator demi kepatuhan terhadap standar akreditasi KARS, memastikan integritas dan privasi data medik tetap steril. |

---

### 6. KESIMPULAN & LEMBAR PERSETUJUAN (Sign-Off)

PharmaXpress bukan sekadar sebuah proyek pengembangan peranti lunak, melainkan pergeseran paradigma tentang bagaimana logistik dan layanan kesehatan farmasi seharusnya dikelola di era informasi berkecepatan tinggi. Arsitektur yang ditawarkan menghadirkan fondasi *Enterprise-grade* yang tahan peluru, stabil, dan sepenuhnya berfokus pada pengalaman interaksi manusia. MVP ini siap untuk diadopsi sebagai tulang punggung (backbone) infrastruktur medis masa depan.

<br>

| Disusun & Diajukan Oleh | Diperiksa & Dinilai Oleh |
| :--- | :--- |
| *(Lead Architects - Maua 72 Hackatahon Vol.5)* | *(Dewan Juri Kehormatan - Maua 72 Hackatahon Vol.5)* |
| <br><br>___________________________<br>**Ahmad Fahmi Haykal**<br><br>___________________________<br>**Tangguh Reksa Hfiy** | <br><br><br><br>___________________________<br>*(Tanda Tangan & Nama Terang)* |

<br>
