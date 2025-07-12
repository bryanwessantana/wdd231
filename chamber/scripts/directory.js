document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById("year");
    const lastModifiedElement = document.getElementById("lastModified");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    if (lastModifiedElement) {
        lastModifiedElement.textContent = document.lastModified;
    }

    const directory = document.getElementById('directory');
    const gridBtn = document.getElementById('grid-view');
    const listBtn = document.getElementById('list-view');

    if (gridBtn && listBtn && directory) {
        gridBtn.addEventListener('click', () => {
            directory.classList.add('grid');
            directory.classList.remove('list');
        });

        listBtn.addEventListener('click', () => {
            directory.classList.add('list');
            directory.classList.remove('grid');
        });
    }

    async function loadMembers() {
        try {
            const response = await fetch('scripts/data/members.json');
            const members = await response.json();

            members.forEach(member => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <h3>${member.name}</h3>
                    <p><strong>Address:</strong> ${member.address}</p>
                    <p><strong>Phone:</strong> ${member.phone}</p>
                    <p><strong>Website:</strong> <a href="${member.website}" target="_blank">${member.website}</a></p>
                    <p><strong>Membership Level:</strong> ${getMembershipLevel(member.membershipLevel)}</p>
                    <p>${member.description || ''}</p>
                    <img src="images/${member.image}" alt="${member.name} logo" style="max-width: 100px; margin-top: 10px;">
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
