
## Frontend PRD: Halaman Otentikasi (Login & Registrasi)

### 1. Tujuan (Objective)

Menyediakan antarmuka pengguna (UI) yang aman, responsif, dan intuitif bagi pengguna untuk mendaftar akun baru dan masuk ke dalam aplikasi. Sistem ini akan terhubung langsung dengan Supabase Authentication.

### 2. Kebutuhan Antarmuka Pengguna (UI Requirements)

Halaman otentikasi (misal: `auth.html`) akan menggunakan desain *single-card layout* di tengah layar yang memungkinkan pengguna beralih antara Login dan Registrasi tanpa perlu memuat ulang halaman (*page reload*).

**Elemen Halaman Login:**

* Judul halaman (misal: "Selamat Datang Kembali")
* Kolom input **Email** (tipe: `email`)
* Kolom input **Password** (tipe: `password`) dengan ikon mata untuk *Show/Hide Password*
* Tombol aksi utama **"Masuk"**
* Teks tautan **"Belum punya akun? Daftar di sini"** (untuk beralih ke form registrasi)

**Elemen Halaman Registrasi:**

* Judul halaman (misal: "Buat Akun Baru")
* Kolom input **Nama Lengkap** (tipe: `text`) - *Akan disimpan ke tabel `profiles*`
* Kolom input **Email** (tipe: `email`)
* Kolom input **Password** (tipe: `password`)
* Kolom input **Konfirmasi Password** (tipe: `password`)
* Tombol aksi utama **"Daftar"**
* Teks tautan **"Sudah punya akun? Masuk di sini"** (untuk beralih ke form login)

### 3. Kebutuhan Fungsional (Functional Requirements)

**Validasi Sisi Klien (Client-Side Validation):**

* Semua kolom wajib diisi (*required*).
* Kolom email harus memvalidasi format standar (contoh: `nama@domain.com`).
* Kolom password pada saat registrasi minimal 6 karakter (standar keamanan default Supabase).
* Kolom "Konfirmasi Password" nilainya harus sama persis dengan kolom "Password". Jika tidak, tombol "Daftar" tidak bisa diklik atau muncul pesan error di bawah kolom.

**Manajemen State (State Management):**

* **State Idle:** Form siap diisi.
* **State Loading:** Saat tombol Masuk/Daftar diklik, teks tombol berubah menjadi "Memproses..." (ditambah animasi *spinner*) dan tombol dinonaktifkan (*disabled*) untuk mencegah pengiriman data berulang (*double-submit*).
* **State Error:** Jika terjadi kesalahan (password salah, email sudah terdaftar, dll), tampilkan kotak pesan *error* berwarna merah di atas form.
* **State Success:** Jika registrasi berhasil, tampilkan pesan sukses (misal: "Pendaftaran berhasil, mengalihkan...").

### 4. Alur Integrasi Supabase (Integration Flow)

* **Aksi Login:** Menggunakan fungsi `supabase.auth.signInWithPassword()`. Jika *response* sukses, simpan sesi dan arahkan pengguna (*redirect*) ke halaman `dashboard.html` (atau halaman utama aplikasi Anda).
* **Aksi Registrasi:** Menggunakan fungsi `supabase.auth.signUp()`. Setelah akun terbuat di `auth.users`, fungsi ini harus secara otomatis memicu penyimpanan input "Nama Lengkap" ke dalam tabel `profiles` yang tadi sudah Anda buat.
* **Pengecekan Sesi (*Auth Guard*):** Jika pengguna yang sudah dalam keadaan *login* mencoba mengakses halaman `auth.html`, sistem akan otomatis mengarahkan mereka kembali ke halaman utama.

### 5. Keamanan & Aksesibilitas

* Tidak menyimpan password dalam bentuk *plaintext* (ditangani oleh Supabase).
* Pastikan form bisa dinavigasi menggunakan tombol `Tab` pada *keyboard*.
* Gunakan atribut HTML `aria-labels` untuk mendukung pembaca layar (*screen readers*).

---

Dengan PRD ini, kita sudah punya cetak biru (blueprint) yang jelas mengenai tampilan dan cara kerja halaman tersebut.

Apakah Anda ingin saya langsung buatkan kode HTML dan CSS-nya (menggunakan Vanilla CSS atau framework seperti Tailwind) berdasarkan PRD ini?