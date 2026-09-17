document.addEventListener("DOMContentLoaded", () => {
    muatDataNavigasi();
});

async function muatDataNavigasi() {
    try {
        // 1. Tarik data dari JSON
        const responMenu = await fetch('data/grid_menu.json');
        const dataMenu = await responMenu.json();
        
        const responBerita = await fetch('data/berita.json');
        const dataBerita = await responBerita.json();

        // 2. Suntik Data Grid Menu
        const bekasMenu = document.querySelector('.grid-menu-4');
        bekasMenu.innerHTML = ''; // Kosongkan placeholder lama
        
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

        // 3. Suntik Data Highlight (Ambil item pertama yang aktif)
        const beritaHighlight = dataBerita.find(b => b.aktif_di_highlight);
        if (beritaHighlight) {
            const bekasHighlight = document.getElementById('highlight-grid-container');
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