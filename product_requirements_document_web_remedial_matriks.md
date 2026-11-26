# Product Requirements Document (PRD): Web Remedial Matriks Kelas XI

## 1. Ringkasan Eksekutif
**Web Remedial Matriks** adalah aplikasi web interaktif yang dirancang khusus untuk membantu siswa Kelas XI (Mata Pelajaran Matematika Tingkat Lanjut) yang belum mencapai Kriteria Ketuntasan Minimal (KKM) pada Penilaian Harian (PH) materi Matriks. 

Aplikasi ini menyediakan latihan soal dan ujian remedial yang strukturnya mengacu langsung pada **PH XI.2 (Tipe A dan Tipe B)**, dilengkapi dengan generator angka acak (*dynamic question generator*) agar setiap siswa mendapatkan variasi angka yang berbeda namun dengan tingkat kesulitan dan kompetensi yang setara.

---

## 2. Tujuan Produk & Metrik Keberhasilan
### Tujuan Utama
1. **Memfasilitasi Pembelajaran Mandiri:** Memberikan siswa ruang untuk berlatih kembali materi matriks yang belum dikuasai dengan umpan balik langsung (*instant feedback*).
2. **Mencegah Plagiarisme saat Remedial:** Menggunakan variasi angka yang diacak secara algoritmik (namun tetap menghasilkan jawaban bulat/rapi) sehingga siswa fokus memahami konsep.
3. **Efisiensi Koreksi bagi Guru:** Menyediakan sistem penilaian otomatis (*auto-grading*) untuk jawaban skalar maupun elemen matriks, serta rekapitulasi nilai yang siap diekspor.

### Metrik Keberhasilan (KPI)
* $\ge 85\%$ siswa remedial berhasil mencapai nilai KKM setelah menyelesaikan sesi latihan dan ujian remedial.
* Waktu koreksi guru berkurang hingga $90\%$ berkat sistem penilaian otomatis.
* Tingkat penyelesaian (*completion rate*) sesi remedial mencapai $100\%$ sebelum tenggat waktu.

---

## 3. Target Pengguna
1. **Siswa Kelas XI (Peserta Remedial):**
   * *Kebutuhan:* Tampilan matriks yang rapi dan mudah dibaca, kolom input jawaban matriks yang intuitif (bukan sekadar teks biasa), petunjuk pengerjaan (*hint*) saat latihan, dan kepastian status ketuntasan.
2. **Guru Matematika (Admin):**
   * *Kebutuhan:* Memantau siswa mana yang sudah/belum mengerjakan remedial, melihat analisis butir soal mana yang paling banyak salah, mengatur KKM/batas waktu, dan mengunduh nilai akhir.

---

## 4. Pemetaan Materi & Spesifikasi Bank Soal
Berdasarkan dokumen **PH XI.2 (Tipe A & B)**, aplikasi wajib mencakup **6 kompetensi inti** berikut. Setiap kompetensi akan memiliki *template* soal yang angkanya dapat diacak (*parameterized*):

| No | Kompetensi / Topik | Referensi PH XI.2 | Bentuk Output / Input Jawaban |
| :--- | :--- | :--- | :--- |
| **1** | **Kesamaan, Penjumlahan & Pengurangan Matriks** | Tipe A No. 1 ($P + Q - R = S$) & Tipe B No. 1 ($K + L = M$) | Input angka untuk nilai variabel ($x, y, z$) dan hasil operasi akhir (misal: $2x - y + z$). |
| **2** | **Operasi Matriks, Transpos, & Perkalian Invers ($2 \times 2$)** | Tipe A No. 2 ($2A - B^T = C$) & Tipe B No. 2 ($A^{-1} \times B$) | Input angka variabel atau *grid* matriks $2 \times 2$. |
| **3** | **Persamaan Matriks & Sifat Determinan ($2 \times 2$)** | Tipe A No. 3 ($A \cdot M = B$) & Tipe B No. 3 ($\det(A+B)^2$) | *Grid* matriks $2 \times 2$ atau input skalar. |
| **4** | **Determinan, Adjoin, & Invers Matriks ($3 \times 3$)** | Tipe A No. 4 & Tipe B No. 4 | Multi-input: 1 input skalar ($\det(A)$), 1 *grid* $3 \times 3$ ($\text{Adj}(A)$), dan 1 *grid* $3 \times 3$ (mendukung input pecahan untuk $A^{-1}$). |
| **5** | **Aplikasi Matriks pada SPLDV (Soal Cerita 2 Variabel)** | Tipe A No. 5 (Koperasi Siswa) & Tipe B No. 5 (Tiket Pentas Seni) | Bertahap: (a) Input *grid* persamaan matriks $A \cdot X = B$, (b) Input harga satuan $x$ dan $y$, (c) Input total harga pembelian baru. |
| **6** | **Aplikasi Matriks pada SPLTV (Soal Cerita 3 Variabel)** | Tipe A No. 6 & Tipe B No. 6 (Toko Kue Tradisional) | Input harga masing-masing 3 item ($x, y, z$) dalam format angka/Rupiah. |

> **Catatan Algoritma Generator Soal:** Untuk soal determinan, invers ($3 \times 3$), dan soal cerita (SPLDV/SPLTV), generator angka **wajib** memastikan determinan $\neq 0$ (matriks non-singular) dan solusi $(x, y, z)$ berupa bilangan bulat positif yang masuk akal (misalnya kelipatan Rp500 atau Rp1.000 untuk harga barang).

---

## 5. Fitur Utama (Functional Requirements)

### 5.1. Modul Siswa
1. **Akses Masuk Sederhana:** Login menggunakan NIS/Nama dan Kode Kelas/Token Remedial dari guru (tanpa proses registrasi rumit).
2. **Dua Mode Pengerjaan:**
   * **Mode Latihan (Prasyarat):** Siswa berlatih soal-soal mirip PH dengan fitur **Hint Bertahap** (misal: rumus determinan $3 \times 3$ atau cara menyusun matriks $A \cdot X = B$) dan **Pembahasan Langkah demi Langkah** setelah menjawab.
   * **Mode Ujian Remedial:** Mode evaluasi resmi dengan *timer*, tanpa *hint*, soal diacak dari 6 kompetensi inti, dan nilai langsung terekam ke dashboard guru.
3. **Antarmuka Input Matriks Khusus (*Matrix Input Grid*):**
   * Mendukung input angka negatif dan pecahan (misal: `1/3` atau `-2/5`) untuk invers matriks.
   * Navigasi cepat antar sel menggunakan tombol `Tab` atau panah keyboard.
4. **Halaman Hasil & Status KKM:**
   * Menampilkan skor akhir, rincian benar/salah per nomor, serta status **"TUNTAS"** atau **"BELUM TUNTAS (Silakan Ulangi)"**.

### 5.2. Modul Guru (Admin)
1. **Pengaturan Remedial:** Mengatur nilai KKM (default: 75), durasi ujian, jumlah kesempatan mengulang (*max attempts*), dan kode akses kelas.
2. **Dashboard Monitoring:** Tabel daftar siswa yang menampilkan Nama, Kelas, Waktu Pengerjaan, Nilai Tertinggi, Jumlah Percobaan, dan Status KKM.
3. **Ekspor Data:** Tombol unduh rekap nilai dalam format `.csv` / Excel.

---

## 6. Alur Pengguna (User Flow - Siswa)
1. Siswa membuka web $\rightarrow$ Memasukkan Nama, Kelas, dan Kode Remedial.
2. Siswa masuk ke halaman **Beranda Remedial** $\rightarrow$ Melihat daftar 6 topik materi.
3. *(Opsional/Wajib)* Siswa mengerjakan **Mode Latihan** untuk memahami kembali konsep yang salah saat PH.
4. Siswa memulai **Ujian Remedial** $\rightarrow$ Mengerjakan 6 soal (terdiri dari kombinasi input skalar dan *grid* matriks).
5. Siswa klik **Kumpulkan Jawaban** $\rightarrow$ Sistem melakukan *auto-grading* secara instan.
6. Sistem menampilkan skor dan pembahasan. Jika nilai $\ge \text{KKM}$, status berubah menjadi **Tuntas**. Jika $< \text{KKM}$, siswa diarahkan untuk mengulang latihan dan mengambil ujian kembali.

---

## 7. Kebutuhan Non-Fungsional & Rekomendasi Tech Stack
* **Responsif (Mobile-First):** Banyak siswa mengakses melalui *smartphone*. *Grid* matriks $3 \times 3$ harus tetap rapi dan nyaman diketik di layar HP.
* **Rendering Matematika Akurat:** Seluruh notasi matriks, pangkat, transpos ($B^T$), dan invers ($A^{-1}$) wajib dirender dengan tajam menggunakan **KaTeX** atau **MathJax**.
* **Rekomendasi Tech Stack (MVP):**
  * **Frontend:** React / Next.js + Tailwind CSS (untuk UI bersih dan responsif).
  * **Math Rendering:** `katex` / `react-katex`.
  * **Backend & Database:** Supabase atau Firebase (untuk autentikasi ringan dan penyimpanan nilai siswa secara *real-time*).

---

## 8. Roadmap Pengembangan
* **Fase 1 (MVP):** Pembuatan UI *Matrix Input Grid*, 6 *template* soal dinamis sesuai PH XI.2, *auto-grading*, dan halaman hasil instan (bisa langsung diuji coba sebagai *single-page app*).
* **Fase 2 (Integrasi Guru):** Penambahan database untuk menyimpan nilai siswa, Dashboard Guru, dan fitur ekspor CSV.
* **Fase 3 (Pengayaan):** Penambahan fitur *Hint* interaktif bertahap dan analitik soal tersulit untuk evaluasi pembelajaran guru.