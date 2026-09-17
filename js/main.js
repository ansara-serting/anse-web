// --- JALANKAN SEMUA FUNGSI SEMASA LAMAN DIMUATKAN ---
document.addEventListener("DOMContentLoaded", () => {
    muatDataNavigasi();
    initTema();        // Tarik memori tema
    initSaizTeks();    // Tarik memori saiz teks
});

// =========================================================
// 1. PENGURUSAN LACI MENU (OFF-CANVAS DRAWER)
// =========================================================
const drawer = document.getElementById('side-drawer');
const backdrop = document.getElementById('drawer-backdrop');
const btnTutupDrawer = document.getElementById('btn-tutup-drawer');

function bukaDrawer() {
    drawer.classList.remove('hidden');
    backdrop.classList.remove('hidden');
    // Sedikit delay untuk membenarkan transition CSS berlaku
    setTimeout(() => {
        drawer.classList.add('open');
        backdrop.classList.add('open');
    }, 10);
}

function tutupDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    // Tunggu animasi slide keluar selesai (0.3s) sebelum hide
    setTimeout(() => {
        drawer.classList.add('hidden');
        backdrop.classList.add('hidden');
    }, 300);
}

// Event Listeners untuk tutup laci
btnTutupDrawer.addEventListener('click', tutupDrawer);
backdrop.addEventListener('click', tutupDrawer); // Klik kawasan gelap untuk tutup


// =========================================================
// 2. PENGURUSAN TEMA TERANG / GELAP (DARK MODE)
// =========================================================
const btnToggleTema = document.getElementById('toggle-tema');
const body = document.body;

function initTema() {
    const temaDisimpan = localStorage.getItem('tema_anse');
    if (temaDisimpan === 'dark') {
        body.classList.add('dark-theme');
    }
}

btnToggleTema.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    const temaSemasa = body.classList.contains('dark-theme') ? 'dark' : 'light';
    localStorage.setItem('tema_anse', temaSemasa); // Simpan pilihan pengguna
});


// =========================================================
// 3. PENGURUSAN AKSESIBILITI SAIZ TEKS (^A)
// =========================================================
const btnTextSize = document.getElementById('btn-text-size');
const popoverA11y = document.getElementById('popover-a11y');
let timeoutA11y; // Pembolehubah untuk simpan timer

// Togol (Buka/Tutup) Popover bila klik butang ^A
btnTextSize.addEventListener('click', (e) => {
    e.stopPropagation();
    popoverA11y.classList.toggle('hidden');

    // Reset timer setiap kali butang diklik
    clearTimeout(timeoutA11y);

    // Jika popover sedang dibuka, mulakan kiraan 10 saat (10000 ms)
    if (!popoverA11y.classList.contains('hidden')) {
        timeoutA11y = setTimeout(() => {
            popoverA11y.classList.add('hidden');
        }, 10000);
    }
});

// Tutup popover secara automatik jika pengguna klik di tempat lain
document.addEventListener('click', (e) => {
    if (!popoverA11y.contains(e.target) && e.target !== btnTextSize) {
        popoverA11y.classList.add('hidden');
        clearTimeout(timeoutA11y); // Matikan timer jika ditutup manual
    }
});

function ubahSaizTeks(saiz) {
    const root = document.documentElement;
    let fontSize = '16px'; // Saiz asal (Default)

    if (saiz === 'kecil') fontSize = '14px';
    if (saiz === 'besar') fontSize = '18px';

    // Ubah pembolehubah CSS
    root.style.setProperty('--base-font-size', fontSize);
    
    // Simpan pilihan ke dalam localStorage
    localStorage.setItem('saiz_teks_anse', fontSize);
}

function initSaizTeks() {
    const saizDisimpan = localStorage.getItem('saiz_teks_anse');
    if (saizDisimpan) {
        document.documentElement.style.setProperty('--base-font-size', saizDisimpan);
    }
}