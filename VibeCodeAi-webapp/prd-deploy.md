

# 📄 PRD: Perbaikan Isu Deployment Vercel (Error 404)

## 1. Latar Belakang & Pernyataan Masalah

Proyek **KalkuMenu** telah berhasil dihubungkan ke repositori GitHub dan di- *deploy* melalui Vercel dengan status *Ready* (Sukses). Namun, saat pengguna mencoba mengakses aplikasi utama melalui tombol navigasi di *Landing Page*, server mengembalikan **Error 404 Not Found**.

Masalah ini terjadi karena arsitektur *default* Vite dirancang untuk *Single-Page Application* (SPA), sehingga Vercel hanya mem- *build* file `index.html` utama dan mengabaikan file HTML lain yang berada di dalam folder `VibeCodeAi-webapp`. Selain itu, lingkungan server Vercel (Linux) menerapkan aturan *Case Sensitivity* (sensitif terhadap huruf besar/kecil) yang ketat pada pembacaan URL.

## 2. Tujuan (Objectives)

* Mengonfigurasi Vite agar mengenali proyek sebagai *Multi-Page Application* (MPA).
* Memastikan seluruh halaman web (Landing Page, Auth, Kalkulator HPP, Resep, Bahan Baku) ter- *build* dengan sempurna dan diunggah ke *production environment* Vercel.
* Menghilangkan Error 404 saat melakukan perpindahan halaman (*routing*).

## 3. Ruang Lingkup (Scope of Work)

* **Termasuk:** Pembaruan konfigurasi `vite.config.js`, audit penulisan *href* pada file HTML, dan pengujian *deployment* ulang.
* **Tidak Termasuk:** Perubahan pada logika JavaScript (`app.js`, `kalkulator.js`) atau penambahan UI baru.

---

## 4. Kebutuhan Teknis & Langkah Implementasi

### Fase 1: Konfigurasi Multi-Page Application (MPA) di Vite

Sistem *build tool* (Rollup) di dalam Vite harus dipetakan secara manual agar mendeteksi semua file `.html`.

* **File Target:** `vite.config.js` (berada di *root* folder utama)
* **Tindakan:** Timpa seluruh isi file dengan konfigurasi pemetaan *input* berikut:

```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // 1. Halaman Utama (Landing Page)
        main: resolve(__dirname, 'index.html'),
        
        // 2. Halaman Autentikasi (Jika ada)
        auth: resolve(__dirname, 'VibeCodeAi-webapp/auth.html'),
        
        // 3. Modul Aplikasi Utama
        app: resolve(__dirname, 'VibeCodeAi-webapp/index.html'),
        kalkulator: resolve(__dirname, 'VibeCodeAi-webapp/kalkulator.html'),
        resep: resolve(__dirname, 'VibeCodeAi-webapp/resep.html')
      }
    }
  }
});

```

### Fase 2: Audit Case-Sensitivity pada HTML

Server Vercel akan memblokir akses jika ada perbedaan 1 huruf kapital saja antara nama folder fisik dan URL yang dipanggil.

* **File Target:** `index.html` (Landing Page) dan seluruh menu navigasi di dalam `VibeCodeAi-webapp/`.
* **Tindakan:**
* Pastikan semua link menuju aplikasi ditulis menggunakan huruf kapital yang persis dengan nama folder di *File Explorer* VS Code.
* **Format yang Benar:** `<a href="./VibeCodeAi-webapp/index.html">` (Atau arahkan ke `auth.html` jika sistem login sudah siap).



### Fase 3: Deployment Ulang (Triggering Vercel)

Vercel akan secara otomatis melakukan *build* ulang begitu mendeteksi adanya perubahan di *branch* utama (Main) pada repositori GitHub.

* **Tindakan di Terminal VS Code:**
1. `git add .` (Menambahkan perubahan)
2. `git commit -m "fix: update vite config for multi-page build and fix 404 errors"` (Memberikan catatan perbaikan)
3. `git push` (Mengirim ke GitHub)



---

## 5. Kriteria Penerimaan (Acceptance Criteria)

Fitur/Perbaikan ini dianggap selesai dan berhasil jika memenuhi syarat berikut:

1. [ ] *Deployment* di Vercel Dashboard berstatus hijau (**Ready**) setelah proses *push* terbaru.
2. [ ] URL utama (contoh: `kalkumenu-app.vercel.app`) berhasil menampilkan *Landing Page*.
3. [ ] Mengklik tombol "Coba Sekarang" berhasil memuat halaman di dalam folder `VibeCodeAi-webapp/` tanpa memunculkan layar 404.
4. [ ] Pengguna dapat berpindah dari halaman "Bahan Baku" ke halaman "Resep" dan "Kalkulator" dengan normal di versi *online* (bukan *localhost*).