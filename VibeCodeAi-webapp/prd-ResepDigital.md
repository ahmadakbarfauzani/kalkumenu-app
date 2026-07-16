

# Product Requirement Document (PRD) Frontend

## Fitur 02: Resep Digital / Menu Builder (BETA-02)

| Atribut | Detail |
| --- | --- |
| **Status** | Approved / Ready for Dev |
| **Target Rilis** | MVP (Minimum Viable Product) |
| **Ketergantungan** | Wajib menyelesaikan Fitur 01 (Tabel `materials` harus ada) |

---

## 1. Ringkasan Fitur (Feature Overview)

Fitur **Resep Digital** adalah inti dari operasional produksi. Halaman ini memungkinkan pengguna untuk membuat sebuah "Menu" (misal: Es Kopi Susu) dan meracik resepnya dengan cara menarik data bahan baku yang sudah didaftarkan pada Fitur 01, lalu menentukan takaran presisi untuk satu porsi.

### Tujuan Utama:

* Menjaga konsistensi rasa (SOP) dengan mengunci takaran porsi.
* Membangun struktur relasi data (Menu berisi banyak Bahan Baku) yang nantinya akan dihitung total biayanya di Fitur 03 (Kalkulator HPP).

---

## 2. Alur Pengguna (User Flow)

```
[User masuk ke Halaman] ➔ [Sistem memuat dropdown Bahan Baku dari db]
                                    │
       ┌────────────────────────────┴────────────────────────────┐
       ▼                                                         ▼
[User ketik Nama Menu Baru]                              [User melihat Daftar Menu]
       │                                                         │
[User klik '+ Tambah Bahan' (Form Dinamis muncul)]               │
       │                                                         │
[User pilih Bahan & isi Takaran (Bisa tambah banyak baris)]      │
       │                                                         │
[User klik 'Simpan Resep'] ➔ [Sistem simpan ke 2 tabel] ➔ [Daftar Menu ter-update]

```

---

## 3. Spesifikasi Fungsional & UI (Functional & UI Specs)

Halaman ini dibagi menjadi dua bagian utama: **Form Builder** (Kiri/Atas) dan **Daftar Menu** (Kanan/Bawah).

### A. Komponen Form Builder (Dinamis)

Berbeda dengan form biasa, form ini memiliki "Baris Bahan Baku" yang bisa ditambah atau dihapus tanpa batas oleh pengguna.

| Nama Elemen | Tipe Input | Aturan Validasi | Keterangan Tambahan |
| --- | --- | --- | --- |
| **Nama Menu** | Teks | Wajib diisi, min 3 karakter | Contoh: "Es Kopi Susu Senja" |
| **Tombol Tambah Bahan** | Button | - | Menambahkan 1 baris form baru ke layar. |
| **Pilih Bahan (Per Baris)** | Dropdown (Select) | Wajib memilih 1 bahan | Datanya ditarik *live* dari tabel `materials`. |
| **Takaran (Per Baris)** | Angka (Desimal) | Wajib diisi, > 0 | Input jumlah bahan yang dipakai (misal: 150). |
| **Tombol Hapus Baris** | Button (Icon ❌) | - | Menghapus baris bahan baku yang sedang aktif. |
| **Tombol Simpan Resep** | Button (Submit) | - | Mengeksekusi penyimpanan ke database. |

### B. Komponen Daftar Menu (Preview)

Menampilkan daftar resep yang sudah berhasil dibuat. Tampilannya berbentuk kartu (*Card*) atau *Accordion* yang bisa dibuka-tutup.

* **Header Kartu:** Menampilkan Nama Menu (Contoh: **Es Kopi Susu Senja**).
* **Isi Kartu (Daftar Bahan):** Menampilkan *bullet points* atau tabel kecil berisi rincian bahan dan takarannya (Contoh: `Susu UHT - 150 ml`, `Espresso - 30 ml`).
* **Aksi:** Tombol **Hapus Menu** (Menghapus menu beserta rincian resepnya).

---

## 4. Logika Bisnis & Integrasi Teknis (Technical Logic)

Fitur ini membutuhkan operasi database yang sedikit lebih kompleks (*Relational Database Operations*).

### A. Proses Muat Awal (READ Dropdown)

* Saat halaman pertama kali dibuka, jalankan `GET` ke tabel `materials`.
* Simpan data ini ke dalam variabel (state) di JavaScript agar setiap kali pengguna menekan tombol "Tambah Bahan", sistem tidak perlu melakukan *request* ulang ke database untuk mengisi *dropdown*.

### B. Proses Penyimpanan (Dua Tahap / Two-Step POST)

Karena kita memiliki 2 tabel (`menus` dan `recipe_items`), penyimpanan harus berurutan:

1. **Tahap 1 (Insert Menu):** Kirim `nama_menu` ke tabel `menus`. Minta Supabase untuk mengembalikan ID dari menu yang baru saja dibuat (misal mendapat `id = 5`).
2. **Tahap 2 (Insert Items):** Lakukan *looping* (perulangan) pada semua baris bahan baku yang diisi pengguna. Bentuk sebuah array (daftar) yang berisi: `menu_id = 5`, `material_id = [pilihan user]`, `jumlah_terpakai = [input user]`. Kirim array ini sekaligus (*Bulk Insert*) ke tabel `recipe_items`.

### C. Proses Menampilkan Resep (Join Query)

Untuk menampilkan daftar menu di sebelah kanan, frontend harus menggunakan query *Join* bawaan Supabase:

* Ambil data dari tabel `menus`, dan sertakan juga data relasinya dari tabel `recipe_items`, sekaligus ambil nama bahan dari tabel `materials`.
* *Struktur Query Supabase (JS):* `.select('*, recipe_items(*, materials(*))')`

---

## 5. Penanganan Error & Keadaan Khusus (Edge Cases)

* **Bahan Baku Kosong:** Jika tabel `materials` belum ada isinya sama sekali (pengguna melewati Fitur 01), form tidak boleh digunakan. Tampilkan pesan: *"Anda belum memiliki bahan baku. Silakan isi database bahan baku terlebih dahulu."*
* **Submit Tanpa Bahan:** Jika pengguna mengisi Nama Menu tapi belum menambahkan satu baris bahan pun, tombol "Simpan" harus ditahan dan memunculkan peringatan: *"Tambahkan minimal 1 bahan baku untuk resep ini."*
* **Pencegahan Duplikasi Baris (Opsional tapi disarankan):** Frontend bisa memunculkan peringatan jika pengguna memilih bahan baku yang sama (misal memilih Susu UHT dua kali di dua baris berbeda) dalam satu resep.
* **Penghapusan Menu (Delete):** Berkat pengaturan **Cascade** yang sudah Anda buat di Supabase, saat pengguna menghapus suatu menu, frontend hanya perlu mengirim perintah hapus ke tabel `menus`. Supabase akan otomatis menghapus semua baris terkait di `recipe_items`.

---

Jika Anda sudah siap, beri aba-aba, dan saya akan langsung membuatkan **file HTML lengkap dengan kode JavaScript dinamisnya** untuk Fitur 02 ini!