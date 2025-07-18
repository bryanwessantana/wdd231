document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById("year");
    const lastModifiedElement = document.getElementById("lastModified");
    const directory = document.getElementById('directory');
    const gridBtn = document.getElementById('grid-view');
    const listBtn = document.getElementById('list-view');
    const spotlightSection = document.getElementById('spotlights');

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    if (lastModifiedElement) {
        lastModifiedElement.textContent = new Date(document.lastModified).toLocaleDateString();
    }

    if (gridBtn && listBtn && directory) {
        gridBtn.setAttribute('aria-pressed', 'true');
        listBtn.setAttribute('aria-pressed', 'false');

        gridBtn.addEventListener('click', () => {
            directory.classList.add('grid');
            directory.classList.remove('list');
            gridBtn.setAttribute('aria-pressed', 'true');
            listBtn.setAttribute('aria-pressed', 'false');
        });

        listBtn.addEventListener('click', () => {
            directory.classList.add('list');
            directory.classList.remove('grid');
            gridBtn.setAttribute('aria-pressed', 'false');
            listBtn.setAttribute('aria-pressed', 'true');
        });
    }

    async function loadMembers() {
        try {
            const response = await fetch('scripts/data/members.json'); // <- Must be accessible from HTML
            if (!response.ok) throw new Error('Network response was not ok');
            const members = await response.json();

            if (directory) renderDirectory(members);
            if (spotlightSection) renderSpotlights(members);
        } catch (error) {
            console.error('Error loading members:', error);
            if (directory) directory.innerHTML = '<p>Unable to load member data.</p>';
            if (spotlightSection) spotlightSection.innerHTML = '<p>Unable to load spotlight data.</p>';
        }
    }

    function renderDirectory(members) {
        directory.innerHTML = '';

        members.forEach(member => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${member.name}</h3>
                <p><strong>Address:</strong> ${member.address}</p>
                <p><strong>Phone:</strong> ${member.phone}</p>
                <p><strong>Website:</strong> <a href="${member.website}" target="_blank" rel="noopener">${member.website}</a></p>
                <p><strong>Membership Level:</strong> ${getMembershipLevel(member.membershipLevel)}</p>
                <p>${member.description || ''}</p>
                ${member.image ? `<img src="images/${member.image}" alt="${member.name} logo" style="max-width: 100px; margin-top: 10px;">` : ''}
            `;
            directory.appendChild(card);
        });
    }

    function renderSpotlights(members) {
        spotlightSection.innerHTML = '';

        const topMembers = members.filter(m => m.membershipLevel === 2 || m.membershipLevel === 3);
        const randomSpotlights = topMembers.sort(() => 0.5 - Math.random()).slice(0, 3);

        randomSpotlights.forEach(member => {
            const card = document.createElement('div');
            card.className = 'spotlight-card';
            card.innerHTML = `
                <img src="images/${member.image}" alt="${member.name} logo">
                <div class="business-info">
                    <h3>${member.name}</h3>
                    <p>${member.description || ""}</p>
                    <p><strong>EMAIL:</strong> ${member.email || "N/A"}</p>
                    <p><strong>PHONE:</strong> ${member.phone}</p>
                    <p><strong>URL:</strong> <a href="${member.website}" target="_blank">${member.website}</a></p>
                </div>
            `;
            spotlightSection.appendChild(card);
        });
    }

    function getMembershipLevel(level) {
        switch (level) {
            case 1: return 'Member';
            case 2: return 'Silver';
            case 3: return 'Gold';
            default: return 'Unknown';
        }
    }

    loadMembers();
});
