document.addEventListener('DOMContentLoaded', muatTemplatHalaman);

async function muatTemplatHalaman() {
    const parameterQuery = new URLSearchParams(window.location.search);
    const encodedQuery = decodeURIComponent(window.location.search.slice(1));
    const parameterHalaman = parameterQuery.get('page')
        || new URLSearchParams(encodedQuery).get('page');
    const namaHalaman = parameterHalaman || document.body.dataset.page;
    const bekasKandungan = document.querySelector('#page-content');

    if (!namaHalaman || !bekasKandungan) return;

    try {
        const [header, footer, response, footerDataResponse, menuLinksResponse, settingsResponse] = await Promise.all([
            fetch('templates/header.html').then(periksaResponse),
            fetch('templates/footer.html').then(periksaResponse),
            fetch(`data/${namaHalaman}.json`).then(periksaResponse),
            fetch('data/footer.json').then(periksaResponse),
            fetch('data/menu_links.json', { cache: 'no-store' }).then(periksaResponse),
            fetch('data/settings.json').then(periksaResponse)
        ]);
        const data = await response.json();
        const footerData = await footerDataResponse.json();
        const menuLinks = await menuLinksResponse.json();
        const settings = await settingsResponse.json();

        document.body.dataset.page = namaHalaman;
        const kelasHalaman = namaHalaman === 'hubungi' ? 'contact-page' : `${namaHalaman}-page`;
        document.body.classList.add('content-page', kelasHalaman);
        document.title = namaHalaman === 'about'
            ? 'Mengenai ANSE | ANSARA Serting'
            : 'Hubungi ANSE | ANSARA Serting';

        document.querySelector('#site-header').innerHTML = await header.text();
        document.querySelector('#site-footer').innerHTML = await footer.text();
        binaFooter(footerData, menuLinks, settings);

        const pembinaHalaman = {
            about: binaKandunganAbout,
            hubungi: binaKandunganHubungi
        };
        const binaKandungan = pembinaHalaman[namaHalaman];

        if (!binaKandungan) throw new Error(`Halaman tidak disokong: ${namaHalaman}`);
        bekasKandungan.innerHTML = binaKandungan(data);
    } catch (error) {
        console.error('Gagal memuatkan templat halaman:', error);
        bekasKandungan.innerHTML = '<p class="page-error">Kandungan halaman tidak dapat dimuatkan.</p>';
    }
}

function binaFooter(data, pautan, tetapan) {
    const bekasPeta = document.querySelector('#footer-map-container');
    const bekasInfo = document.querySelector('#footer-info-container');

    if (bekasPeta) {
        bekasPeta.innerHTML = `<iframe src="${data.peta_embed}" loading="lazy" allowfullscreen></iframe>`;
    }

    if (bekasInfo) {
        const pautanHTML = pautan
            .filter(item => Array.isArray(item.active_in_menu) && item.active_in_menu.includes('footer'))
            .map(item => `<li><a href="${item.url}">${item.label}</a></li>`)
            .join('');

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
                <ul>${pautanHTML}</ul>
            </div>
            <div class="footer-location">
                <p class="footer-eyebrow">Kunjungi kami</p>
                <h2>MRSM Serting</h2>
                <p>Bandar Baru Jempol, Negeri Sembilan</p>
                <a class="footer-map-link" href="${data.peta_url}" target="_blank" rel="noopener">Buka lokasi <span aria-hidden="true">↗</span></a>
            </div>
        `;
    }

    const pautanSubfooter = document.querySelector('#footer-legal-links');
    const teksHakCipta = document.querySelector('#footer-copyright');
    if (pautanSubfooter && Array.isArray(tetapan.subfooter_links)) {
        pautanSubfooter.innerHTML = tetapan.subfooter_links
            .map(item => `<a href="${item.url}">${item.text}</a>`)
            .join('');
    }
    if (teksHakCipta && tetapan.copyright_text) {
        teksHakCipta.textContent = tetapan.copyright_text;
    }
}

async function periksaResponse(response) {
    if (!response.ok) throw new Error(`Permintaan gagal: ${response.status}`);
    return response;
}

function binaKandunganAbout(data) {
    const rows = data.profile.details.map(([label, value]) => `
        <tr><th>${label}</th><td>${value}</td></tr>
    `).join('');
    const mission = data.mission.map(item => `<li>${item}</li>`).join('');
    const members = data.leadership.members.map(([name, role, batch]) => `
        <article class="exco-card">
            <div class="exco-avatar" aria-hidden="true">👤</div>
            <div class="exco-name">${name}</div>
            <div class="exco-role">${role}</div>
            <div class="exco-batch">${batch}</div>
        </article>
    `).join('');

    return `
        <div class="content-container">
            <h1 class="section-title">${data.title}</h1>
            <p class="lead-text">${data.intro}</p>

            <section class="content-section">
                <h2>${data.profile.title}</h2>
                ${data.profile.paragraphs.map(text => `<p>${text}</p>`).join('')}
                <table class="ros-table"><tbody>${rows}</tbody></table>
            </section>

            <section class="vm-grid">
                <article class="vm-box">
                    <h2>Visi Kami</h2>
                    <p>${data.vision}</p>
                </article>
                <article class="vm-box">
                    <h2>Misi Teras</h2>
                    <ul>${mission}</ul>
                </article>
            </section>

            <section class="content-section">
                <h2>${data.leadership.title}</h2>
                <h6>${data.leadership.session}</h6>
                <p>${data.leadership.description}</p>
                <div class="exco-grid">${members}</div>
            </section>
        </div>
    `;
}

function binaKandunganHubungi(data) {
    const details = data.details.map(detail => `
        <article class="contact-card">
            <h2>${detail.label}</h2>
            <p>${detail.value}</p>
            <a class="contact-link" href="${detail.url}" target="_blank" rel="noopener">${detail.action} <span aria-hidden="true">↗</span></a>
        </article>
    `).join('');
    const social = data.social.map(item => `
        <a class="contact-social-link" href="${item.url}" target="_blank" rel="noopener">${item.label} <span aria-hidden="true">↗</span></a>
    `).join('');

    return `
        <div class="content-container">
            <h1 class="section-title">${data.title}</h1>
            <p class="lead-text">${data.intro}</p>

            <section class="contact-grid" aria-label="Maklumat perhubungan">
                ${details}
            </section>

            <section class="content-section contact-social-section">
                <h2>Ikuti ANSE</h2>
                <p>Ikuti saluran rasmi kami untuk berita, aktiviti, dan perkembangan komuniti alumni.</p>
                <nav class="contact-social-links" aria-label="Media sosial ANSE">
                    ${social}
                </nav>
            </section>
        </div>
    `;
}
