# Roadmap Pengembangan: Web Remedial Matriks Kelas XI

Dokumen ini merupakan rencana pengembangan (*engineering & product roadmap*) berdasarkan [product_requirements_document_web_remedial_matriks.md](./product_requirements_document_web_remedial_matriks.md) untuk membangun aplikasi **Web Remedial Matriks Kelas XI (Matematika Tingkat Lanjut)** yang mengacu pada **PH XI.2 (Tipe A & Tipe B)**.

---

## Ringkasan Arsitektur & Prinsip Teknis

* **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS (pendekatan *Mobile-First*).
* **Math Rendering:** KaTeX (`katex`) untuk notasi matriks, transpos ($B^T$), determinan, dan invers ($A^{-1}$).
* **Math & Generator Engine:** Modul murni TypeScript (tanpa ketergantungan UI) dengan aritmetika pecahan eksak (*rational number arithmetic*) agar tidak terjadi *floating-point error*, determinan dijamin $\neq 0$, dan solusi rapi.
* **Backend & Database:** Supabase (PostgreSQL + Auth untuk Guru + Row Level Security) untuk penyimpanan sesi, nilai, pengaturan remedial, dan analitik butir soal.
* **Testing:** Vitest untuk *unit test* generator soal & *auto-grading* (kritis untuk akurasi matematika), serta uji responsivitas pada layar *smartphone*.

---

## Fase 0: Fondasi Proyek & Keputusan Desain
**Target:** Menyiapkan fondasi teknis dan menutup ambiguitas spesifikasi sebelum masuk ke implementasi fitur.

### Deliverable
- [ ] **Inisialisasi Repositori & Tech Stack:** Setup Next.js + TypeScript + Tailwind CSS + KaTeX + Vitest.
- [ ] **Spesifikasi Aturan Penilaian (Scoring Rubric):**
  - Menetapkan bobot nilai untuk 6 kompetensi (misal: total 100 poin dengan *partial credit* pada soal multi-bagian seperti No. 4 dan No. 5).
  - Menetapkan aturan normalisasi input (misal: menerima pecahan `1/2`, `-2/5`, desimal ekuivalen opsional, dan format Rupiah seperti `15000` / `15.000` / `Rp15.000`).
- [ ] **Core Math Library (`lib/math/`):**
  - Utilitas bilangan rasional (`Fraction`: penyederhanaan FPB/GCD, penjumlahan, perkalian, perbandingan eksak, *parser* string input siswa).
  - Operasi matriks $2 \times 2$ dan $3 \times 3$ (penjumlahan, pengurangan, perkalian, transpos, determinan, kofaktor, adjoin, invers eksak).
  - *Unit test* 100% untuk operasi matriks & parser jawaban.
- [ ] **Desain UI/UX Mobile-First:** *Wireframe* singkat untuk halaman Login Siswa, Beranda Remedial, tampilan Soal + *Matrix Input Grid*, Halaman Hasil, dan Dashboard Guru.

### Kriteria Selesai (*Definition of Done*)
- Semua operasi matriks $2 \times 2$ dan $3 \times 3$ serta *parser* pecahan lulus *unit test*.
- KaTeX berhasil merender notasi matriks di layar desktop maupun *mobile* tanpa *horizontal overflow* yang merusak tata letak.

---

## Fase 1: MVP — Modul Siswa, Generator Soal Dinamis & Auto-Grading
**Target:** Aplikasi *Single-Page / Standalone* yang sudah bisa diuji coba langsung oleh siswa dan guru untuk memvalidasi akurasi soal, kenyamanan *input grid*, dan *auto-grading*.

### Deliverable
- [ ] **Komponen `MatrixInputGrid`:**
  - Mendukung ukuran $2 \times 2$ dan $3 \times 3$ dengan kurung matriks visual yang rapi.
  - Mendukung input angka negatif dan pecahan (misal `-2/5`).
  - Navigasi keyboard cepat (`Tab`, `Shift+Tab`, dan tombol panah).
  - Nyaman digunakan di *smartphone* (ukuran *tap target* memadai, tidak memicu *zoom* otomatis di iOS/Android).
- [ ] **Dynamic Question Generator (6 Kompetensi PH XI.2):**
  1. **Kompetensi 1 — Kesamaan, Penjumlahan & Pengurangan Matriks:** Variasi Tipe A ($P + Q - R = S$) & Tipe B ($K + L = M$) dengan input variabel $x, y, z$ dan ekspresi akhir.
  2. **Kompetensi 2 — Operasi Matriks, Transpos & Perkalian Invers ($2 \times 2$):** Variasi Tipe A ($2A - B^T = C$) & Tipe B ($A^{-1} \times B$) dengan determinan $\neq 0$ dan hasil bulat/rapi.
  3. **Kompetensi 3 — Persamaan Matriks & Sifat Determinan ($2 \times 2$):** Variasi Tipe A ($A \cdot M = B$) & Tipe B ($\det(A+B)^2$).
  4. **Kompetensi 4 — Determinan, Adjoin & Invers Matriks ($3 \times 3$):** Generator matriks non-singular dengan $|\det(A)|$ kecil (misal $1 \le |\det(A)| \le 6$) agar invers mudah dihitung; multi-input: $\det(A)$, $\text{Adj}(A)$, dan $A^{-1}$.
  5. **Kompetensi 5 — Aplikasi Matriks pada SPLDV (Soal Cerita 2 Variabel):** Template cerita (Koperasi Siswa / Tiket Pentas Seni) dengan harga kelipatan Rp500/Rp1.000; input bertahap: matriks $A \cdot X = B$, nilai $x, y$, dan total harga pembelian baru.
  6. **Kompetensi 6 — Aplikasi Matriks pada SPLTV (Soal Cerita 3 Variabel):** Template cerita (Toko Kue Tradisional) dengan determinan $\neq 0$ dan solusi harga bulat positif kelipatan Rp500/Rp1.000.
- [ ] **Auto-Grading Engine:**
  - Evaluasi otomatis untuk jawaban skalar, ekspresi, *grid* matriks, dan soal bertahap.
  - Perhitungan skor akhir, status **TUNTAS** ($\ge \text{KKM}$) atau **BELUM TUNTAS**, dan rincian benar/salah per nomor.
- [ ] **Alur Ujian Remedial Dasar:**
  - Form identitas siswa sementara (Nama, Kelas, NIS).
  - Navigasi 6 soal, *timer* hitung mundur, konfirmasi kumpulkan jawaban, dan halaman hasil instan beserta kunci jawaban.

### Kriteria Selesai (*Definition of Done*)
- 1.000 iterasi *fuzz/property testing* pada keenam generator menghasilkan 0 matriks singular ($\det = 0$), 0 pembagian nol, dan 100% solusi sesuai batasan (bulat positif/kelipatan Rupiah untuk SPLDV/SPLTV).
- Siswa dapat menyelesaikan 1 sesi penuh (6 soal) di *smartphone* maupun laptop dan langsung mendapatkan skor akurat.

---

## Fase 2: Integrasi Backend, Autentikasi & Dashboard Guru (Admin)
**Target:** Menghubungkan aplikasi ke database agar nilai siswa terekam aman, guru dapat mengelola sesi remedial, dan rekap nilai siap diekspor.

### Deliverable
- [ ] **Skema Database (Supabase PostgreSQL) & Keamanan (RLS):**
  - Tabel `remedial_sessions` (kode akses/token, kelas, KKM default 75, durasi ujian, *max attempts*, status aktif, opsi wajib latihan).
  - Tabel `students` (NIS, nama, kelas).
  - Tabel `attempts` (relasi siswa & sesi, mode latihan/ujian, *seed* soal, jawaban siswa, skor per nomor, skor total, waktu mulai/selesai, status KKM).
  - Kebijakan *Row Level Security* (RLS): siswa hanya dapat mengakses/mengirim sesi miliknya; guru memiliki akses penuh pada kelasnya.
- [ ] **Akses Masuk Siswa & Autentikasi Guru:**
  - Siswa masuk dengan NIS/Nama + Kode Remedial/Token Kelas (validasi token & sisa *max attempts*).
  - Guru login menggunakan akun Admin (email & password).
- [ ] **Persistensi Sesi Ujian:**
  - Menyimpan *seed* soal dan progres jawaban agar *refresh* halaman atau koneksi terputus sementara tidak mengacak ulang soal atau mereset *timer*.
  - Validasi waktu & perhitungan skor dilakukan/diverifikasi di sisi server (*server-side grading*) untuk mencegah manipulasi di browser.
- [ ] **Dashboard Monitoring Guru:**
  - Halaman **Pengaturan Remedial** (ubah KKM, durasi, *max attempts*, buka/tutup kode kelas).
  - Tabel monitoring siswa: Nama, NIS, Kelas, Waktu Pengerjaan, Nilai Tertinggi, Jumlah Percobaan, Status KKM (**Tuntas / Belum Tuntas**), dengan filter kelas & pencarian.
  - **Ekspor Data:** Unduh rekap nilai ke format `.csv` / Excel (`.xlsx`) siap olah.

### Kriteria Selesai (*Definition of Done*)
- Nilai siswa langsung muncul di Dashboard Guru secara *real-time* setelah klik **Kumpulkan Jawaban**.
- Batas *max attempts* dan durasi ujian tervalidasi secara konsisten bahkan saat halaman di-*refresh*.
- File `.csv` hasil ekspor dapat dibuka rapi di Microsoft Excel / Google Sheets (termasuk format karakter/delimiter yang sesuai).

---

## Fase 3: Mode Latihan Interaktif, Hint Bertahap & Analitik Guru
**Target:** Meningkatkan efektivitas pembelajaran mandiri siswa (KPI $\ge 85\%$ tuntas) dan memberi wawasan evaluasi bagi guru.

### Deliverable
- [ ] **Mode Latihan (Prasyarat / Mandiri):**
  - Siswa dapat memilih berlatih per topik (dari 6 kompetensi) atau paket campuran tanpa *timer*.
  - Opsi pengaturan guru untuk mewajibkan siswa menyelesaikan Mode Latihan sebelum membuka Mode Ujian Remedial.
- [ ] **Sistem Hint Bertahap (*Progressive Hints*):**
  - Minimal 2–3 level petunjuk per kompetensi (misal: Level 1 rumus dasar, Level 2 langkah penyusunan matriks/kofaktor, Level 3 petunjuk perhitungan spesifik sesuai angka acak siswa).
- [ ] **Pembahasan Langkah demi Langkah (*Dynamic Step-by-Step Solution*):**
  - Pembahasan digenerasi secara dinamis mengikuti angka acak yang diterima siswa (bukan teks statis), dirender rapi menggunakan KaTeX.
- [ ] **Analitik Butir Soal (Dashboard Guru):**
  - Grafik/tabel persentase ketuntasan per kompetensi (Kompetensi 1 s.d. 6) untuk mengidentifikasi materi tersulit.
  - Ringkasan metrik kelas: persentase siswa tuntas, rata-rata percobaan hingga tuntas, dan daftar siswa yang belum memulai remedial.

### Kriteria Selesai (*Definition of Done*)
- Setiap kompetensi memiliki minimal 2 tingkat *hint* dan pembahasan langkah demi langkah yang sesuai 100% dengan angka acak soal.
- Dashboard Guru menampilkan pemeringkatan topik dengan tingkat kesalahan tertinggi berdasarkan data `attempts`.

---

## Fase 4: Pengujian Lapangan (UAT), Optimasi & Peluncuran
**Target:** Memastikan aplikasi siap dipakai serentak oleh satu kelas/angkatan saat jadwal remedial resmi.

### Deliverable
- [ ] **Verifikasi Matematis oleh Guru:** Review sampel 10 variasi soal dari tiap kompetensi bersama guru Matematika Kelas XI untuk memastikan kesesuaian dengan PH XI.2.
- [ ] **Uji Coba Terbatas (Pilot / UAT):** Uji coba pada 5–10 siswa menggunakan berbagai perangkat (HP Android, iPhone, laptop) untuk mengecek performa, keterbacaan matriks $3 \times 3$, dan kejelasan UX.
- [ ] **Deployment & Monitoring:** Deploy ke produksi (misal: Vercel + Supabase), konfigurasi *error logging*, dan uji beban ringan (30–40 siswa mengerjakan bersamaan).

---

## Risiko Teknis & Mitigasi

| Risiko | Dampak | Mitigasi |
| :--- | :--- | :--- |
| **Kesalahan pembulatan *floating-point*** pada invers $3 \times 3$ | Jawaban benar siswa dinilai salah | Gunakan aritmetika bilangan rasional eksak (`Fraction`) di seluruh generator dan *auto-grader*. |
| **Angka terlalu besar / pecahan rumit** pada matriks $3 \times 3$ | Siswa frustrasi dan kesulitan menghitung manual | Batasi rentang elemen matriks dan pilih matriks dengan $|\det(A)| \le 6$ (atau matriks unimodular/terkontrol) melalui generator konstruktif. |
| **Input grid $3 \times 3$ sempit di layar HP** | Salah ketik dan UX buruk | Desain *mobile-first* dengan ukuran sel fleksibel, *scroll* terkontrol bila perlu, dan dukungan tombol bantu `-` dan `/` jika diperlukan. |
| **Siswa me-refresh browser untuk mencari soal mudah / reset timer** | Integritas ujian remedial terganggu | Ikat *seed* soal dan waktu mulai (`started_at`) ke database sejak ujian dimulai; *refresh* memuat ulang soal & sisa waktu yang sama. |
| **Ambiguitas format jawaban** (misal `15.000` vs `15000` atau `2/4` vs `1/2`) | Siswa kehilangan poin padahal konsep benar | Normalisasi input di *parser* (abaikan spasi, simbol `Rp`, pemisah ribuan pada soal Rupiah, dan samakan nilai pecahan ekuivalen). |

---

## Keputusan Terbuka (Perlu Konfirmasi Sebelum Fase 1/2)

1. **Bobot Nilai & Partial Credit:** Apakah keenam soal memiliki bobot sama, atau soal kompleks (Invers $3 \times 3$ dan SPLDV/SPLTV) memiliki bobot lebih besar dengan penilaian parsial?
2. **Aturan Format Invers $3 \times 3$:** Apakah siswa wajib mengisi pecahan sederhana (misal `1/2`), atau pecahan belum disederhanakan (`2/4`) dan desimal (`0.5`) juga diterima?
3. **Prasyarat Mode Latihan:** Apakah siswa **wajib** menyelesaikan Mode Latihan terlebih dahulu sebelum bisa memulai Ujian Remedial, atau sifatnya opsional (dapat diatur per sesi oleh guru)?
