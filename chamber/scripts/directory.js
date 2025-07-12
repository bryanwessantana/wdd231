document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("lastModified").textContent = document.lastModified;

const directory = document.getElementById('directory');
const gridBtn = document.getElementById('grid-view');
const listBtn = document.getElementById('list-view');

gridBtn.addEventListener('click', () => {
    directory.classList.add('grid');
    directory.classList.remove('list');
});

listBtn.addEventListener('click', () => {
    directory.classList.add('list');
    directory.classList.remove('grid');
});

// Example data - replace with actual fetch from JSON or API
const members = [
    { name: "BizOne", email: "biz1@email.com", phone: "123-456-7890", website: "https://bizone.com" },
    { name: "BizTwo", email: "biz2@email.com", phone: "123-555-7890", website: "https://biztwo.com" },
    { name: "BizThree", email: "biz3@email.com", phone: "123-456-0000", website: "https://bizthree.com" }
];

members.forEach(member => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${member.name}</h3>
      <p>Email: <a href="mailto:${member.email}">${member.email}</a></p>
      <p>Phone: ${member.phone}</p>
      <p><a href="${member.website}" target="_blank">Visit Website</a></p>
    `;
    directory.appendChild(card);
});