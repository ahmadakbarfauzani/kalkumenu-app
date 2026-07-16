Pilihan yang sangat tepat! Membangun Aplikasi Kalkulator HPP dan Resep Digital adalah proyek yang terarah, bebas dari kerumitan perangkat keras, dan dampaknya langsung terasa oleh pemilik bisnis F&B.

Untuk membantu Anda mulai proses *coding* atau mendesain antarmuka (UI/UX), berikut adalah rancangan **Product Requirements Document (PRD)** versi ringkas yang berfokus pada *Minimum Viable Product* (MVP).

---

# Product Requirements Document (PRD)

**Nama Produk:** SmartHPP (Nama Sementara)
**Platform:** Web App (Responsif untuk Mobile/Desktop)
**Status:** MVP (Versi 1.0)

## 1. Ringkasan Produk

SmartHPP adalah aplikasi pencatat resep digital sekaligus kalkulator Harga Pokok Penjualan (HPP) otomatis untuk bisnis F&B skala kecil dan menengah (kafe, kedai kopi, *home industry*). Aplikasi ini bertujuan menghilangkan "tebak-tebakan" dalam menentukan harga jual menu.

## 2. Tujuan & Sasaran

* **Masalah:** Pemilik kafe sering kesulitan menghitung modal pasti per porsi karena harus membagi satuan besar (liter/kilogram) ke satuan kecil (mililiter/gram).
* **Solusi:** Menyediakan sistem di mana pengguna cukup memasukkan harga beli bahan baku (modal awal), dan sistem akan menghitung harga per satuan terkecil secara otomatis.
* **Sasaran (Metrik Keberhasilan):** Pengguna dapat membuat satu resep lengkap dan mengetahui HPP-nya dalam waktu kurang dari 3 menit.

## 3. Target Pengguna

* **Pemilik Bisnis F&B / Manajer Kafe:** Membutuhkan data untuk menentukan harga jual dan persentase laba.
* **Chef / Head Barista:** Membutuhkan buku resep digital yang standar agar rasa makanan/minuman konsisten siapa pun yang meraciknya.

---

## 4. Fitur Utama (Ruang Lingkup MVP)

### A. Modul Manajemen Bahan Baku (Ingredients Database)

Fitur ini adalah pondasi aplikasi. Pengguna mendata barang yang mereka beli dari pasar atau penyuplai.

* **Input Data:** Nama bahan, Harga Beli Total, Jumlah Satuan Beli (Misal: 1000), Tipe Satuan (Gram, Mililiter, Pcs).
* **Kalkulasi Otomatis (Back-end):** Sistem wajib menghitung dan menyimpan "Harga per Satuan Terkecil".
* *Contoh:* Beli Susu Rp20.000 untuk 1000 ml. Sistem otomatis menyimpan nilai: Rp20 / ml.



### B. Modul Resep Digital (Recipe Builder)

Tempat pengguna meracik bahan baku menjadi sebuah menu siap jual.

* **Detail Menu:** Nama Menu, Kategori (Makanan/Minuman/Camilan), Foto Menu (Opsional).
* **Komposisi (Builder):** Pengguna mencari bahan baku dari *database*, lalu memasukkan takaran per porsi.
* *Contoh Input:* Susu (150 ml), Kopi (15 gram), Gula (10 gram).



### C. Kalkulator HPP & Margin (Pricing Engine)

Fitur inti yang memberikan nilai jual (ROI) kepada pengguna.

* **Total HPP (Otomatis):** Sistem menjumlahkan semua biaya bahan baku di dalam resep tersebut.
* **Kalkulator Margin:**
* Pengguna memasukkan target persentase keuntungan (Misal: 40%).
* Sistem mengeluarkan **Saran Harga Jual**.


* **Simulasi Harga Manual:** Jika pengguna ingin menjual dengan harga Rp25.000, sistem akan menampilkan berapa persen keuntungan riil yang didapat.

---

## 5. Alur Pengguna (User Flow) Dasar

1. **Registrasi/Login:** Pengguna masuk ke dasbor.
2. **Langkah 1 (Input Bahan):** Masuk ke menu "Bahan Baku" -> Klik "Tambah Bahan" -> Isi Susu Segar, Rp20.000, 1000 ml -> Simpan.
3. **Langkah 2 (Buat Resep):** Masuk ke menu "Resep" -> Klik "Buat Resep Baru" -> Beri nama "Iced Latte".
4. **Langkah 3 (Racik):** Tambahkan komponen "Susu Segar", isi takaran 150 ml.
5. **Langkah 4 (Hitung & Simpan):** Lihat total modal (HPP) yang muncul -> Masukkan target margin laba -> Lihat saran harga jual -> Simpan Resep.

---

## 6. Kebutuhan Basis Data (Struktur Sederhana)

Untuk tahap MVP, Anda hanya membutuhkan 3 tabel utama dalam *database* (misal menggunakan MySQL atau PostgreSQL):

* `users` (Data pemilik akun)
* `ingredients` (Data bahan baku dasar + harga)
* `recipes` (Data nama menu dan harga jual)
* `recipe_ingredients` (Tabel relasi / *pivot* yang menghubungkan resep dengan bahan baku beserta takarannya)

## 7. Hal yang Harus Dihindari di Versi 1.0 (Out of Scope)

Agar proyek ini tetap simpel dan cepat selesai, **jangan** menambahkan fitur berikut di tahap awal:

* Integrasi sistem kasir (POS).
* Pelacakan sisa stok / *Inventory tracking* (biarkan aplikasi murni sebagai kalkulator dan buku resep).
* Multi-cabang / Multi-outlet.

---

Dengan PRD ringkas ini, Anda sudah punya arah yang sangat jelas untuk mulai mendesain tampilan layar atau membuat struktur *database*-nya.

Apakah Anda berencana membangun aplikasi ini menggunakan *framework* atau bahasa pemrograman tertentu, atau masih menimbang-nimbang teknologi apa yang paling pas untuk dipakai?