// auth.js - Frontend Logic for Authentication
import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------
    // DOM Elements
    // -----------------------------------------
    
    // Sections
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    
    // Forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Switch Links
    const linkToRegister = document.getElementById('link-to-register');
    const linkToLogin = document.getElementById('link-to-login');
    
    // Global Message
    const authMessage = document.getElementById('auth-message');
    
    // Toggle Password Buttons
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');

    // -----------------------------------------
    // State Management: View Toggling
    // -----------------------------------------
    function showSection(sectionToShow, sectionToHide) {
        sectionToHide.classList.add('hidden');
        sectionToHide.classList.remove('active');
        
        sectionToShow.classList.remove('hidden');
        sectionToShow.classList.add('active');
        
        hideMessage();
        
        // Reset forms when switching
        loginForm.reset();
        registerForm.reset();
        
        // Remove validation error styles
        document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    }

    linkToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(registerSection, loginSection);
    });

    linkToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(loginSection, registerSection);
    });

    // -----------------------------------------
    // Toggle Password Visibility
    // -----------------------------------------
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const iconEye = btn.querySelector('.icon-eye');
            const iconEyeOff = btn.querySelector('.icon-eye-off');
            
            if (input.type === 'password') {
                input.type = 'text';
                iconEye.classList.add('hidden');
                iconEyeOff.classList.remove('hidden');
                btn.setAttribute('aria-label', 'Sembunyikan Password');
            } else {
                input.type = 'password';
                iconEye.classList.remove('hidden');
                iconEyeOff.classList.add('hidden');
                btn.setAttribute('aria-label', 'Tampilkan Password');
            }
        });
    });

    // -----------------------------------------
    // Validation Helpers
    // -----------------------------------------
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function setInvalid(input, isInvalid) {
        if (isInvalid) {
            input.classList.add('invalid');
        } else {
            input.classList.remove('invalid');
        }
    }

    // -----------------------------------------
    // State Management: Loading & Messages
    // -----------------------------------------
    function showMessage(msg, type = 'error') {
        authMessage.textContent = msg;
        authMessage.className = `auth-message ${type}`;
        // Removing 'hidden' makes it visible due to CSS classes handling layout
        authMessage.classList.remove('hidden'); 
    }

    function hideMessage() {
        authMessage.classList.add('hidden');
        authMessage.textContent = '';
        authMessage.className = 'auth-message hidden';
    }

    function setLoading(btn, isLoading, defaultText) {
        const btnText = btn.querySelector('.btn-text');
        const spinner = btn.querySelector('.spinner');
        
        if (isLoading) {
            btn.disabled = true;
            btn.classList.add('loading');
            btnText.textContent = 'Memproses...';
            spinner.classList.remove('hidden');
        } else {
            btn.disabled = false;
            btn.classList.remove('loading');
            btnText.textContent = defaultText;
            spinner.classList.add('hidden');
        }
    }

    // -----------------------------------------
    // Form Submission: Login
    // -----------------------------------------
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessage();
        
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        const btn = document.getElementById('btn-login');
        
        let isValid = true;

        // Validate Email
        if (!emailInput.value || !validateEmail(emailInput.value)) {
            setInvalid(emailInput, true);
            isValid = false;
        } else {
            setInvalid(emailInput, false);
        }

        // Validate Password
        if (!passwordInput.value) {
            setInvalid(passwordInput, true);
            isValid = false;
        } else {
            setInvalid(passwordInput, false);
        }

        if (!isValid) return;

        // Execute Login Mock
        setLoading(btn, true, 'Masuk');
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: emailInput.value,
                password: passwordInput.value,
            });
            
            if (error) throw error;
            
            showMessage('Berhasil masuk! Mengalihkan...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html'; // Redirect to dashboard / home
            }, 1000);
            
        } catch (error) {
            showMessage(error.message || 'Gagal masuk. Silakan periksa kembali kredensial Anda.');
            setLoading(btn, false, 'Masuk');
        }
    });

    // -----------------------------------------
    // Form Submission: Register
    // -----------------------------------------
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessage();
        
        const nameInput = document.getElementById('register-name');
        const emailInput = document.getElementById('register-email');
        const passwordInput = document.getElementById('register-password');
        const confirmPasswordInput = document.getElementById('register-confirm-password');
        const btn = document.getElementById('btn-register');
        
        let isValid = true;

        // Validate Name
        if (!nameInput.value || nameInput.value.length < 2) {
            setInvalid(nameInput, true);
            isValid = false;
        } else {
            setInvalid(nameInput, false);
        }

        // Validate Email
        if (!emailInput.value || !validateEmail(emailInput.value)) {
            setInvalid(emailInput, true);
            isValid = false;
        } else {
            setInvalid(emailInput, false);
        }

        // Validate Password
        if (!passwordInput.value || passwordInput.value.length < 6) {
            setInvalid(passwordInput, true);
            isValid = false;
        } else {
            setInvalid(passwordInput, false);
        }

        // Validate Confirm Password
        if (!confirmPasswordInput.value || confirmPasswordInput.value !== passwordInput.value) {
            setInvalid(confirmPasswordInput, true);
            isValid = false;
        } else {
            setInvalid(confirmPasswordInput, false);
        }

        if (!isValid) return;

        // Execute Register Mock
        setLoading(btn, true, 'Daftar');
        
        try {
            const { data, error } = await supabase.auth.signUp({
                email: emailInput.value,
                password: passwordInput.value,
                options: {
                    data: {
                        name: nameInput.value,
                    }
                }
            });
            
            if (error) throw error;
            
            // Note: If email confirmations are enabled in Supabase, the user won't be logged in yet.
            // If they are disabled, the user is logged in.
            // In either case, we will insert into profiles (or assume a trigger handles it).
            // Usually, creating a profile is handled by a Postgres Trigger on auth.users.
            // If you need to manually insert it here:
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([{ id: data.user.id, name: nameInput.value }]);
                
                if (profileError) {
                    console.error("Gagal membuat profil:", profileError);
                }
            }
            
            showMessage('Pendaftaran berhasil! Silakan periksa email Anda (jika konfirmasi diaktifkan) atau langsung masuk.', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html'; // Redirect to dashboard / home
            }, 2500);
            
        } catch (error) {
            showMessage(error.message || 'Gagal mendaftar. Email mungkin sudah digunakan.');
            setLoading(btn, false, 'Daftar');
        }
    });

    // Input listeners to clear error state on typing
    const allInputs = document.querySelectorAll('input');
    allInputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.classList.contains('invalid')) {
                setInvalid(input, false);
            }
        });
    });
});
