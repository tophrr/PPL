# Test Plan (Rencana Pengujian)

## Objective

- Memvalidasi seluruh fungsionalitas kritis (Total 59 story points) untuk memastikan sistem siap rilis versi 1.

## Scope (Ruang Lingkup)

- Pengujian mencakup alur integrasi AI, sinkronisasi real-time dengan database Convex, dan keamanan RBAC.

## Test Environment (Lingkungan Uji)

- Runtime: Bun
- Deployment: serverless (Vercel)

## Acceptance Criteria (Kriteria Kelulusan)

- Semua fitur prioritas tinggi (High Priority) harus lulus 100%.
- Fungsi Auto-save dan Segregasi Data harus bekerja tanpa kegagalan.

## Tooling (Alat)

- Unit / Integration: Vitest (Bun)
- End-to-End: Playwright

---

## Test Cases (Test Scenarios)

### 1) Authentication & Role Management (TC-AUTH)

- **TC-AUTH-1 — Login / Logout**: Pengguna dapat masuk menggunakan email dan password valid, serta logout menghapus sesi.
- **TC-AUTH-2 — RBAC Enforcement**: Sistem membatasi akses menurut peran:
  - Admin: akses penuh
  - Creator: hanya membuat/mengedit draf & jadwal
  - Manager: menyetujui draf & melihat analitik
  - Client: melihat brand sendiri dan melakukan Approve/Reject
- **TC-AUTH-3 — Session Management**: Sesi tetap aktif selama waktu tertentu sehingga pengguna tidak perlu login ulang saat navigasi halaman.

### 2) AI-Powered Content Planning (TC-AI)

- **TC-AI-1 — Input Validation**: Tampilkan error jika field kosong atau melebihi batas karakter; mencegah pengiriman prompt tidak valid ke API eksternal.
- **TC-AI-2 — State Management / Fetching**: Tampilkan loading spinner selama proses AI dan nonaktifkan tombol untuk mencegah klik ganda.
- **TC-AI-3 — LLM Error Handling**: Saat timeout atau rate-limit, tampilkan toast ramah tanpa menghapus data yang sudah diketik.
- **TC-AI-4 — Manual Edit**: Hasil AI dapat diedit secara manual melalui komponen Text Editor.

### 3) Scheduler & Approval System (TC-SCH)

- **TC-SCH-1 — Drag-and-Drop Validation**: Tolak pemindahan jadwal konten ke tanggal masa lalu (validasi sisi klien).
- **TC-SCH-2 — Real-time Subscription**: Perubahan status (Approve/Reject) dari Klien langsung ter-render di layar agensi tanpa perlu refresh.
- **TC-SCH-3 — Optimistic UI Update**: UI merespons perubahan secara instan sebelum konfirmasi server dan menyediakan rollback jika gagal.

### 4) Centralized Analytics Dashboard (TC-ANL)

- **TC-ANL-1 — Date Picker Validation**: Tolak End Date yang lebih awal daripada Start Date.
- **TC-ANL-2 — State Persistence (Filters)**: Preferensi filter tersimpan di Local/Session Storage; konteks tidak hilang saat navigasi atau koneksi singkat terputus.
- **TC-ANL-3 — Empty State Handling**: Grafik dan komponennya tidak rusak saat data bernilai nol; tampilkan desain empty state yang terstruktur.

---

Jika Anda ingin, saya bisa juga:

- Menambahkan checklist per test case dengan langkah langkah yang dapat dieksekusi di Vitest/Playwright.
- Menambahkan ID traceable ke setiap skenario untuk integrasi CI.
