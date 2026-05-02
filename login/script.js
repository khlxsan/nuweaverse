import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// ── Redirect Logic ──
function redirectAfterLogin(isAdmin) {
  if (isAdmin) {
    window.location.replace('../admin/');
    return;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const redirectTarget = urlParams.get('redirect');
  
  if (redirectTarget === 'checkout') {
    window.location.replace('../checkout/');
  } else {
    // Jika ada referrer dan masih di domain yang sama (bukan dari halaman login itu sendiri)
    if (document.referrer && document.referrer.indexOf(window.location.host) !== -1 && document.referrer.indexOf('login') === -1) {
      window.location.replace(document.referrer);
    } else {
      window.location.replace('../'); // Default kembali ke beranda
    }
  }
}

// ── Auth helpers with Firebase ──
const Auth = {
  async register(nama, email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(window.fbAuth, email, password);
      const user = userCredential.user;

      try {
        // Simpan data tambahan ke Firestore
        await setDoc(doc(window.fbDb, "users", user.uid), {
          nama: nama.trim(),
          email: email.toLowerCase().trim(),
          createdAt: new Date().toISOString(),
          role: 'user'
        });
      } catch (fsErr) {
        console.warn("Firestore Error (Abaikan jika Rules belum diatur):", fsErr);
        // Tetap lanjut meskipun Firestore gagal (agar user bisa masuk)
      }

      this.setSession({ nama, email: user.email, role: 'user' });
      return { ok: true, message: 'Akun berhasil dibuat!' };
    } catch (error) {
      console.error("Register Error:", error);
      let msg = 'Gagal mendaftar. ' + (error.message || '');
      if (error.code === 'auth/email-already-in-use') msg = 'Email sudah terdaftar.';
      if (error.code === 'auth/weak-password') msg = 'Password terlalu lemah (min. 6 karakter).';
      return { ok: false, message: msg };
    }
  },

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(window.fbAuth, email, password);
      const user = userCredential.user;

      let userData = { nama: user.email.split('@')[0], role: 'user' };
      try {
        const userDoc = await getDoc(doc(window.fbDb, "users", user.uid));
        if (userDoc.exists()) {
          userData = userDoc.data();
        }
      } catch (fsErr) {
        console.warn("Firestore Read Error:", fsErr);
      }

      this.setSession({ nama: userData.nama, email: user.email, role: userData.role || 'user' });
      const isAdmin = (userData.role === 'admin');
      return { ok: true, message: isAdmin ? 'Selamat datang, Admin!' : 'Selamat datang kembali, ' + userData.nama + '!', isAdmin };
    } catch (error) {
      console.error("Login Error:", error);
      let msg = 'Email atau password salah.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        msg = 'Email atau password salah. Coba lagi.';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Terlalu banyak percobaan gagal. Silakan coba lagi nanti.';
      }
      return { ok: false, message: msg };
    }
  },

  async googleLogin() {
    try {
      const provider = new GoogleAuthProvider();
      // Memaksa Google untuk selalu menampilkan pilihan akun setiap kali tombol diklik
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(window.fbAuth, provider);
      const user = result.user;

      let userData = { nama: user.displayName || user.email.split('@')[0], role: 'user' };
      
      try {
        const userDocRef = doc(window.fbDb, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          userData = userDoc.data();
        } else {
          // Jika user baru via Google, simpan ke Firestore
          await setDoc(userDocRef, {
            nama: userData.nama,
            email: user.email,
            createdAt: new Date().toISOString(),
            role: 'user'
          });
        }
      } catch (fsErr) {
        console.warn("Firestore Error on Google Login:", fsErr);
      }

      this.setSession({ nama: userData.nama, email: user.email, role: userData.role });
      return { ok: true, message: 'Berhasil masuk dengan Google!', isAdmin: userData.role === 'admin' };
    } catch (error) {
      console.error("Google Login Error:", error);
      return { ok: false, message: 'Gagal masuk dengan Google. ' + (error.message || '') };
    }
  },

  setSession(user) {
    localStorage.setItem('nuweav_session', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('nuweav_session');
    signOut(window.fbAuth);
  }
};

// ── Sync Auth State ──
// Jika user sudah login di Firebase tapi localStorage kosong, isi kembali.
onAuthStateChanged(window.fbAuth, async (user) => {
  if (user) {
    const session = localStorage.getItem('nuweav_session');
    if (!session) {
      // User login tapi session hilang (misal: refresh/tab baru)
      try {
        const userDoc = await getDoc(doc(window.fbDb, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : { nama: user.email.split('@')[0], role: 'user' };
        Auth.setSession({ nama: userData.nama, email: user.email, role: userData.role });
      } catch (e) {
        Auth.setSession({ nama: user.email.split('@')[0], email: user.email, role: 'user' });
      }
    }
    
    // Redirect otomatis ditiadakan sesuai permintaan
    // const currentSession = JSON.parse(localStorage.getItem('nuweav_session'));
    // if (currentSession && window.location.pathname.includes('login')) {
    //   redirectAfterLogin(currentSession.role === 'admin');
    // }
  }
});

// ── DOM refs ──
const tabMasuk     = document.getElementById('tabMasuk');
const tabDaftar    = document.getElementById('tabDaftar');
const tabIndicator = document.getElementById('tabIndicator');
const formMasuk    = document.getElementById('formMasuk');
const formDaftar   = document.getElementById('formDaftar');
const authAlert    = document.getElementById('authAlert');
const authEyebrow  = document.getElementById('authEyebrow');
const authTitle    = document.getElementById('authCardTitle');
const switchToDaftar = document.getElementById('switchToDaftar');
const switchToMasuk  = document.getElementById('switchToMasuk');

// ── Tab switching ──
function activateTab(tab) {
  const isMasuk = tab === 'masuk';

  tabMasuk.classList.toggle('active', isMasuk);
  tabDaftar.classList.toggle('active', !isMasuk);
  tabIndicator.classList.toggle('on-daftar', !isMasuk);

  formMasuk.classList.toggle('active', isMasuk);
  formDaftar.classList.toggle('active', !isMasuk);

  authEyebrow.textContent = isMasuk ? 'Selamat Datang Kembali' : 'Bergabung Bersama Kami';
  authTitle.textContent   = isMasuk ? 'Masuk ke Akun Anda'     : 'Buat Akun Gratis';

  clearAlert();
  clearAllErrors();
}

tabMasuk.addEventListener('click',  () => activateTab('masuk'));
tabDaftar.addEventListener('click', () => activateTab('daftar'));
switchToDaftar?.addEventListener('click', () => activateTab('daftar'));
switchToMasuk?.addEventListener('click',  () => activateTab('masuk'));

// ── Alert helpers ──
function showAlert(message, type = 'error') {
  authAlert.textContent = message;
  authAlert.className = 'auth-alert ' + type;
}
function clearAlert() {
  authAlert.textContent = '';
  authAlert.className = 'auth-alert';
}

// ── Field error helpers ──
function setError(inputEl, errEl, msg) {
  inputEl.classList.add('is-error');
  inputEl.classList.remove('is-success');
  errEl.textContent = msg;
}
function clearError(inputEl, errEl) {
  inputEl.classList.remove('is-error');
  errEl.textContent = '';
}
function setSuccess(inputEl) {
  inputEl.classList.add('is-success');
  inputEl.classList.remove('is-error');
}
function clearAllErrors() {
  [
    ['loginEmail', 'loginEmailErr'],
    ['loginPassword', 'loginPasswordErr'],
    ['regNama', 'regNamaErr'],
    ['regEmail', 'regEmailErr'],
    ['regPassword', 'regPasswordErr'],
    ['regPasswordConfirm', 'regPasswordConfirmErr']
  ].forEach(([id, errId]) => {
    const el = document.getElementById(id);
    const err = document.getElementById(errId);
    if (el && err) { el.classList.remove('is-error', 'is-success'); err.textContent = ''; }
  });
}

// ── Validation ──
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Password visibility toggle ──
function setupEyeToggle(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const inp = document.getElementById(inputId);
  if (!btn || !inp) return;
  btn.addEventListener('click', () => {
    const isText = inp.type === 'text';
    inp.type = isText ? 'password' : 'text';
    btn.setAttribute('aria-label', isText ? 'Tampilkan password' : 'Sembunyikan password');
    btn.style.color = isText ? '' : 'var(--clr-gold-lt)';
  });
}
setupEyeToggle('toggleLoginPass', 'loginPassword');
setupEyeToggle('toggleRegPass',   'regPassword');
setupEyeToggle('toggleRegPassConfirm', 'regPasswordConfirm');

// ── Loading state ──
function setLoading(btn, state) {
  btn.disabled = state;
  btn.classList.toggle('loading', state);
}

// ── FORM: Masuk ──
formMasuk.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();
  let valid = true;

  const emailEl = document.getElementById('loginEmail');
  const passEl  = document.getElementById('loginPassword');
  const emailErr = document.getElementById('loginEmailErr');
  const passErr  = document.getElementById('loginPasswordErr');

  if (!emailEl.value.trim()) {
    setError(emailEl, emailErr, 'Email wajib diisi.');
    valid = false;
  } else if (!isValidEmail(emailEl.value)) {
    setError(emailEl, emailErr, 'Format email tidak valid.');
    valid = false;
  } else {
    clearError(emailEl, emailErr);
    setSuccess(emailEl);
  }

  if (!passEl.value) {
    setError(passEl, passErr, 'Password wajib diisi.');
    valid = false;
  } else {
    clearError(passEl, passErr);
    setSuccess(passEl);
  }

  if (!valid) return;

  const btnMasuk = document.getElementById('btnMasuk');
  setLoading(btnMasuk, true);

  const result = await Auth.login(emailEl.value, passEl.value);
  setLoading(btnMasuk, false);

  if (result.ok) {
    showAlert('✓ ' + result.message, 'success');
    setTimeout(() => { redirectAfterLogin(result.isAdmin); }, 900);
  } else {
    showAlert(result.message, 'error');
  }
});

// ── FORM: Daftar ──
formDaftar.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();
  let valid = true;

  const namaEl  = document.getElementById('regNama');
  const emailEl = document.getElementById('regEmail');
  const passEl  = document.getElementById('regPassword');
  const namaErr  = document.getElementById('regNamaErr');
  const emailErr = document.getElementById('regEmailErr');
  const passErr  = document.getElementById('regPasswordErr');

  const passConfirmEl = document.getElementById('regPasswordConfirm');
  const passConfirmErr = document.getElementById('regPasswordConfirmErr');

  if (!namaEl.value.trim() || namaEl.value.trim().length < 2) {
    setError(namaEl, namaErr, 'Nama minimal 2 karakter.');
    valid = false;
  } else {
    clearError(namaEl, namaErr);
    setSuccess(namaEl);
  }

  if (!emailEl.value.trim()) {
    setError(emailEl, emailErr, 'Email wajib diisi.');
    valid = false;
  } else if (!isValidEmail(emailEl.value)) {
    setError(emailEl, emailErr, 'Format email tidak valid.');
    valid = false;
  } else {
    clearError(emailEl, emailErr);
    setSuccess(emailEl);
  }

  if (!passEl.value || passEl.value.length < 6) {
    setError(passEl, passErr, 'Password minimal 6 karakter.');
    valid = false;
  } else {
    clearError(passEl, passErr);
    setSuccess(passEl);
  }

  if (!passConfirmEl.value) {
    setError(passConfirmEl, passConfirmErr, 'Ketik ulang password wajib diisi.');
    valid = false;
  } else if (passConfirmEl.value !== passEl.value) {
    setError(passConfirmEl, passConfirmErr, 'Password tidak cocok.');
    valid = false;
  } else {
    clearError(passConfirmEl, passConfirmErr);
    setSuccess(passConfirmEl);
  }

  if (!valid) return;

  const btnDaftar = document.getElementById('btnDaftar');
  setLoading(btnDaftar, true);

  const result = await Auth.register(namaEl.value, emailEl.value, passEl.value);
  setLoading(btnDaftar, false);

  if (result.ok) {
    showAlert('✓ ' + result.message, 'success');
    setTimeout(() => { redirectAfterLogin(false); }, 900);
  } else {
    showAlert(result.message, 'error');
  }
});

// ── Google Login Buttons ──
async function handleGoogleLogin(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  
  clearAlert();
  // Simple loading feedback on Google button
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Memuat...';
  btn.style.opacity = '0.7';
  btn.style.pointerEvents = 'none';

  const result = await Auth.googleLogin();
  
  if (result.ok) {
    showAlert('✓ ' + result.message, 'success');
    setTimeout(() => { redirectAfterLogin(result.isAdmin); }, 900);
  } else {
    showAlert(result.message, 'error');
    btn.innerHTML = originalText;
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
  }
}

const btnGoogleMasuk = document.getElementById('btnGoogleMasuk');
const btnGoogleDaftar = document.getElementById('btnGoogleDaftar');

if (btnGoogleMasuk) btnGoogleMasuk.addEventListener('click', () => handleGoogleLogin('btnGoogleMasuk'));
if (btnGoogleDaftar) btnGoogleDaftar.addEventListener('click', () => handleGoogleLogin('btnGoogleDaftar'));

// ── Check tab dari URL param ──
// Contoh: /login/?tab=daftar
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('tab') === 'daftar') {
  activateTab('daftar');
}

// ── Check Action URL param ──
if (urlParams.get('action') === 'logout') {
  Auth.clearSession();
  // Bersihkan parameter url agar tidak tertahan di status logout
  window.history.replaceState({}, document.title, window.location.pathname);
  showAlert('Anda telah berhasil keluar.', 'success');
}
