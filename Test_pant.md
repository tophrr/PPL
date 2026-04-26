**_Test Plan_** **(Rencana Pengujian)
Komponen Deskripsi
Objektif**
Memvalidasi seluruh fungsionalitas kritis
(Total 59 story points) untuk memastikan
sistem siap rilis versi 1.
**Ruang Lingkup** Pengujian mencakup alur integrasi AI,
sinkronisasi _real-time_ database Convex, dan
keamanan RBAC
**Lingkungan Uji** _Runtime_ menggunakan **Bun** dengan
_deployment_ pada infrastruktur _serverless_
**Vercel
Kriteria Kelulusan** Semua fitur prioritas tinggi ( _High Priority_ )
harus lulus 100% tanpa kegagalan pada
fungsi _Auto-save_ dan Segregasi Data
**Alat (** **_Tooling_** **)** Vitest/Bun _Test_ untuk Unit/ _Integration Test_
dan _Playwright_ untuk pengujian E2E
( _End-to-End_ )
**_Test Cases_**

**1. Modul:** **_Authentication & Role Management (_** **TC-AUTH)**
    **ID Skenario Hasil yang diharapkan**
       **(CoA)
TC-AUTH-1** Verifikasi Login/Logout Pengguna dapat masuk
menggunakan email dan
password yang valid serta
keluar dari sistem dengan
menghapus sesi.
**TC-AUTH-2** Validasi _Role-Based Access
Control (_ RBAC) ketat
Sistem membatasi akses,
sehingga:
- **_Admin_** : Memiliki akses
penuh
**_- Creator_** **:** Hanya dapat
membuat/mengedit draf
& jadwal
**_- Manager_** : Menyetujui
draf & melihat analitik
**_- Client_** : Hanya dapat
melihat _brand_ sendiri dan
_Approve/Reject_
**TC-AUTH-3** _Session Management_ Sesi tetap aktif dalam jangka


```
waktu tertentu sehingga
pengguna tidak perlu login
ulang saat navigasi halaman
```
**2. Modul: AI-** **_Powered Content Planning_** **(TC-AI)**
    **ID Skenario Hasil yang Diharapkan**
       **(CoA)
TC-AI-1** Validasi _Input Client_ - _side_ Muncul pesan error jika field
kosong atau melebihi batas
karakter, mencegah
pengiriman prompt tidak valid
ke API eksternal
**TC-AI-2** _State Management Fetching_ Menampilkan _loading spinner_
saat proses AI berjalan dan
tombol menjadi tidak aktif
( _blocked)_ untuk mencegah
klik ganda
**TC-AI-3** _Error Handling LLM_ Jika API _timeout_ atau
_rate-limit_ , muncul _toast
message_ ramah tanpa
menghapus data yang sudah
diketik pengguna
**TC-AI-4** _Manual Edit Functionality_ Hasil AI dapat diedit secara
manual melalui komponen
_Text Editor_ yang disediakan
**3. Modul:** **_Scheduler & Approval System_** **(TC-SCH)**
    **ID Skenario Hasil yang Diharapkan**
       **(CoA)
TC-SCH-1** Validasi _Drag-and-Drop_ Sistem menolak pemindahan
jadwal konten ke tanggal di
masa lalu melalui validasi sisi
klien.
**TC-SCH-2** _Real-time Subscription_ Perubahan status
( _Approve/Reject)_ dari Klien
langsung ter- _render_ di layar
agensi secara instan tanpa
perlu _refresh halaman_
**TC-SCH-3** _Optimistic UI Update_ Antarmuka merespons


```
perubahan secara instan
sebelum konfirmasi server ,
memberikan umpan balik
( rollback) jika gagal koneksi
```
**4. Modul:** **_Centralized Analytics Dashboard_** **(TC-ANL)**
    **ID Skenario Hasil yang Diharapkan**
       **(CoA)
TC-ANL-1** Validasi _Date Picker_ Sistem menolak jika _End
Date_ diatur lebih awal
daripada _Start Date_
**TC-ANL-2** _State Persistence Filter_ Preferensi filter tersimpan di
_Local/Session Storage_ ,
konteks tidak hilang saat
navigasi maju-mundur atau
koneksi terputus sesaat
**TC-ANL-3** _Empty State UI Handling_ Grafik tidak pecah saat data
bernilai nol, sistem me- _render_
desain _Empty State_ yang
terstruktur


