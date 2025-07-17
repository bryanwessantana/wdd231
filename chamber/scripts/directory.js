document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById("year");
    const lastModifiedElement = document.getElementById("lastModified");
    const directory = document.getElementById('directory');
    const gridBtn = document.getElementById('grid-view');
    const listBtn = document.getElementById('list-view');

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
            const response = await fetch('scripts/data/members.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const members = await response.json();

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
        } catch (error) {
            console.error('Error loading members:', error);
            directory.innerHTML = '<p>Unable to load member data.</p>';
        }
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
