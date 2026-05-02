// ═══════════════════════════════════════
// NUWEAV — Main Script
// ═══════════════════════════════════════

// ── Filosofi data ──
const MOTIF_DATA = {
  parang: {
    title: 'Motif Parang Rusak',
    img:   'assets/Motif/motif1.png',
    content: `
      <p>Motif ini diciptakan oleh Panembahan Senopati (pendiri Kerajaan Mataram Islam) saat beliau sedang bertapa di Pantai Selatan. Beliau terinspirasi dari gerakan ombak samudera yang tak henti-hentinya menghantam tebing karang hingga karang tersebut terkikis (rusak).</p>
      <p>Motif ini melambangkan kekuasaan manusia untuk mengendalikan hawa nafsunya. Motif ini mengandung pesan agar manusia memiliki jiwa yang tak pernah menyerah seperti ombak samudera.</p>
    `
  },
  sidomukti: {
    title: 'Motif Sidomukti',
    img:   'assets/Motif/motif2.png',
    content: `
      <p>Motif Sidomukti adalah pengembangan dari motif kuno Sidomulyo yang populer sejak masa Susuhunan Pakubuwana IV (akhir abad ke-18). Motif ini diciptakan dengan filosofi mendalam bagi pasangan yang baru menikah agar hidup dalam kemuliaan (mukti).</p>
      <p>Sidomukti menekankan pada keberlanjutan, kebahagiaan, dan kecukupan rezeki. Berikut adalah ornamen utamanya:</p>
      <ul>
        <li><strong>Kupu Kupu:</strong> Melambangkan proses perjuangan dan kerja keras menuju kesempurnaan.</li>
        <li><strong>Singgasana:</strong> Melambangkan kedudukan yang terhormat di masyarakat.</li>
        <li><strong>Bunga:</strong> Melambangkan keharuman nama dan kecantikan budi pekerti.</li>
      </ul>
    `
  },
  kawung: {
    title: 'Motif Kawung',
    img:   'assets/Motif/motif3.png',
    content: `
      <p>Motif ini Sudah ada sejak abad ke-9, namun mulai berkembang pesat pada masa Kesultanan Mataram. Ada cerita rakyat tentang seorang pemuda santun dan bijak yang terpilih menjadi abdi dalem karena mengenakan motif ini yang dibuatkan oleh ibunya sebagai pengingat agar tetap rendah hati.</p>
      <p>Bentuknya melambangkan sedulur papat lima pancer (empat saudara, lima sebagai pusat), yang merujuk pada keselarasan antara mikrokosmos (manusia) dan makrokosmos (alam semesta). Kawung melambangkan pengendalian diri yang sempurna dan hati yang bersih tanpa ria.</p>
    `
  },
  truntum: {
    title: 'Motif Truntum',
    img:   'assets/Motif/motif4.png',
    content: `
      <p>Motif ini diciptakan oleh Kanjeng Ratu Kencana (Permaisuri Sunan Pakubuwana III). Ceritanya, sang Ratu merasa diabaikan oleh Raja yang sedang jatuh cinta pada selir baru. Dalam kesedihannya, beliau memandangi bintang di langit dan mulai mencanting motif ini.</p>
      <p>Melihat ketekunan dan hasil karya sang Ratu yang indah, cinta sang Raja bersemi kembali (tumbuh kembali). Motif ini melambangkan cinta yang tulus, abadi, dan semakin lama semakin subur.</p>
    `
  },
  sekarjagad: {
    title: 'Motif Sekar Jagad',
    img:   'assets/Motif/motif5.png',
    content: `
      <p>Motif ini muncul sekitar abad ke-18. Nama "Sekar Jagad" berasal dari kata Kar (peta) dalam bahasa Belanda dan Jagad (Dunia) dalam bahasa Jawa. Namun, ada juga yang mengartikannya sebagai Sekar (Bunga) dan Jagad (Dunia).</p>
      <p>Motif ini menggambarkan keindahan keragaman. Motif ini menyatukan berbagai pola batik yang berbeda dalam satu kain, melambangkan keindahan dunia yang penuh dengan perbedaan namun tetap harmonis.</p>
    `
  }
};

document.addEventListener('DOMContentLoaded', () => {

  // ── 3D Tilt on About Card ──
  const aboutCard = document.getElementById('aboutCard');
  if (aboutCard) {
    aboutCard.addEventListener('mousemove', (e) => {
      const rect = aboutCard.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      aboutCard.style.transform = `perspective(800px) rotateX(${dy * -12}deg) rotateY(${dx * 12}deg) scale(1.02)`;
    });
    aboutCard.addEventListener('mouseleave', () => {
      aboutCard.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  }

  // ══════════════════════════════════════
  // MOTIF CAROUSEL
  // ══════════════════════════════════════
  const mTrack  = document.getElementById('motifTrack');
  const mClip   = document.getElementById('motifClip');
  const mSlides = mTrack ? Array.from(mTrack.querySelectorAll('.motif-slide')) : [];
  const mLeft   = document.getElementById('motifLeft');
  const mRight  = document.getElementById('motifRight');

  let mPage = 0; 

  function getVisibleItems() {
    return window.innerWidth <= 768 ? 1 : 4;
  }

  function getCardWidth() {
    if (!mClip || !mSlides[0]) return 260;
    const vItems = getVisibleItems();
    const GAP = 1.2 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    if (vItems === 1) return mClip.clientWidth;
    return (mClip.clientWidth - (vItems - 1) * GAP) / vItems;
  }

  function setSlideWidths() {
    const w = getCardWidth();
    mSlides.forEach(s => { s.style.width = w + 'px'; });
  }

  function goMotifPage(page) {
    const maxPage = mSlides.length - getVisibleItems();
    if (page < 0) page = 0;
    if (page > maxPage) page = maxPage;
    mPage = page;

    const GAP = 1.2 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    const offset = -(page * (getCardWidth() + GAP));
    if (mTrack) mTrack.style.transform = 'translateX(' + offset + 'px)';
    
    // Arrow visibility
    if (mLeft)  mLeft.classList.toggle('motif-hidden',  mPage === 0);
    if (mRight) mRight.classList.toggle('motif-hidden', mPage === maxPage);
  }

  if (mLeft)  mLeft.addEventListener('click',  () => goMotifPage(mPage - 1));
  if (mRight) mRight.addEventListener('click', () => goMotifPage(mPage + 1));

  // Init
  if (mSlides.length) {
    setSlideWidths();
    goMotifPage(0);
    window.addEventListener('resize', () => { 
      setSlideWidths(); 
      // Ensure page is within bounds on resize
      const maxP = mSlides.length - getVisibleItems();
      if (mPage > maxP) mPage = maxP;
      goMotifPage(mPage); 
    }, { passive: true });
  }


  // ══════════════════════════════════════
  // MOTIF MODAL
  // ══════════════════════════════════════
  const modal      = document.getElementById('motifModal');
  const modalImg   = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalCont  = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');
  const backdrop   = document.getElementById('modalBackdrop');

  function openModal(key) {
    const data = MOTIF_DATA[key];
    if (!data || !modal) return;
    modalImg.src           = data.img;
    modalImg.alt           = data.title;
    modalTitle.textContent = data.title;
    modalCont.innerHTML    = data.content;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  mSlides.forEach(slide => {
    slide.addEventListener('click', () => {
      const key = slide.dataset.key;
      if (key) openModal(key);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (backdrop)   backdrop.addEventListener('click',   closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // ══════════════════════════════════════
  // PROD MODAL (3D DETAIL)
  // ══════════════════════════════════════
  const prodModal      = document.getElementById('prodModal');
  const prodModalClose = document.getElementById('prodModalClose');
  const prodBackdrop   = document.getElementById('prodModalBackdrop');
  const prodCard1      = document.getElementById('prod1'); // the active item

  function openProdModal() {
    if (prodModal) prodModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeProdModal() {
    if (prodModal) prodModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (prodCard1) prodCard1.addEventListener('click', openProdModal);
  if (prodModalClose) prodModalClose.addEventListener('click', closeProdModal);
  if (prodBackdrop) prodBackdrop.addEventListener('click', closeProdModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProdModal(); });

  // ── Model-viewer progress bar ──
  const modelViewer = document.querySelector('model-viewer');
  if (modelViewer) {
    const progress = modelViewer.querySelector('.progress-bar');
    const updateBar = modelViewer.querySelector('.update-bar');
    const progressText = document.getElementById('modelProgressText');
    
    modelViewer.addEventListener('progress', (event) => {
      const p = event.detail.totalProgress;
      const percentage = Math.round(p * 100);
      
      if (updateBar) updateBar.style.width = `${percentage}%`;
      if (progressText) progressText.textContent = `Memuat 3D... ${percentage}%`;
      
      if (progress) {
        if (p === 1) {
          progress.classList.add('hide');
        } else {
          progress.classList.remove('hide');
        }
      }
    });
  }

  // ── Scroll reveal ──
  const revealEls = document.querySelectorAll(
    '.about-grid, .catalog-grid, .pillar-card, .stat-item, .section-header, .motif-header'
  );
  revealEls.forEach(el => {
    el.classList.add('reveal');
    if (el.classList.contains('pillar-card')) {
      const idx = [...el.parentElement.children].indexOf(el);
      if (idx > 0) el.classList.add('reveal-delay-' + Math.min(idx, 4));
    }
  });
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => revealObserver.observe(el));

  // ── Stat bar animation ──
  const fills = document.querySelectorAll('.stat-fill');
  const fillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { 
        entry.target.classList.add('animated'); 
        fillObserver.unobserve(entry.target); 
      }
    });
  }, { threshold: 0.5 });
  fills.forEach(f => fillObserver.observe(f));

  // ── Counter animation ──
  const counters = document.querySelectorAll('.stat-number[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      let start = 0;
      const inc = target / (1800 / 16);
      const timer = setInterval(() => {
        start += inc;
        if (start >= target) { start = target; clearInterval(timer); }
        el.textContent = Number.isInteger(target) ? Math.floor(start) : start.toFixed(0);
      }, 16);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  // ── Navbar Scroll Effect ──
  const nav = document.getElementById('navbar');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }, { passive: true });
  }

  // ── Hamburger Menu Toggle ──
  const menuBtn = document.getElementById('hamburger');
  const menuList = document.getElementById('navLinks');
  
  if (menuBtn && menuList) {
    menuBtn.onclick = (e) => {
      e.preventDefault();
      menuBtn.classList.toggle('active');
      menuList.classList.toggle('open');
      document.body.style.overflow = menuList.classList.contains('open') ? 'hidden' : '';
    };

    // Close menu when clicking a link
    const links = menuList.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.onclick = () => {
        menuBtn.classList.remove('active');
        menuList.classList.remove('open');
        document.body.style.overflow = '';
      };
    });
  }

  // ── Active nav link on scroll ──
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', () => {
    let curr = '';
    sections.forEach(sec => { if (window.scrollY >= sec.offsetTop - 120) curr = sec.id; });
    navLinkEls.forEach(l => {
      l.classList.remove('active');
      if (l.getAttribute('href') === '#' + curr) l.classList.add('active');
    });
  }, { passive: true });

  // ── Sustain Accordion ──
  const accordionBtns = document.querySelectorAll('.sustain-btn');
  accordionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      item.classList.toggle('open');
    });
  });

  // ══════════════════════════════════════
  // AUTH STATE — Navbar & Checkout Guard
  // ══════════════════════════════════════
  const navAuth = document.getElementById('navAuth');

  function renderNavAuth() {
    if (!navAuth) return;
    const raw = localStorage.getItem('nuweav_session');

    if (raw) {
      // User sudah login — tampilkan nama + dropdown logout
      const user = JSON.parse(raw);
      const firstName = (user.nama || 'Pengguna').split(' ')[0];
      navAuth.innerHTML = `
        <div class="nav-user-wrap" id="navUserWrap">
          <button class="nav-user-btn" id="navUserBtn" aria-haspopup="true" aria-expanded="false">
            <span class="nav-user-avatar">${firstName.charAt(0).toUpperCase()}</span>
            <span class="nav-user-name">${firstName}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="nav-user-dropdown" id="navUserDropdown">
            <div class="nav-dd-info">
              <span class="nav-dd-nama">${user.nama}</span>
              <span class="nav-dd-email">${user.email}</span>
            </div>
            <div class="nav-dd-divider"></div>
            <button class="nav-dd-logout" id="navLogout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Keluar
            </button>
          </div>
        </div>
      `;

      // Toggle dropdown
      const userBtn = document.getElementById('navUserBtn');
      const dropdown = document.getElementById('navUserDropdown');
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('open');
        userBtn.setAttribute('aria-expanded', isOpen);
      });
      document.addEventListener('click', () => {
        dropdown.classList.remove('open');
        userBtn.setAttribute('aria-expanded', 'false');
      });

      // Logout
      document.getElementById('navLogout').addEventListener('click', () => {
        localStorage.removeItem('nuweav_session');
        window.location.href = 'login/?action=logout';
      });

    } else {
      // Belum login — tampilkan tombol Masuk
      navAuth.innerHTML = `
        <a href="login/" class="nav-login-btn" id="navLoginBtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Masuk
        </a>
      `;
    }
  }

  renderNavAuth();

  // ── Guard tombol "Pesan" → cek login sebelum ke checkout ──
  const btnBeli = document.querySelector('.btn-beli-elegant');
  if (btnBeli) {
    btnBeli.addEventListener('click', (e) => {
      const isLoggedIn = !!localStorage.getItem('nuweav_session');
      if (!isLoggedIn) {
        e.preventDefault();
        window.location.href = 'login/?tab=masuk&redirect=checkout';
      }
      // Jika sudah login, href bawaan (checkout/) berjalan normal
    });
  }

});

