document.addEventListener('DOMContentLoaded', () => {
    const year = document.getElementById("year");
    const modified = document.getElementById("lastModified");
    const gridBtn = document.getElementById('grid-view');
    const listBtn = document.getElementById('list-view');
    const dir = document.getElementById('directory');
    const spotlight = document.getElementById('spotlights');

    const timestampInput = document.getElementById('timestamp');
    if (timestampInput) {
        timestampInput.value = new Date().toISOString();
    }

    if (year) year.textContent = new Date().getFullYear();
    if (modified) modified.textContent = new Date(document.lastModified).toLocaleString();

    if (gridBtn && listBtn && dir) {
        const toggleView = (view) => {
            dir.classList.toggle('grid', view === 'grid');
            dir.classList.toggle('list', view === 'list');
            gridBtn.setAttribute('aria-pressed', view === 'grid');
            listBtn.setAttribute('aria-pressed', view === 'list');
        };
        gridBtn.addEventListener('click', () => toggleView('grid'));
        listBtn.addEventListener('click', () => toggleView('list'));
        toggleView('grid');
    }

    async function loadMembers() {
        try {
            const res = await fetch('scripts/data/members.json');
            if (!res.ok) throw new Error('Failed to load');
            const members = await res.json();
            if (dir) renderDirectory(members);
            if (spotlight) renderSpotlights(members);
        } catch (e) {
            console.error('Error loading members:', e);
            if (dir) dir.innerHTML = '<p>Unable to load member data.</p>';
            if (spotlight) spotlight.innerHTML = '<p>Unable to load spotlight data.</p>';
        }
    }

    function renderDirectory(members) {
        dir.innerHTML = '';
        members.forEach(m => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
            <h3>${m.name}</h3>
            <p><strong>Address:</strong> ${m.address}</p>
            <p><strong>Phone:</strong> ${m.phone}</p>
            <p><strong>Website:</strong> <a href="${m.website}" target="_blank">${m.website}</a></p>
            <p><strong>Membership Level:</strong> ${getLevel(m.membershipLevel)}</p>
            <p>${m.description || ''}</p>
            ${m.image
                    ? `
                        <picture>
                            <source srcset="images/${m.image.replace(/\.(jpg|jpeg|png)$/i, '.webp')}" type="image/webp">
                            <img src="images/${m.image}" alt="${m.name} logo" style="max-width:100px; margin-top:10px;" loading="lazy">
                        </picture>
                      `
                    : ''
                }
        `;
            dir.appendChild(card);
        });
        animateCards();
    }

    function renderSpotlights(members) {
        spotlight.innerHTML = '';
        members
            .filter(m => [2, 3].includes(m.membershipLevel))
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .forEach(m => {
                const card = document.createElement('div');
                card.className = 'spotlight-card';
                card.innerHTML = `
                <picture>
                    <source srcset="images/${m.image.replace(/\.(jpg|jpeg|png)$/i, '.webp')}" type="image/webp">
                    <img src="images/${m.image}" alt="${m.name} logo" loading="lazy">
                </picture>
                <div class="business-info">
                    <h3>${m.name}</h3>
                    <p>${m.description || ''}</p>
                    <p><strong>EMAIL:</strong> ${m.email || 'N/A'}</p>
                    <p><strong>PHONE:</strong> ${m.phone}</p>
                    <p><strong>URL:</strong> <a href="${m.website}" target="_blank">${m.website}</a></p>
                </div>
            `;
                spotlight.appendChild(card);
            });
    }

    const getLevel = lvl => ({ 1: 'Member', 2: 'Silver', 3: 'Gold' }[lvl] || 'Unknown');

    function animateCards() {
        document.querySelectorAll('.card').forEach((card, i) => {
            card.style.opacity = 0;
            card.style.transition = 'opacity 1s ease';
            setTimeout(() => (card.style.opacity = 1), 300 * i);
        });
    }

    document.querySelectorAll('.membership-cards a').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const modalId = link.getAttribute('href').replace('#', '');
            const modal = document.getElementById(modalId);
            if (modal?.showModal) modal.showModal();
        });
    });

    loadMembers();

    // ─────────────────────────────────────────────
    // Discover Page Enhancements
    // ─────────────────────────────────────────────
    if (document.body.classList.contains('discover-page')) {
        const messageDiv = document.getElementById("visit-message");
        const gallery = document.querySelector(".gallery");
        const sidebar = document.querySelector(".sidebar");
        const layout = document.querySelector(".discover-layout");

        // 1. LocalStorage visit tracking
        const now = Date.now();
        const lastVisit = localStorage.getItem("lastVisit");
        if (!lastVisit) {
            showTemporaryMessage("Welcome!");
        } else {
            const diff = now - parseInt(lastVisit);
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            if (days === 0) {
                showTemporaryMessage("Welcome back!");
            } else {
                showTemporaryMessage(`Visited ${days} day${days > 1 ? 's' : ''} ago.`);
            }
        }
        localStorage.setItem("lastVisit", now);

        function showTemporaryMessage(text) {
            if (!messageDiv || !sidebar || !layout) return;

            messageDiv.textContent = text;
            sidebar.classList.add("show");
            layout.classList.remove("sidebar-hidden");

            setTimeout(() => {
                sidebar.classList.remove("show");
                messageDiv.style.display = "none";
                layout.classList.add("sidebar-hidden");
            }, 3000);
        }

        // 2. Load Places of Interest
        async function loadPlaces() {
            try {
                const res = await fetch("scripts/data/places.json");
                if (!res.ok) throw new Error("Unable to fetch places.json");
                const places = await res.json();
                renderGallery(places);
            } catch (err) {
                console.error(err);
                gallery.innerHTML = "<p>Unable to load interest items.</p>";
            }
        }

        function renderGallery(items) {
            gallery.innerHTML = '';
            items.forEach(item => {
                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `
                    <h2>${item.name}</h2>
                    <figure>
                        <picture>
                            <source srcset="${item.image.replace(/\.(jpg|jpeg|png)$/i, '.webp')}" type="image/webp">
                            <img src="${item.image}" alt="${item.name}" loading="lazy">
                        </picture>
                    </figure>
                    <address>${item.address}</address>
                    <p>${item.description}</p>
                    <button>Learn more</button>
                `;
                gallery.appendChild(card);
            });
        }

        loadPlaces();
    }
});
