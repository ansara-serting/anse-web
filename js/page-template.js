document.addEventListener('DOMContentLoaded', muatTemplatHalaman);

async function muatTemplatHalaman() {
    const namaHalaman = document.body.dataset.page;
    const bekasKandungan = document.querySelector('#page-content');

    if (!namaHalaman || !bekasKandungan) return;

    try {
        const [header, footer, response] = await Promise.all([
            fetch('templates/header.html').then(periksaResponse),
            fetch('templates/footer.html').then(periksaResponse),
            fetch(`data/${namaHalaman}.json`).then(periksaResponse)
        ]);
        const data = await response.json();

        document.querySelector('#site-header').innerHTML = await header.text();
        document.querySelector('#site-footer').innerHTML = await footer.text();

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
