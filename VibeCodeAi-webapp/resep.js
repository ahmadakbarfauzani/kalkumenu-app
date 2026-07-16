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
    let materialsList = [];

    // DOM Elements
    const form = document.getElementById('recipe-form');
    const inputNamaMenu = document.getElementById('nama_menu');
    const btnAddIngredient = document.getElementById('add-ingredient-btn');
    const ingredientsContainer = document.getElementById('ingredients-container');
    const emptyIngredientsMsg = document.getElementById('empty-ingredients-msg');

    const btnSubmit = document.getElementById('submit-recipe-btn');
    const btnSubmitText = btnSubmit.querySelector('.btn-text');
    const btnSubmitSpinner = document.getElementById('submit-spinner');

    const btnRefreshMenu = document.getElementById('refresh-menu-btn');
    const menuListContainer = document.getElementById('menu-list-container');
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

    // Form Dynamic Rows Logic
    const checkEmptyIngredients = () => {
        const rows = ingredientsContainer.querySelectorAll('.ingredient-row');
        if (rows.length === 0) {
            emptyIngredientsMsg.style.display = 'block';
        } else {
            emptyIngredientsMsg.style.display = 'none';
        }
        // clear error if it was shown
        document.getElementById('error-ingredients').style.display = 'none';
    };

    const createIngredientRow = () => {
        const row = document.createElement('div');
        row.className = 'ingredient-row';
        
        // Select options string
        let optionsHtml = '<option value="" disabled selected>Pilih bahan...</option>';
        materialsList.forEach(m => {
            optionsHtml += `<option value="${m.id}" data-satuan="${m.satuan}">${m.nama_bahan}</option>`;
        });

        row.innerHTML = `
            <div class="form-group ingredient-select-col">
                <select class="material-select" required>
                    ${optionsHtml}
                </select>
            </div>
            <div class="form-group ingredient-qty-col">
                <div class="input-with-prefix">
                    <input type="number" class="qty-input" placeholder="Takaran" required min="0.01" step="0.01">
                    <span class="prefix satuan-label" style="left: auto; right: 1rem; color: var(--text-muted); font-size: 0.8rem;">-</span>
                </div>
            </div>
            <button type="button" class="icon-btn remove-row-btn" style="color: var(--danger);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        // Handle select change to update unit label
        const select = row.querySelector('.material-select');
        const satuanLabel = row.querySelector('.satuan-label');
        select.addEventListener('change', (e) => {
            const selectedOption = select.options[select.selectedIndex];
            satuanLabel.textContent = selectedOption.getAttribute('data-satuan') || '-';
        });

        // Handle remove
        row.querySelector('.remove-row-btn').addEventListener('click', () => {
            row.remove();
            checkEmptyIngredients();
        });

        ingredientsContainer.appendChild(row);
        checkEmptyIngredients();
    };

    btnAddIngredient.addEventListener('click', () => {
        if (materialsList.length === 0) {
            showAlert("Data bahan baku masih kosong. Silakan tambahkan di halaman Database Bahan Baku terlebih dahulu.");
            return;
        }
        createIngredientRow();
    });

    // Fetch Materials for Dropdown (FILTERED BY USER)
    const fetchMaterials = async () => {
        try {
            const { data, error } = await supabase
                .from('materials')
                .select('*')
                .eq('user_id', currentUser.id);
                
            if (error) throw error;
            materialsList = data || [];
            setConnectionStatus(true, 'Terhubung');
        } catch (err) {
            console.error("Fetch Materials Error:", err);
            setConnectionStatus(false, 'Terputus');
            showAlert("Gagal mengambil data bahan baku.");
        }
    };

    // Fetch Menus for List (FILTERED BY USER)
    const fetchMenus = async () => {
        menuListContainer.innerHTML = `
            <div class="loading-state text-center" id="menu-loading">
                <div class="spinner-large"></div>
                <p>Memuat daftar menu...</p>
            </div>
        `;

        try {
            const { data, error } = await supabase
                .from('menus')
                .select('*, recipe_items(*, materials(*))')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            renderMenus(data || []);
        } catch (err) {
            console.error("Fetch Menus Error:", err);
            menuListContainer.innerHTML = `
                <div class="empty-state text-center" style="color: var(--danger);">
                    Gagal memuat daftar menu.
                </div>
            `;
        }
    };

    // Render Menu Cards
    const renderMenus = (menus) => {
        menuListContainer.innerHTML = '';
        
        if (menus.length === 0) {
            menuListContainer.innerHTML = `
                <div class="empty-state text-center">
                    Belum ada menu yang dibuat. Silakan tambah menu pertama Anda!
                </div>
            `;
            return;
        }

        menus.forEach(menu => {
            const card = document.createElement('div');
            card.className = 'menu-card';
            
            // Build ingredients list HTML
            let ingredientsHtml = '';
            if (menu.recipe_items && menu.recipe_items.length > 0) {
                ingredientsHtml = '<ul class="menu-ingredient-list">';
                menu.recipe_items.forEach(item => {
                    const matName = item.materials ? item.materials.nama_bahan : 'Bahan Terhapus';
                    const matSatuan = item.materials ? item.materials.satuan : '';
                    ingredientsHtml += `
                        <li>
                            <span class="ingredient-name">${matName}</span>
                            <span class="ingredient-qty">${item.jumlah_terpakai} ${matSatuan}</span>
                        </li>
                    `;
                });
                ingredientsHtml += '</ul>';
            } else {
                ingredientsHtml = '<p class="text-muted" style="font-size:0.875rem;">Tidak ada bahan baku.</p>';
            }

            card.innerHTML = `
                <div class="menu-card-header">
                    <h3>${menu.nama_menu}</h3>
                    <button class="icon-btn delete-menu-btn" data-id="${menu.id}" title="Hapus Menu" style="color: var(--text-secondary); padding: 0.2rem;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
                <div class="menu-card-body">
                    ${ingredientsHtml}
                </div>
            `;
            
            menuListContainer.appendChild(card);
        });

        // Attach delete listeners
        document.querySelectorAll('.delete-menu-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteMenu);
        });
    };

    // Form Submission (INSERT — WITH user_id)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate
        const namaMenu = inputNamaMenu.value.trim();
        if (namaMenu.length < 3) {
            document.getElementById('error-nama-menu').style.display = 'block';
            return;
        } else {
            document.getElementById('error-nama-menu').style.display = 'none';
        }

        const rows = ingredientsContainer.querySelectorAll('.ingredient-row');
        if (rows.length === 0) {
            document.getElementById('error-ingredients').style.display = 'block';
            return;
        }

        // Collect Data
        let recipeItemsData = [];
        let isRowValid = true;

        rows.forEach(row => {
            const materialId = row.querySelector('.material-select').value;
            const qty = parseFloat(row.querySelector('.qty-input').value);

            if (!materialId || isNaN(qty) || qty <= 0) {
                isRowValid = false;
            } else {
                recipeItemsData.push({
                    material_id: materialId,
                    jumlah_terpakai: qty
                });
            }
        });

        if (!isRowValid) {
            showAlert("Harap lengkapi semua pilihan bahan baku dan takarannya (harus > 0).");
            return;
        }

        // Start UI Loading
        btnSubmit.disabled = true;
        btnSubmitText.textContent = 'Menyimpan...';
        btnSubmitSpinner.classList.remove('hidden');

        try {
            // TAHAP 1: Insert Menu (WITH user_id)
            const { data: menuData, error: menuError } = await supabase
                .from('menus')
                .insert([{ nama_menu: namaMenu, user_id: currentUser.id }])
                .select();

            if (menuError) throw menuError;
            if (!menuData || menuData.length === 0) throw new Error("Gagal membuat menu.");

            const newMenuId = menuData[0].id;

            // TAHAP 2: Insert Items
            const itemsToInsert = recipeItemsData.map(item => ({
                menu_id: newMenuId,
                material_id: item.material_id,
                jumlah_terpakai: item.jumlah_terpakai
            }));

            const { error: itemsError } = await supabase
                .from('recipe_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            // Success
            form.reset();
            ingredientsContainer.innerHTML = '';
            checkEmptyIngredients();
            fetchMenus(); // Refresh list

        } catch (err) {
            console.error("Save Recipe Error:", err);
            showAlert("Gagal menyimpan resep: " + err.message);
        } finally {
            btnSubmit.disabled = false;
            btnSubmitText.textContent = 'Simpan Resep';
            btnSubmitSpinner.classList.add('hidden');
        }
    });

    // Delete Menu (WITH user_id guard)
    const handleDeleteMenu = async (e) => {
        const btn = e.currentTarget;
        const id = btn.getAttribute('data-id');

        if (!confirm("Hapus menu ini beserta seluruh resepnya?")) return;

        btn.style.opacity = '0.5';
        btn.disabled = true;

        try {
            const { error } = await supabase
                .from('menus')
                .delete()
                .eq('id', id)
                .eq('user_id', currentUser.id);

            if (error) throw error;
            
            fetchMenus();
        } catch (err) {
            console.error("Delete Menu Error:", err);
            showAlert("Gagal menghapus menu: " + err.message);
            btn.style.opacity = '1';
            btn.disabled = false;
        }
    };

    // Init
    btnRefreshMenu.addEventListener('click', fetchMenus);

    // Run on load
    await fetchMaterials();
    await fetchMenus();
};

// Run
initApp();
