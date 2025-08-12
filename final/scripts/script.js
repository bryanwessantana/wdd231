// script.js — Fixed full version
// Keeps all features: product loading, categories, search, cart, favorites, promos, UI helpers.

let allProducts = []; // Will hold products loaded from JSON

// --- ENTRY: run after DOM loaded ---
document.addEventListener("DOMContentLoaded", mainInit);

async function mainInit() {
    // start lazy loading images selector (safe)
    document.querySelectorAll('.promo-carousel img').forEach(img => {
        img.setAttribute('loading', 'lazy');
    });

    // load products (chooses correct path depending on folder)
    await loadProducts();

    // wire UI that doesn't depend on products
    initializePage();

    // render category/product grids if present
    renderProductsByCategory();
    renderProductGridPage();

    // setup search handlers (some pages wait for productsLoaded)
    initSearchHandlers();

    // other UI initializations
    initOtherUI();
}

// --- LOAD PRODUCTS ---
async function loadProducts() {
    // Choose JSON path depending on whether we are in /categories/ folder
    const pathToJSON = window.location.pathname.includes("/categories/")
        ? "../scripts/data/products.json"
        : "scripts/data/products.json";

    try {
        const res = await fetch(pathToJSON);

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
            throw new Error("products.json did not return an array");
        }

        allProducts = data;
        document.dispatchEvent(new Event("productsLoaded"));
        return allProducts;
    } catch (err) {
        console.error("Error loading products:", err);

        // Try to show user-friendly message in a few likely containers
        const fallbackContainers = [
            document.getElementById("products-container"),
            document.getElementById("product-grid"),
            document.getElementById("searchResults"),
            document.getElementById("promoCarousel")
        ];
        fallbackContainers.forEach(c => {
            if (c) c.innerHTML = `<p style="color:red;">Error loading products.</p>`;
        });

        return []; // return empty to allow rest of page to function
    }
}

// --- UTIL: safe lowercase compare ---
function safeEqualsLower(a = "", b = "") {
    // returns true if both strings equal ignoring case; handles undefined
    return String(a).toLowerCase() === String(b).toLowerCase();
}

// --- Create product card HTML fragment (string) ---
function productCardHTML(product, options = {}) {
    // options: {showBrand, showDesc, currencySymbol}
    const name = product?.name || "Unnamed Product";
    const image = product?.image || "images/default.jpg";
    const price = typeof product?.price === "number" ? product.price.toFixed(2) : "0.00";
    const brand = product?.brand || "";
    const desc = product?.description || "";
    const currency = options.currencySymbol ?? "R$";

    return `
        <div class="product-card" data-id="${product?.id ?? ""}">
            <img src="${image}" alt="${escapeHtml(name)}" loading="lazy">
            <h3>${escapeHtml(name)}</h3>
            ${options.showBrand ? `<p class="brand">${escapeHtml(brand)}</p>` : ""}
            ${options.showDesc ? `<p class="desc">${escapeHtml(desc)}</p>` : ""}
            <p class="price">${currency}${price}</p>
            <div class="product-actions">
                <button onclick="addToCart(${product?.id ?? 'null'})" aria-label="Add ${escapeHtml(name)} to cart">🛒</button>
                <button onclick="addToFavorites(${product?.id ?? 'null'})" aria-label="Add ${escapeHtml(name)} to favorites">❤️</button>
            </div>
        </div>
    `;
}

// small helper to escape user-provided strings in templates
function escapeHtml(str) {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

// --- PAGE INITIALIZATION (non-product-specific) ---
function initializePage() {
    updateYearAndModified();
    initThemeToggle();
    loadFavorites(); // displays favorites UI if present
    loadCart(); // populate cart UI if present
    initPromoCarousel();
    initLoginUI();
    markActiveNavLink();
    initOtherUI(); // footer and menu handlers
}

// Update year and last modified
function updateYearAndModified() {
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

    const lastModifiedEl = document.getElementById('lastModified');
    if (lastModifiedEl) lastModifiedEl.textContent = `Last updated: ${document.lastModified || 'N/A'}`;
}

// Theme toggle
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
    });
}

// --- RENDER PRODUCTS FOR A HORIZONTAL TRACK (by dataset on element) ---
function renderProductsByCategory() {
    const productTrack = document.querySelector('.product-track');
    if (!productTrack) return;

    const categoryDataset = productTrack.dataset.category; // friendly name or key
    if (!categoryDataset) return;

    // Map friendly names if needed (keep this mapping small and editable)
    const categoryMap = {
        "Clothes": "Karate Gear",
        "Supplements": "Supplement",
        "Health": "Health",
        "Promotions": "Promotions"
    };
    const realCategory = categoryMap[categoryDataset] || categoryDataset;

    // Filter safely using optional chaining
    const filtered = (allProducts || []).filter(p =>
        String(p?.category ?? "").toLowerCase() === String(realCategory ?? "").toLowerCase()
    );

    // Render
    productTrack.innerHTML = ""; // clear
    filtered.forEach(p => {
        // create DOM node (safer than innerHTML inside loop)
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.image || 'images/default.jpg'}" alt="${escapeHtml(p.name || '')}">
            <h4>${escapeHtml(p.name || '')}</h4>
            <p>R$${(typeof p.price === 'number' ? p.price.toFixed(2) : '0.00')}</p>
            <div class="track-actions">
                <button onclick="addToCart(${p.id})" aria-label="Add ${escapeHtml(p.name)} to cart">Add to Cart</button>
                <button onclick="addToFavorites(${p.id})" aria-label="Add ${escapeHtml(p.name)} to favorites">❤️ Favorite</button>
            </div>
        `;
        productTrack.appendChild(card);
    });

    if (filtered.length === 0) {
        productTrack.innerHTML = `<p style="color:gray; padding:1rem;">No items for this category.</p>`;
    }
}

// --- RENDER PRODUCT GRID PAGE (product-grid element) ---
function renderProductGridPage() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    // Page's body may include a data-category attribute as friendly name
    const category = document.body.dataset.category;
    const categoryMap = {
        "Clothes": "Karate Gear",
        "Supplements": "Supplement",
        "Health": "Health",
        "Promotions": "Promotions"
    };
    const realCategory = categoryMap[category] || category;

    if (!realCategory) {
        // If no category provided, show all products
        grid.innerHTML = (allProducts || []).map(p => productCardHTML(p, { showBrand: true, showDesc: true })).join("");
        return;
    }

    const filtered = (allProducts || []).filter(p =>
        String(p?.category ?? "").toLowerCase() === String(realCategory ?? "").toLowerCase()
    );

    if (filtered.length === 0) {
        grid.innerHTML = `<p>No products found in this category.</p>`;
        return;
    }

    grid.innerHTML = filtered.map(product => productCardHTML(product, { showBrand: true, showDesc: true })).join("");
}

// --- FAVORITES ---
function addToFavorites(productId) {
    if (typeof productId !== 'number') return;
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(productId)) {
        favorites.push(productId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert("Added to favorites!");
        loadFavorites();
    } else {
        alert("Already in favorites.");
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
        favoritesContainer.innerHTML = `<p style="text-align:center; font-style: italic; color: gray;">You have no favorite items yet.</p>`;
        return;
    }

    favorites.forEach(favId => {
        const product = (allProducts || []).find(p => p.id === favId);
        if (product) {
            const favCard = document.createElement('div');
            favCard.className = 'promo-item';
            favCard.innerHTML = `
                <img src="${product.image || 'images/default.jpg'}" alt="${escapeHtml(product.name)}">
                <h4>${escapeHtml(product.name)}</h4>
                <p>R$${(typeof product.price === 'number' ? product.price.toFixed(2) : '0.00')}</p>
                <button class="remove-favorite" data-id="${product.id}">Remove ❤️</button>
            `;
            favoritesContainer.appendChild(favCard);
        }
    });

    // Add remove event listeners
    favoritesContainer.querySelectorAll('.remove-favorite').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = parseInt(e.target.dataset.id, 10);
            removeFromFavorites(id);
        });
    });
}

// --- CART ---
function addToCart(productId) {
    if (typeof productId !== 'number') return;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert("Added to cart!");
    loadCart(); // refresh cart UI if on cart page
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(id => id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

function decreaseCartQuantity(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const index = cart.indexOf(productId);
    if (index > -1) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    loadCart();
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
        cartContainer.innerHTML = `<p style="text-align:center; font-style: italic; color: gray; width: 100%;">Your cart is empty.</p>`;
        cartTotalEl.textContent = '0.00';
        return;
    }

    let total = 0;
    const quantities = {};
    cart.forEach(id => {
        quantities[id] = (quantities[id] || 0) + 1;
    });

    Object.entries(quantities).forEach(([idStr, qty]) => {
        const id = parseInt(idStr, 10);
        const product = (allProducts || []).find(p => p.id === id);
        if (product) {
            total += (typeof product.price === 'number' ? product.price : 0) * qty;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${product.image || 'images/default.jpg'}" alt="${escapeHtml(product.name)}">
                <h4>${escapeHtml(product.name)}</h4>
                <p>R$${(typeof product.price === 'number' ? product.price.toFixed(2) : '0.00')}</p>
                <div class="quantity-controls">
                    <button class="qty-decrease" data-id="${id}" aria-label="Decrease">-</button>
                    <span class="qty-value">${qty}</span>
                    <button class="qty-increase" data-id="${id}" aria-label="Increase">+</button>
                </div>
                <button class="remove-item" data-id="${id}" aria-label="Remove">Remove</button>
            `;
            cartContainer.appendChild(cartItem);
        }
    });

    cartTotalEl.textContent = total.toFixed(2);

    // Add listeners
    cartContainer.querySelectorAll('.qty-increase').forEach(btn => {
        btn.addEventListener('click', e => {
            const productId = parseInt(e.target.dataset.id, 10);
            addToCart(productId);
        });
    });

    cartContainer.querySelectorAll('.qty-decrease').forEach(btn => {
        btn.addEventListener('click', e => {
            const productId = parseInt(e.target.dataset.id, 10);
            decreaseCartQuantity(productId);
        });
    });

    cartContainer.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', e => {
            const productId = parseInt(e.target.dataset.id, 10);
            removeFromCart(productId);
        });
    });
}

// --- PROMO CAROUSEL ---
function initPromoCarousel() {
    const promoCarousel = document.getElementById('promoCarousel');
    if (!promoCarousel) return;

    promoCarousel.innerHTML = '';

    const promotions = (allProducts || []).filter(p =>
        String(p?.category ?? "").toLowerCase() === 'promotions'
    );

    if (promotions.length === 0) {
        promoCarousel.innerHTML = `<p style="color:gray; padding:1rem;">No promotions available.</p>`;
        return;
    }

    promotions.forEach(product => {
        const promoCard = document.createElement('div');
        promoCard.classList.add('promo-item');
        promoCard.innerHTML = `
            <img src="${product.image || 'images/default.jpg'}" alt="${escapeHtml(product.name)}">
            <h4>${escapeHtml(product.name)}</h4>
            <p>R$${(typeof product.price === 'number' ? product.price.toFixed(2) : '0.00')}</p>
            <div class="promo-actions">
                <button onclick="addToFavorites(${product.id})" aria-label="Favorite">❤️</button>
                <button onclick="addToCart(${product.id})" aria-label="Add to cart">🛒</button>
            </div>
        `;
        promoCarousel.appendChild(promoCard);
    });

    // optional arrow controls
    document.querySelector('.promo-arrow.left')?.addEventListener('click', () => {
        promoCarousel.scrollBy({ left: -300, behavior: 'smooth' });
    });
    document.querySelector('.promo-arrow.right')?.addEventListener('click', () => {
        promoCarousel.scrollBy({ left: 300, behavior: 'smooth' });
    });
}

// --- SEARCH HANDLERS (search input + searchbar.html) ---
function initSearchHandlers() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const itemsList = document.querySelectorAll('#items li'); // static lists on some pages
    const params = new URLSearchParams(window.location.search);
    const searchTermDisplay = document.getElementById('searchTerm');
    const searchResultsContainer = document.getElementById('searchResults'); // on searchbar.html
    const currentPage = window.location.pathname.split("/").pop();

    function filterItems(term) {
        const lowerTerm = String(term).toLowerCase();
        itemsList.forEach(item => {
            item.style.display = item.textContent.toLowerCase().includes(lowerTerm) ? '' : 'none';
        });
    }

    function performSearch() {
        const term = (searchInput?.value || '').trim();
        if (!term) return;
        if (itemsList.length > 0) filterItems(term);
        if (currentPage !== 'searchbar.html') {
            window.location.href = `categories/searchbar.html?q=${encodeURIComponent(term)}`;
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (itemsList.length > 0) filterItems(searchInput.value);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
    if (searchBtn) searchBtn.addEventListener('click', performSearch);

    // On searchbar.html - show results dynamically
    if (currentPage === 'searchbar.html' && searchResultsContainer) {
        const term = params.get('q') || '';

        if (searchTermDisplay) {
            searchTermDisplay.textContent = term ? `Results for "${term}":` : 'No search term provided.';
        }
        if (searchInput) searchInput.value = term;

        const showResults = () => {
            searchResultsContainer.innerHTML = ''; // Clear

            if (!term) {
                searchResultsContainer.innerHTML = '<p style="text-align:center; color:gray;">No search term provided.</p>';
                return;
            }

            const results = (allProducts || []).filter(p =>
                String(p?.name ?? '').toLowerCase().includes(String(term).toLowerCase())
            );

            if (results.length === 0) {
                searchResultsContainer.innerHTML = '<p style="text-align:center; color:gray;">No products found.</p>';
                return;
            }

            results.forEach(p => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <img src="${p.image || 'images/default.jpg'}" alt="${escapeHtml(p.name)}">
                    <h4>${escapeHtml(p.name)}</h4>
                    <p>R$${(typeof p.price === 'number' ? p.price.toFixed(2) : '0.00')}</p>
                    <div class="product-actions">
                        <button onclick="addToCart(${p.id})">🛒 Add to Cart</button>
                        <button onclick="addToFavorites(${p.id})">❤️ Favorite</button>
                    </div>
                `;
                searchResultsContainer.appendChild(card);
            });
        };

        // If products already loaded show results, otherwise listen
        if ((allProducts || []).length > 0) {
            showResults();
        } else {
            document.addEventListener('productsLoaded', showResults);
        }
    }
}

// --- MISC UI: login state, nav highlight, footer icons, menu toggle, AOS init ---
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

    // thank you message handler on contact success
    if (document.getElementById('thankYouMessage')) {
        const name = localStorage.getItem('contactName') || 'Friend';
        document.getElementById('thankYouMessage').textContent =
            `Thanks, ${name}, your message has been sent.`;
        localStorage.removeItem('contactName');
    }
}

function markActiveNavLink() {
    const currentPath = window.location.pathname.split("/").pop();
    const links = document.querySelectorAll("nav a");
    links.forEach(link => {
        if (link.getAttribute("href") === currentPath) {
            link.classList.add("active");
        }
    });
}

function initOtherUI() {
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");
    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("show");
        });
    }

    // Footer social icons (append if footer container present)
    const footerContainer = document.querySelector('footer .footer-container');
    if (footerContainer && !footerContainer.querySelector('.footer-right')) {
        const footerRight = document.createElement('div');
        footerRight.className = 'footer-right';
        footerRight.setAttribute('data-aos', 'fade-left');
        footerRight.innerHTML = `
          <div class="social-icons">
            <a href="https://www.instagram.com" target="_blank" aria-label="Instagram"><i class="fab fa-instagram fa-lg"></i></a>
            <a href="https://www.facebook.com" target="_blank" aria-label="Facebook"><i class="fab fa-facebook fa-lg"></i></a>
            <a href="https://www.youtube.com" target="_blank" aria-label="YouTube"><i class="fab fa-youtube fa-lg"></i></a>
            <a href="https://wa.me" target="_blank" aria-label="WhatsApp"><i class="fab fa-whatsapp fa-lg"></i></a>
          </div>
        `;
        footerContainer.appendChild(footerRight);
    }

    if (window.AOS) AOS.init({ duration: 800, once: true, easing: 'ease-in-out' });
}