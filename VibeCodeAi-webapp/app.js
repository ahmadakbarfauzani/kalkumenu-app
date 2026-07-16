// ---------------------------------------------------------
// SUPABASE CONFIGURATION
// ---------------------------------------------------------
const SUPABASE_URL = 'https://faemisozlsyawnrgweak.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gaDILWbXR7fmZKgl2nzHCQ_gBxsYiKc';

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------------------------------------------------------
// AUTH GUARD: Validate user session before anything
// ---------------------------------------------------------
let currentUser = null;

const initAuth = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        // Not logged in — redirect to auth page
        window.location.href = 'auth.html';
        return false;
    }

    currentUser = user;
    return true;
};

// ---------------------------------------------------------
// MAIN APP LOGIC (runs only after auth is confirmed)
// ---------------------------------------------------------
const initApp = async () => {
    const isAuthenticated = await initAuth();
    if (!isAuthenticated) return;

    // DOM Elements
    const form = document.getElementById('material-form');
    const inputNama = document.getElementById('nama_bahan');
    const inputHarga = document.getElementById('harga_beli_total');
    const inputKuantitas = document.getElementById('kuantitas_total');
    const inputSatuan = document.getElementById('satuan');
    const calcPreview = document.getElementById('calc-preview');

    const btnSubmit = document.getElementById('submit-btn');
    const btnSubmitText = btnSubmit.querySelector('.btn-text');
    const btnSubmitSpinner = document.getElementById('submit-spinner');

    const btnRefresh = document.getElementById('refresh-btn');
    const tableBody = document.getElementById('table-body');
    const connectionStatus = document.getElementById('connection-status');
    const connectionText = document.getElementById('connection-text');

    const alertBanner = document.getElementById('alert-banner');
    const alertMessage = document.getElementById('alert-message');
    const closeAlertBtn = document.getElementById('close-alert');

    // Utilities
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(number);
    };

    const showAlert = (msg) => {
        alertMessage.textContent = msg;
        alertBanner.classList.remove('hidden');
    };

    closeAlertBtn.addEventListener('click', () => {
        alertBanner.classList.add('hidden');
    });

    // Update Status UI
    const setConnectionStatus = (isOnline, text) => {
        connectionStatus.className = 'status-dot ' + (isOnline ? 'online' : 'offline');
        connectionText.textContent = text;
    };

    // Calculate and Update Preview
    const updateCalculationPreview = () => {
        const harga = parseFloat(inputHarga.value) || 0;
        const kuantitas = parseFloat(inputKuantitas.value) || 0;
        const satuan = inputSatuan.value || '-';
        
        if (harga > 0 && kuantitas > 0) {
            const hargaPerSatuan = harga / kuantitas;
            calcPreview.textContent = `${formatRupiah(hargaPerSatuan)} / ${satuan}`;
            calcPreview.style.color = 'var(--success)';
        } else {
            calcPreview.textContent = `Rp 0 / ${satuan}`;
            calcPreview.style.color = 'var(--text-secondary)';
        }
    };

    // Event Listeners for Calculation Preview
    inputHarga.addEventListener('input', updateCalculationPreview);
    inputKuantitas.addEventListener('input', updateCalculationPreview);
    inputSatuan.addEventListener('change', updateCalculationPreview);

    // Form Validation Handlers
    const showError = (inputId, show) => {
        const group = document.getElementById(inputId).closest('.form-group');
        if (show) {
            group.classList.add('has-error');
        } else {
            group.classList.remove('has-error');
        }
    };

    const validateForm = () => {
        let isValid = true;
        
        if (inputNama.value.trim().length < 3) {
            showError('nama_bahan', true);
            isValid = false;
        } else {
            showError('nama_bahan', false);
        }
        
        if (parseFloat(inputHarga.value) <= 0 || isNaN(parseFloat(inputHarga.value))) {
            showError('harga_beli_total', true);
            isValid = false;
        } else {
            showError('harga_beli_total', false);
        }
        
        if (parseFloat(inputKuantitas.value) <= 0 || isNaN(parseFloat(inputKuantitas.value))) {
            showError('kuantitas_total', true);
            isValid = false;
        } else {
            showError('kuantitas_total', false);
        }
        
        if (!inputSatuan.value) {
            showError('satuan', true);
            isValid = false;
        } else {
            showError('satuan', false);
        }
        
        return isValid;
    };

    ['input', 'change'].forEach(evt => {
        form.addEventListener(evt, (e) => {
            if(e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT'){
                showError(e.target.id, false); // Clear error on edit
            }
        });
    });

    // Fetch Data from Supabase (FILTERED BY USER)
    const fetchMaterials = async () => {
        try {
            tableBody.innerHTML = `
                <tr id="loading-row">
                    <td colspan="5" class="text-center loading-state">
                        <div class="spinner-large"></div>
                        <p>Memuat data database...</p>
                    </td>
                </tr>
            `;
            
            const { data, error } = await supabase
                .from('materials')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            
            setConnectionStatus(true, 'Terhubung ke Database');
            alertBanner.classList.add('hidden');
            renderTable(data);
            
        } catch (err) {
            console.error("Fetch Error:", err);
            setConnectionStatus(false, 'Terputus');
            showAlert("Gagal terhubung ke database. Periksa koneksi atau konfigurasi Anda.");
            tableBody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="5" class="text-center" style="color: var(--danger);">
                        Terjadi kesalahan saat mengambil data.
                    </td>
                </tr>
            `;
        }
    };

    // Render Data to Table
    const renderTable = (materials) => {
        tableBody.innerHTML = '';
        
        if (!materials || materials.length === 0) {
            tableBody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="5" class="text-center">
                        Belum ada data bahan baku. Silakan tambah data pertama Anda!
                    </td>
                </tr>
            `;
            return;
        }
        
        materials.forEach(item => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td><strong>${item.nama_bahan}</strong></td>
                <td>${formatRupiah(item.harga_beli_total)}</td>
                <td>${item.kuantitas_total} ${item.satuan}</td>
                <td class="highlight-col">${formatRupiah(item.harga_per_satuan)} / ${item.satuan}</td>
                <td class="action-col">
                    <button class="btn btn-danger-sm delete-btn" data-id="${item.id}">Hapus</button>
                </td>
            `;
            
            tableBody.appendChild(tr);
        });
        
        // Attach delete listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    };

    // Handle Form Submit (CREATE — WITH user_id)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        // Calculate logic
        const namaBahan = inputNama.value.trim();
        const hargaBeli = parseFloat(inputHarga.value);
        const kuantitas = parseFloat(inputKuantitas.value);
        const satuan = inputSatuan.value;
        const hargaPerSatuan = hargaBeli / kuantitas;
        
        const payload = {
            nama_bahan: namaBahan,
            harga_beli_total: hargaBeli,
            kuantitas_total: kuantitas,
            satuan: satuan,
            harga_per_satuan: hargaPerSatuan,
            user_id: currentUser.id
        };
        
        // UI Loading State (Double submission prevention)
        btnSubmit.disabled = true;
        btnSubmitText.textContent = 'Menyimpan...';
        btnSubmitSpinner.classList.remove('hidden');
        
        try {
            const { error } = await supabase
                .from('materials')
                .insert([payload]);
                
            if (error) throw error;
            
            // Reset form on success
            form.reset();
            updateCalculationPreview();
            
            // Refresh Table
            fetchMaterials();
            
        } catch (err) {
            console.error("Insert Error:", err);
            showAlert("Gagal menyimpan bahan baku. " + err.message);
        } finally {
            // Restore UI state
            btnSubmit.disabled = false;
            btnSubmitText.textContent = 'Simpan Bahan Baku';
            btnSubmitSpinner.classList.add('hidden');
        }
    });

    // Handle Delete Data (DELETE — WITH user_id guard)
    const handleDelete = async (e) => {
        const id = e.target.getAttribute('data-id');
        
        if (!confirm("Apakah Anda yakin ingin menghapus bahan baku ini?")) {
            return;
        }
        
        // Change button text to indicate loading
        const originalText = e.target.textContent;
        e.target.textContent = '...';
        e.target.disabled = true;
        
        try {
            const { error } = await supabase
                .from('materials')
                .delete()
                .eq('id', id)
                .eq('user_id', currentUser.id);
                
            if (error) throw error;
            
            // Refresh Table
            fetchMaterials();
            
        } catch (err) {
            console.error("Delete Error:", err);
            showAlert("Gagal menghapus data. " + err.message);
            e.target.textContent = originalText;
            e.target.disabled = false;
        }
    };

    // Initial Load
    btnRefresh.addEventListener('click', fetchMaterials);
    fetchMaterials();
};

// Run
initApp();
