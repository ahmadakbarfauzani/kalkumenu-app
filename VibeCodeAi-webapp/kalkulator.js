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

    // State
    let menusData = [];
    let currentMenu = null;

    // DOM Elements
    const selectMenu = document.getElementById('select-menu');
    const inputMargin = document.getElementById('input-margin');

    const hppTableBody = document.getElementById('hpp-table-body');
    const totalHppVal = document.getElementById('total-hpp-val');
    const saranHargaVal = document.getElementById('saran-harga-val');
    const marginDisplayVal = document.getElementById('margin-display-val');

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

    const setConnectionStatus = (isOnline, text) => {
        connectionStatus.className = 'status-dot ' + (isOnline ? 'online' : 'offline');
        connectionText.textContent = text;
    };

    // Fetch Data (FILTERED BY USER)
    const fetchMenus = async () => {
        try {
            const { data, error } = await supabase
                .from('menus')
                .select('*, recipe_items(*, materials(nama_bahan, harga_per_satuan, satuan))')
                .eq('user_id', currentUser.id)
                .order('nama_menu', { ascending: true });

            if (error) throw error;

            menusData = data || [];
            setConnectionStatus(true, 'Terhubung');
            populateMenuDropdown();

        } catch (err) {
            console.error("Fetch Menus Error:", err);
            setConnectionStatus(false, 'Terputus');
            showAlert("Gagal mengambil data menu dari database.");
            selectMenu.innerHTML = '<option value="" disabled selected>Gagal memuat data</option>';
        }
    };

    const populateMenuDropdown = () => {
        if (menusData.length === 0) {
            selectMenu.innerHTML = '<option value="" disabled selected>Belum ada menu. Buat menu terlebih dahulu.</option>';
            return;
        }

        let optionsHtml = '<option value="" disabled selected>-- Pilih Menu --</option>';
        menusData.forEach(menu => {
            optionsHtml += `<option value="${menu.id}">${menu.nama_menu}</option>`;
        });

        selectMenu.innerHTML = optionsHtml;
    };

    // Calculation Logic
    const calculateAndRender = () => {
        if (!currentMenu) return;

        const marginVal = parseFloat(inputMargin.value) || 0;
        marginDisplayVal.textContent = marginVal;

        let totalHpp = 0;

        // Check if recipe has items
        if (!currentMenu.recipe_items || currentMenu.recipe_items.length === 0) {
            hppTableBody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="3" class="text-center" style="color: #fbbf24;">
                        Menu ini belum memiliki rincian bahan baku.
                    </td>
                </tr>
            `;
            totalHppVal.textContent = formatRupiah(0);
            saranHargaVal.textContent = formatRupiah(0);
            return;
        }

        // Render Table Rows & Calculate HPP
        hppTableBody.innerHTML = '';

        let hasOrphanedData = false;

        currentMenu.recipe_items.forEach(item => {
            // Handle orphaned materials (deleted from DB but still in recipe)
            if (!item.materials) {
                hasOrphanedData = true;
                return;
            }

            const qty = parseFloat(item.jumlah_terpakai) || 0;
            const hargaSatuan = parseFloat(item.materials.harga_per_satuan) || 0;
            const totalBiayaBahan = qty * hargaSatuan;

            totalHpp += totalBiayaBahan;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.materials.nama_bahan}</td>
                <td>${qty} ${item.materials.satuan}</td>
                <td class="text-right">${formatRupiah(totalBiayaBahan)}</td>
            `;
            hppTableBody.appendChild(tr);
        });

        if (hasOrphanedData) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td colspan="3" class="text-center" style="color: var(--danger); font-size: 0.85rem;">
                    *Ada bahan baku yang terhapus dari sistem namun masih terdaftar di resep ini.
                </td>
            `;
            hppTableBody.appendChild(tr);
        }

        // Update Totals
        totalHppVal.textContent = formatRupiah(totalHpp);

        // Calculate Selling Price (Rounded to nearest 100 up)
        const marginAmount = totalHpp * (marginVal / 100);
        const exactSellingPrice = totalHpp + marginAmount;

        // Bulatkan ke ratusan terdekat ke atas (contoh: 12723 -> 12800)
        let saranHargaJual = Math.ceil(exactSellingPrice / 100) * 100;

        // Edge case if 0
        if (exactSellingPrice === 0) saranHargaJual = 0;

        saranHargaVal.textContent = formatRupiah(saranHargaJual);
    };

    // Event Listeners
    selectMenu.addEventListener('change', (e) => {
        const selectedId = parseInt(e.target.value);
        currentMenu = menusData.find(m => m.id === selectedId);
        calculateAndRender();
    });

    inputMargin.addEventListener('input', () => {
        // If empty, it's 0
        if (inputMargin.value === '') {
            marginDisplayVal.textContent = '0';
        }
        calculateAndRender();
    });

    // Init
    fetchMenus();
};

// Run
initApp();
