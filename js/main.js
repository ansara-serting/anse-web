// --- JALANKAN SEMUA FUNGSI SEMASA LAMAN DIMUATKAN ---
document.addEventListener("DOMContentLoaded", () => {
    muatDataNavigasi();
    initTema();        
    initSaizTeks();    
});

// =========================================================
// 1. SUNTIKAN DATA JSON (SEKSYEN NAVIGASI)
// =========================================================
async function muatDataNavigasi() {
    try {
        // Tarik data dari folder data/
        const responMenu = await fetch('./data/grid_menu.json');
        const dataMenu = await responMenu.json();
        
        const responBerita = await fetch('./data/berita.json');
        const dataBerita = await responBerita.json();

        // Suntik Data Grid Menu
        const bekasMenu = document.querySelector('.grid-menu-4');
        if (bekasMenu) {
            bekasMenu.innerHTML = ''; 
            dataMenu.forEach(item => {
                const objekHTML = item.objek ? `<div class="card-objek">${item.objek}</div>` : '';
                bekasMenu.innerHTML += `
                    <a href="${item.pautan}" class="menu-card ${item.class_kad}">
                        <div class="card-content">
                            <h3>${item.tajuk}</h3>
                            <p>${item.sub_teks}</p>
                        </div>
                        ${objekHTML}
                    </a>
                `;
            });
        }

        // Suntik Data Highlight
        const beritaHighlight = dataBerita.find(b => b.aktif_di_highlight);
        const bekasHighlight = document.getElementById('highlight-grid-container');
        if (beritaHighlight && bekasHighlight) {
            bekasHighlight.innerHTML = `
                <div class="highlight-placeholder">
                    <span class="badge">${beritaHighlight.kategori}</span>
                    <p class="highlight-title">${beritaHighlight.tajuk}</p>
                    <small>${beritaHighlight.kapsyen_klik}</small>
                </div>
            `;
        }

    } catch (error) {
        console.error("Gagal memuatkan data JSON:", error);
    }
}

// =========================================================
// 2. PENGURUSAN LACI MENU (OFF-CANVAS DRAWER)
// =========================================================
const drawer = document.getElementById('side-drawer');
const backdrop = document.getElementById('drawer-backdrop');
const btnTutupDrawer = document.getElementById('btn-tutup-drawer');
const btnHamburger = document.getElementById('btn-hamburger');

function bukaDrawer() {
    if(!drawer || !backdrop) return;
    drawer.classList.remove('hidden');
    backdrop.classList.remove('hidden');
    setTimeout(() => {
        drawer.classList.add('open');
        backdrop.classList.add('open');
    }, 10);
}

function tutupDrawer() {
    if(!drawer || !backdrop) return;
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    setTimeout(() => {
        drawer.classList.add('hidden');
        backdrop.classList.add('hidden');
    }, 300);
}

if(btnTutupDrawer) btnTutupDrawer.addEventListener('click', tutupDrawer);
if(backdrop) backdrop.addEventListener('click', tutupDrawer);
// Pastikan fungsi ini dipanggil untuk butang hamburger yang baru
if(btnHamburger) btnHamburger.addEventListener('click', bukaDrawer);

// =========================================================
// 3. PENGURUSAN TEMA TERANG / GELAP (DARK MODE)
// =========================================================
const btnToggleTema = document.getElementById('toggle-tema');
const body = document.body;

function initTema() {
    const temaDisimpan = localStorage.getItem('tema_anse');
    if (temaDisimpan === 'dark') {
        body.classList.add('dark-theme');
    }
}

if(btnToggleTema) {
    btnToggleTema.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        const temaSemasa = body.classList.contains('dark-theme') ? 'dark' : 'light';
        localStorage.setItem('tema_anse', temaSemasa);
    });
}

// =========================================================
// 4. PENGURUSAN AKSESIBILITI SAIZ TEKS (^A)
// =========================================================
const btnTextSize = document.getElementById('btn-text-size');
const popoverA11y = document.getElementById('popover-a11y');
let timeoutA11y;

if(btnTextSize && popoverA11y) {
    btnTextSize.addEventListener('click', (e) => {
        e.stopPropagation();
        popoverA11y.classList.toggle('hidden');
        clearTimeout(timeoutA11y);

        if (!popoverA11y.classList.contains('hidden')) {
            timeoutA11y = setTimeout(() => {
                popoverA11y.classList.add('hidden');
            }, 10000);
        }
    });

    document.addEventListener('click', (e) => {
        if (!popoverA11y.contains(e.target) && e.target !== btnTextSize) {
            popoverA11y.classList.add('hidden');
            clearTimeout(timeoutA11y);
        }
    });
}

// Terekspos ke Global Window untuk onclick pada butang dalam HTML
window.ubahSaizTeks = function(saiz) {
    const root = document.documentElement;
    let fontSize = '16px'; 

    if (saiz === 'kecil') fontSize = '14px';
    if (saiz === 'besar') fontSize = '18px';

    root.style.setProperty('--base-font-size', fontSize);
    localStorage.setItem('saiz_teks_anse', fontSize);
};

function initSaizTeks() {
    const saizDisimpan = localStorage.getItem('saiz_teks_anse');
    if (saizDisimpan) {
        document.documentElement.style.setProperty('--base-font-size', saizDisimpan);
    }
}