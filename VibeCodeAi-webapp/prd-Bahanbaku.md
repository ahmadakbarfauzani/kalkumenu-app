# Product Requirement Document (PRD) Frontend

## Fitur 01: Database Bahan Baku (BETA-01)

| Atribut | Detail |
| --- | --- |
| **Status** | Approved / Ready for Dev |
| **Target Rilis** | MVP (Minimum Viable Product) |
| **Ketergantungan** | Tidak ada (Fitur Mandiri/Fondasi) |

---

## 1. Ringkasan Fitur (Feature Overview)

Fitur **Database Bahan Baku** adalah modul fondasi yang memungkinkan pemilik UMKM mendaftarkan semua stok modal mentah yang dibeli dalam skala grosir/pembelian. Sistem secara otomatis mengonversi nominal tersebut menjadi harga per satuan unit terkecil agar bisa digunakan secara presisi pada pembuatan resep (Fitur 02) dan kalkulator HPP (Fitur 03).

### Tujuan Utama:

* Menghilangkan kalkulasi manual yang rawan salah hitung oleh pemilik UMKM.
* Menstandarkan konversi satuan (misal: Kilogram ke Gram, Liter ke Mililiter).
* Menyediakan satu sumber data terpusat (*Single Source of Truth*) untuk semua bahan baku.

---

## 2. Alur Pengguna (User Flow)

```
[User masuk ke Halaman] ➔ [Sistem memuat data bahan baku] 
                                    │
       ┌────────────────────────────┴────────────────────────────┐
       ▼                                                         ▼
[User mengisi Form Tambah]                               [User klik tombol Hapus]
       │                                                         │
[Kalkulasi harga per unit]                               [Konfirmasi Pop-up]
       │                                                         │
[Kirim data ke Supabase]                                 [Kirim request delete]
       │                                                         │
[Tabel refresh otomatis (Tanpa Reload)]                  [Tabel refresh otomatis]

```

---

## 3. Spesifikasi Fungsional & UI (Functional & UI Specs)

Halaman dibagi menjadi dua area utama yang responsif (tampilan grid 3-kolom pada layar besar, dan susunan vertikal pada layar ponsel):

1. **Panel Kiri:** Form Input Bahan Baku.


2. **Panel Kanan:** Tabel/Daftar Bahan Baku.



### A. Komponen Form Input (Tambah Bahan Baku)

Menyediakan antarmuka input yang bersih dengan placeholder yang memandu pengguna.

| Nama Elemen | Tipe Input | Aturan Validasi | Error Message (Jika Melanggar) |
| --- | --- | --- | --- |
| **Nama Bahan**<br> | Teks | Wajib diisi, minimal 3 karakter.

 | "Nama bahan minimal 3 karakter." |
| **Harga Beli Total**<br> | Angka (Rupiah) | Wajib diisi, nilai harus > 0.

 | "Harga harus lebih besar dari 0." |
| **Jumlah (Kuantitas)**<br> | Angka (Desimal) | Wajib diisi, nilai harus > 0.

 | "Kuantitas tidak boleh kosong/0." |
| **Satuan Ukuran**<br> | Dropdown (Select) | Wajib memilih salah satu opsi.

 | "Silakan pilih satuan ukuran." |

> **Catatan UX:** Kolom `harga_per_satuan` **tidak boleh** ditampilkan sebagai input. Kolom ini sepenuhnya dihitung secara otomatis oleh sistem untuk menghindari manipulasi data manual.
> 
> 

### B. Komponen Tabel Daftar Bahan Baku

Menampilkan data yang ditarik secara real-time dari database dengan urutan data terbaru berada paling atas.

* **Format Rupiah:** Semua angka nominal uang wajib diformat ke Rupiah (`IDR`) dengan pemisah ribuan agar mudah dibaca.


* **Kolom Highlight:** Kolom **Harga / Satuan** harus diberikan penanda visual yang mencolok (misalnya latar belakang hijau/biru tipis) karena ini adalah data kunci dari fitur ini.


* **Tombol Aksi:** Setiap baris data wajib memiliki tombol **Hapus**.



---

## 4. Logika Bisnis & Integrasi Teknis (Technical Logic)

### A. Rumus Kalkulasi di Frontend

Sebelum data dikirim ke server/Supabase, frontend wajib melakukan perhitungan matematika berikut secara instan:

$$\text{harga\_per\_satuan} = \frac{\text{harga\_beli\_total}}{\text{kuantitas\_total}}$$

* **Contoh Kasus:**
* Input: Susu UHT, Harga = Rp20.000, Kuantitas = 1000, Satuan = ml.


* Proses: $\frac{20000}{1000} = 20$.
* Hasil: Rp20 / ml disimpan ke field `harga_per_satuan`.





### B. Interaksi API (Supabase)

Frontend berkomunikasi langsung dengan Supabase Client CDN dengan skema operasi berikut:

1. **READ (`GET`):**
* Mengambil data dari tabel `materials`.


* Diurutkan berdasarkan `created_at` secara *descending* (terbaru ke terlama).




2. **CREATE (`POST`):**
* Mengirim objek JSON berisi: `nama_bahan`, `harga_beli_total`, `kuantitas_total`, `satuan`, dan `harga_per_satuan`.


* Setelah sukses, memicu fungsi `fetch` ulang untuk memperbarui daftar tabel tanpa melakukan reload halaman penuh (*Single Page Application experience*).




3. **DELETE (`DELETE`):**
* Mengirim parameter `id` baris yang dipilih.


* Wajib memicu konfirmasi browser (`confirm()`) sebelum melakukan eksekusi penghapusan.





---

## 5. Penanganan Error & Keadaan Khusus (Edge Cases)

* **Data Kosong:** Jika database kosong, tabel harus menampilkan ilustrasi/teks informatif: *"Belum ada bahan baku. Gunakan form di samping untuk menambahkan!"*

* **Koneksi Gagal:** Jika Supabase URL/Key salah atau internet terputus, tampilkan banner error merah di atas tabel berisi pesan: *"Gagal terhubung ke database. Periksa konfigurasi Anda."*

* **Loading State:** Tampilkan teks pembantu *"Memuat data..."* atau animasi spinner kecil ketika frontend sedang menunggu respon dari server Supabase.


* **Double Submission Prevention:** Saat tombol "Simpan" diklik, ubah status tombol menjadi *Disabled* dan teks berubah menjadi *Menyimpan...* agar pengguna tidak mengirim data ganda akibat menekan tombol berkali-kali.