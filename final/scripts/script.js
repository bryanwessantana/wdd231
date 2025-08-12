// ==================== GLOBALS ====================
let allProducts = [];

// Fix image paths for subpages
function getImagePath(path) {
    if (!path) return 'images/placeholder.png';
    return window.location.pathname.includes('/categories/')
        ? '../' + path
        : path;
}

// ==================== MAIN INIT ====================
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();

    updateYearAndModified();
    initThemeToggle();
    renderProductsByCategory();
    renderProductGridPage();
    loadFavorites();
    loadCart();
    initPromoCarousel();
    initOtherUI();
    initSearchHandlers();
    initLoginUI();
    initPageHighlight();
    initContactThankYou();
    initSocialLinks();

    document.querySelectorAll('.promo-carousel img').forEach(img => {
        img.setAttribute('loading', 'lazy');
    });
});

// ==================== LOAD PRODUCTS ====================
async function loadProducts() {
    try {
        const pathToJSON = window.location.pathname.includes('/categories/')
            ? '../scripts/data/products.json'
            : 'scripts/data/products.json';

        const res = await fetch(pathToJSON);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        allProducts = await res.json();

        // Dispatch event for pages waiting for products
        document.dispatchEvent(new Event('productsLoaded'));
    } catch (err) {
        console.error('Failed to load products:', err);
        allProducts = [];
    }
}

// ==================== UTILITIES ====================
function updateYearAndModified() {
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

    const lastModifiedEl = document.getElementById('lastModified');
    if (lastModifiedEl) lastModifiedEl.textContent = `Last updated: ${document.lastModified}`;
}

function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
    });
}

// ==================== CATEGORY PAGE RENDERING ====================
function renderProductsByCategory() {
    const productTrack = document.querySelector('.product-track');
    if (!productTrack) return;

    const category = productTrack.dataset.category;
    if (!category) return;

    const categoryMap = {
        'Clothes': 'Karate Gear',
        'Supplements': 'Supplement',
        'Health': 'Health',
        'Promotions': 'Promotions'
    };
    const realCategory = categoryMap[category] || category;

    const filtered = allProducts.filter(p =>
        (p?.category ?? '').toLowerCase() === realCategory.toLowerCase()
    );

    productTrack.innerHTML = '';

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${getImagePath(p.image)}" alt="${p.name}">
            <h4>${p.name}</h4>
            <p>R$${p.price.toFixed(2)}</p>
            <button onclick="addToCart(${p.id})">🛒 Add to Cart</button>
            <button onclick="addToFavorites(${p.id})">❤️ Favorite</button>
        `;
        productTrack.appendChild(card);
    });
}

// ==================== PRODUCT GRID PAGES ====================
function renderProductGridPage() {
    const container = document.getElementById('product-grid');
    if (!container) return;

    const category = document.body.dataset.category;
    const categoryMap = {
        'Clothes': 'Karate Gear',
        'Supplements': 'Supplement',
        'Health': 'Health',
        'Promotions': 'Promotions'
    };
    const realCategory = categoryMap[category] || category;

    const filtered = allProducts.filter(p =>
        (p?.category ?? '').toLowerCase() === realCategory.toLowerCase()
    );

    if (filtered.length === 0) {
        container.innerHTML = `<p>No products found in this category.</p>`;
        return;
    }

    container.innerHTML = filtered.map(p => `
        <div class="product-card">
            <img src="${getImagePath(p.image)}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p class="brand">${p.brand}</p>
            <p class="price">R$${p.price.toFixed(2)}</p>
            <p class="desc">${p.description}</p>
        </div>
    `).join('');
}

// ==================== FAVORITES ====================
function addToFavorites(productId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(productId)) {
        favorites.push(productId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Added to favorites!');
        loadFavorites();
    } else {
        alert('Already in favorites.');
    }
}

function removeFromFavorites(productId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(id => id !== productId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadFavorites();
}

function loadFavorites() {
    const favoritesContainer = document.getElementById('favoritesContainer');
    if (!favoritesContainer) return;

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favoritesContainer.innerHTML = '';

    if (favorites.length === 0) {
        favoritesContainer.innerHTML = `<p style="text-align:center; color:gray;">No favorites yet.</p>`;
        return;
    }

    favorites.forEach(favId => {
        const p = allProducts.find(prod => prod.id === favId);
        if (p) {
            const favCard = document.createElement('div');
            favCard.className = 'promo-item';
            favCard.innerHTML = `
                <img src="${getImagePath(p.image)}" alt="${p.name}">
                <h4>${p.name}</h4>
                <p>R$${p.price.toFixed(2)}</p>
                <button onclick="removeFromFavorites(${p.id})">Remove ❤️</button>
            `;
            favoritesContainer.appendChild(favCard);
        }
    });
}

// ==================== CART ====================
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
    loadCart();
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(id => id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
}

function decreaseCartQuantity(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const index = cart.indexOf(productId);
    if (index > -1) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
    }
}

function clearCart() {
    localStorage.removeItem('cart');
    loadCart();
}

function loadCart() {
    const cartContainer = document.getElementById('cartContainer');
    const cartTotalEl = document.getElementById('cartTotal');
    if (!cartContainer || !cartTotalEl) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = `<p style="text-align:center; color:gray;">Your cart is empty.</p>`;
        cartTotalEl.textContent = '0.00';
        return;
    }

    let total = 0;
    const quantities = {};
    cart.forEach(id => {
        quantities[id] = (quantities[id] || 0) + 1;
    });

    Object.entries(quantities).forEach(([idStr, qty]) => {
        const id = parseInt(idStr);
        const p = allProducts.find(prod => prod.id === id);
        if (p) {
            total += p.price * qty;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${getImagePath(p.image)}" alt="${p.name}">
                <h4>${p.name}</h4>
                <p>R$${p.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button onclick="decreaseCartQuantity(${id}); loadCart();">-</button>
                    <span>${qty}</span>
                    <button onclick="addToCart(${id}); loadCart();">+</button>
                </div>
                <button onclick="removeFromCart(${id}); loadCart();">Remove</button>
            `;
            cartContainer.appendChild(cartItem);
        }
    });

    cartTotalEl.textContent = total.toFixed(2);
}

// ==================== PROMOTIONS ====================
function initPromoCarousel() {
    const promoCarousel = document.getElementById('promoCarousel');
    if (!promoCarousel) return;

    promoCarousel.innerHTML = '';

    const promotions = allProducts.filter(p =>
        (p?.category ?? '').toLowerCase() === 'promotions'
    );

    promotions.forEach(p => {
        const promoCard = document.createElement('div');
        promoCard.classList.add('promo-item');
        promoCard.innerHTML = `
            <img src="${getImagePath(p.image)}" alt="${p.name}">
            <h4>${p.name}</h4>
            <p>R$${p.price.toFixed(2)}</p>
            <button onclick="addToFavorites(${p.id})">❤️ Favorite</button>
            <button onclick="addToCart(${p.id})">🛒 Add to Cart</button>
        `;
        promoCarousel.appendChild(promoCard);
    });
}

// ==================== UI HELPERS ====================
function initOtherUI() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }
}

function initSearchHandlers() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchTermDisplay = document.getElementById('searchTerm');
    const searchResultsContainer = document.getElementById('searchResults');
    const params = new URLSearchParams(window.location.search);
    const currentPage = window.location.pathname.split('/').pop();

    function performSearch() {
        const term = searchInput.value.trim();
        if (term && currentPage !== 'searchbar.html') {
            window.location.href = `categories/searchbar.html?q=${encodeURIComponent(term)}`;
        }
    }

    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (searchInput) searchInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') performSearch();
    });

    if (currentPage === 'searchbar.html') {
        const term = params.get('q') || '';
        if (searchTermDisplay) {
            searchTermDisplay.textContent = term ? `Results for "${term}":` : 'No search term provided.';
        }
        if (searchResultsContainer) {
            const results = allProducts.filter(p =>
                p.name.toLowerCase().includes(term.toLowerCase())
            );
            if (results.length === 0) {
                searchResultsContainer.innerHTML = '<p style="text-align:center; color:gray;">No products found.</p>';
                return;
            }
            searchResultsContainer.innerHTML = results.map(p => `
                <div class="product-card">
                    <img src="${getImagePath(p.image)}" alt="${p.name}">
                    <h4>${p.name}</h4>
                    <p>R$${p.price.toFixed(2)}</p>
                    <button onclick="addToCart(${p.id})">🛒 Add to Cart</button>
                    <button onclick="addToFavorites(${p.id})">❤️ Favorite</button>
                </div>
            `).join('');
        }
    }
}

function initLoginUI() {
    const logoutBtn = document.getElementById('logoutBtn');
    const loginLink = document.getElementById('loginLink');
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (loggedInUser) {
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (loginLink) loginLink.style.display = 'none';
    } else {
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (loginLink) loginLink.style.display = 'inline-block';
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            alert('You have logged out.');
            window.location.href = 'login.html';
        });
    }
}

function initPageHighlight() {
    const currentPath = window.location.pathname.split('/').pop();
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

function initContactThankYou() {
    if (document.getElementById('thankYouMessage')) {
        const name = localStorage.getItem('contactName') || 'Friend';
        document.getElementById('thankYouMessage').textContent =
            `Thanks, ${name}, your message has been sent.`;
        localStorage.removeItem('contactName');
    }
}

// ==================== SOCIAL MEDIA LINKS (robust, FA or SVG fallback) ====================
function initSocialLinks() {
    // find or create container
    let socialContainer = document.getElementById('socialLinks');

    if (!socialContainer) {
        const footerRight = document.querySelector('footer .footer-right') || document.querySelector('footer');
        if (!footerRight) {
            console.warn('initSocialLinks: no <footer> found to attach social links.');
            return;
        }
        socialContainer = document.createElement('div');
        socialContainer.id = 'socialLinks';
        // keep both class names your CSS uses
        socialContainer.className = 'social-links social-icons';
        footerRight.appendChild(socialContainer);
    } else {
        // ensure correct classes for your CSS selectors
        socialContainer.classList.add('social-links', 'social-icons');
    }

    const socials = [
        { href: 'https://www.facebook.com', fa: 'fab fa-facebook-f', label: 'Facebook', svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22 12a10 10 0 10-11.5 9.87v-6.99h-2.2V12h2.2V9.98c0-2.17 1.29-3.37 3.28-3.37.95 0 1.94.17 1.94.17v2.13h-1.09c-1.08 0-1.42.67-1.42 1.36V12h2.42l-.39 2.88h-2.03V21.9A10 10 0 0022 12z"/></svg>` },
        { href: 'https://twitter.com', fa: 'fab fa-twitter', label: 'Twitter', svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22 5.92a7.5 7.5 0 01-2.17.6A3.78 3.78 0 0021.4 4a7.56 7.56 0 01-2.4.92A3.77 3.77 0 0015.5 4c-2.08 0-3.77 1.7-3.77 3.8 0 .3.03.6.1.88A10.7 10.7 0 013 5.2a3.78 3.78 0 001.16 5.07 3.7 3.7 0 01-1.7-.47v.05c0 1.77 1.26 3.24 2.94 3.57-.3.08-.62.12-.95.12-.23 0-.46-.02-.68-.06.46 1.45 1.8 2.5 3.38 2.53A7.58 7.58 0 012 19.54 10.7 10.7 0 008.29 21c6.55 0 10.14-5.42 10.14-10.12v-.46A7.3 7.3 0 0022 5.92z"/></svg>` },
        { href: 'https://www.instagram.com', fa: 'fab fa-instagram', label: 'Instagram', svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="17.6" cy="6.4" r="0.6" fill="currentColor"/></svg>` },
        { href: 'https://www.youtube.com', fa: 'fab fa-youtube', label: 'YouTube', svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M23.5 6.2s-.2-1.7-.8-2.4c-.8-.9-1.7-.9-2.1-1C16.8 2.4 12 2.4 12 2.4h-.1S7.2 2.4 3.4 2.8c-.4 0-1.3.1-2.1 1C.4 4.6.2 6.2.2 6.2S0 8.2 0 10.1v.8c0 1.9.2 3.9.2 3.9s.2 1.6.9 2.3c.8.9 1.8.9 2.3 1 1.6.2 6.8.4 6.8.4s4.8 0 8.6-.4c.4 0 1.3-.1 2.1-1 .6-.7.8-2.4.8-2.4s.2-2 .2-3.9v-.8c0-1.9-.2-3.9-.2-3.9zM9.8 15.1V8.9l6.1 3.1-6.1 3.1z"/></svg>` }
    ];

    // detect if Font Awesome stylesheet is already present
    const linkTags = Array.from(document.getElementsByTagName('link'));
    const hasFA = linkTags.some(l => l.href && (/font-?awesome|fontawesome|kit.fontawesome|use.fontawesome|cdnjs.cloudflare.com\/ajax\/libs\/font-awesome/i.test(l.href)));

    // Build UL/LI markup (matches your CSS selectors)
    const ul = document.createElement('ul');
    ul.style.margin = 0;
    ul.style.padding = 0;
    ul.style.display = 'flex';
    ul.style.gap = '0.8rem';
    ul.style.alignItems = 'center';
    ul.style.justifyContent = 'center';

    socials.forEach(s => {
        const li = document.createElement('li');
        li.style.listStyle = 'none';
        const a = document.createElement('a');
        a.href = s.href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.setAttribute('aria-label', s.label);
        a.style.display = 'inline-flex';
        a.style.alignItems = 'center';
        a.style.justifyContent = 'center';
        a.style.padding = '0.2rem';
        a.style.color = 'inherit';
        // If Font Awesome is available, create <i>. Else use inline SVG fallback.
        if (hasFA) {
            const i = document.createElement('i');
            i.className = s.fa;
            a.appendChild(i);
        } else {
            // SVG fallback
            const wrapper = document.createElement('span');
            wrapper.innerHTML = s.svg;
            // ensure svg sizing is similar to your i sizing
            const svg = wrapper.querySelector('svg');
            if (svg) {
                svg.style.width = '1.25rem';
                svg.style.height = '1.25rem';
                svg.style.display = 'block';
            }
            a.appendChild(wrapper);
        }
        li.appendChild(a);
        ul.appendChild(li);
    });

    // clear any previous content and append
    socialContainer.innerHTML = '';
    socialContainer.appendChild(ul);
}