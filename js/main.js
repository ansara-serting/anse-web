// --- JALANKAN SEMUA FUNGSI SEMASA LAMAN DIMUATKAN ---
document.addEventListener("DOMContentLoaded", () => {
    muatDataNavigasi();
    muatDataCarousel();
    muatDataTrivia();
    muatDataFooter();
    initTema();        
    initSaizTeks();    
});

// =========================================================
// 1. SUNTIKAN DATA JSON (SEKSYEN NAVIGASI)
// =========================================================
async function muatDataNavigasi() {
    try {
        const responMenu = await fetch('./data/grid_menu.json');
        const dataMenu = await responMenu.json();

        const responBerita = await fetch('./data/content.json');
        const dataBerita = await responBerita.json();

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

        const highlightItems = dataBerita.filter(item => Array.isArray(item.display_in) && item.display_in.includes('highlight'));
        const bekasHighlight = document.getElementById('highlight-grid-container');

        if (bekasHighlight && highlightItems.length) {
            bekasHighlight.innerHTML = highlightItems.map((item, index) => `
                <a href="${item.pautan}" class="highlight-link-wrapper ${index === 0 ? 'active' : ''}" data-index="${index}" aria-hidden="${index === 0 ? 'false' : 'true'}">
                    <div class="highlight-bg" style="background-image: url('${item.imej}');"></div>
                    <div class="highlight-overlay"></div>
                    <div class="highlight-content">
                        <span class="badge">${item.kategori}</span>
                        <h2 class="highlight-title">${item.tajuk}</h2>
                        <small class="highlight-caption">${item.kapsyen_klik}</small>
                    </div>
                </a>
            `).join('');

            if (highlightItems.length > 1) {
                mulakanSlideshowHighlight(highlightItems.length);
            }
        }

    } catch (error) {
        console.error("Gagal memuatkan data JSON:", error);
    }
}

function mulakanSlideshowHighlight(jumlahHighlight) {
    const slides = [...document.querySelectorAll('.highlight-link-wrapper')];
    if (!slides.length || jumlahHighlight <= 1) return;

    let indeksAktif = 0;
    const tempoh = 10000;
    let timerId = null;

    const paparkanSlide = (index) => {
        slides.forEach((slide, i) => {
            const isActive = i === index;
            slide.classList.toggle('active', isActive);
            slide.setAttribute('aria-hidden', String(!isActive));
        });
    };

    const mulaTimer = () => {
        clearInterval(timerId);
        timerId = setInterval(() => {
            indeksAktif = (indeksAktif + 1) % slides.length;
            paparkanSlide(indeksAktif);
        }, tempoh);
    };

    const hentikanTimer = () => {
        clearInterval(timerId);
    };

    paparkanSlide(indeksAktif);
    mulaTimer();

    slides.forEach((slide) => {
        slide.addEventListener('mouseenter', hentikanTimer);
        slide.addEventListener('mouseleave', mulaTimer);
    });
}

// =========================================================
// 2. PENGURUSAN LACI MENU (OFF-CANVAS DRAWER)
// =========================================================
const drawer = document.getElementById('side-drawer');
const backdrop = document.getElementById('drawer-backdrop');
const btnTutupDrawer = document.getElementById('btn-tutup-drawer');
const btnHamburger = document.getElementById('btn-hamburger');

function setDrawerState(isOpen) {
    if (!drawer || !backdrop || !btnHamburger) return;

    drawer.classList.toggle('hidden', !isOpen);
    backdrop.classList.toggle('hidden', !isOpen);
    drawer.setAttribute('aria-hidden', String(!isOpen));
    backdrop.setAttribute('aria-hidden', String(!isOpen));
    btnHamburger.setAttribute('aria-expanded', String(isOpen));

    if (isOpen) {
        drawer.classList.add('open');
        backdrop.classList.add('open');
    } else {
        drawer.classList.remove('open');
        backdrop.classList.remove('open');
    }
}

function bukaDrawer() {
    if(!drawer || !backdrop) return;
    setDrawerState(true);
}

function tutupDrawer() {
    if(!drawer || !backdrop) return;
    setDrawerState(false);
}

if(btnTutupDrawer) btnTutupDrawer.addEventListener('click', tutupDrawer);
if(backdrop) backdrop.addEventListener('click', tutupDrawer);
if(btnHamburger) btnHamburger.addEventListener('click', () => {
    const isOpen = btnHamburger.getAttribute('aria-expanded') === 'true';
    setDrawerState(!isOpen);
});

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
    const setPopoverState = (isOpen) => {
        popoverA11y.classList.toggle('hidden', !isOpen);
        popoverA11y.setAttribute('aria-hidden', String(!isOpen));
        btnTextSize.setAttribute('aria-expanded', String(isOpen));
    };

    btnTextSize.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = btnTextSize.getAttribute('aria-expanded') === 'true';
        setPopoverState(!isOpen);
        clearTimeout(timeoutA11y);

        if (!isOpen) {
            timeoutA11y = setTimeout(() => {
                setPopoverState(false);
            }, 10000);
        }
    });

    document.addEventListener('click', (e) => {
        if (!popoverA11y.contains(e.target) && e.target !== btnTextSize) {
            setPopoverState(false);
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

// =========================================================
// 5. PENGURUSAN CAROUSEL (SEKSYEN 2)
// =========================================================
let slaidSemasa = 0;
let jumlahSlaid = 0;

async function muatDataCarousel() {
    try {
        const respon = await fetch('./data/content.json');
        const dataCarousel = await respon.json();
        const slideItems = dataCarousel.filter(item => Array.isArray(item.display_in) && item.display_in.includes('carousel'));
        jumlahSlaid = slideItems.length;

        const track = document.getElementById('carousel-track');
        const dotsContainer = document.getElementById('carousel-dots');

        if (!track || !dotsContainer) return;

        track.innerHTML = '';
        dotsContainer.innerHTML = '';

        if (!slideItems.length) {
            track.innerHTML = '<div class="carousel-slide" style="display:flex; justify-content:center; align-items:center; height:100%;"><h2>Tiada program ditunjukkan.</h2></div>';
            return;
        }

        slideItems.forEach((item, index) => {
            track.innerHTML += `
                <div class="carousel-slide">
                    <div class="slide-bg" style="background-image: url('${item.imej}');"></div>
                    <div class="slide-overlay"></div>
                    <div class="slide-content">
                        <h2>${item.tajuk}</h2>
                        <p>${item.keterangan}</p>
                        <a href="${item.pautan_butang}" class="btn-utama">${item.label_butang}</a>
                    </div>
                </div>
            `;

            dotsContainer.innerHTML += `
                <div class="dot ${index === 0 ? 'active' : ''}" onclick="pergiKeSlaid(${index})"></div>
            `;
        });

        const btnNext = document.getElementById('carousel-next');
        const btnPrev = document.getElementById('carousel-prev');

        if (btnNext) btnNext.addEventListener('click', slaidSeterusnya);
        if (btnPrev) btnPrev.addEventListener('click', slaidSebelumnya);

        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const threshold = 50;
            if (touchEndX < touchStartX - threshold) {
                slaidSeterusnya();
            }
            if (touchEndX > touchStartX + threshold) {
                slaidSebelumnya();
            }
        }

    } catch (error) {
        console.error("Gagal memuatkan data Carousel JSON:", error);
    }
}

// --- FUNGSI PERGERAKAN CAROUSEL ---
function kemaskiniPaparanCarousel() {
    const track = document.getElementById('carousel-track');
    const dots = document.querySelectorAll('.dot');
    const slides = document.querySelectorAll('.carousel-slide');
    const seksyenCarousel = document.getElementById('seksyen-carousel');
    
    if (!track) return;
    
    // Tentukan jika skrin layak untuk Partial View
    const isPartial = (jumlahSlaid >= 3) && window.innerWidth > 768;
    
    if (isPartial) {
        seksyenCarousel.classList.add('seksyen-carousel-partial');
        
        // MATEMATIK PARTIAL VIEW:
        // Slaid = 88%, Kiri = 1%, Kanan = 1% (Total 90% pergerakan)
        // Untuk center slaid pertama (index 0), tolak track ke kanan sebanyak 5%
        track.style.transform = `translateX(calc(-${slaidSemasa * 90}% + 5%))`;
    } else {
        seksyenCarousel.classList.remove('seksyen-carousel-partial');
        // Mod penuh biasa untuk phone
        track.style.transform = `translateX(-${slaidSemasa * 100}%)`;
    }

    // Kemaskini kelas aktif pada slaid (untuk kesan zoom/terang)
    slides.forEach((slide, index) => {
        if (index === slaidSemasa) {
            slide.classList.add('active-slide');
        } else {
            slide.classList.remove('active-slide');
        }
    });

    // Kemaskini warna titik (dot) aktif
    dots.forEach((dot, index) => {
        if (index === slaidSemasa) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// TAMBAH BARIS INI: Pastikan margin dikira semula jika pengguna sengetkan phone/resize browser
window.addEventListener('resize', kemaskiniPaparanCarousel);

function slaidSeterusnya() {
    // Jika di slaid terakhir, kembali ke 0. Jika tidak, tambah 1.
    slaidSemasa = (slaidSemasa === jumlahSlaid - 1) ? 0 : slaidSemasa + 1;
    kemaskiniPaparanCarousel();
}

function slaidSebelumnya() {
    // Jika di slaid pertama, pergi ke slaid terakhir. Jika tidak, tolak 1.
    slaidSemasa = (slaidSemasa === 0) ? jumlahSlaid - 1 : slaidSemasa - 1;
    kemaskiniPaparanCarousel();
}

// Buka fungsi ini ke global (window) supaya titik HTML boleh guna atribut 'onclick'
window.pergiKeSlaid = function(index) {
    slaidSemasa = index;
    kemaskiniPaparanCarousel();
};

// =========================================================
// 6. PENGURUSAN FAKTA & TRIVIA (SEKSYEN 3)
// =========================================================
async function muatDataTrivia() {
    try {
        const respon = await fetch('./data/trivia.json');
        const data = await respon.json();
        const bekasTrivia = document.getElementById('trivia-container');

        if (!bekasTrivia) return;

        // Gabungkan elemen tatasusunan (array) fakta menjadi perenggan HTML
        let htmlFakta = '';
        data.fakta.forEach(teks => {
            htmlFakta += `<p class="trivia-item">${teks}</p>`;
        });

        // Suntik ke dalam skrin
        bekasTrivia.innerHTML = `
            <h2>${data.tajuk}</h2>
            ${htmlFakta}
            <div class="trivia-sumber">${data.sumber}</div>
        `;

    } catch (error) {
        console.error("Gagal memuatkan data Trivia:", error);
    }
}

// =========================================================
// 7. PENGURUSAN FOOTER (SEKSYEN 4)
// =========================================================
async function muatDataFooter() {
    try {
        const respon = await fetch('./data/footer.json');
        const data = await respon.json();

        const bekasPeta = document.getElementById('footer-map-container');
        const bekasInfo = document.getElementById('footer-info-container');

        if (bekasPeta) {
            bekasPeta.innerHTML = `<iframe src="${data.peta_embed}" loading="lazy" allowfullscreen></iframe>`;
        }

        if (bekasInfo) {
            let pautanHTML = '';
            data.pautan_pantas.forEach(link => {
                pautanHTML += `<li><a href="${link.url}">${link.label}</a></li>`;
            });

            bekasInfo.innerHTML = `
                <div class="footer-info">
                    <div class="footer-brand">
                        <div class="footer-logo-container">
                            <img src="assets/logo-anse.png" alt="Logo ANSE">
                        </div>
                        <span class="footer-eyebrow">Komuniti ANSE Serting</span>
                    </div>
                    <h2>${data.nama_organisasi}</h2>
                    <p class="footer-registration">No. pendaftaran: ${data.no_pendaftaran}</p>
                    <address>${data.alamat.replace(/\n/g, '<br>')}</address>
                </div>
                
                <div class="footer-links">
                    <p class="footer-eyebrow">Terokai</p>
                    <h2>${data.laman_web}</h2>
                    <ul>
                        ${pautanHTML}
                    </ul>
                </div>

                <div class="footer-location">
                    <p class="footer-eyebrow">Kunjungi kami</p>
                    <h2>MRSM Serting</h2>
                    <p>Bandar Baru Jempol, Negeri Sembilan</p>
                    <a class="footer-map-link" href="${data.peta_url}" target="_blank" rel="noopener">Buka lokasi <span aria-hidden="true">↗</span></a>
                </div>
            `;
        }
    } catch (error) {
        console.error("Gagal memuatkan data Footer:", error);
    }
}

// =========================================================
// 8. KAWALAN BUTANG SKROL DINAMIK (SCROLL INDICATOR)
// =========================================================
const btnScrollIndicator = document.getElementById('btn-scroll-indicator');

// Senarai ID seksyen mengikut turutan dari atas ke bawah
const senaraiSeksyen = [
    'seksyen-navigasi', // Ini mewakili bahagian atas sekali (Navigasi)
    'seksyen-carousel',
    'seksyen-trivia',
    'seksyen-footer'
];

if (btnScrollIndicator) {
    btnScrollIndicator.setAttribute('aria-label', 'Skrol ke bahagian seterusnya');

    btnScrollIndicator.addEventListener('click', (e) => {
        e.preventDefault();

        let idSeksyenSeterusnya = null;

        // Semak satu persatu seksyen mana yang berada di bawah pandangan skrin sekarang
        for (let i = 0; i < senaraiSeksyen.length; i++) {
            const seksyen = document.getElementById(senaraiSeksyen[i]);
            if (!seksyen) continue;

            const jarakDariAtas = seksyen.getBoundingClientRect().top;

            // Jika jaraknya lebih dari 50px dari atas skrin, ia bermaksud
            // seksyen ini adalah seksyen yang SETERUSNYA
            if (jarakDariAtas > 50) {
                idSeksyenSeterusnya = senaraiSeksyen[i];
                break; // Berhenti mencari setelah jumpa
            }
        }

        // Skrol ke seksyen seterusnya dengan lancar
        if (idSeksyenSeterusnya) {
            document.getElementById(idSeksyenSeterusnya).scrollIntoView({ behavior: 'smooth' });
        } else {
            // Jika tiada seksyen di bawah (bermakna kita di Footer), kembali ke atas!
            document.getElementById(senaraiSeksyen[0]).scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// --- KOD BARU: PEMANTAU FOOTER (Intersection Observer) ---
const footerSeksyen = document.getElementById('seksyen-footer');

if (footerSeksyen && btnScrollIndicator) {
    const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Apabila Footer kelihatan di skrin
                // Kita balut teks dengan span supaya boleh disorok di mobile, dan tambah title untuk tooltip
                btnScrollIndicator.innerHTML = '▲ <span class="btt-text">Back to top</span>';
                btnScrollIndicator.setAttribute('title', 'Back to top');
                btnScrollIndicator.classList.add('back-to-top-mode');
            } else {
                // Apabila berada di seksyen lain
                btnScrollIndicator.innerHTML = '▼';
                btnScrollIndicator.removeAttribute('title');
                btnScrollIndicator.classList.remove('back-to-top-mode');
            }
        });
    }, { 
        threshold: 0.3 // Mula tukar bila 30% footer mula nampak di skrin
    });

    footerObserver.observe(footerSeksyen);
}
