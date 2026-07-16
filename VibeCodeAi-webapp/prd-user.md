

## Technical PRD: Manajemen Data Berbasis Pengguna (User-Specific CRUD)

### 1. Tujuan (Objective)

Memodifikasi logika JavaScript pada fitur "Tambah Data" (Insert) dan "Tampilkan Data" (Select) agar sepenuhnya terikat pada sesi pengguna yang sedang aktif. Ini memastikan pengguna A hanya dapat menyimpan dan melihat data milik pengguna A (misalnya pada tabel `menus` dan `materials`), serta mencegah kebocoran data antar pengguna.

### 2. Kebutuhan Persiapan (Prerequisites)

Sebelum kode JavaScript ini dieksekusi, sistem mengharapkan hal berikut sudah terpenuhi:

* **Database (Langkah 1 & 2):** Tabel target memiliki kolom `user_id` (berelasi dengan `auth.users(id)`) dan sistem keamanan RLS sudah aktif dengan kebijakan (*policy*) yang membatasi akses berbasis `auth.uid()`.
* **Autentikasi (Sesi Aktif):** Pengguna wajib dalam keadaan *login*. Logika harus mampu menangkap *token* sesi pengguna saat ini.

### 3. Alur Kerja Langkah 3: Penyimpanan Data (Data Insertion / Create)

* **Pemicu (Trigger):** *Event listener* saat pengguna menekan tombol "Simpan" pada form tambah data (misalnya form tambah menu).
* **Proses Utama:**
1. **Validasi Sesi:** Panggil fungsi `await supabase.auth.getUser()` untuk memverifikasi siapa yang sedang menekan tombol tersebut.
2. **Ekstraksi ID:** Tarik nilai `user.id` dari respon otorisasi. Jika `user` tidak ditemukan, hentikan proses dan lemparkan *error* (atau arahkan kembali ke halaman login).
3. **Pengumpulan Data Form:** Tangkap nilai dari input HTML (misal: nama menu, harga).
4. **Injeksi Payload:** Gabungkan data form dengan ID pengguna ke dalam satu objek *payload*. (Contoh: `{ nama_menu: 'x', harga: 'y', user_id: user.id }`).
5. **Eksekusi Database:** Kirim *payload* tersebut ke Supabase menggunakan perintah `supabase.from('menus').insert()`.


* **Hasil (Output):**
* Jika sukses (201 Created): Tampilkan notifikasi "Berhasil disimpan", kosongkan form (`form.reset()`), dan panggil ulang fungsi "Tampilkan Data" (Langkah 4) agar tabel di layar langsung diperbarui.
* Jika gagal: Tampilkan pesan *error* di konsol dan layar (*alert*).



### 4. Alur Kerja Langkah 4: Menampilkan Data (Data Fetching / Read)

* **Pemicu (Trigger):** Halaman selesai dimuat (seperti saat masuk ke *dashboard* utama) atau dipanggil ulang setelah penambahan/penghapusan data.
* **Proses Utama:**
1. **Validasi Sesi:** Panggil fungsi `await supabase.auth.getUser()`. (Fungsi baca data tidak boleh dijalankan jika pengguna berstatus *guest* / belum login).
2. **Ekstraksi ID:** Ambil `user.id` dari pengguna yang aktif.
3. **Eksekusi Database (Dengan Filter):** Panggil data dari Supabase menggunakan perintah `supabase.from('menus').select('*')`.
4. **Penerapan Filter Identitas:** Wajib merangkaikan perintah pemanggilan dengan `.eq('user_id', user.id)`. Ini adalah syarat mutlak agar API hanya merespon dengan sekumpulan data yang kolom `user_id`-nya identik dengan ID peminta.
5. **Perulangan Layar (DOM Manipulation):** Terima *array* data dari Supabase, lalu lakukan *looping* (misalnya menggunakan `.forEach()`) untuk mencetak baris tabel (tag `<tr>` dan `<td>`) atau elemen kartu ke dalam HTML.


* **Hasil (Output):**
* Jika data ada: Daftar elemen UI terisi dengan informasi eksklusif milik pengguna tersebut.
* Jika data kosong (baru mendaftar): Tampilkan pesan ramah di antarmuka, misalnya: *"Belum ada data menu. Silakan tambah data pertama Anda."*



### 5. Penanganan Status Keamanan Tambahan

* **Loading State:** Selama proses `insert` dan `select` berjalan (*fetching* via internet), tampilkan indikator *loading* di layar agar pengguna tidak menekan tombol berkali-kali yang bisa menyebabkan data ganda.
* **Proteksi RLS:** Jika ada manipulasi nakal dari *browser* (misalnya seseorang sengaja mengubah kode JavaScript untuk membuang filter `.eq()`), sistem ini tetap akan aman karena RLS di Langkah 2 akan langsung memblokir permintaan dari sisi *server* (*Database merespon: 403 Forbidden / Array Kosong*).