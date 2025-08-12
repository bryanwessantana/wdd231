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
    await loadProducts(); // Wait until products are loaded

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

    // Lazy load promo carousel images
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